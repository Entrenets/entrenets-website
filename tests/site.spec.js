const { test, expect } = require('./fixtures');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = ['/', '/about/', '/contact/', '/thanks/', '/solutions/cloud-migration/', '/solutions/cloud-management/', '/solutions/network-automation/'];
const services = [
  ['Cloud Management', '/solutions/cloud-management/'],
  ['Cloud Migration', '/solutions/cloud-migration/'],
  ['Network Automation', '/solutions/network-automation/'],
];

test('prospects can read and reach the email link on the confirmation page at desktop and mobile sizes', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/thanks/');

    await expect(page.getByRole('heading', { name: 'Thank you for contacting us' })).toBeVisible();
    await expect(page.getByText('Thanks for getting in touch!', { exact: false })).toBeVisible();

    const link = page.getByRole('link', { name: 'info@entrenets.com', exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'mailto:info@entrenets.com');

    const { violations } = await new AxeBuilder({ page })
      .include('.thanks-message')
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
    await link.focus();
    await expect(link).toBeFocused();
  }
});

test('a prospect can reach each service from the footer', async ({ page }) => {
  for (const [name, route] of services) {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(route + '$'));
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('keyboard prospects can open services, reach a link, and close the submenu', async ({ page }) => {
  await page.goto('/');
  const solutions = page.getByRole('button', { name: 'Solutions', exact: true });
  await solutions.focus();
  await solutions.press('Enter');
  await expect(solutions).toHaveAttribute('aria-expanded', 'true');
  await solutions.press('Tab');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cloud Management', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(solutions).toBeFocused();
  await expect(solutions).toHaveAttribute('aria-expanded', 'false');
  expect(await solutions.evaluate(button => getComputedStyle(button).outlineStyle)).not.toBe('none');
});

test('mobile keyboard prospects can see focus on the navigation toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const navigation = page.getByRole('button', { name: 'Toggle navigation' });
  await expect(navigation).toBeFocused();
  await expect(navigation).not.toHaveCSS('outline-style', 'none');
  await expect(navigation).not.toHaveCSS('outline-width', '0px');
  await navigation.press('Enter');
  await expect(navigation).toHaveAttribute('aria-expanded', 'true');
});

test('mobile keyboard prospects can dismiss services and then navigation with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const navigation = page.getByRole('button', { name: 'Toggle navigation' });
  const solutions = page.getByRole('button', { name: 'Solutions', exact: true });
  await navigation.press('Enter');
  await solutions.press('Space');
  await solutions.press('Tab');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cloud Management', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(solutions).toBeFocused();
  await expect(solutions).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(navigation).toBeFocused();
  await expect(navigation).toHaveAttribute('aria-expanded', 'false');
  await expect(solutions).toBeHidden();
});

test('desktop keyboard prospects keep focus when Escape has no open menu to dismiss', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  const home = navigation.getByRole('link', { name: 'Home', exact: true });
  await home.focus();
  await home.press('Escape');
  await expect(home).toBeFocused();
  await home.press('Tab');
  const solutions = navigation.getByRole('button', { name: 'Solutions', exact: true });
  await expect(solutions).toBeFocused();
  await solutions.press('Space');
  await solutions.press('Tab');
  const service = navigation.getByRole('link', { name: 'Cloud Management', exact: true });
  await expect(service).toBeFocused();
  await service.press('Enter');
  await expect(page).toHaveURL(/\/solutions\/cloud-management\/$/);
});

test('prospects keep usable focus and closed menus when switching between desktop and mobile', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('button', { name: 'Toggle navigation' });
  const solutions = page.getByRole('button', { name: 'Solutions', exact: true });
  await solutions.press('Enter');
  await solutions.press('Tab');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(navigation).toBeFocused();
  await expect(navigation).toHaveAttribute('aria-expanded', 'false');
  await expect(solutions).toBeHidden();
  await navigation.press('Enter');
  await solutions.press('Enter');
  await solutions.press('Tab');
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(solutions).toBeFocused();
  await expect(solutions).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(navigation).toBeFocused();
  await expect(navigation).toHaveAttribute('aria-expanded', 'false');
  await expect(solutions).toBeHidden();
});

test('desktop prospects can discover every service by pointer and keep menus usable after resizing', async ({ page }) => {
  for (const [name, route] of services) {
    await page.goto('/');
    const navigation = page.getByRole('navigation', { name: 'Main navigation' });
    const solutions = navigation.getByRole('button', { name: 'Solutions', exact: true });
    await solutions.hover();
    await expect(solutions).toHaveAttribute('aria-expanded', 'true');
    const service = navigation.getByRole('link', { name, exact: true });
    await service.focus();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(service).toBeVisible();
    await expect(service).toBeFocused();
    await service.click();
    await expect(page).toHaveURL(new RegExp(route + '$'));
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('mobile prospects can open navigation, visit a service, and close navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const navigation = page.getByRole('button', { name: 'Toggle navigation' });
  await navigation.click();
  await expect(navigation).toHaveAttribute('aria-expanded', 'true');
  const solutions = page.getByRole('button', { name: 'Solutions', exact: true });
  await solutions.click();
  await expect(solutions).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cloud Migration', exact: true }).click();
  await expect(page).toHaveURL(/\/solutions\/cloud-migration\/?$/);
  await navigation.click();
  await expect(navigation).toHaveAttribute('aria-expanded', 'true');
  await navigation.click();
  await expect(navigation).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Solutions', exact: true })).toBeHidden();
});

test('retained public pages have working internal destinations and referenced resources', async ({ page, request }) => {
  const checked = new Set();
  for (const route of pages) {
    await page.goto(route);
    for (const stylesheet of await page.locator('link[rel="stylesheet"]').all()) {
      const href = await stylesheet.getAttribute('href');
      expect(href.trim(), `${route}: empty stylesheet URL`).not.toBe('');
      expect(new URL(href, page.url()).pathname, `${route}: stylesheet directory request`).not.toBe('/assets/css/');
    }
    for (const image of await page.locator('img').all()) {
      expect(await image.evaluate(element => element.complete && element.naturalWidth > 0), `${route}: ${await image.getAttribute('src')}`).toBe(true);
    }
    const urls = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => elements.map(element => element.href || element.src));
    for (const url of urls) {
      const target = new URL(url);
      target.hash = '';
      if (target.origin !== new URL(page.url()).origin || target.pathname.startsWith('/_vercel/') || checked.has(target.href)) continue;
      checked.add(target.href);
      const response = await request.get(target.href);
      expect(response.status(), `${route}: ${target.href}`).toBe(200);
      if (response.headers()['content-type']?.includes('text/css')) {
        const css = await response.text();
        for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
          urls.push(new URL(match[2], response.url()).href);
        }
      }
    }
  }
});

test('production permits discovery while previews and development remain excluded', async ({ page }) => {
  for (const [origin, expected] of [['http://localhost:8081', 'index, follow'], ['http://localhost:8082', 'noindex, nofollow'], ['http://localhost:8080', 'noindex, nofollow']]) {
    for (const route of pages) {
      await page.goto(origin + route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', expected);
    }
  }
});

test('fresh builds keep unfinished blog and legal content unpublished', async ({ request }) => {
  for (const origin of ['http://localhost:8081', 'http://localhost:8082']) {
    for (const route of ['/blog/', '/blog/1/', '/privacy-policy/', '/terms-conditions/', '/blog/design-inspiration-the-best-projects-from-November/', '/blog/the-10-biggest-rebrands-and-logo-designs-of-2019/', '/blog/the-10-biggest-product-stories-of-2019/', '/blog/pt-chooses-classic-blue-for-its-colour-of-the-year-2020/']) {
      expect((await request.get(origin + route)).status(), origin + route).toBe(404);
    }
  }
});
