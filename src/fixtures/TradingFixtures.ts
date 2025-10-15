// fixtures/index.ts
import { test as base } from '@playwright/test';
import { TradingPage } from '../pages/TradingPage';

export type TestFixtures = {
  tradingPage: TradingPage;
};

export const testWithFixtures = base.extend<TestFixtures>({
  tradingPage: async ({ page }, use) => {
    await use(new TradingPage(page));
  }
});