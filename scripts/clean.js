const { rmSync } = require('node:fs');

// Only remove generated output, never source assets.
rmSync('_site', { recursive: true, force: true });
