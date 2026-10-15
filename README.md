# Entrenets website

Eleventy renders Nunjucks layouts and Markdown content into `_site`. CSS and other assets are copied unchanged by Eleventy as ordinary static files. Project-owned class names use kebab-case and are used directly by templates; vendor classes follow their library's naming.

## Development

Use Node 24 (`nvm use`) and install dependencies with `npm ci`.

- `npm run dev` starts Eleventy at http://localhost:8080 and watches source changes.
- `npm run build` removes stale `_site` output and builds the site.
- `npm run check` checks JavaScript syntax. This repository does not use TypeScript or have a typechecking command.
- `npm test` runs the browser integration suite. Install its isolated browser once with `npx playwright install chromium`.
- `npm test -- tests/inquiry.spec.js` runs only the inquiry tests.
- `npm test -- tests/build.spec.js` checks the release build and generated output.

The tests start fresh development, production, and preview sites on ports 8080–8082. Those ports must be free. Web3Forms and hCaptcha are controlled at their external boundaries; tests do not send real inquiries or solve live challenges. Uncaught browser errors fail tests. Traces are retained for failures under `test-results`.

## Deployment and indexing

Vercel builds with `npm run build` and serves `_site`, as specified in `vercel.json`. Node 24.x is declared in `package.json`. No redirect rules are required.

Only `VERCEL_ENV=production` enables search indexing. Vercel supplies this deployment context; keep system environment variables enabled for builds. Preview, development, and unspecified contexts remain `noindex`. For a production build outside Vercel, run `VERCEL_ENV=production npm run build` explicitly. Allowing indexing does not guarantee search inclusion.

Unknown deployment contexts also remain `noindex`; `NODE_ENV=production` alone does not enable indexing. The build reads the deployment context at build time, so rebuild when changing it.

Unfinished blog and legal content remains excluded by `.eleventyignore`. `npm run build` removes `_site` before rendering; invoking Eleventy directly does not provide that cleanup guarantee. Fresh output contains only the home, about, contact, thank-you, Cloud Migration, Cloud Management, and Network Automation HTML pages.

Build-output tests run the public build command in an isolated project for production, preview, development, unspecified, and unknown contexts. Each build starts with stale public pages, excluded blog and legal pages, and an obsolete asset. The tests inspect the exact generated HTML page set, indexing instructions on every page, and removal of stale output.

## Business inquiries

The form requires name, email, and message. Website and phone are optional, and personal email addresses are accepted. Web3Forms acceptance leads to a thank-you page on the same deployment. Rejected and unconfirmed outcomes retain input and allow deliberate retries with fresh hCaptcha verification. Stalled requests become unconfirmed after 20 seconds; the site does not automatically retry them.

Public fallback and receiving inbox: info@entrenets.com. Alba owns responding within two business days. The Web3Forms access key and hCaptcha site key are public browser identifiers, not proof of inbox routing or service enforcement.

Before release, complete the manual checks in [the release evidence](docs/release-readiness.md). Browser test success and Web3Forms acceptance alone do not prove inbox delivery.
