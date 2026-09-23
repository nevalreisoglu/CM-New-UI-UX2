#!/usr/bin/env node
/**
 * Regression run for Surveys.
 *
 *   node tests/srv.js
 *
 * Creates a survey with all six question types, a translation and a branching
 * rule, checks the ten-question limit and the customer preview (mobile and
 * Web Self Care), attaches it to a push channel ({{SURVEY_LINK}}) and a pull
 * channel (rendered in the card) of a campaign and to a journey Delivery step,
 * then reads results in Operation analysis › Surveys: the NPS panel, the
 * per-question charts, the response grid and the full answer set in the side
 * panel. Screenshots go to tests/shots/. An empty error list is the pass
 * condition.
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
const addQ = async (p, type) => { await p.click('#srv-addq'); await p.click(`[data-addq="${type}"]`); };
const lastQ = (p) => p.$$('.srv-q').then((qs) => qs.length - 1);

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  console.log('\nthe menu and the list');
  let page = await open(browser);
  const nav = await page.$$eval('.nav button[data-view]:not([hidden])', (bs) => bs.map((b) => b.dataset.view));
  check(nav.indexOf('surveys') === nav.indexOf('segmentation') + 1, 'Surveys sits right after Segments, in Audience & content');
  for (const [role, seen] of [['admin', true], ['approver', false], ['cmo', false]]) {
    await page.selectOption('#role-sel', role);
    check((await page.$eval('.nav button[data-view="surveys"]', (b) => !b.hidden)) === seen, `${seen ? 'visible' : 'hidden'} for ${role}`);
  }
  await page.selectOption('#role-sel', 'marketer');
  await page.click('.nav button[data-view="surveys"]');
  const heads = await page.$$eval('#srv-table thead th', (t) => t.map((x) => x.textContent.trim()));
  check(['Survey', 'Status', 'Questions', 'Channels', 'Responses', 'Last response', 'Used by'].every((h) => heads.includes(h)), 'list columns: ' + heads.join(' · '));
  const nps = await page.$eval('#srv-table tr[data-srv="SRV-01"]', (tr) => tr.textContent);
  check(/Active/.test(nps) && /433/.test(nps) && /2511/.test(nps), 'the renewal NPS is active and used by campaigns 433 and 2511');
  await page.click('[data-srvst="Draft"]');
  check(await page.$$eval('#srv-table tr[data-srv]', (trs) => trs.length === 1 && trs[0].dataset.srv === 'SRV-03'), 'status chips filter the list');
  await page.click('[data-srvst="All"]');
  await page.fill('#srv-q', 'csat');
  check(await page.$$eval('#srv-table tr[data-srv]', (trs) => trs.map((t) => t.dataset.srv).join()) === 'SRV-02', 'search finds the CSAT survey');
  await page.fill('#srv-q', '');
  await page.screenshot({ path: path.join(SHOTS, 'srv-list.png') });

  console.log('\ncreate a survey');
  await page.click('#srv-new');
  check(!!(await page.$('.srv-wb .srv-def')) && !!(await page.$('.srv-wb .srv-qs')) && !!(await page.$('.srv-wb .srv-prev')), 'the editor is a workbench: definition, questions, preview');
  await page.click('#srv-save');
  check(/name/i.test(await page.textContent('#toast')), 'saving without a name is refused with a reason');
  await page.fill('#srv-name', 'After-support check');
  await page.fill('#srv-desc', 'Short check after a support contact.');
  const types = await page.$$eval('[data-addq]', (b) => b.map((x) => x.textContent.trim()));
  await page.click('body');
  check(JSON.stringify(types) === JSON.stringify(['NPS (0–10)', 'CSAT (1–5)', 'Rating (1–5 stars)', 'Single choice', 'Multiple choice', 'Free text']), 'Add question offers exactly the six types');
  const texts = { nps: 'How likely are you to recommend us?', csat: 'How satisfied are you with the support?', rating: 'Rate the speed of the answer', single: 'Was your issue solved?', multi: 'What helped?', text: 'Anything we should change?' };
  for (const t of Object.keys(texts)) {
    await addQ(page, t);
    const i = await lastQ(page);
    await page.fill(`#sq-${i}`, texts[t]);
  }
  check((await page.$$('.srv-q')).length === 6, 'six questions added, one of each type');
  await page.fill('[data-qf="3"][data-opt="0"]', 'Yes');
  await page.fill('[data-qf="3"][data-opt="1"]', 'No');
  await page.fill('[data-qf="4"][data-opt="0"]', 'Clear answer');
  await page.fill('[data-qf="4"][data-opt="1"]', 'Speed');
  await page.click('[data-optadd="4"]');
  await page.fill('[data-qf="4"][data-opt="2"]', 'Friendly tone');
  await page.fill('[data-qf="3"][data-optscore="0"]', '2');
  check((await page.$$('[data-qf="4"][data-opt]')).length === 3, 'options can be added; scoring shows a score per option');
  await page.selectOption('[data-qf="3"][data-br="if"]', 'Yes');
  await page.selectOption('[data-qf="3"][data-br="to"]', 'end');
  check(/If “Yes” → skips to the end/.test(await page.textContent('#srv-pv')), 'one branching rule: if the answer is Yes, skip to the end — shown in the preview');
  check(/cannot branch/.test(await page.textContent('.srv-q[data-q="5"]')), 'free text explains it cannot branch');
  await page.click('[data-qmv="5"][data-dir="-1"]');
  check((await page.inputValue('#sq-4')) === texts.text, 'questions reorder with ↑ ↓');
  await page.click('[data-qmv="4"][data-dir="1"]');
  await page.click('[data-lang="uk"]');
  check((await page.$$('[data-tr="uk"]')).length === 6, 'a second language adds a translation field per question');
  await page.fill('[data-qf="0"][data-tr="uk"]', 'Чи порекомендуєте ви нас?');
  await page.click('[data-plang="uk"]');
  check((await page.textContent('#srv-pv')).includes('Чи порекомендуєте ви нас?'), 'the preview switches language');
  await page.click('[data-plang="en"]');
  const pv = await page.$eval('#srv-pv', (e) => ({ phone: !!e.querySelector('.phone'), nps: e.querySelectorAll('.sf-scale.nps span').length, stars: !!e.querySelector('.sf-stars'), radios: e.querySelectorAll('.sf-o.single').length, checks: e.querySelectorAll('.sf-o.multi').length, text: !!e.querySelector('.sf-text') }));
  check(pv.phone && pv.nps === 11 && pv.stars && pv.radios === 2 && pv.checks === 3 && pv.text, 'mobile preview in the phone frame renders every type: ' + JSON.stringify(pv));
  await page.screenshot({ path: path.join(SHOTS, 'srv-editor.png') });
  await page.click('[data-dev="web"]');
  check(!!(await page.$('#srv-pv .mail .srv-form')), 'Web Self Care preview is a web card');
  await page.screenshot({ path: path.join(SHOTS, 'srv-editor-web.png') });

  console.log('\nthe ten-question limit');
  for (let k = 0; k < 4; k++) { await addQ(page, 'csat'); await page.fill(`#sq-${await lastQ(page)}`, 'Filler ' + k); }
  check(await page.$eval('#srv-addq', (b) => b.disabled) && /Ten questions is the limit/.test(await page.textContent('.srv-qs')), 'at ten questions Add is disabled and a note says why');
  for (let k = 0; k < 4; k++) await page.click(`[data-qrm="${await lastQ(page)}"]`);
  await page.selectOption('#srv-status', 'Active');
  await page.click('#srv-save');
  const id = await page.evaluate(() => srvDraft.id);
  check(/Saved/.test(await page.textContent('#toast')) && await page.evaluate((i) => !!srvById(i), id), `saved as ${id}`);
  await page.click('#srv-saveclose');
  check(!!(await page.$(`#srv-table tr[data-srv="${id}"]`)), 'it is in the list');

  console.log('\nattach it to a campaign');
  await page.click('.nav button[data-view="campaigns"]');
  await page.click('#camp-table [data-open="3310"]');
  await page.click('.stepper button[data-step="3"]');
  const pushSel = page.locator('#camp-card select[data-pk="survey"]').first();
  check(await pushSel.count() > 0, 'each channel card has an Attach survey control');
  await pushSel.selectOption(id);
  const chip = page.locator('#camp-card .srv-param').first();
  check(await chip.count() === 1, 'on SMS the {{SURVEY_LINK}} placeholder becomes available');
  await page.click('#camp-card [data-slot="body"][data-pi="0"]');
  await chip.click();
  check((await page.inputValue('#camp-card [data-slot="body"][data-pi="0"]')).includes('{{SURVEY_LINK}}'), 'clicking it inserts the placeholder into the text');
  check((await page.textContent('#pv-0')).includes('s.example.com/'), 'the preview prints a personal survey link');
  await page.screenshot({ path: path.join(SHOTS, 'srv-attach-sms.png') });
  await page.click('#camp-back');
  await page.click('#camp-new');
  await page.fill('#cc-name', 'Self care feedback card');
  await page.click('#camp-card [data-reach="pull"]').catch(() => {});
  await page.click('#cc-start');
  const pullChans = await page.evaluate(() => campDraft.channels);
  if (!pullChans.some((c) => ['inapp', 'wsc', 'chatbot'].includes(c))) { await page.click('#camp-card [data-ch="wsc"]'); }
  await page.evaluate(() => { campStep = 3; renderCampaigns(); });
  await page.locator('#camp-card select[data-pk="survey"]').first().selectOption('SRV-02');
  check(!!(await page.$('#pv-0 .srv-form.inline')) && (await page.$$('#camp-card .srv-param')).length === 0, 'on a pull channel the survey renders inside the card, no link placeholder');
  await page.screenshot({ path: path.join(SHOTS, 'srv-attach-pull.png') });
  check((await page.$$eval('#camp-card .stepper button', (b) => b.length)) === 8, 'the campaign steps are unchanged — no survey campaign flow');

  console.log('\nattach it to a journey Delivery step');
  await page.click('.nav button[data-view="journeys"]');
  const dnode = await page.evaluate(() => { const j = JOURNEYS.find((x) => x.id === curJ); const n = j.nodes.find((x) => x.type === 'delivery'); selNode = n.id; renderCanvas(); renderNodePanel(); return n.id; });
  check(!!(await page.$('#f-survey')), `the Delivery step ${dnode} has Attach survey`);
  await page.selectOption('#f-survey', { index: 1 });
  check(!!(await page.$('#jp-body [data-jins="SURVEY_LINK"]')) || /renders inside/.test(await page.textContent('#jp-body')), 'and offers the link placeholder (or renders in the card)');
  await page.close();

  console.log('\nresults');
  page = await open(browser);
  await page.click('.nav button[data-view="surveys"]');
  await page.click('[data-srvres="SRV-01"]');
  await page.waitForSelector('#view-opsan.active');
  check(await page.$eval('[data-opt="srv"]', (b) => b.classList.contains('on')) && (await page.inputValue('#ops-srv')) === 'SRV-01', 'Results opens Operation analysis › Surveys on that survey');
  const tl = await page.$$eval('.ops-srvbar ~ .db-hd .tile .l', (l) => l.map((x) => x.textContent.trim()));
  check(JSON.stringify(tl) === JSON.stringify(['Responses', 'Response rate', 'Average score', 'Completion rate', 'NPS']), 'summary: ' + tl.join(' · '));
  const n = await page.$eval('.ops-srvbar ~ .db-hd .tile .v', (v) => +v.textContent.replace(/,/g, ''));
  check(n > 100, `a few hundred generated responses over 90 days (${n} for the NPS survey)`);
  const npsP = await page.$eval('.srv-nps', (e) => ({ v: e.querySelector('.nv').textContent, seg: e.querySelectorAll('.bar i').length, trend: e.querySelectorAll('.srv-trend .tb').length }));
  check(/^[+−-]?\d+$/.test(npsP.v) && npsP.seg === 3 && npsP.trend > 1, `NPS panel: ${npsP.v}, a stacked bar of three, a trend of ${npsP.trend} points`);
  const qp = await page.$$eval('.srv-qp', (ps) => ps.map((p) => ({ bars: p.querySelectorAll('.hbar, .srv-dist .tb').length, txt: p.querySelectorAll('.srv-txt li').length })));
  check(qp.length === 3 && qp[0].bars === 11 && qp[1].bars === 5 && qp[2].txt > 0, 'one chart per question: 0–10 distribution, choice bars, recent free-text answers');
  check(await page.$$eval('.srv-txt small', (s) => s.every((x) => /^CUS-\*{4}\d{4}/.test(x.textContent))), 'free-text answers carry a masked customer id');
  const gh = await page.$$eval('#ops-grid thead th', (t) => t.map((x) => x.textContent.replace(/[▲▼]/g, '').trim()));
  check(JSON.stringify(gh) === JSON.stringify(['Customer', 'Campaign', 'Channel', 'Total score', 'Result', 'Sent date', 'Response date']), 'response grid: ' + gh.join(' · '));
  await page.screenshot({ path: path.join(SHOTS, 'srv-results.png') });
  await page.click('#ops-grid tbody tr[data-oid]');
  await page.waitForSelector('#ops-drawer:not([hidden])');
  const ans = await page.$$eval('#ops-drawer .srv-ans li', (l) => l.length);
  check(ans === 3, 'the side panel shows the full answer set, skipped questions included');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, 'srv-response-panel.png') });
  await page.keyboard.press('Escape');
  await page.selectOption('#ops-srv', 'SRV-02');
  check(!(await page.$('.srv-nps')) && (await page.$$('.srv-qp')).length === 3, 'a CSAT survey has no NPS panel, still one chart per question');
  await page.selectOption('#ops-srv', 'SRV-03');
  check(/draft and has not been sent/.test(await page.textContent('.srv-empty')), 'a draft survey shows a real empty state');
  await page.click('[data-opt="del"]');
  await page.click('[data-opt="srv"]');
  check((await page.inputValue('#ops-srv')) === 'SRV-03', 'the picked survey survives switching tabs');

  console.log('\nlayout');
  for (const width of [1280, 1440]) {
    for (const collapsed of [false, true]) {
      const p = await open(browser, 'marketer', width);
      if (collapsed) { await p.click('#btn-nav'); await p.waitForTimeout(200); }
      await p.click('.nav button[data-view="surveys"]');
      await p.click('[data-srvopen="SRV-01"]');
      const fit = await p.evaluate(() => { const c = document.getElementById('srv-card'); return document.documentElement.scrollWidth <= innerWidth + 1 && c.scrollWidth <= c.clientWidth + 1; });
      check(fit, `${width} px, menu ${collapsed ? 'collapsed' : 'open'}: the editor fits without horizontal scroll`);
      await p.screenshot({ path: path.join(SHOTS, `srv-editor-${width}${collapsed ? '-collapsed' : ''}.png`) });
      await p.close();
    }
  }

  await browser.close();
  console.log('\nerrors: ' + (errors.length ? '\n - ' + errors.join('\n - ') : 'none'));
  process.exit(errors.length ? 1 : 0);
})();
