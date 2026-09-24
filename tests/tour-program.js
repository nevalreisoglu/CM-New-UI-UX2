#!/usr/bin/env node
/**
 * Regression script for the "Group work in a program" and "Follow a program" tours.
 *
 *   node tests/tour-program.js
 *
 * Forces each tour with window.startTour, drives it with nothing but "Do it for
 * me" and "Next", and asserts the end state: a saved program with a goal, a
 * contact cap and at least one member; for CMO and approver, the read-only tour
 * and nothing else. Also checks the hand path, Getting started, resume after a
 * reload and role changes. Screenshots land in tests/shots/.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = path.join(__dirname, 'shots');
const SHOT_STEPS = { 4: '04-goal', 7: '07-members', 8: '08-timeline' };

const errors = [];
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'}  ${what}`); if (!ok) errors.push(what); };
const stepNo = (p) => p.evaluate(() => { const n = document.querySelector('.tc-n'); return n ? +n.textContent.split('/')[0] : 0; });
const waitStep = (p, n) => p.waitForFunction((k) => { const e = document.querySelector('.tc-n'); return e && +e.textContent.split('/')[0] === k; }, n, { timeout: 6000 }).catch(() => {});
const cardState = (p) => p.evaluate(() => {
  const c = document.querySelector('.tour-card'); if (!c) return null;
  const n = c.querySelector('.tc-n');
  return { step: n ? +n.textContent.split('/')[0] : 0, title: (c.querySelector('h4') || {}).textContent || '', fill: !!c.querySelector('[data-sample]') };
});

async function newPage(browser, role) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_CERT/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(URL);
  await page.waitForSelector('.view.active');
  if (role) await page.selectOption('#role-sel', role);
  return page;
}

async function drive(page, id, shotPrefix) {
  await page.evaluate((i) => window.startTour(i), id);
  await page.waitForSelector('.tour-card');
  let seen = 0, guard = 0, last = -1, stuck = 0, fills = 0;
  while (guard++ < 40) {
    const st = await cardState(page);
    if (!st) break;
    seen = Math.max(seen, st.step); if (st.fill) fills++;
    if (st.step === last && ++stuck > 4) { errors.push(`${id}: stuck on step ${st.step} (${st.title})`); break; } else if (st.step !== last) stuck = 0;
    last = st.step;
    if (shotPrefix && SHOT_STEPS[st.step]) {
      const f = path.join(SHOTS, `${shotPrefix}-${SHOT_STEPS[st.step]}.png`);
      if (!fs.existsSync(f)) { await page.waitForTimeout(250); await page.screenshot({ path: f }); }
    }
    await page.click('[data-next]');
    await page.waitForFunction((b) => { const n = document.querySelector('.tc-n'); return !n || +n.textContent.split('/')[0] !== b; }, st.step, { timeout: 5000 }).catch(() => {});
  }
  return { seen, fills };
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  Object.values(SHOT_STEPS).forEach((s) => { const f = path.join(SHOTS, `tourP-${s}.png`); if (fs.existsSync(f)) fs.unlinkSync(f); });
  const browser = await chromium.launch();

  console.log('\nprogram tour — only "Do it for me" and "Next"');
  {
    const page = await newPage(browser);
    const total = await page.evaluate(() => window.TOURS['first-program'].steps.length);
    const { seen } = await drive(page, 'first-program', 'tourP');
    check(seen === total, `walked all ${total} steps (reached ${seen})`);
    const out = await page.evaluate(() => {
      const p = PROGRAMS.find((x) => x.name === 'Q4 Retention push');
      if (!p) return null;
      return { id: p.id, goal: p.goal, cap: p.cap, owner: p.owner, members: prgCamps(p).length + (p.journeys || []).length, status: window.tourStateFor('first-program').status };
    });
    check(!!out, 'the tour saved "Q4 Retention push"');
    if (out) {
      check(out.goal.metric === 'Conversions' && +out.goal.target === 5000, `goal: ${out.goal.metric} ${out.goal.target}`);
      check(out.cap.n === 2 && out.cap.per === 'week', `contact cap: ${out.cap.n} per ${out.cap.per}`);
      check(out.members >= 1, `has members (${out.members})`);
      check(out.status === 'done', 'the tour is recorded as done');
    }
    await page.click('.nav button[data-view="start"]');
    const gs = await page.evaluate(() => [...document.querySelectorAll('.gs-it')].map((n) => ({ t: n.querySelector('b').textContent.trim(), done: n.classList.contains('done'), soon: n.classList.contains('soon') })));
    const row = gs.find((g) => g.t.startsWith('Group work in a program')) || {};
    check(row.done === true && !row.soon, 'Getting started: "Group work in a program" is ticked, not "coming soon"');
    check(!gs.some((g) => g.soon && /journey|program/i.test(g.t)), 'no journey or program row is "coming soon" any more');
    await page.close();
  }

  console.log('\nprogram tour — by hand, without pressing Next');
  {
    const page = await newPage(browser);
    await page.evaluate(() => window.startTour('first-program'));
    await page.click('.nav button[data-view="programs"]'); await waitStep(page, 2);
    check(await stepNo(page) === 2, 'opening Program advances to step 2');
    await page.click('#prg-new'); await waitStep(page, 3);
    check(await stepNo(page) === 3, '+ New program advances to step 3');
    await page.fill('#prg-card input[data-pk="name"]', 'Typed by hand'); await waitStep(page, 4);
    check(await stepNo(page) === 4, 'typing the name advances to step 4');
    await page.fill('#prg-card input[data-pg="target"]', '1200'); await waitStep(page, 5);
    check(await stepNo(page) === 5, 'setting a goal target advances to step 5');
    await page.click('[data-next]'); await waitStep(page, 6);
    await page.click('#prg-save'); await waitStep(page, 7);
    check(await stepNo(page) === 7, 'Save advances to step 7');
    await page.click('#prg-pick');
    await page.click('#prg-card .pick input[type="checkbox"] >> nth=0');
    await page.click('#prg-pick-add'); await waitStep(page, 8);
    check(await stepNo(page) === 8, 'adding a member advances to step 8');
    await page.evaluate(() => window.stopTour('skipped'));
    await page.close();
  }

  console.log('\nresume after a reload');
  {
    const page = await newPage(browser);
    await page.evaluate(() => { window.startTour('first-program'); window.tourGo(5); });
    await page.reload(); await page.waitForSelector('.view.active');
    await page.evaluate(() => window.tourResume());
    const txt = await page.evaluate(() => (document.querySelector('.tour-card.center') || {}).textContent || '');
    check(/Continue where you left off\?/.test(txt) && /Group work in a program/.test(txt), 'a reload offers "Continue where you left off?"');
    await page.click('[data-yes]'); await page.waitForSelector('.tc-n');
    check(await stepNo(page) === 2, 'Continue resumes at the New program step');
    await page.close();
  }

  console.log('\nCMO and approver: only the read-only tour');
  for (const role of ['cmo', 'approver']) {
    const page = await newPage(browser, role);
    const tours = await page.evaluate(() => Object.keys(window.TOURS).filter((k) => !window.TOURS[k].roles || window.TOURS[k].roles.includes(document.getElementById('role-sel').value)));
    check(tours.includes('follow-program') && !tours.includes('first-program') && !tours.includes('first-journey'), `${role}: follow-program, not the build tours (${tours.join(', ')})`);
    await page.click('.nav button[data-view="start"]');
    const rows = await page.evaluate(() => [...document.querySelectorAll('.gs-it')].map((n) => n.querySelector('b').textContent.trim()));
    check(rows.some((r) => r.startsWith('Follow a program')) && !rows.some((r) => /Group work|Build a journey/.test(r)), `${role}: Getting started shows "Follow a program" only`);
    const { seen, fills } = await drive(page, 'follow-program', role === 'cmo' ? 'tourF' : null);
    check(seen === 4 && fills === 0, `${role}: four steps, no "Do it for me" (${seen} steps, ${fills} fills)`);
    check(await page.evaluate(() => window.tourStateFor('follow-program').status) === 'done', `${role}: finishes`);
    await page.click('.nav button[data-view="start"]');
    const done = await page.evaluate(() => { const n = [...document.querySelectorAll('.gs-it')].find((x) => x.querySelector('b').textContent.startsWith('Follow a program')); return n && n.classList.contains('done'); });
    check(done === true, `${role}: "Follow a program" is ticked`);
    await page.evaluate(() => { window.startTour('follow-program'); window.tourGo(2); });
    await page.selectOption('#role-sel', 'marketer'); await page.waitForTimeout(250);
    check((await page.$$('.tour-card')).length === 0, `${role}: switching role mid-tour stops it`);
    await page.close();
  }
  {
    // A CMO who opens a Timeline by hand gets the item ticked too.
    const page = await newPage(browser, 'cmo');
    await page.click('.nav button[data-view="programs"]');
    await page.click('#prg-card tbody tr >> nth=0');
    await page.click('#prg-card [data-tab="timeline"]');
    await page.click('.nav button[data-view="start"]');
    const done = await page.evaluate(() => { const n = [...document.querySelectorAll('.gs-it')].find((x) => x.querySelector('b').textContent.startsWith('Follow a program')); return n && n.classList.contains('done'); });
    check(done === true, 'cmo: opening a Timeline by hand ticks "Follow a program"');
    await page.close();
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  console.log(`screenshots: ${SHOTS}`);
  process.exit(errors.length ? 1 : 0);
})();
