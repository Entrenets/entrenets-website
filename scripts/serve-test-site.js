const { spawn } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');

const [context, port] = process.argv.slice(2);
if (!['development', 'production', 'preview'].includes(context) || !/^808[0-2]$/.test(port)) {
  throw new Error('Expected deployment context and test port');
}
const output = path.join('.test-site', context);
rmSync(output, { recursive: true, force: true });
const server = spawn(process.execPath, [
  'node_modules/@11ty/eleventy/cmd.cjs', '--serve', '--port=' + port, '--output=' + output,
], { stdio: 'inherit', env: { ...process.env, VERCEL_ENV: context } });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('exit', code => process.exit(code ?? 0));
