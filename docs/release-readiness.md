# Business inquiry release evidence

Candidate: the implementation commit for IBS-1 in epic IBS-7. Record its SHA and the deployed candidate URL when running the live checks. This document tracks evidence, not a claim that production has been released.

## Automated and local verification

The browser suite exercises the rendered site in development, production, and preview contexts. External Web3Forms and hCaptcha outcomes are controlled. It checks submission acceptance, retained information, explicit rejection, unconfirmed responses, verification expiry/failure/loading, timeouts, retries, duplicate prevention, validation, accessible navigation, resources, styling, indexing, and excluded content. Uncaught browser errors fail the suite.

Run `npm run check`, `npm test`, and `npm run build` under Node 24. Do not treat these checks as evidence of actual inbox delivery or server-side CAPTCHA enforcement.

Final verification on 2026-10-05 used a fresh temporary installation of the exact staged dependency manifests under Node 24.21.0. All 24 browser tests passed, syntax checking passed for 10 JavaScript files, and a fresh Eleventy 3.0.0 build generated all 7 public pages. Independent Standards and Spec review follow-ups confirmed that their implementation findings were resolved; see [implementation review](implementation-review.md).

## Verified configuration on 2026-10-05

`vercel project inspect --json --non-interactive` reported the linked project `entrenets-website`:

- Framework: `eleventy`.
- Node version: `24.x`.
- Dashboard build command, output directory, and install command: default (null).

The candidate declares `npm run build` and `_site` in `vercel.json` and Node `24.x` in `package.json`. The candidate has not been deployed, so a deployment build log has not been inspected. Vercel must expose `VERCEL_ENV` at build time; verify that setting and the rendered robots instruction on the actual candidate.

Alba confirmed in the implementation conversation that the receiving inbox is `info@entrenets.com`, hCaptcha is mandatory in the Web3Forms dashboard, and Alba can confirm receipt. This is owner confirmation, not an independent inspection or a completed delivery experiment. Alba owns responding within two business days.

## Required manual release gates — pending

- [ ] Record the candidate commit, deployment URL, build log, effective `npm run build` command, Node 24 runtime, and production/preview build contexts.
- [ ] Inspect the Web3Forms form for the public access key used by the site. Record confirmation of `info@entrenets.com` routing and mandatory hCaptcha enforcement, with account-level evidence that contains no credentials or prospect data.
- [ ] Submit controlled missing/invalid verification to the actual service outside browser validation. Record its rejection. Coordinate these negative probes with the form owner; no real prospect inquiry is involved.
- [ ] Make a coordinated live inquiry on the candidate with valid hCaptcha and have Alba confirm receipt at `info@entrenets.com`. Record time and receipt outcome, without copying personal information into this document.
- [ ] Confirm monitoring and the two-business-day response commitment operationally.
- [ ] Report unresolved access, quota, routing, enforcement, or delivery problems. Keep IBS-9 and release readiness incomplete while any required evidence is missing.

No production deployment or real business inquiry was initiated by the automated suite. A successful service response alone does not establish delivery or human review.

References: [Web3Forms hCaptcha setup and dashboard enforcement](https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha), [hCaptcha callbacks](https://docs.hcaptcha.com/configuration), [Vercel configuration](https://vercel.com/docs/project-configuration), [Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Presentation and CSS workflow evidence

Compared rendered screenshots against starting commit `5126dacc345c1589407e11584c7f7ea5b163d686` at 1280×900 and 390×844, with external resources controlled identically. Home and Cloud Migration screenshots were pixel-identical before and after at both sizes. The contact page retains the existing layout, colors, borders, and button presentation while adding the approved optional-field labels, fallback contact, and outcome feedback. Desktop and mobile contact captures were visually inspected.

A temporary source stylesheet was added and changed from a first to a second value. The watched development server reflected both values; fresh production output contained the second. The probe stylesheet was then removed. The browser suite also compares navigation, headings, form controls, column layout, and prefooter styling between development and production at both sizes.
