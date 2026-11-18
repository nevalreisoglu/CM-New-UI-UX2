#!/usr/bin/env node
/**
 * Live send (decision X9): the sender function on its own, then end to end — the prototype served
 * over http with ?live=<key>, a journey activated, the function called with the providers stubbed.
 * No real message leaves this script.
 *
 *   node tests/sender.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const sender = require('../api/send.js');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const check = (ok, msg) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${msg}`); if (!ok) errors.push(msg); };

const ENV = { DEMO_SEND_KEY: 'k-123', RESEND_API_KEY: 're_x', DEMO_EMAIL_TO: 'someone@example.com', TWILIO_ACCOUNT_SID: 'ACx', TWILIO_AUTH_TOKEN: 't', TWILIO_FROM: '+15005550006', DEMO_SMS_TO: '+905001112233', NTFY_TOPIC: 'topic-x' };
const stub = (calls, status = 200) => async (url, opt) => { calls.push({ url: String(url), opt }); return { ok: status < 300, status }; };

(async () => {
  console.log('\nthe function');
  {
    const calls = [];
    const pkg = { messages: [
      { channel: 'sms', text: 'one' }, { channel: 'sms', text: 'two' },
      { channel: 'email', subject: 'S', html: '<p>x</p>', text: 'x', to: 'attacker@example.com' },
      { channel: 'push', title: 'T', text: 'b', click: 'https://site.example/offer/?n=A' },
      { channel: 'web', url: 'https://site.example/offer/?n=A' }, { channel: 'fax', text: 'no' },
    ] };
    const res = await sender.sendAll(pkg, ENV, stub(calls));
    check(res.map((r) => r.channel).join() === 'sms,email,push,web', `one result per known channel, in order (${res.map((r) => r.channel)})`);
    check(res.every((r) => r.status === 'sent'), 'all four are sent when every provider is set up');
    check(calls.length === 3, `three provider calls — the second SMS and the unknown channel are dropped (${calls.length})`);
    const mail = JSON.parse(calls.find((c) => c.url.includes('resend')).opt.body);
    check(mail.to.join() === ENV.DEMO_EMAIL_TO, 'the e-mail goes to the configured recipient, never to one the page names');
    check(mail.subject.startsWith('[TEST] '), 'the subject is marked [TEST]');
    const sms = new URLSearchParams(calls.find((c) => c.url.includes('twilio')).opt.body);
    check(sms.get('To') === ENV.DEMO_SMS_TO && sms.get('Body') === 'one', 'the SMS goes to the configured number with the first text');
    check(!JSON.stringify(res).includes('someone@') && !JSON.stringify(res).includes('1112233'), 'results mask the recipients');

    const bare = await sender.sendAll(pkg, { DEMO_SEND_KEY: 'k' }, stub([]));
    check(bare.filter((r) => r.status === 'skipped').length === 3 && bare.find((r) => r.channel === 'web').status === 'sent', 'channels without keys are skipped, the website still works');
    const down = await sender.sendAll(pkg, ENV, stub([], 500));
    check(down.filter((r) => r.status === 'failed').length === 3, 'a provider error is reported as failed');

    // Twilio: accepted is not delivered
    const twilio = (post, polls) => { let n = 0; return async (url, opt) => (opt && opt.method === 'POST' ? { ok: post.ok !== false, status: post.status || 201, json: async () => post.body } : { ok: true, status: 200, json: async () => polls[Math.min(n++, polls.length - 1)] }); };
    const one = { messages: [{ channel: 'sms', text: 'x' }] }; const FAST = Object.assign({ SMS_POLL_MS: '1' }, ENV);
    let r1 = (await sender.sendAll(one, FAST, twilio({ body: { sid: 'SM1', status: 'queued' } }, [{ status: 'sent' }, { status: 'delivered' }])))[0];
    check(r1.status === 'sent' && /delivered$/.test(r1.detail), `a delivered SMS says so (${r1.detail})`);
    r1 = (await sender.sendAll(one, FAST, twilio({ body: { sid: 'SM1', status: 'queued' } }, [{ status: 'undelivered', error_code: 30008 }])))[0];
    check(r1.status === 'failed' && /Twilio 30008/.test(r1.detail), `an undelivered SMS is reported as failed with Twilio's code (${r1.detail})`);
    r1 = (await sender.sendAll(one, FAST, twilio({ body: { sid: 'SM1', status: 'queued' } }, [{ status: 'sent' }])))[0];
    check(r1.status === 'sent' && /not confirmed/.test(r1.detail), 'an SMS still on its way says delivery is not confirmed');
    r1 = (await sender.sendAll(one, FAST, twilio({ ok: false, status: 400, body: { code: 21608, message: 'x' } }, [])))[0];
    check(r1.status === 'failed' && /21608/.test(r1.detail) && /verified/.test(r1.detail) && !/1112233/.test(r1.detail), `a refused SMS explains why (${r1.detail})`);

    const call = (headers, env) => sender.handle('POST', headers, '{"messages":[]}', env, stub([]));
    check((await call({ 'x-live-key': 'wrong' }, ENV)).statusCode === 401, 'a wrong key is refused');
    check((await call({}, ENV)).statusCode === 401, 'a missing key is refused');
    check((await call({}, {})).statusCode === 200, 'with no key configured, the site sends without one');
    check((await call({ 'x-live-key': 'k-123', origin: 'https://evil.example', host: 'site.example' }, ENV)).statusCode === 403, 'a page on another site is refused');
    check((await call({ 'x-live-key': 'k-123', origin: 'https://site.example', host: 'site.example' }, ENV)).statusCode === 200, 'the site itself is accepted');
    check((await sender.handle('POST', { 'x-live-key': 'k-123' }, { messages: [{ channel: 'web', url: 'https://s.example/offer/?n=A' }] }, ENV, stub([]))).body.results[0].status === 'sent', 'a body the host already parsed is accepted');
    check((await sender.handle('GET', {}, '', ENV, stub([]))).statusCode === 405, 'GET is refused');
  }

  console.log('\nend to end: activate a journey on the served prototype');
  const provider = []; const realFetch = global.fetch; global.fetch = stub(provider);
  const posts = []; let serverEnv = ENV;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/send') { let body = ''; req.on('data', (d) => { body += d; }); req.on('end', async () => {
      posts.push(JSON.parse(body)); const out = await sender.handle(req.method, req.headers, body, serverEnv, global.fetch);
      res.writeHead(out.statusCode, { 'content-type': 'application/json' }); res.end(JSON.stringify(out.body)); }); return; }
    const file = url.pathname.startsWith('/offer/') ? 'sender/site/offer/index.html' : 'index.html';
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(ROOT, file)));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const open = async (query) => { const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.route('https://fonts.**', (r) => r.abort()); await page.goto(`${base}/?notour${query}`); await page.waitForSelector('.view.active'); return page; };
  {
    const page = await open('&live=k-123');
    await page.evaluate(() => { showView('journeys'); jOpen('JRN-12'); const j = JOURNEYS.find((x) => x.id === 'JRN-12'); j.status = 'Draft'; activateJourney(j, false); });
    await page.waitForSelector('#ts-modal .ts-live', { timeout: 8000 }).catch(() => {});
    check(posts.length === 1, `activating posts once to /api/send (${posts.length})`);
    const chans = (posts[0] || { messages: [] }).messages.map((m) => m.channel);
    check(chans.join() === 'sms,email,web', `one message per channel the journey uses (${chans})`);
    const sms = posts[0].messages.find((m) => m.channel === 'sms'), mail = posts[0].messages.find((m) => m.channel === 'email');
    check(/Oksana/.test(sms.text) && !/\{\{/.test(sms.text) && sms.text.includes(`${base}/offer/?`), 'the SMS is personalised and carries the offer link');
    check(/background-color/.test(mail.html) && !/class=/.test(mail.html) && mail.html.includes(`${base}/offer/?`), 'the e-mail is the preview with inlined styles and the offer link on its button');
    check(mail.subject.length > 0 && !/\{\{/.test(mail.subject), `the subject is resolved (${mail.subject})`);
    check(provider.length === 2, `the function called the two providers (${provider.length})`);
    const live = await page.textContent('#ts-modal .ts-live').catch(() => '');
    check(/SMS · sent/.test(live) && /Email · sent/.test(live) && /Website · sent/.test(live), 'the dialog reports the real result per channel');
    check(!/someone@example|1112233/.test(live), 'the dialog shows masked recipients only');
    const before = posts.length;
    await page.evaluate(() => { const j = JOURNEYS.find((x) => x.id === 'JRN-12'); pauseJourney(j); activateJourney(j, false); }); await page.waitForTimeout(300);
    check(posts.length === before, 'resuming a paused journey does not send again');
    await page.screenshot({ path: path.join(__dirname, 'shots', 'live-send.png') });

    const web = posts[0].messages.find((m) => m.channel === 'web').url;
    await page.goto(web);
    check((await page.textContent('#hi')) === 'Hi Oksana' && (await page.isVisible('#offer')), 'the offer page greets the recipient and shows the offer');
    await page.click('#act'); check(await page.isVisible('#done'), 'Activate confirms on the page');
    await page.screenshot({ path: path.join(__dirname, 'shots', 'live-offer-page.png') });
    await page.goto(`${base}/offer/?n=${encodeURIComponent('<img src=x onerror=window.__x=1>')}&o=${encodeURIComponent('<b>x</b>')}`);
    check(!(await page.evaluate(() => window.__x)) && (await page.locator('#oname b').count()) === 0, 'the offer page renders link values as text, never as markup');
    await page.close();
  }
  {
    const page = await open('');
    const before = posts.length;
    await page.evaluate(() => { showView('journeys'); jOpen('JRN-07'); const j = JOURNEYS.find((x) => x.id === 'JRN-07'); j.status = 'Draft'; activateJourney(j, false); }); await page.waitForTimeout(400);
    check(posts.length === before + 1, 'without ?live= the page still posts (no special link needed)');
    check(!(await page.locator('#ts-modal').count()) && !(await page.locator('#toast', { hasText: 'Sent for real' }).count()), 'a sender that wants a key answers 401 and the page stays quiet');
    await page.close();
  }
  {
    serverEnv = Object.assign({}, ENV); delete serverEnv.DEMO_SEND_KEY;
    const page = await open(''); const before = provider.length;
    await page.evaluate(() => { showView('journeys'); jOpen('JRN-12'); const j = JOURNEYS.find((x) => x.id === 'JRN-12'); j.status = 'Draft'; activateJourney(j, false); });
    await page.waitForSelector('#ts-modal .ts-live', { timeout: 8000 }).catch(() => {});
    const live = await page.textContent('#ts-modal .ts-live').catch(() => '');
    check(/Email · sent/.test(live) && provider.length === before + 2, 'on a site with no key, the plain address sends on Activate');
    serverEnv = ENV; await page.close();
  }
  {
    const page = await browser.newPage(); const reqs = []; page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().includes('fonts.')) reqs.push(r.url()); });
    await page.route('https://fonts.**', (r) => r.abort());
    await page.goto('file://' + path.join(ROOT, 'index.html') + '?notour&live=k-123'); await page.waitForSelector('.view.active');
    await page.evaluate(() => { showView('journeys'); jOpen('JRN-07'); const j = JOURNEYS.find((x) => x.id === 'JRN-07'); j.status = 'Draft'; activateJourney(j, false); }); await page.waitForTimeout(400);
    check(reqs.length === 0, `opened from a file, the prototype requests nothing even with ?live= (${reqs.length})`);
    await page.close();
  }
  await browser.close(); server.close(); global.fetch = realFetch;
  console.log(`\nerrors: ${errors.length ? errors.join(' | ') : 'none'}`);
  process.exit(errors.length ? 1 : 0);
})();
