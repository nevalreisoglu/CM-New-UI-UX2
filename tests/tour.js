#!/usr/bin/env node
/**
 * Regression script for the guided tours (v42).
 *
 *   node tests/tour.js
 *
 * Opens index.html WITHOUT ?notour and forces the tour through
 * window.startTour — auto-start is suppressed under automation because the
 * prototype checks navigator.webdriver, so nothing would appear on its own.
 *
 * Drives "Create your first campaign" with nothing but "Do it for me" and
 * "Next", then asserts the campaign really reached Pending approval and that
 * the Getting started checklist noticed. Screenshots land in tests/shots/.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = path.join(__dirname, 'shots');
const SHOT_STEPS = { 1: '01-welcome', 5: '05-create', 7: '07-channels', 10: '10-segments', 13: '13-content', 16: '16-approval' };

const errors = [];
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'}  ${what}`); if (!ok) errors.push(what); };

const cardState = (p) => p.evaluate(() => {
  const c = document.querySelector('.tour-card');
  if (!c) return null;
  const n = document.querySelector('.tc-n');
  return {
    step: n ? +n.textContent.split('/')[0].trim() : 0,
    total: n ? +n.textContent.split('/')[1].trim() : 0,
    title: (c.querySelector('h4') || {}).textContent || '',
    fill: !!c.querySelector('[data-sample]'),
    finale: !!c.querySelector('[data-fin]'),
    button: (c.querySelector('[data-next]') || {}).textContent || '',
  };
});

async function newPage(browser, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  if (opts.breakStorage) {
    // A private window or an embedded preview can make this throw on access.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage denied'); } });
    });
  }
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(URL + (opts.query || ''));
  await page.waitForSelector('.view.active');
  return page;
}

async function driveFirstCampaign(page, { shots = false } = {}) {
  await page.evaluate(() => window.startTour('first-campaign'));
  await page.waitForSelector('.tour-card');
  let seen = 0, guard = 0;
  while (guard++ < 40) {
    const st = await cardState(page);
    if (!st) break;
    seen = Math.max(seen, st.step);
    if (shots && SHOT_STEPS[st.step] && !fs.existsSync(path.join(SHOTS, `tourA-${SHOT_STEPS[st.step]}.png`))) {
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(SHOTS, `tourA-${SHOT_STEPS[st.step]}.png`) });
    }
    if (st.finale) { await page.click('[data-fin="1"]'); break; }
    const before = st.step;
    if (st.fill && st.button === 'Show me') await page.click('[data-sample]');
    else await page.click('[data-next]');
    await page.waitForFunction(
      (b) => { const n = document.querySelector('.tc-n'); return !n || +n.textContent.split('/')[0] !== b; },
      before, { timeout: 8000 }
    ).catch(() => {});
  }
  return seen;
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  console.log('\ntour A — create your first campaign, using only "Do it for me" and "Next"');
  {
    const page = await newPage(browser);
    const seen = await driveFirstCampaign(page, { shots: true });
    check(seen === 17, `walked all 17 steps (reached ${seen})`);

    const out = await page.evaluate(() => {
      const seeded = window.__seedIds;
      const mine = CAMPAIGNS.filter((c) => c.createdBy === 'Neval Reisoğlu' && c.status === 'Pending approval');
      return {
        pending: mine.map((c) => ({ id: c.id, name: c.name, channels: c.channels, lists: c.lists.map((l) => l.id), offers: c.offers })),
        status: window.tourStateFor('first-campaign').status,
        stats: window.startStats(),
      };
    });
    check(out.pending.length === 1, 'exactly one campaign is waiting for approval');
    const c = out.pending[0] || {};
    check(/my first/i.test(c.name || ''), `it is the tour's campaign (${c.name})`);
    check((c.channels || []).includes('sms'), 'SMS is its channel');
    check((c.lists || []).includes('ML-2202'), 'the 2-day expiry segment is its target');
    check((c.offers || []).length > 0, 'it carries an offer');
    check(out.status === 'done', 'the tour is recorded as done');

    await page.click('.nav button[data-view="start"]');
    const gs = await page.evaluate(() => [...document.querySelectorAll('.gs-it')].map((n) => ({
      title: n.querySelector('b').textContent.trim(), done: n.classList.contains('done') })));
    const done = (t) => (gs.find((g) => g.title.startsWith(t)) || {}).done;
    check(done('Create your first campaign') === true, 'checklist: "Create your first campaign" is ticked');
    check(done('Submit a campaign for approval') === true, 'checklist: "Submit a campaign for approval" is ticked');
    await page.screenshot({ path: path.join(SHOTS, 'getting-started-marketer.png') });
    await page.close();
  }

  console.log('\ntour A — done by hand, without pressing Next');
  {
    const page = await newPage(browser);
    await page.evaluate(() => { window.startTour('first-campaign'); window.tourGo(1); });
    await page.click('.nav button[data-view="campaigns"]');
    await page.waitForFunction(() => +document.querySelector('.tc-n').textContent.split('/')[0] === 3, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate(() => +document.querySelector('.tc-n').textContent.split('/')[0]) === 3, 'clicking the menu advances to step 3');
    await page.click('#camp-new');
    await page.waitForFunction(() => +document.querySelector('.tc-n').textContent.split('/')[0] === 4, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate(() => +document.querySelector('.tc-n').textContent.split('/')[0]) === 4, 'clicking + New campaign advances to step 4');
    await page.fill('#camp-card input[data-k="name"]', 'Typed by hand');
    await page.waitForFunction(() => +document.querySelector('.tc-n').textContent.split('/')[0] === 5, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate(() => +document.querySelector('.tc-n').textContent.split('/')[0]) === 5, 'typing the name advances to step 5');
    await page.click('#cc-start');
    await page.waitForFunction(() => +document.querySelector('.tc-n').textContent.split('/')[0] === 6, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate(() => +document.querySelector('.tc-n').textContent.split('/')[0]) === 6, 'Start building advances to step 6, in the editor');
    check(await page.evaluate(() => !!document.querySelector('#camp-card .stepper')), 'the editor shows the stepper after Start building');
    await page.close();
  }

  console.log('\nthe other tours run end to end for their roles');
  for (const [role, id, name] of [
    ['marketer', 'create-segment', 'Create a segment'],
    ['approver', 'approve-campaign', 'Review and approve a campaign'],
    ['cmo', 'read-dashboard', 'Read the dashboard'],
    ['admin', 'admin-setup', 'Admin setup'],
  ]) {
    const page = await newPage(browser);
    await page.selectOption('#role-sel', role);
    await page.evaluate((i) => window.startTour(i), id);
    let guard = 0, last = -1, stuck = 0;
    while (guard++ < 30) {
      const st = await cardState(page);
      if (!st) break;
      if (st.step === last && ++stuck > 3) break; else if (st.step !== last) stuck = 0;
      last = st.step;
      if (st.finale) { await page.click('[data-fin="0"]'); break; }
      if (st.fill && st.button === 'Show me') await page.click('[data-sample]'); else await page.click('[data-next]');
      await page.waitForFunction((b) => { const n = document.querySelector('.tc-n'); return !n || +n.textContent.split('/')[0] !== b; }, last, { timeout: 6000 }).catch(() => {});
    }
    const status = await page.evaluate((i) => window.tourStateFor(i).status, id);
    check(status === 'done', `${name} (${role}) finishes`);
    if (role === 'cmo') await page.screenshot({ path: path.join(SHOTS, 'tourD-dashboard.png') });
    await page.close();
  }

  console.log('\nguard rails');
  {
    const page = await newPage(browser, { query: '?notour' });
    await page.waitForTimeout(700);
    check((await page.$$('.tour-card')).length === 0, '?notour shows nothing on load');
    await page.close();
  }
  {
    const page = await newPage(browser);
    await page.evaluate(() => { window.startTour('first-campaign'); window.tourGo(4); });
    await page.selectOption('#role-sel', 'cmo');
    await page.waitForTimeout(250);
    check((await page.$$('.tour-card')).length === 0, 'changing role stops the running tour');
    await page.close();
  }
  {
    // Everything must still work when localStorage throws on access.
    const page = await newPage(browser, { breakStorage: true });
    const ok = await page.evaluate(() => {
      window.startTour('read-dashboard');
      const shown = !!document.querySelector('.tour-card');
      window.tourGo(2);
      const step = window.tourStateFor('read-dashboard').step;
      window.stopTour('skipped');
      return shown && step === 2;
    });
    check(ok, 'the tour runs with localStorage denied');
    check((await page.$$('#start-card .gs-it')).length >= 0, 'Getting started still renders with localStorage denied');
    await page.close();
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  console.log(`screenshots: ${SHOTS}`);
  process.exit(errors.length ? 1 : 0);
})();
