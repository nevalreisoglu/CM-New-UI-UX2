#!/usr/bin/env node
/**
 * Regression script for the "Build your first journey" tour.
 *
 *   node tests/tour-journey.js
 *
 * Forces the tour with window.startTour (auto-start is off under automation),
 * drives it with nothing but "Do it for me" and "Next", and asserts that the
 * journey it leaves behind is validated and has a Delivery, a Wait for event with
 * two connected branches and an Exit. Then checks the hand path, Getting started,
 * resume after a reload and the ? menu. Screenshots land in tests/shots/.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = path.join(__dirname, 'shots');
const SHOT_STEPS = { 4: '04-trigger', 8: '08-delivery', 11: '11-branches', 14: '14-simulation' };

const errors = [];
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'}  ${what}`); if (!ok) errors.push(what); };
const stepNo = (p) => p.evaluate(() => { const n = document.querySelector('.tc-n'); return n ? +n.textContent.split('/')[0] : 0; });
const cardState = (p) => p.evaluate(() => {
  const c = document.querySelector('.tour-card'); if (!c) return null;
  const n = c.querySelector('.tc-n');
  return { step: n ? +n.textContent.split('/')[0] : 0, total: n ? +n.textContent.split('/')[1] : 0, title: (c.querySelector('h4') || {}).textContent || '' };
});
const waitStep = (p, n) => p.waitForFunction((k) => { const e = document.querySelector('.tc-n'); return e && +e.textContent.split('/')[0] === k; }, n, { timeout: 6000 }).catch(() => {});

async function newPage(browser, role) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_CERT/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('dialog', (d) => d.accept('accepted'));
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(URL);
  await page.waitForSelector('.view.active');
  if (role) await page.selectOption('#role-sel', role);
  return page;
}

async function drive(page, id, shotPrefix) {
  await page.evaluate((i) => window.startTour(i), id);
  await page.waitForSelector('.tour-card');
  let seen = 0, guard = 0, last = -1, stuck = 0;
  while (guard++ < 60) {
    const st = await cardState(page);
    if (!st) break;
    seen = Math.max(seen, st.step);
    if (st.step === last && ++stuck > 4) { errors.push(`${id}: stuck on step ${st.step} (${st.title})`); break; } else if (st.step !== last) stuck = 0;
    last = st.step;
    if (shotPrefix && SHOT_STEPS[st.step]) {
      const f = path.join(SHOTS, `${shotPrefix}-${SHOT_STEPS[st.step]}.png`);
      if (!fs.existsSync(f)) { await page.waitForTimeout(250); await page.screenshot({ path: f }); }
    }
    await page.click('[data-next]');
    await page.waitForFunction((b) => { const n = document.querySelector('.tc-n'); return !n || +n.textContent.split('/')[0] !== b; }, st.step, { timeout: 5000 }).catch(() => {});
  }
  return seen;
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  SHOT_STEPS && Object.values(SHOT_STEPS).forEach((s) => { const f = path.join(SHOTS, `tourJ-${s}.png`); if (fs.existsSync(f)) fs.unlinkSync(f); });
  const browser = await chromium.launch();

  console.log('\njourney tour — only "Do it for me" and "Next"');
  {
    const page = await newPage(browser);
    const total = await page.evaluate(() => window.TOURS['first-journey'].steps.length);
    const seen = await drive(page, 'first-journey', 'tourJ');
    check(seen === total, `walked all ${total} steps (reached ${seen})`);
    const out = await page.evaluate(() => {
      const j = JOURNEYS.filter((x) => !['JRN-07', 'JRN-12', 'JRN-20'].includes(x.id)).slice(-1)[0];
      if (!j) return null;
      const v = jValidate(j); const w = j.nodes.find((n) => n.type === 'wait');
      const reach = (id) => (w ? w.next : []).map((x) => (typeof x === 'string' ? x : x.to)).map((t) => j.nodes.find((n) => n.id === t));
      return {
        name: j.name, status: j.status, valid: v.done === v.total, event: [].concat(j.nodes[0].cfg.events).join(','),
        delivery: j.nodes.filter((n) => n.type === 'delivery').map((n) => ({ ch: n.cfg.channel, text: n.cfg.text })),
        waitEvent: w && w.cfg.event, waitTimeout: w && w.cfg.timeout, labels: w ? w.next.map((x) => x.label) : [],
        targets: reach().map((n) => n && n.type), exits: j.nodes.filter((n) => n.type === 'exit').length,
        entered: Object.keys(sim[j.id].parts).length, status_: window.tourStateFor('first-journey').status,
      };
    });
    check(!!out, 'the tour created a journey');
    if (out) {
      check(out.name === 'Balance low — top-up nudge', `named "${out.name}"`);
      check(out.event === 'balance_low', 'starts on balance_low');
      check(out.delivery.some((d) => d.ch === 'sms' && /balance is low/i.test(d.text || '')), 'has the SMS delivery with the tour text');
      check(out.waitEvent === 'offer_accepted' && out.waitTimeout === '1 day', 'Wait for event: offer_accepted, 1 day');
      check(out.labels.join('/') === 'accepted/timeout' && out.targets.join('/') === 'exit/delivery', `two branches: accepted → exit, timeout → reminder (${out.labels.join('/')} → ${out.targets.join('/')})`);
      check(out.exits >= 1, 'has an Exit');
      check(out.valid, 'passes validation');
      check(out.status === 'Active', 'is Active');
      check(out.entered > 0, 'a test customer entered through the simulation strip');
      check(out.status_ === 'done', 'the tour is recorded as done');
    }
    await page.click('.nav button[data-view="start"]');
    const gs = await page.evaluate(() => [...document.querySelectorAll('.gs-it')].map((n) => ({ t: n.querySelector('b').textContent.trim(), done: n.classList.contains('done'), soon: n.classList.contains('soon') })));
    const row = gs.find((g) => g.t.startsWith('Build a journey')) || {};
    check(row.done === true && !row.soon, 'Getting started: "Build a journey" is ticked, not "coming soon"');
    await page.screenshot({ path: path.join(SHOTS, 'tourJ-getting-started.png') });
    await page.close();
  }

  console.log('\njourney tour — by hand, without pressing Next');
  {
    const page = await newPage(browser);
    await page.evaluate(() => window.startTour('first-journey'));
    await page.click('.nav button[data-view="journeys"]'); await waitStep(page, 2);
    check(await stepNo(page) === 2, 'opening Journey Builder advances to step 2');
    await page.click('#jl-new'); await waitStep(page, 3);
    check(await stepNo(page) === 3, '+ New journey advances to step 3');
    await page.fill('#jc-name', 'Typed by hand'); await waitStep(page, 4);
    check(await stepNo(page) === 4, 'typing the name advances to step 4');
    await page.click('#jl-card [data-trig="event"]'); await waitStep(page, 5);
    check(await stepNo(page) === 5, 'picking "When something happens" advances to step 5');
    await page.click('[data-next]'); await waitStep(page, 6);
    await page.click('#jc-start'); await waitStep(page, 7);
    check(await stepNo(page) === 7, 'Start building advances to step 7, on the canvas');
    await page.click('[data-next]'); await waitStep(page, 8);
    await page.click('#palette [data-tour="pal-delivery"]'); await waitStep(page, 9);
    check(await stepNo(page) === 9, 'clicking Delivery in the palette advances to step 9');
    await page.fill('#jp-body #f-text', 'Written by hand'); await waitStep(page, 10);
    check(await stepNo(page) === 10, 'writing the delivery text advances to step 10');
    await page.click('#palette [data-tour="pal-wait"]'); await waitStep(page, 11);
    check(await stepNo(page) === 11, 'clicking Wait for event advances to step 11');
    // Draw the accepted branch by dragging from the Wait step's port to the Exit, then add the
    // reminder from the palette with the Wait step selected — the second branch.
    const ids = await page.evaluate(() => { const j = JOURNEYS[JOURNEYS.length - 1]; return { w: j.nodes.find((n) => n.type === 'wait').id, x: j.nodes.find((n) => n.type === 'exit').id }; });
    const port = await page.locator(`#canvas .node[data-id="${ids.w}"] circle.port.out`).boundingBox();
    const ex = await page.locator(`#canvas .node[data-id="${ids.x}"] rect.body`).boundingBox();
    await page.mouse.move(port.x + port.width / 2, port.y + port.height / 2); await page.mouse.down();
    await page.mouse.move(ex.x + ex.width / 2, ex.y + ex.height / 2, { steps: 8 }); await page.mouse.up();
    check(await page.evaluate((w) => { const j = JOURNEYS[JOURNEYS.length - 1]; return j.nodes.find((n) => n.id === w).next.length; }, ids.w) === 1, 'dragging from the port draws a branch through the spotlight');
    await page.click('#palette [data-tour="pal-delivery"]'); await waitStep(page, 12);
    check(await stepNo(page) === 12, 'a second branch advances to step 12');
    await page.evaluate(() => window.stopTour('skipped'));
    await page.close();
  }

  console.log('\nresume after a reload, the ? menu and role changes');
  {
    const page = await newPage(browser);
    await page.evaluate(() => { window.startTour('first-journey'); window.tourGo(8); });
    await page.reload(); await page.waitForSelector('.view.active');
    await page.evaluate(() => window.tourResume());
    const txt = await page.evaluate(() => (document.querySelector('.tour-card.center') || {}).textContent || '');
    check(/Continue where you left off\?/.test(txt) && /Build your first journey/.test(txt), 'a reload offers "Continue where you left off?"');
    check(/New journey/.test(txt), 'and says it picks up from New journey (the draft is gone)');
    await page.click('[data-yes]'); await page.waitForSelector('.tc-n');
    check(await stepNo(page) === 2, 'Continue resumes at the New journey step');
    await page.evaluate(() => window.stopTour('skipped'));
    await page.click('#btn-help');
    const menu = await page.evaluate(() => [...document.querySelectorAll('#help-menu [data-tour]')].map((b) => b.dataset.tour + ':' + b.querySelector('.pill').textContent));
    check(menu.some((m) => m.startsWith('first-journey:')), `? › Guided tours lists the journey tour (${menu.join(', ')})`);
    await page.click('#help-menu [data-tour="first-journey"]'); await page.waitForSelector('.tc-n');
    check(await page.evaluate(() => window.TOUR.id) === 'first-journey', 'it starts from the ? menu');
    await page.selectOption('#role-sel', 'cmo'); await page.waitForTimeout(250);
    check((await page.$$('.tour-card')).length === 0, 'changing role stops it');
    await page.close();
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  console.log(`screenshots: ${SHOTS}`);
  process.exit(errors.length ? 1 : 0);
})();
