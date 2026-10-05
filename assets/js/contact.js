(() => {
  'use strict';

  const form = document.getElementById('business-inquiry');
  if (!form) return;
  const status = document.getElementById('inquiry-status');
  const submit = form.querySelector('[type="submit"]');
  const unconfirmed = 'Your submission is unconfirmed. Your information is still here. Please complete CAPTCHA verification again before a deliberate retry, or email info@entrenets.com.';
  let submitting = false;
  let widget;
  const captchaTimeout = window.setTimeout(captchaUnavailable, 15000);
  submit.disabled = false;

  function feedback(message, focus = false) {
    status.textContent = message;
    if (focus) status.focus();
  }

  function captchaUnavailable() {
    if (!submitting) feedback('CAPTCHA verification is unavailable. Please try again later or email info@entrenets.com. Your information is still here.');
  }

  function resetVerification() {
    const token = form.querySelector('[name="h-captcha-response"]');
    if (token) token.value = '';
    try {
      if (widget !== undefined && window.hcaptcha) window.hcaptcha.reset(widget);
    } catch {
      status.textContent += ' Verification is unavailable; please use the email fallback.';
    }
  }

  window.addEventListener('error', event => {
    if (event.target.id === 'captcha-script') {
      window.clearTimeout(captchaTimeout);
      captchaUnavailable();
    }
  }, true);

  window.inquiryCaptchaReady = () => {
    window.clearTimeout(captchaTimeout);
    try {
      widget = window.hcaptcha.render('inquiry-captcha', {
        sitekey: document.getElementById('inquiry-captcha').dataset.sitekey,
        theme: 'dark',
        callback: () => {
          if (!submitting) feedback('Verification complete. You can send your inquiry.');
        },
        'expired-callback': () => {
          if (!submitting) feedback('CAPTCHA verification expired. Please verify again. Your information is still here, or you can email info@entrenets.com.');
        },
        'error-callback': () => {
          if (!submitting) feedback('CAPTCHA verification failed. Please verify again, or email info@entrenets.com. Your information is still here.');
        },
      });
    } catch {
      captchaUnavailable();
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(form);
    if (!data.get('h-captcha-response')) {
      feedback('Please complete CAPTCHA verification before sending. You can also email info@entrenets.com.', true);
      return;
    }
    submitting = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    feedback('Sending your inquiry. Please wait.');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let accepted = false;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
        signal: controller.signal,
      });
      const result = await response.json();
      if (response.ok && result && result.success === true) {
        window.location.assign(form.dataset.thanksUrl);
        accepted = true;
        return;
      }
      feedback(result && result.success === false
        ? 'The service rejected your inquiry. Your information is still here. Please complete CAPTCHA verification again and retry, or email info@entrenets.com.'
        : unconfirmed, true);
    } catch {
      feedback(unconfirmed, true);
    } finally {
      window.clearTimeout(timeout);
      if (!accepted) {
        resetVerification();
        submitting = false;
        submit.disabled = false;
        form.removeAttribute('aria-busy');
      }
    }
  });
})();
