import { Page, expect } from '@playwright/test';

export class TradingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Локаторы
  private readonly tradingTab = '[data-test-id="header-trading"]';
  private readonly mainContent = 'main';
  private readonly tradingViewIframe = 'iframe';
  private readonly chartContainer = '[class*="chart"]';

  async navigateToTrading() {
    console.log('=== Starting navigation to Trading page ===');
    
    try {
      // Сначала убедимся, что мы на главной странице
      await this.ensureOnMainPage();
      
      // Ищем и кликаем на вкладку Trading
      console.log('Looking for Trading tab...');
      const tradingTab = this.page.locator(this.tradingTab);
      
      await expect(tradingTab).toBeVisible({ timeout: 15000 });
      console.log('✅ Trading tab found, clicking...');
      
      await tradingTab.click();
      console.log('✅ Trading tab clicked');
      
      // Ждем перехода на trading страницу
      await this.page.waitForURL('**/trading**', { timeout: 20000 });
      console.log('✅ URL changed to Trading page');
      
      // Обрабатываем возможные модалки
      await this.handlePossibleModals();
      
      // Ждем полной загрузки страницы
      await this.waitForTradingPageReady();
      
      console.log('✅ Successfully navigated to Trading page');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to Trading:', error);
      await this.takeScreenshot('navigation-error');
      return false;
    }
  }

  private async ensureOnMainPage() {
    console.log('Ensuring we are on main page...');
    
    // Если мы не на bitsgap.com, переходим туда
    const currentUrl = this.page.url();
    if (!currentUrl.includes('bitsgap.com')) {
      console.log('Not on bitsgap.com, navigating...');
      await this.page.goto('https://bitsgap.com');
    }
    
    // Ждем загрузки страницы
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Main page loaded');
    
    // Проверяем, что мы аутентифицированы (видим какой-то элемент главной страницы)
    const mainPageIndicator = this.page.locator(this.mainContent).or(this.page.locator('body'));
    await expect(mainPageIndicator).toBeVisible({ timeout: 10000 });
    console.log('✅ Confirmed we are on main authenticated page');
  }

  private async handlePossibleModals() {
    console.log('Checking for modals...');
    
    const modalSelectors = [
      'div[role="dialog"]',
      '.modal',
      'button:has-text("Stay on Demo")',
      'button:has-text("Close")',
      'button:has-text("Got it")'
    ];

    for (const selector of modalSelectors) {
      try {
        const modal = this.page.locator(selector).first();
        if (await modal.isVisible({ timeout: 3000 })) {
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
          
          await this.page.waitForTimeout(1000);
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
    
    // Ждем основные элементы
    await expect(this.page.locator(this.mainContent)).toBeVisible({ timeout: 15000 });
    
    // Ждем iframe с TradingView
    await expect(this.page.locator(this.tradingViewIframe).first()).toBeVisible({ timeout: 20000 });
    
    // Даем дополнительное время для загрузки контента
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Trading page is ready');
  }

  async verifyTradingPage() {
    console.log('Verifying Trading page...');
    
    const checks = [
      { name: 'URL check', check: async () => this.page.url().includes('/trading') },
      { name: 'Main content', check: async () => {
        const main = this.page.locator(this.mainContent);
        return await main.isVisible();
      }},
      { name: 'Trading View iframe', check: async () => {
        const iframe = this.page.locator(this.tradingViewIframe).first();
        return await iframe.isVisible();
      }}
    ];

    let allPassed = true;
    
    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          console.log(`✅ ${check.name} passed`);
        } else {
          console.log(`❌ ${check.name} failed`);
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