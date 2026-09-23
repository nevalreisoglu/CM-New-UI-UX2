// @ts-check
const path = require('path');
const { test, expect } = require('./fixtures');

/**
 * Reference screenshots of the main screens, written to tests/screenshots/.
 * They are review material for the UX meetings, not pixel assertions — the run
 * only fails if a screen cannot be reached or renders empty.
 */
const SHOTS = [
  ['dashboard', 'admin', async (app) => app.locator('.nav button[data-view="dashboard"]').click()],
  ['programs', 'admin', async (app) => app.locator('.nav button[data-view="programs"]').click()],
  ['campaign-list', 'admin', async (app) => app.locator('.nav button[data-view="campaigns"]').click()],
  ['campaign-create', 'marketer', async (app) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
  }],
  ['campaign-info-step', 'admin', async (app) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
    await app.locator('#cc-name').fill('Package renewal — SMS offer');
    await app.locator('#camp-card [data-obj="Retention"]').click();
    await app.locator('#cc-start').click();
  }],
  ['journey-builder', 'admin', async (app) => app.locator('.nav button[data-view="journeys"]').click()],
  ['journey-monitor', 'admin', async (app) => app.locator('.nav button[data-view="monitor"]').click()],
  ['segment-workbench', 'admin', async (app) => {
    await app.locator('.nav button[data-view="segmentation"]').click();
    await app.locator('#seg-new').click();
    await app.locator('#seg-search').click();
  }],
  ['reports', 'admin', async (app) => app.locator('.nav button[data-view="reports"]').click()],
  ['operation-analysis', 'marketer', async (app) => app.locator('.nav button[data-view="opsan"]').click()],
  ['survey-results', 'marketer', async (app) => {
    await app.locator('.nav button[data-view="surveys"]').click();
    await app.locator('[data-srvres="SRV-01"]').click();
  }],
  ['survey-editor', 'marketer', async (app) => {
    await app.locator('.nav button[data-view="surveys"]').click();
    await app.locator('[data-srvopen="SRV-01"]').click();
  }],
  ['parameters', 'admin', async (app) => app.locator('.nav button[data-view="parameters"]').click()],
  ['dashboard-cmo', 'cmo', async (app) => app.locator('.nav button[data-view="dashboard"]').click()],
  ['dashboard-campaign-detail', 'cmo', async (app) => {
    await app.locator('.nav button[data-view="dashboard"]').click();
    await app.locator('#db-card [data-dbc]').first().click();
  }],
  ['user-manual', 'marketer', async (app) => app.locator('#btn-manual').click()],
];

for (const [name, role, open] of SHOTS) {
  test(`screenshot: ${name}`, async ({ app }) => {
    await app.selectOption('#role-sel', role);
    await open(app);
    await expect(app.locator('.view.active')).toBeVisible();
    await app.waitForTimeout(150); // let the collapse/zoom transitions settle
    await app.screenshot({ path: path.join(__dirname, '..', 'screenshots', `${name}.png`), fullPage: false });
  });
}
