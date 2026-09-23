#!/usr/bin/env node
/**
 * Regression run for Operation analysis.
 *
 *   node tests/ops.js
 *
 * Walks the one screen that replaces the current product's five report grids:
 * the scope bar, all four tabs, the column chooser and technical ids, sorting,
 * the advanced NOT/AND/OR filter, CSV export, saved views, the row side panel,
 * empty states, masking of recipient details, and the "Results" entry point
 * from a campaign. Screenshots go to tests/shots/ at 1280 and 1440 px, menu
 * open and collapsed. An empty error list is the pass condition.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?notour';
const SHOTS = path.join(__dirname, 'shots');
const errors = [];
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'}  ${what}`); if (!ok) errors.push(what); };

async function open(browser, role = 'marketer', width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, acceptDownloads: true });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(URL);
  await page.waitForSelector('.view.active');
  await page.selectOption('#role-sel', role);
  return page;
}
const heads = (p) => p.$$eval('#ops-grid thead th', (ths) => ths.map((t) => t.textContent.replace(/[▲▼]/g, '').trim()));
const rowCount = (p) => p.$eval('.ops-gt .kpi b', (b) => +b.textContent.replace(/,/g, ''));
const tab = async (p, k) => { await p.click(`[data-opt="${k}"]`); await p.waitForSelector(`[data-opt="${k}"].on`); };
const noHScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('#ops-card').scrollWidth <= document.querySelector('#ops-card').clientWidth + 1);

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  console.log('\nthe menu');
  let page = await open(browser);
  const nav = await page.$$eval('.nav button[data-view]:not([hidden])', (bs) => bs.map((b) => b.dataset.view));
  check(nav.includes('opsan'), 'Operation analysis is in the marketer menu');
  check(nav.indexOf('opsan') === nav.indexOf('reports') + 1, 'it sits right after Reports, in Operate');
  check(await page.$eval('.nav button[data-view="opsan"]', (b) => b.dataset.grp === 'ops'), 'group is Operate');
  check((await page.$$('.nav button[data-view]')).length === (await page.$$('.nav button[data-view]')).length && !(await page.$('.nav button[data-view*="promo"]')), 'one menu item — no separate Active Promotions screen');
  for (const role of ['approver', 'admin']) {
    await page.selectOption('#role-sel', role);
    check(!(await page.$eval('.nav button[data-view="opsan"]', (b) => b.hidden)), `visible for ${role}`);
  }
  await page.selectOption('#role-sel', 'cmo');
  check(await page.$eval('.nav button[data-view="opsan"]', (b) => b.hidden), 'hidden for the executive');
  await page.selectOption('#role-sel', 'marketer');

  console.log('\nReports and Operation analysis say which is which');
  await page.click('.nav button[data-view="reports"]');
  check(/row-level/.test(await page.textContent('#rp-card .rp-ops')), 'Reports names Operation analysis as the row-level view');
  await page.click('#rp-toops');
  await page.waitForSelector('#view-opsan.active');
  check(/aggregated, chart-led/.test(await page.textContent('#ops-card .card-h p')), 'Operation analysis names Reports as the aggregated view');
  check((await page.textContent('#crumb')).includes('Operate') && (await page.textContent('#crumb .cur')) === 'Deliveries', 'breadcrumb reads Operate › Operation analysis › Deliveries');

  console.log('\nDeliveries');
  const tabs = await page.$$eval('.ops-tabs button', (bs) => bs.map((b) => b.textContent.trim()));
  check(JSON.stringify(tabs) === JSON.stringify(['Deliveries', 'Eliminations', 'Promotions', 'Surveys']), 'four tabs: ' + tabs.join(' · '));
  const tiles = await page.$$eval('.ops-hd .tile .l', (ls) => ls.map((l) => l.textContent.trim()));
  check(JSON.stringify(tiles) === JSON.stringify(['Targeted', 'Delivered', 'Eliminated', 'Control group', 'Failed']), 'summary strip: ' + tiles.join(' · '));
  const failed = await page.$eval('.ops-hd .tile:last-child', (t) => ({ v: +t.querySelector('.v').textContent.replace(/,/g, ''), bad: t.classList.contains('bad') }));
  check(failed.v === 0 || failed.bad, `Failed is red when above zero (${failed.v})`);
  let h = await heads(page);
  check(JSON.stringify(h) === JSON.stringify(['Campaign', 'Status', 'Channel', 'Delivery type', 'Execution date', 'Targeted', 'Delivered', 'Eliminated', 'Control group', 'Delivery status']), 'default columns: ' + h.join(' · '));
  check(!h.some((x) => /ID$/.test(x)), 'technical ids are hidden by default');
  await page.click('#ops-tech');
  h = await heads(page);
  check(['Communication ID', 'Delivery ID', 'Execution ID', 'Main DM ID'].every((x) => h.includes(x)), 'Show technical IDs adds Communication, Delivery, Execution and Main DM ID');
  await page.click('#ops-tech');
  check(!(await heads(page)).some((x) => /ID$/.test(x)), 'and hides them again');

  console.log('\ncolumn chooser');
  await page.click('#ops-colsbtn');
  await page.waitForSelector('.ops-cols:not([hidden])');
  await page.check('.ops-cols [data-colvis="ex"]');
  await page.uncheck('.ops-cols [data-colvis="type"]');
  h = await heads(page);
  check(h.includes('Execution ID') && !h.includes('Delivery type'), 'a technical id is reachable through the chooser; a column can be hidden');
  await page.click('.ops-cols [data-colmv="cst"][data-d="-1"]');
  check((await heads(page))[0] === 'Status', 'reorder: Status moved to the first position');
  await page.screenshot({ path: path.join(SHOTS, 'ops-columns.png') });
  await page.click('#ops-colreset');
  await page.keyboard.press('Escape');
  check((await heads(page))[0] === 'Campaign' && !(await page.$('.ops-cols:not([hidden])')), 'Default columns restores the layout; Esc closes the chooser');

  console.log('\nsort and resize');
  await page.click('#ops-grid [data-sort="targeted"]');
  const nums = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => +tr.children[5].textContent.replace(/,/g, '')));
  check(nums.length > 1 && nums.every((n, i) => !i || nums[i - 1] >= n), 'Targeted sorts descending on the first click');
  const th = await page.$('#ops-grid th[data-colk="camp"]');
  const w0 = (await th.boundingBox()).width;
  const rz = await (await page.$('#ops-grid [data-rz="camp"]')).boundingBox();
  await page.mouse.move(rz.x + 3, rz.y + 10); await page.mouse.down(); await page.mouse.move(rz.x + 83, rz.y + 10, { steps: 4 }); await page.mouse.up();
  const w1 = (await (await page.$('#ops-grid th[data-colk="camp"]')).boundingBox()).width;
  check(w1 > w0 + 40, `columns resize by dragging the header edge (${Math.round(w0)} → ${Math.round(w1)} px)`);
  const sticky = await page.evaluate(() => { const gw = document.querySelector('.ops-gw'); gw.scrollTop = 300; const t = document.querySelector('#ops-grid thead th').getBoundingClientRect().top; const g = gw.getBoundingClientRect().top; gw.scrollTop = 0; return Math.abs(t - g) < 3; });
  check(sticky, 'the header stays put while the rows scroll');

  console.log('\nadvanced filter');
  check(!(await page.$('#ops-adv')), 'the condition builder is not a permanent strip');
  const before = await rowCount(page);
  await page.click('#ops-advbtn');
  await page.waitForSelector('#ops-adv');
  await page.selectOption('#ops-adv [data-adv="0"][data-f="col"]', 'ch');
  await page.selectOption('#ops-adv [data-adv="0"][data-f="op"]', 'equals');
  await page.fill('#ops-adv [data-adv="0"][data-f="val"]', 'SMS');
  await page.click('#ops-advadd');
  await page.check('#ops-adv [data-adv="1"][data-f="not"]');
  await page.selectOption('#ops-adv [data-adv="1"][data-f="col"]', 'dst');
  await page.selectOption('#ops-adv [data-adv="1"][data-f="op"]', 'equals');
  await page.fill('#ops-adv [data-adv="1"][data-f="val"]', 'Completed');
  await page.screenshot({ path: path.join(SHOTS, 'ops-advanced-filter.png') });
  await page.click('#ops-advapply');
  const chips = await page.$$eval('.ops-cond', (cs) => cs.map((c) => c.textContent.replace('×', '').trim()));
  check(chips.length === 2 && /^NOT Delivery status/.test(chips[1]), 'one chip per active condition: ' + chips.join(' | '));
  const cells = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => [tr.children[2].textContent.trim(), tr.children[9].textContent.trim()]));
  check(cells.length > 0 && cells.every(([ch, st]) => ch === 'SMS' && st !== 'Completed'), `Channel = SMS AND NOT status = Completed (${cells.length} of ${before} rows)`);
  await page.click('.ops-cond [data-rmcond="1"]');
  await page.click('.ops-cond [data-rmcond="0"]');
  check((await rowCount(page)) === before, 'removing the chips restores every row');

  console.log('\nCSV export');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#ops-csv')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8').split('\n');
  check(dl.suggestedFilename().startsWith('operation-analysis-del'), 'a real download: ' + dl.suggestedFilename());
  check(csv.length === before + 1 && csv[0].startsWith('"Campaign","Status","Channel"'), `CSV holds the header and ${before} rows`);
  check(await page.$eval('.ops-gt > button[disabled]', (b) => b.textContent.includes('Excel') && !!b.title), 'Export Excel is a concept button, disabled with a tooltip');

  console.log('\nthe side panel');
  await page.click('#ops-grid tbody tr[data-oid]');
  await page.waitForSelector('#ops-drawer:not([hidden])');
  const dr = await page.textContent('#ops-drawer');
  check(['Communication ID', 'Delivery ID', 'Execution ID', 'Main DM ID'].every((x) => dr.includes(x)), 'the panel shows every field, technical ids included');
  check(!!(await page.$('#ops-drawer [data-go^="campaigns:"]')) && dr.includes('Open delivery') && dr.includes('Open customer'), 'links: Open campaign ›, Open delivery, Open customer');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'ops-deliveries-panel.png') });
  await page.keyboard.press('Escape');
  check(await page.$eval('#ops-drawer', (d) => d.hidden), 'Esc closes it');

  console.log('\nscope bar');
  const d30 = await rowCount(page);
  await page.click('[data-opr="90"]');
  const d90 = await rowCount(page);
  check(d90 > d30, `widening the period to 90 days adds rows (${d30} → ${d90})`);
  await page.click('#ops-campbtn');
  await page.fill('#ops-campq', 'renewal');
  const listed = await page.$$eval('.ops-camplist [data-camp]', (bs) => bs.map((b) => b.textContent));
  check(listed.length > 1 && listed.slice(1).every((t) => /renewal/i.test(t)), 'the campaign picker is searchable');
  await page.click('.ops-camplist [data-camp="433"]');
  check((await page.textContent('#ops-campbtn')).includes('433'), 'campaign 433 picked');
  const only433 = await page.$$eval('#ops-grid tbody tr', (trs) => trs.every((tr) => tr.children[0].textContent.includes('433')));
  check(only433, 'Deliveries shows only that campaign');
  await tab(page, 'elim');
  check((await page.textContent('#ops-campbtn')).includes('433') && await page.$eval('.fchip[data-opr="90"]', (b) => b.classList.contains('on')), 'the scope survives switching tabs');
  check(await page.$$eval('#ops-grid tbody tr', (trs) => trs.every((tr) => tr.children[0].textContent.includes('433'))), 'and filters Eliminations too');
  await page.click('#ops-reset');
  check((await page.textContent('#ops-campbtn')).includes('All campaigns') && await page.$eval('.fchip[data-opr="30"]', (b) => b.classList.contains('on')), 'Reset clears the scope');

  console.log('\nEliminations');
  const et = await page.$$eval('.ops-hd .tile .l', (ls) => ls.map((l) => l.textContent.trim()));
  check(JSON.stringify(et) === JSON.stringify(['Eliminated', 'Most-triggered rule', 'Campaigns affected', 'Share of targeted']), 'summary strip: ' + et.join(' · '));
  const rules = await page.$$eval('.ops-rule', (bs) => bs.map((b) => [b.dataset.rule, +b.querySelector('.n b').textContent.replace(/,/g, '')]));
  const shares = await page.evaluate(() => ELIM_REASONS);
  check(JSON.stringify(rules.map((r) => r[0])) === JSON.stringify(shares.map((s) => s[0])), 'the breakdown uses the dashboard funnel\'s reason set: ' + rules.map((r) => r[0]).join(' · '));
  const tot = rules.reduce((t, r) => t + r[1], 0);
  check(rules.every((r, i) => Math.abs(r[1] / tot - shares[i][1]) < 0.02), 'and its proportions (within 2 points): ' + rules.map((r) => Math.round(100 * r[1] / tot) + '%').join(' '));
  await page.click('.nav button[data-view="dashboard"]');
  const dbReasons = await page.$$eval('.db-p[data-p="funnel"] .fun .r.dr span:first-child', (s) => s.map((x) => x.textContent.trim()));
  check(JSON.stringify(dbReasons) === JSON.stringify(rules.map((r) => r[0])), 'the dashboard panel lists the same reasons');
  await page.click('.nav button[data-view="opsan"]');
  await page.click('.ops-rule[data-rule="Channel cooldown"]');
  const ruleCells = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => tr.children[2].textContent.trim()));
  check(ruleCells.length > 0 && ruleCells.every((t) => t === 'Channel cooldown'), 'clicking a bar filters the grid to that rule');
  check(JSON.stringify(await heads(page)) === JSON.stringify(['Campaign', 'Customer', 'Rule', 'Channel', 'Execution date', 'Marketing list']), 'grid: Campaign · Customer · Rule · Channel · Execution date · Marketing list');
  await page.screenshot({ path: path.join(SHOTS, 'ops-eliminations.png') });
  await page.click('.ops-rule[data-rule="Channel cooldown"]');

  console.log('\nPromotions');
  await tab(page, 'promo');
  const pt = await page.$$eval('.ops-hd .tile .l', (ls) => ls.map((l) => l.textContent.trim()));
  check(JSON.stringify(pt) === JSON.stringify(['Codes issued', 'Sent', 'Redeemed', 'Redemption rate', 'Expiring within 7 days']), 'summary strip: ' + pt.join(' · '));
  const rc = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => tr.children[5].textContent.trim()));
  check(rc.length > 0 && rc.every((t) => t.includes('•••')), 'recipient info is masked by default: ' + rc.slice(0, 2).join(', '));
  check(!(await page.$('#ops-reveal')), 'a marketer has no switch to reveal it');
  const all = await rowCount(page);
  await page.click('#ops-active');
  const act = await rowCount(page);
  const sts = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => tr.children[9].textContent.trim()));
  check(act < all && sts.every((s) => s === 'Active'), `Active only replaces the old Active Promotions screen (${all} → ${act})`);
  await page.screenshot({ path: path.join(SHOTS, 'ops-promotions.png') });
  await page.click('#ops-active');
  const html = await page.content();
  check(!/@etiya\.com/i.test(html), 'no @etiya.com address anywhere');
  await page.close();

  page = await open(browser, 'admin');
  await page.click('.nav button[data-view="opsan"]');
  await tab(page, 'promo');
  await page.click('#ops-reveal');
  const raw = await page.$$eval('#ops-grid tbody tr', (trs) => trs.map((tr) => tr.children[5].textContent.trim()));
  check(raw.every((t) => !t.includes('•••')) && raw.every((t) => /@example\.com$|^\+90 5XX/.test(t)), 'an admin reveals recipient details — still fictional: ' + raw.slice(0, 2).join(', '));
  await page.close();

  console.log('\nsaved views');
  page = await open(browser);
  await page.click('.nav button[data-view="opsan"]');
  await page.click('[data-opr="7"]');
  await tab(page, 'elim');
  await page.click('#ops-savebtn');
  await page.fill('#ops-viewname', 'Last week eliminations');
  await page.click('#ops-savego');
  await page.click('#ops-reset');
  await tab(page, 'del');
  await page.selectOption('#ops-views', { label: 'Last week eliminations' });
  check(await page.$eval('[data-opt="elim"]', (b) => b.classList.contains('on')) && await page.$eval('.fchip[data-opr="7"]', (b) => b.classList.contains('on')), 'a saved view restores the tab and the period');

  console.log('\nempty states');
  for (const [k, word] of [['del', 'deliveries'], ['elim', 'eliminations'], ['promo', 'promotion codes']]) {
    await tab(page, k);
    await page.click('#ops-advbtn');
    await page.fill('#ops-adv [data-adv="0"][data-f="val"]', 'zzz-nothing');
    await page.click('#ops-advapply');
    const t = await page.textContent('#ops-grid tbody');
    check(new RegExp(word, 'i').test(t) && /clear the filters/i.test(t), `${k}: "${t.trim().slice(0, 90)}…"`);
    await page.click('.ops-cond [data-rmcond="0"]');
  }
  await tab(page, 'srv');
  check(!!(await page.$('#ops-card .ops-empty, #ops-card .ops-srv')), 'the Surveys tab renders');
  await page.close();

  console.log('\nResults from a campaign');
  page = await open(browser);
  await page.click('.nav button[data-view="campaigns"]');
  await page.click('#camp-table [data-results="3310"]');
  await page.waitForSelector('#view-opsan.active');
  check((await page.textContent('#ops-campbtn')).includes('3310') && await page.$eval('[data-opt="del"]', (b) => b.classList.contains('on')), 'campaign list › Results opens Deliveries pre-filtered to 3310');
  check(await page.$$eval('#ops-grid tbody tr', (trs) => trs.length > 0 && trs.every((tr) => tr.children[0].textContent.includes('3310'))), 'and every row is that campaign');
  await page.click('#ops-grid tbody tr[data-oid]');
  await page.click('#ops-drawer [data-go]');
  await page.waitForSelector('#view-campaigns.active');
  check((await page.textContent('#camp-card .card-h h2')).includes('3310'), 'Open campaign › goes back to it');
  await page.click('#camp-results');
  await page.waitForSelector('#view-opsan.active');
  check((await page.textContent('#ops-campbtn')).includes('3310'), 'the editor header has Results too');
  await page.click('.nav button[data-view="campaigns"]');
  await page.click('#camp-back');
  await page.click('#camp-new');
  await page.click('#cc-skip');
  check(!(await page.$('#camp-results')), 'a new, unsaved campaign has no Results yet');
  await page.close();

  console.log('\nlayout: 1280 and 1440, menu open and collapsed');
  for (const width of [1280, 1440]) {
    for (const collapsed of [false, true]) {
      const p = await open(browser, 'admin', width);
      if (collapsed) { await p.click('#btn-nav'); await p.waitForTimeout(200); }
      await p.click('.nav button[data-view="opsan"]');
      for (const k of ['del', 'elim', 'promo', 'srv']) {
        await tab(p, k);
        check(await noHScroll(p), `${width} px, menu ${collapsed ? 'collapsed' : 'open'}, ${k}: no horizontal page scroll`);
        await p.screenshot({ path: path.join(SHOTS, `ops-${k}-${width}${collapsed ? '-collapsed' : ''}.png`) });
      }
      await p.close();
    }
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  process.exit(errors.length ? 1 : 0);
})();
