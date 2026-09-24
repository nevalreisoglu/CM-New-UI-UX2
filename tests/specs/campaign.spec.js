// @ts-check
const { test, expect } = require('./fixtures');

const STEPS = ['Info', 'Targeting', 'Offer', 'Channel & content', 'Communication rules', 'Schedule', 'Approval', 'Summary'];

/** Pick a goal from the header chip's popover. */
async function pickGoal(app, goal) {
  await app.locator('#camp-goalchip').click();
  await app.locator(`#camp-goalpop [data-goal="${goal}"]`).click();
}

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
    // The goal is asked once: it is a header chip, not a field of the Info step.
    await expect(app.locator('#camp-goalchip')).toHaveText(/Goal: Winback/);
    await expect(app.locator('#camp-card .typechip')).toHaveText('Offer');
    await expect(app.locator('#camp-card [data-goal], #camp-card select[data-k="type"], #camp-card select[data-k="category"], #camp-card select[data-k="sub"]')).toHaveCount(0);
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

  test('a new campaign shows eight steps; an Information campaign skips Offer and shows seven', async ({ app }) => {
    await openNewCampaign(app);
    const stepper = app.locator('#camp-card .stepper button');
    // Skip — go straight to the form: no goal yet.
    await expect(app.locator('#camp-goalchip')).toHaveText(/Set goal/);
    await expect(app.locator('#camp-goalchip')).toHaveClass(/unset/);

    // An Offer campaign can use every step.
    await pickGoal(app, 'Retention');
    await expect(app.locator('#camp-goalchip')).toHaveText(/Goal: Retention/);
    await expect(stepper).toHaveCount(STEPS.length);
    await expect(stepper.nth(2)).toBeEnabled();
    await expect(app.locator('#camp-card .stepper')).toContainText('Step 1 of 8');

    // An Information campaign has nothing to offer: the step leaves the path and the
    // connector runs from Targeting straight to Channel & content.
    await pickGoal(app, 'Informational');
    await expect(app.locator('#camp-card .typechip')).toHaveText('Information');
    const offer = stepper.nth(2);
    await expect(offer).toBeHidden();
    await expect(offer).toBeDisabled();
    await expect(offer).toHaveAttribute('title', 'Information campaign — no offer');
    await expect(app.locator('#camp-card .stepper button:visible')).toHaveCount(7);
    await expect(app.locator('#camp-card .stepper .sconn')).toHaveCount(6);
    await expect(app.locator('#camp-card .stepper')).toContainText('Step 1 of 7');
  });

  test('the stepper colours follow readiness, not visits, and never block', async ({ app }) => {
    await openNewCampaign(app);
    const step = (i) => app.locator(`#camp-card .stepper button[data-step="${i}"]`);
    const name = app.locator('#camp-card input[data-k="name"]');

    // Filling the Info step's required parts turns it green without leaving it.
    await expect(step(0)).not.toHaveClass(/done/);
    await name.fill('Stepper check');
    await expect(step(0)).toHaveClass(/done/);
    await expect(step(0)).toHaveClass(/on/);
    await expect(step(0).locator('i')).toHaveText('✓');
    await expect(app.locator('#camp-card .stepper .sconn').first()).toHaveClass(/ok/);
    await expect(name).toBeFocused();
    await expect(app.locator('#camp-card .stepper')).toContainText('Ready to submit: 1 of 6');
    // Clearing it turns it back.
    await name.fill('');
    await expect(step(0)).not.toHaveClass(/done/);
    await expect(app.locator('#camp-card .stepper .sconn').first()).not.toHaveClass(/ok/);
    await name.fill('Stepper check');

    // A visited step that still needs something is amber, not green; an unvisited one is neither.
    await step(1).click();
    await step(3).click();
    await expect(step(1)).toHaveClass(/todo/);
    await expect(step(1)).not.toHaveClass(/done/);
    await expect(step(5)).not.toHaveClass(/todo|done/);
    // Nothing blocks: any step can be clicked.
    await step(7).click();
    await expect(step(7)).toHaveClass(/on/);
    await expect(step(7)).not.toHaveClass(/done/);
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

  test('readiness counts six things the maker does; the side panel is gone; approval is a state', async ({ app }) => {
    await openNewCampaign(app);
    await expect(app.locator('#camp-ready')).toHaveCount(0);
    await expect(app.locator('#camp-card .stepper')).toContainText('Ready to submit: 0 of 6');
    await pickGoal(app, 'Informational');
    await expect(app.locator('#camp-card .stepper')).toContainText('Ready to submit: 0 of 5');
    // The stepper tooltip says what is missing, in plain words.
    await expect(app.locator('#camp-card .stepper button[data-step="0"]')).toHaveAttribute('title', /Give the campaign a name/);
    await expect(app.locator('#camp-card .stepper button[data-step="3"]')).toHaveAttribute('title', /SMS: message is empty/);

    // Approval is the approver's action: the step shows its state, never counted as an item.
    await app.locator('#camp-back').click();
    const approval = async (id) => { await app.locator('#camp-q').fill(id); await app.locator(`#camp-table tr.row[data-id="${id}"]`).click(); return app.locator('#camp-card .stepper button[data-step="6"]'); };
    await expect(await approval('2004')).toHaveClass(/pend/);
    await expect(app.locator('#camp-card .stepper')).toContainText('Ready to submit: 6 of 6');
    await app.locator('#camp-back').click();
    await expect(await approval('2613')).toHaveClass(/rej/);
    await app.locator('#camp-back').click();
    await expect(await approval('433')).toHaveClass(/done/);
  });

  test('Communication rules and Schedule need an explicit choice; nothing is preselected', async ({ app }) => {
    await openNewCampaign(app);
    const step = (i) => app.locator(`#camp-card .stepper button[data-step="${i}"]`);
    await step(4).click();
    await expect(app.locator('#camp-rmode .tcard.on')).toHaveCount(0);
    await expect(step(4)).not.toHaveClass(/done/);
    await app.locator('#camp-rmode [data-rmode="standard"]').click();
    await expect(step(4)).toHaveClass(/done/);
    await expect(app.locator('#camp-card .stdrules')).toContainText('Pre-sent period');
    await app.locator('#camp-rmode [data-rmode="custom"]').click();
    await expect(app.locator('#camp-card [data-ck="override"]')).toBeVisible();

    await step(5).click();
    await expect(app.locator('#camp-strig .tcard.on')).toHaveCount(0);
    await expect(step(5)).toHaveAttribute('title', /Choose Run now or Schedule/);
    await app.locator('#camp-strig [data-strig="Schedule"]').click();
    await expect(step(5)).toHaveClass(/done/);
    await expect(app.locator('#camp-card [data-sk="time"]')).toBeVisible();
  });

  test('missing fields are marked only after leaving the step, and the target counts only added segments', async ({ app }) => {
    await openNewCampaign(app);
    const step = (i) => app.locator(`#camp-card .stepper button[data-step="${i}"]`);
    await step(3).click();
    await expect(app.locator('#camp-card .miss')).toHaveCount(0);
    await step(1).click();
    const kpi = app.locator('#camp-card .tg .box + .box .bh .kpi');
    await expect(kpi).toContainText('includes 0 · excludes 0');
    await expect(kpi).toContainText(/global exclusion lists? (is|are) applied at send, per channel/);
    await step(3).click();
    await expect(app.locator('#camp-card .fld.miss')).not.toHaveCount(0);
  });

  test('Summary lists what is missing; Submit opens the list instead of submitting; Save is never blocked', async ({ app }) => {
    await openNewCampaign(app);
    await app.locator('#camp-card input[data-k="name"]').fill('Submit check');
    await app.locator('#camp-card .stepper button[data-step="7"]').click();
    const b4 = app.locator('#camp-b4sub');
    await expect(b4).toContainText('Before you can submit');
    await expect(b4).toContainText('Choose Run now or Schedule');
    await b4.locator('[data-goto="5"]').click();
    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Schedule');

    await app.locator('#camp-card .stepper button[data-step="6"]').click();
    await app.locator('#camp-activate').click();
    const dlg = app.locator('#camp-miss-modal');
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText('Include at least one segment');
    await expect(app.locator('#camp-card .stepper button[data-step="6"]')).not.toHaveClass(/pend/);
    await app.keyboard.press('Escape');
    await expect(dlg).toHaveCount(0);

    await app.locator('#camp-save').click();
    await expect(app.locator('#toast div').first()).toContainText('Saved');
  });

  test('every step opens with its marketing-toned heading; the stepper labels stay short', async ({ app }) => {
    const HEADINGS = ['Tell us about your campaign', 'Who will you reach?', 'What will you offer?', 'How will you reach them?',
      'Set the ground rules', 'When will it go out?', 'Send it for approval', 'Ready to launch'];
    await app.locator('.nav button[data-view="campaigns"]').click();
    await app.locator('#camp-table tr.row').first().click();
    await pickGoal(app, 'Retention');
    const stepper = app.locator('#camp-card .stepper button');
    for (let i = 0; i < STEPS.length; i++) {
      await stepper.nth(i).click();
      await expect(stepper.nth(i)).toContainText(STEPS[i]);
      await expect(app.locator('#camp-card h1.step-h')).toHaveText(HEADINGS[i]);
    }
  });

  test('a missing item in Summary jumps to its step and field', async ({ app }) => {
    await openNewCampaign(app);
    await app.locator('#camp-card .stepper button[data-step="7"]').click();
    await app.locator('#camp-b4sub [data-goto="0"]').first().click();
    await expect(app.locator('#camp-card .stepper button.on')).toContainText('Info');
    await expect(app.locator('#camp-card input[data-k="name"]')).toBeFocused();
  });
});
