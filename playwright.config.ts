import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
require('dotenv').config();

const config: PlaywrightTestConfig = {
  /* Maximum time one test can run for. */
  globalSetup: require.resolve('./global-setup'),
  // testDir: './tests/test-spec',
  timeout: 30 * 10000,
  expect: {
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    storageState: 'storageState.json',
    actionTimeout: 0,
    screenshot: 'off',
    video: 'off',
    viewport: { width: 1200, height: 720 },
    trace: 'on-first-retry',
    baseURL: process.env.APP_HOST_URL,
    launchOptions: {
      logger: {
        isEnabled: () => {
          return false;
        },
        log: (name, severity, message, args) => console.log(`${name}: ${message}`),
      },
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
      },
    },
    {
      name: 'Desktop chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
  ],
};

export default config;
