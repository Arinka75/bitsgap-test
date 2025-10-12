import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TradingPage } from '../pages/TradingPage';
import { WebSocketHelper } from '../helpers/WebSocketHelper';

type TestFixtures = {
  loginPage: LoginPage;
  tradingPage: TradingPage;
  webSocketHelper: WebSocketHelper;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  tradingPage: async ({ page }, use) => {
    const tradingPage = new TradingPage(page);
    await use(tradingPage);
  },

  webSocketHelper: async ({ page }, use) => {
    const webSocketHelper = new WebSocketHelper(page);
    await use(webSocketHelper);
  },
});

export { expect } from '@playwright/test';