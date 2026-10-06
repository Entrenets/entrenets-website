const { readdirSync } = require('node:fs');
const path = require('node:path');
const { test, expect } = require('./fixtures');

test('production output contains no legacy CSS Module assets or maps', async () => {
  const cssAssets = readdirSync(path.join('.test-site', 'production', 'assets', 'css'));

  expect(cssAssets.filter(filename => filename.endsWith('.module.css'))).toEqual([]);
  expect(cssAssets.filter(filename => filename.endsWith('.module.css.json'))).toEqual([]);
});

test('About layout uses kebab-case grid classes on desktop and mobile in development and production', async ({ page }) => {
  for (const origin of ['http://localhost:8080', 'http://localhost:8081']) {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/about/`);

      await expect(page.locator('.intro-container')).toHaveCSS('display', 'grid');
      await expect(page.locator('.image-content').first()).toHaveCSS('display', 'flex');
      for (const area of [
        'about-intro-image',
        'about-intro-text',
        'innovation-image',
        'innovation-text',
        'human-potential-image',
        'human-potential-text',
      ]) {
        const element = page.locator(`.${area}`);
        await expect(element).toHaveCount(1);
        await expect(element).toHaveCSS('grid-area', area);
      }
      const columns = await page.locator('.grid-container-values').evaluate(element => {
        return getComputedStyle(element).gridTemplateColumns.split(' ').length;
      });
      expect(columns).toBe(width <= 480 ? 1 : 3);
    }
  }
});
