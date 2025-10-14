import { Page, expect } from '@playwright/test';

export class TradingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ОБНОВЛЕННЫЕ ЛОКАТОРЫ НА ОСНОВЕ АКТУАЛЬНОГО UI
  private readonly tradingTab = '[data-test-id="header-trading"]';
  private readonly mainContent = 'main';
  private readonly tradingViewIframe = 'iframe';
  private readonly chartContainer = '[class*="chart"], [data-testid*="chart"]';
  private readonly activeBotsSection = 'text=Active bots';
  private readonly botsTab = '[data-test-id="header-bots"]';

  async navigateToTrading() {
    console.log('=== Starting navigation to Trading page ===');
    
    try {
      // Сначала убедимся, что мы на главной странице после авторизации
      await this.ensureAuthenticated();
      
      // Ищем и кликаем на вкладку Trading
      console.log('Looking for Trading tab...');
      const tradingTab = this.page.locator(this.tradingTab);
      
      // Добавляем больше времени для поиска элемента
      await expect(tradingTab).toBeVisible({ timeout: 20000 });
      console.log('✅ Trading tab found');
      
      // Кликаем и ждем навигации
      await Promise.all([
        this.page.waitForURL('**/trading**', { timeout: 30000 }),
        tradingTab.click()
      ]);
      
      console.log('✅ Successfully navigated to Trading page');
      
      // Обрабатываем возможные модалки
      await this.handlePossibleModals();
      
      // Ждем полной загрузки страницы
      await this.waitForTradingPageReady();
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to Trading:', error);
      await this.takeScreenshot('navigation-error');
      return false;
    }
  }

  private async ensureAuthenticated() {
    console.log('Checking authentication state...');
    
    const currentUrl = this.page.url();
    
    // Если мы не на bitsgap.com, переходим туда
    if (!currentUrl.includes('bitsgap.com')) {
      console.log('Navigating to bitsgap.com...');
      await this.page.goto('https://bitsgap.com');
    }
    
    // Ждем загрузки страницы
    await this.page.waitForLoadState('networkidle');
    
    // Проверяем индикаторы успешной аутентификации
    const authIndicators = [
      this.botsTab,
      this.activeBotsSection,
      '[data-testid="profile-avatar"]'
    ];
    
    let authConfirmed = false;
    for (const indicator of authIndicators) {
      const element = this.page.locator(indicator).first();
      if (await element.isVisible({ timeout: 10000 }).catch(() => false)) {
        console.log(`✅ Authentication confirmed by: ${indicator}`);
        authConfirmed = true;
        break;
      }
    }
    
    if (!authConfirmed) {
      throw new Error('Not authenticated - cannot proceed to Trading page');
    }
    
    console.log('✅ Confirmed we are authenticated');
  }

  private async handlePossibleModals() {
    console.log('Checking for modals...');
    
    const modalSelectors = [
      'div[role="dialog"]',
      '.modal',
      'button:has-text("Stay on Demo")',
      'button:has-text("Close")',
      'button:has-text("Got it")',
      'button:has-text("OK")'
    ];

    for (const selector of modalSelectors) {
      try {
        const modal = this.page.locator(selector).first();
        if (await modal.isVisible({ timeout: 5000 })) {
          console.log(`Found modal with selector: ${selector}`);
          
          if (selector.includes('button')) {
            await modal.click();
          } else {
            // Для модального окна ищем кнопку закрытия
            const closeBtn = modal.locator('button').first();
            if (await closeBtn.isVisible({ timeout: 2000 })) {
              await closeBtn.click();
            } else {
              // Пробуем Escape
              await this.page.keyboard.press('Escape');
            }
          }
          
          await this.page.waitForTimeout(2000);
          console.log('✅ Modal handled');
        }
      } catch (error) {
        // Продолжаем, если не нашли модалку
        continue;
      }
    }
  }

  async waitForTradingPageReady() {
    console.log('Waiting for Trading page to be ready...');
    
    // Ждем основные элементы торговой страницы
    await expect(this.page.locator(this.mainContent)).toBeVisible({ timeout: 15000 });
    
    // Ждем iframe с TradingView
    const iframe = this.page.locator(this.tradingViewIframe).first();
    await expect(iframe).toBeVisible({ timeout: 20000 });
    
    // Дополнительная проверка - ждем загрузки внутри iframe
    try {
      const frame = this.page.frameLocator(this.tradingViewIframe).first();
      await expect(frame.locator(this.chartContainer).first()).toBeVisible({ timeout: 10000 });
      console.log('✅ Trading chart is loaded');
    } catch (error) {
      console.log('⚠️ Chart inside iframe not immediately visible, but continuing...');
    }
    
    console.log('✅ Trading page is ready');
  }

  async verifyTradingPage() {
    console.log('Verifying Trading page...');
    
    const checks = [
      { 
        name: 'URL contains /trading', 
        check: async () => this.page.url().includes('/trading') 
      },
      { 
        name: 'Main content visible', 
        check: async () => {
          const main = this.page.locator(this.mainContent);
          return await main.isVisible();
        }
      },
      { 
        name: 'Trading View iframe visible', 
        check: async () => {
          const iframe = this.page.locator(this.tradingViewIframe).first();
          return await iframe.isVisible();
        }
      }
    ];

    let allPassed = true;
    
    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${check.name} errored:`, error);
        allPassed = false;
      }
    }
    
    return allPassed;
  }

  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `./test-results/trading-${name}-${timestamp}.png`, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: trading-${name}-${timestamp}.png`);
  }

  async logCurrentState() {
    const url = this.page.url();
    const title = await this.page.title();
    console.log('=== CURRENT PAGE STATE ===');
    console.log(`URL: ${url}`);
    console.log(`Title: ${title}`);
    console.log('==========================');
  }
}