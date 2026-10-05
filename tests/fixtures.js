const { test: base, expect } = require('@playwright/test');

// A controlled hCaptcha SDK boundary. Its controls simulate provider events,
// not application functions, and no live challenge or inquiry leaves the tests.
const captchaSDK = `
(() => {
  let options;
  let response;
  window.hcaptcha = {
    render(container, config) {
      options = config;
      const root = typeof container === 'string' ? document.getElementById(container) : container;
      response = document.createElement('textarea');
      response.name = 'h-captcha-response';
      response.hidden = true;
      root.append(response);
      const verify = document.createElement('button');
      verify.type = 'button';
      verify.textContent = 'Complete verification';
      verify.onclick = () => {
        response.value = 'test-verification';
        options.callback?.(response.value);
        window.setTimeout(() => { response.value = ''; options['expired-callback']?.(); }, 120000);
      };
      root.append(verify);
      for (const [label, callback] of [['Expire verification', 'expired-callback'], ['Fail verification', 'error-callback']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.onclick = () => { response.value = ''; options[callback]?.('network-error'); };
        root.append(button);
      }
      return 0;
    },
    reset() { response.value = ''; },
    getResponse() { return response.value; },
  };
  const callback = new URL(document.currentScript.src).searchParams.get('onload');
  if (callback) window[callback]();
  else window.hcaptcha.render(document.querySelector('.h-captcha'), {});
})();`;

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        if (url.pathname.startsWith('/_vercel/')) return route.fulfill({ body: '', contentType: 'text/javascript' });
        return route.continue();
      }
      if (url.hostname === 'js.hcaptcha.com' || (url.hostname === 'web3forms.com' && url.pathname === '/client/script.js')) {
        return route.fulfill({ body: captchaSDK, contentType: 'text/javascript' });
      }
      return route.abort();
    });
    await use(page);
    expect(errors, 'Uncaught errors disrupt the prospect journey').toEqual([]);
  },
});

async function fillInquiry(page) {
  await page.getByLabel('Your Name').fill('A prospect');
  await page.getByLabel('Email Address').fill('prospect@gmail.com');
  await page.getByLabel('Tell us about the project').fill('We need help automating our network.');
}

module.exports = { test, expect, fillInquiry };
