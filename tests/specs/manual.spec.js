// @ts-check
const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures');

const MANUAL_MD = path.resolve(__dirname, '..', '..', 'docs', 'user-manual.md');

test.describe('user manual', () => {
  test('a button in the top bar opens it', async ({ app }) => {
    const btn = app.locator('#btn-manual');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('User manual');
    await expect(app.locator('#man-modal')).toBeHidden();

    await btn.click();
    await expect(app.locator('#man-modal')).toBeVisible();
    await expect(app.locator('#man-modal .ph h3')).toHaveText('User manual');
  });

  test('it closes with Close, Escape and a click outside', async ({ app }) => {
    await app.locator('#btn-manual').click();
    await app.locator('#man-close').click();
    await expect(app.locator('#man-modal')).toBeHidden();

    await app.locator('#btn-manual').click();
    await app.keyboard.press('Escape');
    await expect(app.locator('#man-modal')).toBeHidden();

    await app.locator('#btn-manual').click();
    await app.locator('#man-modal').click({ position: { x: 5, y: 5 } });
    await expect(app.locator('#man-modal')).toBeHidden();
  });

  test('the markdown renders as headings, lists and tables', async ({ app }) => {
    await app.locator('#btn-manual').click();
    const doc = app.locator('#man-doc');

    expect(await doc.locator('h2').count()).toBeGreaterThan(5);
    expect(await doc.locator('table').count()).toBeGreaterThan(0);
    expect(await doc.locator('ul li').count()).toBeGreaterThan(10);
    expect(await doc.locator('ol li').count()).toBeGreaterThan(0);
    await expect(doc.locator('blockquote').first()).toContainText('No build, no server');

    // inline markers must be gone, not printed literally
    const text = await doc.innerText();
    expect(text).not.toContain('**');
    expect(text).not.toMatch(/^#{1,6}\s/m);
    expect(text).not.toContain('| --- |');
  });

  test('the contents list jumps to a section', async ({ app }) => {
    await app.locator('#btn-manual').click();
    const toc = app.locator('#man-toc a');
    expect(await toc.count()).toBeGreaterThan(5);

    const target = app.locator('#man-toc a', { hasText: 'Segments' }).first();
    const id = await target.getAttribute('data-h');
    await target.click();

    // the jump is animated, so poll until it settles
    await expect
      .poll(
        () =>
          app.evaluate((hid) => {
            const doc = document.getElementById('man-doc');
            const h = document.getElementById(hid);
            return Math.abs(h.getBoundingClientRect().top - doc.getBoundingClientRect().top);
          }, id),
        { message: 'the section heading should come to rest at the top of the pane' }
      )
      .toBeLessThan(40);
  });

  test('the event and clock strip is explained without prototype wording', async ({ app }) => {
    await app.locator('#btn-manual').click();
    const text = await app.locator('#man-doc').innerText();
    expect(text).toContain('The event and clock strip');
    expect(text.toLowerCase()).not.toContain('prototype');
  });

  test('the embedded copy matches docs/user-manual.md', async ({ app }) => {
    const onDisk = fs.readFileSync(MANUAL_MD, 'utf8');
    const embedded = await app.evaluate(() =>
      document
        .getElementById('man-src')
        .textContent.replace(/^[\s\S]*?<!--\s*MANUAL:START\s*-->\n?/, '')
        .replace(/<!--\s*MANUAL:END\s*-->[\s\S]*$/, '')
    );
    expect(embedded, 'run: node tools/embed-manual.js').toBe(onDisk);
  });
});
