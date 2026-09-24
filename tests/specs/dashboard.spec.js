// @ts-check
const { test, expect, setRole } = require('./fixtures');

/**
 * The headline strip follows the role (decisions D1, D8, D11). The executive
 * strip is business outcome only; the marketer strip is the state of their
 * work, and opened / clicked stay per campaign in Campaign performance.
 */
const labels = (app) => app.$$eval('#db-card .db-hd .tile .l', (ls) => ls.map((l) => { const c = l.cloneNode(true); c.querySelectorAll('.tip').forEach((t) => t.remove()); return c.textContent.replace(/·.*$/, '').trim(); }));

test.describe('dashboard headline strip', () => {
  test('the marketer sees the state of their work, not portfolio totals', async ({ app }) => {
    await setRole(app, 'marketer');
    await app.locator('.nav button[data-view="dashboard"]').click();
    expect(await labels(app)).toEqual(['Needs your action', 'Waiting for approval', 'Going out this week', 'Live', 'Top campaign']);
    const text = await app.locator('#db-card .db-hd').textContent();
    expect(text).not.toMatch(/Customers reached|Opened|Clicked/);
  });

  test('Campaign performance is the marketer\'s first panel and holds opened and clicked per campaign', async ({ app }) => {
    await setRole(app, 'marketer');
    await app.locator('.nav button[data-view="dashboard"]').click();
    await expect(app.locator('#db-card .db-grid .db-p').first()).toHaveAttribute('data-p', 'top');
    const heads = await app.$$eval('#db-card .db-perf thead th', (t) => t.map((x) => x.textContent.replace(/[▲▼]/g, '').trim()));
    expect(heads).toEqual(expect.arrayContaining(['Opened', 'Clicked']));
  });

  test('the strip tiles open what they count', async ({ app }) => {
    await setRole(app, 'marketer');
    await app.locator('.nav button[data-view="dashboard"]').click();
    const top = app.locator('#db-card .db-hd .tile[data-dbc]');
    const id = await top.getAttribute('data-dbc');
    await top.click();
    await expect(app.locator('#db-card .db-p[data-p="top"] .dbd-h')).toContainText(id || '');
    await app.locator('#db-card [data-dbclose]').click();
    await app.locator('#db-card .db-hd .tile[data-go="campaigns:Draft"]').click();
    await expect(app.locator('.view.active')).toHaveId('view-campaigns');
    await expect(app.locator('#camp-table .fchip.on[data-v="Draft"]')).toHaveCount(0); // chips live outside the table
    await expect(app.locator('.fchip.on[data-f="status"]')).toHaveText('Draft');
  });

  test('the executive strip is unchanged: business outcome only', async ({ app }) => {
    await setRole(app, 'cmo');
    await app.locator('.nav button[data-view="dashboard"]').click();
    expect(await labels(app)).toEqual(['Campaigns', 'Converted customers', 'Revenue', 'ROI', 'Extra conversions from campaigns']);
    await expect(app.locator('#db-card .db-grid .db-p').first()).toHaveAttribute('data-p', 'live');
  });

  test('the executive figures read at operator scale and stay consistent', async ({ app }) => {
    await setRole(app, 'cmo');
    await app.locator('.nav button[data-view="dashboard"]').click();
    await expect(app.locator('#db-card .card-h .pill', { hasText: 'Demo figures at operator scale' })).toHaveCount(1);
    const t = await app.$$eval('#db-card .db-hd .tile', (ts) => ts.map((x) => x.innerText));
    const conv = +t[1].match(/([\d,]+)\s+customers/)[1].replace(/,/g, '');
    expect(conv).toBeGreaterThan(20000);
    expect(t[1]).toMatch(/% of delivered · [\d.]+M delivered/);
    expect(t[2]).toMatch(/₴ \d+ average per conversion/);
    expect(t[3]).toMatch(/₴ [\d.]+M net · ₴ [\d.]+M spend/);
    const base = +t[4].match(/([\d,]+) would have converted anyway/)[1].replace(/,/g, '');
    const incr = +t[4].match(/([\d,]+) thanks to campaigns/)[1].replace(/,/g, '');
    expect(base + incr).toBe(conv); // the two segments sum to the converted total
    expect(await app.$$eval('#db-card .cgbar i', (i) => i.length)).toBe(2);
    expect(t.join('\n')).not.toMatch(/[▲▼] 0%/);
    // row-level data is untouched
    await app.locator('.nav button[data-view="programs"]').click();
    await setRole(app, 'marketer');
    await app.locator('.nav button[data-view="campaigns"]').click();
    await expect(app.locator('#camp-table tr[data-id="433"] td.num').first()).toContainText('12');
  });
});
