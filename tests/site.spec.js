const { test, expect } = require('./fixtures');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = ['/', '/solutions/cloud-migration/', '/contact/', '/thanks/'];

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
  for (const [name, route] of [['Cloud Migration', '/solutions/cloud-migration/'], ['Cloud Management', '/solutions/cloud-management/'], ['Network Automation', '/solutions/network-automation/']]) {
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
  for (const route of ['/', '/about/', '/contact/', '/thanks/', '/solutions/cloud-migration/', '/solutions/cloud-management/', '/solutions/network-automation/']) {
    await page.goto(route);
    const urls = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => elements.map(element => element.href || element.src));
    for (const url of urls) {
      const target = new URL(url);
      if (target.origin !== 'http://localhost:8081' || target.pathname.startsWith('/_vercel/') || checked.has(url)) continue;
      checked.add(url);
      expect((await request.get(url)).status(), `${route}: ${url}`).toBe(200);
    }
    expect(await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.some(link => link.getAttribute('href') === '/assets/css/'))).toBe(false);
  }
});

test('production permits discovery while previews and development remain excluded', async ({ page }) => {
  for (const [origin, expected] of [['http://localhost:8081', 'index, follow'], ['http://localhost:8082', 'noindex, nofollow'], ['http://localhost:8080', 'noindex, nofollow']]) {
    for (const route of ['/', '/about/', '/contact/', '/thanks/', '/solutions/cloud-migration/', '/solutions/cloud-management/', '/solutions/network-automation/']) {
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
