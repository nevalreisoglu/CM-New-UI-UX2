#!/usr/bin/env node
/**
 * Regression run for the Journey list and "Create your journey".
 *
 *   node tests/jlist.js
 *
 * Journey Builder opens on a list like Campaign: search, status chips,
 * advanced filters, a validation indicator per row and five row actions.
 * The script filters the list, opens a journey, returns with ‹ Journey list,
 * walks the row menu, creates a journey through the centred creation screen,
 * and checks the layout at 1280 and 1440 px, menu open and collapsed.
 * An empty error list is the pass condition.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?notour';
const SHOTS = path.join(__dirname, 'shots');
const errors = [];
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'}  ${what}`); if (!ok) errors.push(what); };

async function open(browser, role = 'marketer', width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(URL);
  await page.waitForSelector('.view.active');
  await page.selectOption('#role-sel', role);
  return page;
}
const rowIds = (p) => p.$$eval('#jl-table tbody tr[data-jid]', (trs) => trs.map((t) => t.dataset.jid));

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  console.log('\nthe list is the default screen');
  let page = await open(browser);
  await page.click('.nav button[data-view="journeys"]');
  check(await page.isVisible('#jl-card') && !(await page.isVisible('#jsplit')), 'Journey Builder opens on the list, not the canvas');
  check((await page.textContent('#crumb')).replace(/\s+/g, ' ').includes('Plan & build›Journey Builder') && (await page.textContent('#crumb .cur')) === 'Journey Builder', 'breadcrumb: Plan & build › Journey Builder');
  const campCls = await page.evaluate(() => { showView('campaigns'); const t = document.getElementById('camp-table'); const r = [t.className, t.closest('.padx') ? 'padx' : '']; showView('journeys'); return r; });
  const jCls = await page.$eval('#jl-table', (t) => [t.className, t.closest('.padx') ? 'padx' : '']);
  check(JSON.stringify(campCls) === JSON.stringify(jCls), `same table components as the campaign list (${jCls.join(' in ')})`);
  check(!!(await page.$('#jl-card .toolrow .search-in')) && !!(await page.$('#jl-card .chipbar .fchip')) && !!(await page.$('#jl-card .pager')), 'same search box, status chips and pager');
  const all = await rowIds(page);
  check(all.length >= 3, `every journey is listed (${all.join(', ')})`);
  const valid = await page.$$eval('#jl-table tbody tr[data-jid] td:nth-child(3) .mini', (m) => m.map((x) => [x.textContent.trim(), x.title]));
  check(valid.length === all.length && valid.every(([t, tip]) => /\d\/\d/.test(t) && tip.length > 0), 'a validation indicator on every row, with a tooltip: ' + valid[0][0]);

  console.log('\nfilters');
  await page.fill('#jl-q', 'churn');
  check(JSON.stringify(await rowIds(page)) === '["JRN-07"]', 'search by name');
  await page.fill('#jl-q', 'JRN-12');
  check(JSON.stringify(await rowIds(page)) === '["JRN-12"]', 'search by ID');
  await page.fill('#jl-q', '');
  await page.click('[data-jst="Draft"]');
  check((await rowIds(page)).length === 0 && /No journey matches/.test(await page.textContent('#jl-table tbody')), 'status chip Draft: an empty state with one sentence and the primary action');
  check(!!(await page.$('#jl-new2')), 'the empty state offers + New journey');
  await page.click('#jl-clear');
  await page.click('#jl-adv');
  const adv = await page.$$eval('#jl-card .adv label', (l) => l.map((x) => x.textContent.trim()));
  check(['Program', 'Trigger type', 'Channel in a delivery step', 'Owner', 'Datamart', 'Updated from', 'Updated to'].every((x) => adv.includes(x)), 'advanced filters: ' + adv.join(' · '));
  await page.selectOption('#jf-trigger', 'Event');
  const ev = await rowIds(page);
  check(ev.length > 0 && !ev.includes('JRN-07'), `trigger type Event: ${ev.join(', ')}`);
  await page.selectOption('#jf-trigger', '');
  await page.selectOption('#jf-program', 'Package renewal');
  check(JSON.stringify(await rowIds(page)) === '["JRN-07"]', 'program: Package renewal → JRN-07');
  await page.selectOption('#jf-program', '');
  await page.fill('#jf-from', '2026-09-05');
  const recent = await rowIds(page);
  check(recent.length > 0 && !recent.includes('JRN-07'), `updated from 2026-09-05: ${recent.join(', ')}`);
  await page.fill('#jf-from', '');
  await page.screenshot({ path: path.join(SHOTS, 'jlist-advanced.png') });
  await page.click('#jl-adv');

  console.log('\nopen and return');
  await page.click('#jl-table tr[data-jid="JRN-07"] td:first-child');
  await page.waitForSelector('#jsplit:not([hidden])');
  check((await page.textContent('#crumb .cur')) === 'JRN-07' && (await page.inputValue('#jsel')) === 'JRN-07', 'a row opens its canvas; breadcrumb ends in JRN-07');
  check(!!(await page.$('#jsel')) && !(await page.$('#btn-jlist')), 'the dropdown stays as a quick switcher; the List button is gone');
  await page.selectOption('#jsel', 'JRN-12');
  check((await page.evaluate(() => curJ)) === 'JRN-12', 'the quick switcher still works');
  await page.click('#btn-jback');
  check(await page.isVisible('#jl-card') && (await page.textContent('#crumb .cur')) === 'Journey Builder', '‹ Journey list returns to the list');
  await page.click('.nav button[data-view="dashboard"]');
  await page.click('.nav button[data-view="journeys"]');
  check(await page.isVisible('#jl-card'), 'the menu entry always lands on the list');

  console.log('\nrow actions');
  await page.click('[data-jmore="JRN-07"]');
  const menu = await page.$$eval('[data-jmore="JRN-07"] + .pop button', (b) => b.map((x) => [x.textContent.trim(), x.disabled]));
  check(JSON.stringify(menu.map((m) => m[0])) === '["Monitor","Execution report","Copy","Pause"]', 'Open plus Monitor · Execution report · Copy · Pause: ' + menu.map((m) => m[0]).join(' · '));
  check(menu[3][1] === true, 'a marketer cannot pause — the action is there, disabled with the reason');
  const inView = await page.$eval('[data-jmore="JRN-07"] + .pop', (p) => { const r = p.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.height > 60; });
  check(inView, 'the row menu is fully on screen, not clipped by the table');
  await page.click('[data-jmore="JRN-07"] + .pop [data-jmon]');
  check((await page.$eval('.view.active', (v) => v.id)) === 'view-monitor' && (await page.inputValue('#msel')) === 'JRN-07', 'Monitor opens the Journey Monitor on that journey');
  await page.click('.nav button[data-view="journeys"]');
  await page.click('[data-jmore="JRN-12"]');
  await page.click('[data-jmore="JRN-12"] + .pop [data-jrep]');
  check(await page.isVisible('#rep-modal') || !(await page.$eval('#rep-modal', (m) => m.hidden)), 'Execution report opens the report for that journey');
  await page.keyboard.press('Escape');
  const before = (await rowIds(page)).length;
  await page.click('[data-jmore="JRN-20"]');
  await page.click('[data-jmore="JRN-20"] + .pop [data-jcopy]');
  await page.waitForSelector('#jsplit:not([hidden])');
  const copy = await page.evaluate(() => { const j = JOURNEYS.find((x) => x.id === curJ); return [j.id, j.name, j.status]; });
  check(/\(copy\)$/.test(copy[1]) && copy[2] === 'Draft', `Copy creates ${copy[0]} as a Draft and opens it`);
  await page.click('#btn-jback');
  check((await rowIds(page)).length === before + 1, 'the copy is in the list');
  await page.close();

  page = await open(browser, 'approver');
  await page.click('.nav button[data-view="journeys"]');
  await page.click('[data-jmore="JRN-07"]');
  await page.click('[data-jmore="JRN-07"] + .pop [data-jpause]');
  check((await page.evaluate(() => JOURNEYS.find((j) => j.id === 'JRN-07').status)) === 'Paused', 'an approver pauses a journey from the list');
  await page.click('[data-jmore="JRN-07"]');
  check((await page.textContent('[data-jmore="JRN-07"] + .pop [data-jpause]')).trim() === 'Resume', 'and the action becomes Resume');
  await page.click('[data-jmore="JRN-07"] + .pop [data-jpause]');
  check((await page.evaluate(() => JOURNEYS.find((j) => j.id === 'JRN-07').status)) === 'Active', 'Resume activates it again');
  await page.close();

  console.log('\nCreate your journey');
  page = await open(browser);
  await page.click('.nav button[data-view="journeys"]');
  await page.click('#jl-new');
  check((await page.textContent('#jl-card .cc-hd h2')) === 'Create your journey' && !(await page.isVisible('#jsplit')), 'a centred creation screen, no canvas yet');
  check((await page.textContent('#crumb .cur')) === 'New journey', 'breadcrumb: … › New journey');
  check(await page.evaluate(() => document.activeElement && document.activeElement.id === 'jc-name'), 'the name field has the focus');
  const cards = await page.$$eval('[data-trig] b', (b) => b.map((x) => x.textContent));
  check(JSON.stringify(cards) === JSON.stringify(['When something happens', 'When someone enters a segment', 'On a schedule']), 'three trigger cards');
  check(!!(await page.$('#jc-ev')) && !(await page.$('#jc-seg')), 'the event card reveals the event field');
  await page.click('[data-trig="segment"]');
  check(!!(await page.$('#jc-seg')) && !(await page.$('#jc-ev')), 'the segment card reveals the segment field');
  await page.click('[data-trig="schedule"]');
  check(!!(await page.$('#jc-seg')) && !!(await page.$('#jc-sched')), 'the schedule card reveals the segment and when it runs');
  const w = await page.$eval('#jl-card .cc', (c) => c.getBoundingClientRect().width);
  check(w <= 722, `one centred column, max ~720 px (${Math.round(w)} px)`);
  check((await page.$$('#jl-card [data-jctpl]')).length >= 2, 'a Start from a template strip');
  await page.screenshot({ path: path.join(SHOTS, 'jlist-create.png') });
  await page.fill('#jc-name', 'Weekly usage digest');
  await page.selectOption('#jc-sched', 'Weekly · Mon · 10:00');
  await page.click('#jc-start');
  await page.waitForSelector('#jsplit:not([hidden])');
  const made = await page.evaluate(() => { const j = JOURNEYS.find((x) => x.id === curJ); return { id: j.id, mode: j.nodes[0].cfg.mode, sched: j.nodes[0].cfg.schedule, first: j.nodes[0].type, sel: selNode }; });
  check(made.first === 'entry' && made.mode === 'Segment only (scheduled)' && made.sched === 'Weekly · Mon · 10:00', `Start building lands on the canvas of ${made.id} with its entry step in place`);
  check((await page.textContent('#crumb .cur')) === made.id, 'breadcrumb ends in the new journey');
  await page.click('#btn-jback');
  check((await rowIds(page)).includes(made.id), 'the new journey is in the list as a Draft');
  await page.click('#jl-new');
  await page.click('#jl-card [data-jctpl]');
  await page.waitForSelector('#jsplit:not([hidden])');
  check(/\(copy\)$/.test(await page.evaluate(() => JOURNEYS.find((x) => x.id === curJ).name)), 'a template opens a copy');
  await page.close();

  console.log('\nlayout: 1280 and 1440, menu open and collapsed');
  for (const width of [1280, 1440]) {
    for (const collapsed of [false, true]) {
      const p = await open(browser, 'admin', width);
      if (collapsed) { await p.click('#btn-nav'); await p.waitForTimeout(200); }
      await p.click('.nav button[data-view="journeys"]');
      const fit = await p.$eval('#jl-table', (t) => ({ tw: t.scrollWidth, cw: t.parentElement.clientWidth, name: t.querySelector('tbody td').getBoundingClientRect().width }));
      check(fit.tw <= fit.cw + 1 && fit.name >= 140, `${width} px, menu ${collapsed ? 'collapsed' : 'open'}: no horizontal scroll in the list (${fit.tw}/${fit.cw}), journey column ${Math.round(fit.name)} px`);
      await p.screenshot({ path: path.join(SHOTS, `jlist-${width}${collapsed ? '-collapsed' : ''}.png`) });
      await p.close();
    }
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  process.exit(errors.length ? 1 : 0);
})();
