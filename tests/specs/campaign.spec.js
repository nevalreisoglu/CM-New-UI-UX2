// @ts-check
const { test, expect } = require('./fixtures');

const STEPS = ['Info', 'Targeting', 'Offer', 'Channel & content', 'Communication rules', 'Schedule', 'Approval', 'Summary'];

/** + New campaign opens the creation screen; its skip link goes straight to an empty form. */
async function openNewCampaign(app) {
  await app.locator('.nav button[data-view="campaigns"]').click();
  await app.locator('#camp-new').click();
  await app.locator('#cc-skip').click();
  await expect(app.locator('#camp-card .stepper')).toBeVisible();
}

test.describe('campaign creation screen', () => {
  test('+ New campaign opens a centred creation screen without the stepper', async ({ app }) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
    await expect(app.locator('#camp-card h2')).toHaveText('Create your campaign');
    await expect(app.locator('#camp-card .stepper')).toHaveCount(0);
    await expect(app.locator('#cc-name')).toBeFocused();
    await expect(app.locator('#camp-card [data-obj]')).toHaveCount(5);
    await expect(app.locator('#camp-card [data-reach]')).toHaveCount(2);
    await expect(app.locator('#camp-card [data-cctpl]')).toHaveCount(3);
    const w = await app.locator('#camp-card .cc').evaluate((el) => el.getBoundingClientRect().width);
    expect(w).toBeLessThanOrEqual(720);
  });

  test('Start building needs a name, then lands on Info with the choices applied', async ({ app }) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
    await app.locator('#cc-start').click();
    await expect(app.locator('#toast div').first()).toContainText('Name is required');
    await expect(app.locator('#camp-card .stepper')).toHaveCount(0);

    await app.locator('#cc-name').fill('Win-back by app card');
    await app.locator('#camp-card [data-obj="Winback"]').click();
    await app.locator('#camp-card [data-reach="pull"]').click();
    await app.locator('#cc-start').click();

    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Info');
    await expect(app.locator('#camp-card input[data-k="name"]')).toHaveValue('Win-back by app card');
    await expect(app.locator('#camp-card [data-goal="Winback"]')).toHaveClass(/on/);
    // The goal carries type and category with it; the Info step does not ask for them again.
    await expect(app.locator('#camp-card select[data-k="type"], #camp-card select[data-k="category"], #camp-card select[data-k="sub"]')).toHaveCount(0);
    await expect(app.locator('#camp-card .chgrp')).toHaveClass(/pull-on/);
  });

  test('a template opens a copy of a recent campaign', async ({ app }) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-new').click();
    const first = app.locator('#camp-card [data-cctpl]').first();
    const name = (await first.locator('b').textContent()).trim();
    await first.click();
    await expect(app.locator('#camp-card .stepper')).toBeVisible();
    await expect(app.locator('#camp-card input[data-k="name"]')).toHaveValue(name + ' (copy)');
  });
});

test.describe('campaign wizard', () => {
  test('the list filters by the search box', async ({ app }) => {
    await app.locator('.nav button[data-view="campaigns"]').click();
    const rows = app.locator('#camp-table tbody tr.row');
    const all = await rows.count();
    expect(all).toBeGreaterThan(0);

    await app.locator('#camp-q').fill('Win-back 20%');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Win-back 20% discount');
  });

  test('a new campaign shows all eight steps, with Offer disabled for an Info campaign', async ({ app }) => {
    await openNewCampaign(app);
    const stepper = app.locator('#camp-card .stepper button');

    // An Offer campaign can use every step.
    await app.locator('#camp-card [data-goal="Retention"]').click();
    await expect(stepper).toHaveCount(STEPS.length);
    await expect(stepper.nth(2)).toBeEnabled();
    await expect(app.locator('#camp-card .stepper')).toContainText('Step 1 of 8');

    // An Info campaign has nothing to offer, so the step stays visible but dead.
    await app.locator('#camp-card [data-goal="Informational"]').click();
    await expect(stepper).toHaveCount(STEPS.length);
    const offer = stepper.nth(2);
    await expect(offer).toContainText('Offer');
    await expect(offer).toBeDisabled();
    await expect(offer).toHaveAttribute('title', 'Info campaign — no offer');
    await expect(offer.locator('i')).toHaveText('–');
    await expect(app.locator('#camp-card .stepper')).toContainText('Step 1 of 7');
  });

  test('the name is required before leaving the Info step', async ({ app }) => {
    await openNewCampaign(app);
    await app.locator('#camp-next').click();

    await expect(app.locator('#toast div').first()).toContainText('Name is required');
    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Info');

    await app.locator('#camp-card input[data-k="name"]').fill('Regression test campaign');
    await app.locator('#camp-next').click();
    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Targeting');
  });

  test('the readiness panel counts what is done and never blocks', async ({ app }) => {
    await openNewCampaign(app);
    const ready = app.locator('#camp-ready');
    await expect(ready).toBeVisible();
    await expect(ready).toContainText('Readiness');
    await expect(ready).toContainText('nothing here blocks saving');
    await expect(ready.locator('li.ok')).toHaveCount(0);

    // The panel refreshes when the step changes, not on every keystroke, so that
    // typing in a field never steals focus.
    await app.locator('#camp-card input[data-k="name"]').fill('Readiness check');
    await app.locator('#camp-next').click();

    await expect(ready.locator('li.ok')).toHaveCount(1);
    await expect(ready.locator('li.ok')).toContainText('Name, period and channels');
    await expect(ready).toContainText('1 of 7');
  });

  test('every step opens with its marketing-toned heading; the stepper labels stay short', async ({ app }) => {
    const HEADINGS = ['Tell us about your campaign', 'Who will you reach?', 'What will you offer?', 'How will you reach them?',
      'Set the ground rules', 'When will it go out?', 'Send it for approval', 'Ready to launch'];
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-table tr.row').first().click();
    await app.locator('#camp-card [data-goal="Retention"]').click();
    const stepper = app.locator('#camp-card .stepper button');
    for (let i = 0; i < STEPS.length; i++) {
      await stepper.nth(i).click();
      await expect(stepper.nth(i)).toContainText(STEPS[i]);
      await expect(app.locator('#camp-card h1.step-h')).toHaveText(HEADINGS[i]);
    }
  });

  test('a readiness item jumps to its step', async ({ app }) => {
    await openNewCampaign(app);
    await app.locator('#camp-ready li[data-step="5"]').click();
    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Schedule');
  });
});
