import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',  // Убедитесь что путь правильный
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFolder: 'reports/json' }]
  ],
  use: {
    baseURL: 'https://app.bitsgap.com',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: '.auth/storageState.json'
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});