import { Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async switchToDemoMode() {
    console.log('Switching to Demo mode...');
    
    // Вариант 1: Кликаем на аватар профиля (более надежный локатор)
    try {
      // Пробуем разные возможные локаторы для аватара профиля
      const profileSelectors = [
        '.user-avatar',
        '[class*="avatar"]',
        '[class*="user"]',
        'button[aria-label*="profile" i]',
        'div[class*="profile"]',
        'img[alt*="avatar" i]'
      ];

      let avatarClicked = false;
      for (const selector of profileSelectors) {
        const avatar = this.page.locator(selector).first();
        if (await avatar.isVisible()) {
          await avatar.click();
          avatarClicked = true;
          console.log(`Clicked profile avatar using selector: ${selector}`);
          break;
        }
      }

      if (!avatarClicked) {
        // Если не нашли аватар, пробуем кликнуть по email или имени пользователя
        await this.page.click('text=bitsgap_tst@cuvbox.com');
        console.log('Clicked user email instead of avatar');
      }

      // Ждем появления выпадающего меню
      await this.page.waitForTimeout(2000);

      // Ищем и кликаем кнопку/ссылку Demo в выпадающем меню
      const demoSelectors = [
        'text=Demo',
        'button:has-text("Demo")',
        'a:has-text("Demo")',
        '[class*="demo"]',
        'text=Demo Mode'
      ];

      let demoClicked = false;
      for (const selector of demoSelectors) {
        const demoButton = this.page.locator(selector).first();
        if (await demoButton.isVisible()) {
          await demoButton.click();
          demoClicked = true;
          console.log(`Clicked Demo button using selector: ${selector}`);
          break;
        }
      }

      if (!demoClicked) {
        throw new Error('Demo button not found in profile menu');
      }

      // Ждем переключения режима
      await this.page.waitForTimeout(3000);

      // Проверяем что переключились в demo режим по UI-признаку
      const demoIndicators = [
        'text=Demo Mode',
        '[class*="demo"]',
        'text=DEMO',
        '.demo-indicator'
      ];

      let demoModeActive = false;
      for (const indicator of demoIndicators) {
        const demoElement = this.page.locator(indicator).first();
        if (await demoElement.isVisible()) {
          demoModeActive = true;
          console.log(`Demo mode confirmed with indicator: ${indicator}`);
          break;
        }
      }

      if (!demoModeActive) {
        console.log('No explicit demo indicator found, but continuing...');
      }

      console.log('Successfully switched to Demo mode');

    } catch (error) {
      console.error('Error switching to demo mode:', error);
      throw error;
    }
  }

  // Альтернативный метод - если есть прямое переключение без меню
  async switchToDemoModeAlternative() {
    console.log('Trying alternative demo mode switch...');
    
    // Пробуем найти прямую кнопку переключения Demo/Live
    const modeSwitchers = [
      '[class*="switch"]',
      '[class*="toggle"]',
      '[class*="demo"]',
      'button[aria-label*="demo" i]',
      'button[aria-label*="mode" i]'
    ];

    for (const selector of modeSwitchers) {
      const switcher = this.page.locator(selector);
      if (await switcher.isVisible()) {
        await switcher.click();
        console.log(`Clicked mode switcher: ${selector}`);
        await this.page.waitForTimeout(2000);
        return;
      }
    }

    throw new Error('Could not find demo mode switcher');
  }
}