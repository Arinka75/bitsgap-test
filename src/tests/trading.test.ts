import { test, expect } from '@playwright/test';
import { TradingPage } from '../pages/TradingPage';

test.describe('Trading Page Tests', () => {
  let tradingPage: TradingPage;

  test.beforeEach(async ({ page }) => {
    tradingPage = new TradingPage(page);
  });

  test('should navigate to trading page after authentication', async ({ page }) => {
    console.log('🚀 Starting trading page navigation test');
    
    // Используем сохраненное состояние аутентификации
    // Playwright автоматически применит storageState из конфигурации проекта
    
    try {
      // Логируем начальное состояние
      await tradingPage.logCurrentState();
      
      // Переходим на Trading страницу
      const navigationSuccess = await tradingPage.navigateToTrading();
      
      if (!navigationSuccess) {
        throw new Error('Navigation to Trading page failed');
      }
      
      // Проверяем, что мы на правильной странице
      const verificationSuccess = await tradingPage.verifyTradingPage();
      
      if (verificationSuccess) {
        console.log('🎉 SUCCESS: Trading page test completed successfully!');
        await tradingPage.takeScreenshot('success');
      } else {
        throw new Error('Trading page verification failed');
      }
      
      // Финальная проверка
      expect(verificationSuccess).toBe(true);
      
    } catch (error) {
      console.error('❌ FAILED: Trading page test failed:', error);
      await tradingPage.takeScreenshot('failure');
      await tradingPage.logCurrentState();
      throw error;
    }
  });

  test('should verify trading page components', async ({ page }) => {
    console.log('🔍 Starting trading page components verification');
    
    await tradingPage.navigateToTrading();
    
    // Проверяем основные компоненты
    const currentUrl = page.url();
    expect(currentUrl).toContain('/trading');
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    const tradingIframe = page.locator('iframe').first();
    await expect(tradingIframe).toBeVisible();
    
    console.log('✅ Trading page components verified successfully');
  });
});