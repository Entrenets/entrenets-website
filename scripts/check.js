const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const files = ['.eleventy.js', 'playwright.config.js'];
for (const dir of ['assets/js', 'scripts', 'tests']) {
  files.push(...readdirSync(dir).filter(file => file.endsWith('.js')).map(file => `${dir}/${file}`));
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Syntax checked ${files.length} JavaScript files. This project has no TypeScript configuration.`);
