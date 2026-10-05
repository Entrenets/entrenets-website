const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30000,
  use: { baseURL: 'http://localhost:8081', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node scripts/serve-test-site.js development 8080', url: 'http://localhost:8080', reuseExistingServer: false },
    { command: 'node scripts/serve-test-site.js production 8081', url: 'http://localhost:8081', reuseExistingServer: false },
    { command: 'node scripts/serve-test-site.js preview 8082', url: 'http://localhost:8082', reuseExistingServer: false },
  ],
});
