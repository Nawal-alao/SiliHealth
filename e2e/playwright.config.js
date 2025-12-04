module.exports = {
  timeout: 30 * 1000,
  testDir: './tests',
  reporter: [['list'], ['html', { open: false }]],
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  outputDir: 'e2e/artifacts',
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    actionTimeout: 15 * 1000,
    navigationTimeout: 15 * 1000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
};
