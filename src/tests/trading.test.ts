// tests/trading-flow.spec.ts
import { expect } from '@playwright/test';
import { testWithFixtures } from '../fixtures/TradingFixtures';
import { WebSocketHelper } from '../helpers/WebSocketHelper';
import { TRADING_CONSTANTS, TEST_CONSTANTS } from '../utils/constants';

testWithFixtures('should complete trading flow with random parameters (min price 300000) and WebSocket verification', 
async ({ page, tradingPage }) => {
  
  testWithFixtures.setTimeout(TRADING_CONSTANTS.TIMEOUTS.TEST);


    await tradingPage.navigate();

    await tradingPage.setupDemoMode();

    const orderDetails = await tradingPage.placeBuyOrderAndVerify();
    
    await tradingPage.takeScreenshot('trading-flow-error');

  }
);

testWithFixtures.beforeEach(async ({ page }) => {
  await page.context().storageState({ path: TEST_CONSTANTS.AUTH_STATE_PATH });
});