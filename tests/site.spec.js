const { test, expect } = require('./fixtures');

const pages = ['/', '/solutions/cloud-migration/', '/contact/', '/thanks/'];

test('confirmation text and email link have accessible contrast on desktop and mobile', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/thanks/');
    const content = await page.locator('.confirmation-content').boundingBox();
    expect(Math.abs(content.x + content.width / 2 - width / 2)).toBeLessThan(2);
    expect(Math.abs(content.y + content.height / 2 - 900 / 2)).toBeLessThan(2);
    const link = page.getByRole('link', { name: 'info@entrenets.com' });
    for (const state of ['normal', 'hover', 'focus']) {
      if (state === 'hover') await link.hover();
      if (state === 'focus') await link.focus();
      const ratios = await page.locator('.thanks-message p, .thanks-message a').evaluateAll(elements => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => {
            const channel = Number(value) / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const background = luminance(getComputedStyle(document.body).backgroundColor);
        return elements.map(element => {
          const foreground = luminance(getComputedStyle(element).color);
          return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        });
      });
      for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
      await expect(link).toHaveCSS('text-decoration-line', 'underline');
    }
  }
});

test('prospects see equivalent critical styling at desktop and mobile sizes', async ({ page, request }) => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of pages) {
      const styles = [];
      for (const origin of ['http://localhost:8080', 'http://localhost:8081']) {
        await page.goto(origin + route);
        const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => link.href));
        for (const href of hrefs.filter(url => url.startsWith(origin))) {
          expect((await request.get(href)).status(), href).toBe(200);
        }
        styles.push(await page.evaluate(() => {
          const selectors = ['body', '.logo', 'h1, h4', '.site-navigation', '.prefooter-section', 'form', '.form-row', '#name', '#message'];
          return selectors.map(selector => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const css = getComputedStyle(element);
            return { background: css.backgroundColor, color: css.color, font: css.fontFamily, display: css.display, width: css.width, border: css.borderWidth, columns: css.gridTemplateColumns };
          });
        }));
      }
      expect(styles[0]).toEqual(styles[1]);
      expect(styles[1][0].background).toBe('rgb(0, 0, 0)');
      expect(styles[1][1].width).toBe('150px');
      expect(styles[1][4].display).toBe('flex');
      if (route === '/contact/') {
        expect(styles[1][6].display).toBe('grid');
        expect(styles[1][6].columns.split(' ')).toHaveLength(viewport.width < 767 ? 1 : 2);
        expect(styles[1][7].border).toBe('2px');
        expect(styles[1][8].color).toBe('rgb(255, 255, 255)');
      }
    }
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
