// @ts-check
const { test, expect } = require('./fixtures');

/**
 * Test send: one test recipient, four surfaces — Messages, Mobile push & app, Email, Website.
 * A campaign sends on its own channels and an Offer campaign's offer also shows on the
 * website (C21); a journey sends every Delivery step and shows the offers it hands out (J3).
 */
const surf = (app, k) => app.locator(`#ts-modal .ts-surf[data-surf="${k}"]`);

async function openCampaign(app, id) {
  await app.locator('.nav button[data-view="campaigns"]').click();
  await app.evaluate((cid) => campOpen(cid), id);
  await expect(app.locator('#camp-card .stepper')).toBeVisible();
}
async function openJourney(app, id) {
  await app.locator('.nav button[data-view="journeys"]').click();
  await app.evaluate((jid) => jOpen(jid), id);
}

test.describe('test send', () => {
  test('a campaign sends on its channels and its offer shows on the website', async ({ app }) => {
    await openCampaign(app, '433');
    await app.locator('#camp-testsend').click();
    const modal = app.locator('#ts-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.ts-src')).toContainText('Package renewal — SMS offer');
    await expect(surf(app, 'sms')).toHaveClass(/done/);
    await expect(surf(app, 'sms').locator('.ts-st')).toContainText('Delivered to +90 5XX');
    // personalised with the recipient's own values
    const name = await app.evaluate(() => tsDefaultCust().name);
    await expect(surf(app, 'sms').locator('.bubble')).toContainText(`Hi ${name}`);
    await expect(surf(app, 'push').locator('.ts-st')).toHaveText(/Not a channel of this campaign/);
    await expect(surf(app, 'email').locator('.ts-st')).toHaveText(/Not a channel of this campaign/);
    await expect(surf(app, 'web')).toHaveClass(/done/);
    await expect(surf(app, 'web').locator('.ts-offer')).toContainText('10% bonus on next top-up');
    await expect(app.locator('#ts-log')).toContainText('Messages ✓');
  });

  test('an Information campaign puts nothing on the website', async ({ app }) => {
    await openCampaign(app, '435');
    await app.locator('#camp-testsend').click();
    await expect(surf(app, 'web').locator('.ts-st')).toContainText('Information campaign shows nothing on the website');
  });

  test('a plan card opens the test send on its own channel', async ({ app }) => {
    await openCampaign(app, '433');
    await app.evaluate(() => { campStep = 3; renderCampaigns(); });
    await app.locator('#camp-card [data-ptest]').first().click();
    await expect(surf(app, 'sms')).toHaveClass(/focus/);
    await app.keyboard.press('Escape');
    await expect(app.locator('#ts-modal')).toHaveCount(0);
  });

  test('a journey sends every delivery step, in order, and shows its offers', async ({ app }) => {
    await openJourney(app, 'JRN-12');
    await app.locator('#btn-jtestsend').click();
    await expect(surf(app, 'sms')).toHaveClass(/done/);
    await expect(surf(app, 'email')).toHaveClass(/done/);
    await expect(surf(app, 'email').locator('.ts-mrow')).toHaveCount(1);
    await expect(surf(app, 'email').locator('.mail')).toBeVisible();
    await expect(surf(app, 'push').locator('.ts-st')).toHaveText(/No delivery step on this channel/);
    await expect(surf(app, 'web').locator('.ts-oh')).toHaveText('Offers for you');
  });

  test('the cascade follows the recipient: no app means SMS, and push is not delivered', async ({ app }) => {
    await openJourney(app, 'JRN-07');
    await app.locator('#btn-jtestsend').click();
    await expect(surf(app, 'push')).toHaveClass(/done/);
    await expect(surf(app, 'push').locator('.ts-tag').first()).toContainText('cascade → Mobile Push');
    const noApp = await app.evaluate(() => tsRecipients().find((c) => c.row.APP_INSTALLED !== 'Y').id);
    await app.locator('#ts-cust').selectOption(noApp);
    await expect(surf(app, 'sms')).toHaveClass(/done/);
    await expect(surf(app, 'sms').locator('.ts-tag').first()).toContainText('cascade → SMS');
    await expect(surf(app, 'push').locator('.ts-st')).toContainText('has no app installed');
    await expect(surf(app, 'push')).toHaveClass(/is-fail/);
  });
});
