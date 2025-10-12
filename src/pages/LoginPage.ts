import { Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Локаторы
  private readonly emailInput = 'input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';
  private readonly loginButton = 'button[type="submit"]';
  private readonly demoModeIndicator = '.demo-indicator'; // Пример, нужно уточнить

  async navigate() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    
    // Ждем перехода на app.bitsgap.com
    await expect(this.page).toHaveURL(/app\.bitsgap\.com/);
  }

  async switchToDemoMode() {
    // Локаторы для переключения в demo режим (нужно уточнить по UI)
    const profileMenu = '.profile-menu';
    const demoSwitch = 'text=Demo Mode';
    
    await this.page.click(profileMenu);
    await this.page.click(demoSwitch);
    
    // Проверяем, что demo режим активен
    await expect(this.page.locator(this.demoModeIndicator)).toBeVisible();
  }
}