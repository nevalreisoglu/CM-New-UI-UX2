// @ts-check
const { test, expect, setRole, visibleNavLabels } = require('./fixtures');

/**
 * Role views were the first decision of the redesign: the menu shows only what
 * the signed-in role may do. These are the guarantees the meetings settled on.
 */
test.describe('role views', () => {
  test('the marketer plans and builds but does not administer', async ({ app }) => {
    await setRole(app, 'marketer');
    const pages = await visibleNavLabels(app);
    expect(pages).toEqual(expect.arrayContaining(['Dashboard', 'Campaign', 'Journey Builder', 'Segments']));
    expect(pages).not.toContain('Parameters');
    await expect(app.locator('#nav-foot')).toContainText('Datamart and Parameters are admin work');
  });

  test('the executive sees monitoring only, never the build pages', async ({ app }) => {
    await setRole(app, 'cmo');
    const pages = await visibleNavLabels(app);
    expect(pages).toContain('Dashboard');
    expect(pages).not.toContain('Campaign');
    expect(pages).not.toContain('Segments');
    expect(pages).not.toContain('Journey Builder');
    await expect(app.locator('#nav-foot')).toContainText('dashboards and monitoring only');
  });

  test('the admin sees every page', async ({ app }) => {
    await setRole(app, 'admin');
    const pages = await visibleNavLabels(app);
    expect(pages).toEqual(expect.arrayContaining(['Parameters', 'Campaign', 'Segments', 'Dashboard']));
    // Offers and Policies are hidden from every role (decision X6); nothing else is hidden from the admin
    const hidden = await app.$$eval('.nav button[data-view]', (bs) => bs.filter((b) => b.hidden).map((b) => b.dataset.view));
    expect(hidden, 'admin sees everything except the pages hidden for all').toEqual(['offers', 'policies']);
  });

  test('switching to a role that cannot see the open page moves off it', async ({ app }) => {
    await setRole(app, 'marketer');
    await app.locator('.nav button[data-view="segmentation"]').click();
    await expect(app.locator('.view.active')).toHaveId('view-segmentation');

    await setRole(app, 'cmo');
    await expect(app.locator('.view.active')).not.toHaveId('view-segmentation');
    await expect(app.locator('.nav button.active')).not.toBeHidden();
  });

  test('a menu group disappears when the role can see none of its pages', async ({ app }) => {
    await setRole(app, 'cmo');
    const groups = await app.$$eval('.nav .grp[data-grp]', (gs) =>
      gs.filter((g) => !g.hidden).map((g) => g.dataset.grp)
    );
    expect(groups).not.toContain('aud'); // Audience & content is marketer/admin work
  });
});
