// @ts-check
const { test, expect } = require('./fixtures');

/**
 * v41 corrected the brand to ETIYA. The old spelling crept in through the logo,
 * the footer, the campaign label list and the admin role name, so guard all of
 * them plus the rendered text as a whole.
 */
test.describe('branding', () => {
  test('the top bar and footer read ETIYA', async ({ app }) => {
    await expect(app.locator('header .logo .w b')).toHaveText('ETIYA');
    await expect(app.locator('footer .logo .w b')).toHaveText('ETIYA');
    await expect(app.locator('footer .c')).toContainText('ETIYA ALL RIGHTS RESERVED');
  });

  test('the old ETYA spelling appears nowhere in the rendered page', async ({ app }) => {
    const stray = await app.evaluate(() =>
      (document.body.innerText.match(/\bET[İI]?YA\b/gi) || []).filter((m) => m.toUpperCase() !== 'ETIYA')
    );
    expect(stray, 'no "ETYA" left in visible text').toEqual([]);
  });

  test('the admin role is named Etiya Admin', async ({ app }) => {
    await app.selectOption('#role-sel', 'admin');
    await expect(app.locator('#role-lbl')).toHaveText('Etiya Admin');
  });

  test('ETIYA is offered as a campaign brand once multi-brand is on', async ({ app }) => {
    // Campaign Brand is a configurable field, off by default, so turn it on first.
    await app.selectOption('#role-sel', 'admin');
    await app.locator('.nav button[data-view="parameters"]').click();
    await app.locator('#par-cfg input[data-cfg="multiBrand"]').check();

    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
    await app.locator('#cc-skip').click(); // past the creation screen, straight to the Info step
    const brand = app.locator('#camp-card select[data-k="label"]');
    await expect(brand).toBeVisible();
    await expect(brand.locator('option', { hasText: 'ETIYA' })).toHaveCount(1);
  });
});
