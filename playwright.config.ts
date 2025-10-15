import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60000, 
  
  use: {
    baseURL: 'https://bitsgap.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'D:/bitsgap-test/bitsgap-test/storageState.json' 
      },
      dependencies: ['setup'], 
    },
  ],
  
});