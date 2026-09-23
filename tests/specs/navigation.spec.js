// @ts-check
const { test, expect, openPage } = require('./fixtures');

/** Every page reachable from the left menu, with the view it must activate. */
const PAGES = [
  ['Dashboard', 'view-dashboard'],
  ['Program', 'view-programs'],
  ['Campaign', 'view-campaigns'],
  ['Journey Builder', 'view-journeys'],
  ['Offers', 'view-offers'],
  ['Policies', 'view-policies'],
  ['Segments', 'view-segmentation'],
  ['Surveys', 'view-surveys'],
  ['Reports', 'view-reports'],
  // the open tab follows the page name in the breadcrumb
  ['Operation analysis', 'view-opsan', 'Deliveries'],
];

test.describe('navigation', () => {
  test('the prototype boots on the Dashboard as a marketer', async ({ app }) => {
    await expect(app.locator('.view.active')).toHaveId('view-dashboard');
    await expect(app.locator('.nav button.active')).toHaveAttribute('data-view', 'dashboard');
    await expect(app.locator('#role-lbl')).toHaveText('Marketer');
    await expect(app.locator('#crumb .cur')).toHaveText('Dashboard');
  });

  test('Dashboard is the first page in the menu, under Home', async ({ app }) => {
    const first = app.locator('.nav button[data-view]').first();
    await expect(first).toHaveAttribute('data-view', 'dashboard');
    await expect(first).toHaveAttribute('data-grp', 'home');
  });

  for (const [label, viewId, detail] of PAGES) {
    test(`the menu opens ${label}`, async ({ app }) => {
      await app.selectOption('#role-sel', 'admin');
      await openPage(app, label);
      await expect(app.locator('.view.active')).toHaveCount(1);
      await expect(app.locator('.view.active')).toHaveId(viewId);
      await expect(app.locator('#crumb .cur')).toHaveText(detail || label);
      await expect(app.locator('#crumb')).toContainText(label);
    });
  }

  test('the burger collapses the menu to an icon rail and back', async ({ app }) => {
    const shell = app.locator('.app');
    await expect(shell).not.toHaveClass(/nav-closed/);

    await app.locator('#btn-nav').click();
    await expect(shell).toHaveClass(/nav-closed/);
    await expect(app.locator('#btn-nav')).toHaveAttribute('title', 'Expand menu');
    // labels collapse into tooltips, so every button keeps its name in title=
    await expect(app.locator('.nav button[data-view="campaigns"]')).toHaveAttribute('title', 'Campaign');

    await app.locator('#btn-nav').click();
    await expect(shell).not.toHaveClass(/nav-closed/);
    await expect(app.locator('#btn-nav')).toHaveAttribute('title', 'Collapse menu');
  });

  test('the breadcrumb names the group and the page', async ({ app }) => {
    await openPage(app, 'Campaign');
    await expect(app.locator('#crumb')).toContainText('Plan & build');
    await expect(app.locator('#crumb .cur')).toHaveText('Campaign');
  });
});
