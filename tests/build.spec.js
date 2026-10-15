const { execFileSync } = require('node:child_process');
const { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const publicPages = [
  'about/index.html',
  'contact/index.html',
  'index.html',
  'solutions/cloud-management/index.html',
  'solutions/cloud-migration/index.html',
  'solutions/network-automation/index.html',
  'thanks/index.html',
];
const excludedPages = [
  'blog/index.html',
  'blog/1/index.html',
  'blog/design-inspiration-the-best-projects-from-November/index.html',
  'blog/the-10-biggest-rebrands-and-logo-designs-of-2019/index.html',
  'blog/the-10-biggest-product-stories-of-2019/index.html',
  'blog/pt-chooses-classic-blue-for-its-colour-of-the-year-2020/index.html',
  'privacy-policy/index.html',
  'terms-conditions/index.html',
];

function htmlFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return htmlFiles(path.join(directory, entry.name), relativePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [relativePath] : [];
  }).sort();
}

test('public builds replace stale output with only the intended pages and indexing instructions', async ({}, testInfo) => {
  const project = testInfo.outputPath('project');
  const repository = path.resolve(__dirname, '..');
  mkdirSync(project, { recursive: true });
  for (const source of ['package.json', '.eleventy.js', '.eleventyignore', 'src', 'assets', 'scripts']) {
    cpSync(path.join(repository, source), path.join(project, source), { recursive: true });
  }
  symlinkSync(path.join(repository, 'node_modules'), path.join(project, 'node_modules'), 'dir');

  try {
    for (const [context, robots] of [
      ['production', 'index, follow'],
      ['preview', 'noindex, nofollow'],
      ['development', 'noindex, nofollow'],
      [undefined, 'noindex, nofollow'],
      ['unknown', 'noindex, nofollow'],
    ]) {
      await test.step(`fresh ${context ?? 'unspecified'} deployment build`, async () => {
        const output = path.join(project, '_site');
        for (const stalePage of [...publicPages, ...excludedPages, 'obsolete/index.html']) {
          const filename = path.join(output, stalePage);
          mkdirSync(path.dirname(filename), { recursive: true });
          writeFileSync(filename, '<p>Stale output from a previous deployment.</p>');
        }
        const staleAsset = path.join(output, 'assets', 'obsolete.js');
        mkdirSync(path.dirname(staleAsset), { recursive: true });
        writeFileSync(staleAsset, '// Stale generated asset.');

        // A production Node environment alone must not enable indexing.
        // Do not copy local .env files or inherit a deployment context.
        const env = { ...process.env, NODE_ENV: 'production' };
        delete env.VERCEL_ENV;
        if (context !== undefined) env.VERCEL_ENV = context;
        execFileSync('npm', ['run', 'build'], { cwd: project, env, encoding: 'utf8', timeout: 20000 });

        expect(htmlFiles(output)).toEqual(publicPages);
        expect(existsSync(staleAsset)).toBe(false);
        for (const publicPage of publicPages) {
          const html = readFileSync(path.join(output, publicPage), 'utf8');
          const robotsTags = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi) ?? [];
          expect(robotsTags, publicPage).toHaveLength(1);
          expect(robotsTags[0], publicPage).toContain(`content="${robots}"`);
          expect(html, publicPage).not.toContain('Stale output from a previous deployment.');
        }
      });
    }
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});
