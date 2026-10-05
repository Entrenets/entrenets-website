const { test, expect, fillInquiry } = require('./fixtures');

test('a prospect can use a personal email and omit website and phone, then receive confirmation', async ({ page }) => {
  let submitted;
  await page.route('https://api.web3forms.com/submit', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, message: 'Accepted' } });
  });
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page).toHaveURL(/\/thanks\/$/);
  expect(submitted).toMatchObject({ name: 'A prospect', email: 'prospect@gmail.com', message: 'We need help automating our network.', website: '', phone: '', 'h-captcha-response': 'test-verification' });
  expect(submitted.redirect).toBeUndefined();
  await expect(page.getByText(/Thanks for getting in touch!/i)).toBeVisible();
  await expect(page.getByText(/two business days/i)).toBeVisible();
});

test('a rejected inquiry keeps every field and lets the prospect verify again and retry', async ({ page }) => {
  let attempts = 0;
  await page.route('https://api.web3forms.com/submit', route => {
    attempts += 1;
    expect(route.request().postDataJSON()).toMatchObject({ website: 'https://example.com', phone: '+14155552671' });
    return attempts === 1
      ? route.fulfill({ status: 400, json: { success: false, message: 'Invalid captcha' } })
      : route.fulfill({ json: { success: true } });
  });
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByLabel('Website URL').fill('https://example.com');
  await page.getByLabel('Phone number').fill('+14155552671');
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText(/rejected/i);
  await expect(page).toHaveURL(/\/contact\/$/);
  for (const [label, value] of [['Your Name', 'A prospect'], ['Email Address', 'prospect@gmail.com'], ['Website URL', 'https://example.com'], ['Phone number', '+14155552671'], ['Tell us about the project', 'We need help automating our network.']]) {
    await expect(page.getByLabel(label)).toHaveValue(value);
  }
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText(/complete CAPTCHA/i);
  expect(attempts).toBe(1);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page).toHaveURL(/\/thanks\/$/);
  expect(attempts).toBe(2);
});

test('expired verification explains how to recover without rewriting the inquiry', async ({ page }) => {
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Expire verification' }).click();
  await expect(page.getByRole('status')).toContainText(/expired.*verify again/i);
  await expect(page.getByLabel('Tell us about the project')).toHaveValue('We need help automating our network.');
  await expect(page.getByRole('button', { name: 'Expire verification' })).toBeFocused();
});

for (const [outcome, respond] of [
  ['network failure', route => route.abort()],
  ['unusable response', route => route.fulfill({ body: 'not JSON', contentType: 'application/json' })],
  ['missing acceptance', route => route.fulfill({ json: {} })],
  ['conflicting HTTP response', route => route.fulfill({ status: 500, json: { success: true } })],
]) {
  test(`a prospect sees an unconfirmed outcome after ${outcome} and can retry deliberately`, async ({ page }) => {
    let attempts = 0;
    await page.route('https://api.web3forms.com/submit', route => {
      attempts += 1;
      return attempts === 1 ? respond(route) : route.fulfill({ json: { success: true } });
    });
    await page.goto('/contact/');
    await fillInquiry(page);
    await page.getByRole('button', { name: 'Complete verification' }).click();
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.getByRole('status')).toContainText('unconfirmed');
    await expect(page.getByLabel('Tell us about the project')).toHaveValue('We need help automating our network.');
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
    expect(attempts).toBe(1);
    await page.getByRole('button', { name: 'Complete verification' }).click();
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page).toHaveURL(/\/thanks\/$/);
  });
}

test('required fields and supplied optional values receive browser validation', async ({ page }) => {
  let sent = 0;
  await page.route('https://api.web3forms.com/submit', route => { sent++; return route.fulfill({ json: { success: true } }); });
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByLabel('Your Name')).toBeFocused();
  await fillInquiry(page);
  await page.getByLabel('Email Address').fill('invalid-email');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByLabel('Email Address')).toBeFocused();
  await page.getByLabel('Email Address').fill('prospect@gmail.com');
  await page.getByLabel('Website URL').fill('not-a-url');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByLabel('Website URL')).toBeFocused();
  await page.getByLabel('Website URL').fill('https://example.com');
  await page.getByLabel('Phone number').fill('invalid-phone');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByLabel('Phone number')).toBeFocused();
  expect(sent).toBe(0);
});

test('failed CAPTCHA completion preserves the inquiry and offers email and re-verification', async ({ page }) => {
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Fail verification' }).click();
  await expect(page.getByRole('status')).toContainText(/verification failed.*verify again/i);
  await expect(page.getByLabel('Tell us about the project')).toHaveValue('We need help automating our network.');
  await expect(page.getByRole('link', { name: 'info@entrenets.com', exact: true }).first()).toHaveAttribute('href', 'mailto:info@entrenets.com');
});

test('a CAPTCHA script loading failure explains the email fallback', async ({ page }) => {
  await page.route('https://js.hcaptcha.com/**', route => route.abort());
  await page.goto('/contact/');
  await fillInquiry(page);
  await expect(page.getByRole('status')).toContainText(/verification.*unavailable.*info@entrenets.com/i);
  await expect(page.getByLabel('Tell us about the project')).toHaveValue('We need help automating our network.');
});

test('a stalled submission becomes unconfirmed and returns to an actionable form', async ({ page }) => {
  await page.clock.install();
  let started;
  const requestStarted = new Promise(resolve => { started = resolve; });
  await page.route('https://api.web3forms.com/submit', () => { started(); });
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await requestStarted;
  await expect(page.getByRole('status')).toContainText(/sending/i);
  expect(await page.getByRole('status').evaluate(element => element.closest('[aria-busy="true"]') === null)).toBe(true);
  await page.clock.fastForward(21000);
  await expect(page.getByRole('status')).toContainText(/unconfirmed/i);
  await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  await expect(page.getByLabel('Your Name')).toHaveValue('A prospect');
});

test('repeated submit actions cannot send concurrent inquiries', async ({ page }) => {
  let attempts = 0;
  let release;
  let started;
  const pending = new Promise(resolve => { release = resolve; });
  const requestStarted = new Promise(resolve => { started = resolve; });
  await page.route('https://api.web3forms.com/submit', async route => {
    attempts++;
    started();
    await pending;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await requestStarted;
  await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();
  await page.getByLabel('Email Address').press('Enter');
  await expect(page.getByRole('status')).toContainText(/sending/i);
  expect(await page.getByRole('status').evaluate(element => element.closest('[aria-busy="true"]') === null)).toBe(true);
  release();
  await expect(page).toHaveURL(/\/thanks\/$/);
  expect(attempts).toBe(1);
});

test('a slow CAPTCHA load leaves an actionable email fallback', async ({ page }) => {
  await page.clock.install();
  await page.route('https://js.hcaptcha.com/**', () => {});
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });
  await fillInquiry(page);
  await page.clock.fastForward(16000);
  await expect(page.getByRole('status')).toContainText(/verification.*unavailable/i);
  await expect(page.getByLabel('Tell us about the project')).toHaveValue('We need help automating our network.');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('a prospect can contact Entrenets by email', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.getByRole('link', { name: 'info@entrenets.com', exact: true })).toHaveAttribute('href', 'mailto:info@entrenets.com');
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();
    await expect(page.locator('noscript p')).toContainText('This protected form requires JavaScript.');
    await expect(page.locator('noscript p')).toBeVisible();
  });
});


test('a prospect can keep typing when verification expires automatically', async ({ page }) => {
  await page.clock.install();
  await page.goto('/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  const message = page.getByLabel('Tell us about the project');
  await message.focus();
  await page.clock.fastForward(121000);
  await expect(page.getByRole('status')).toContainText(/expired/i);
  await expect(message).toBeFocused();
  await page.keyboard.type(' More context.');
  await expect(message).toHaveValue('We need help automating our network. More context.');
});


test('a prospect submitting from a preview stays on that preview for confirmation', async ({ page }) => {
  await page.route('https://api.web3forms.com/submit', route => route.fulfill({ json: { success: true } }));
  await page.goto('http://localhost:8082/contact/');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page).toHaveURL('http://localhost:8082/thanks/');
});

test('a prospect receives validation for each missing required field', async ({ page }) => {
  let sent = 0;
  await page.route('https://api.web3forms.com/submit', route => { sent++; return route.fulfill({ json: { success: true } }); });
  for (const label of ['Your Name', 'Email Address', 'Tell us about the project']) {
    await page.goto('/contact/');
    await fillInquiry(page);
    await page.getByLabel(label).fill('');
    await page.getByRole('button', { name: 'Complete verification' }).click();
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.getByLabel(label)).toBeFocused();
  }
  expect(sent).toBe(0);
});
