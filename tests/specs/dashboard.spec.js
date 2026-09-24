// @ts-check
const { test, expect, setRole } = require('./fixtures');

/**
 * The headline strip follows the role (decisions D1, D8, D11). The executive
 * strip is business outcome only; the marketer strip is the state of their
 * work, and opened / clicked stay per campaign in Campaign performance.
 */
const labels = (app) => app.$$eval('#db-card .db-hd .tile .l', (ls) => ls.map((l) => l.textContent.replace(/·.*$/, '').trim()));

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
    expect(await labels(app)).toEqual(['Campaigns', 'Conversions', 'Revenue', 'ROI', 'Incremental']);
    await expect(app.locator('#db-card .db-grid .db-p').first()).toHaveAttribute('data-p', 'live');
  });
});
