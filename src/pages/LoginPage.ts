import { Page, expect } from '@playwright/test';
import { AUTH_CONSTANTS } from '../utils/constants';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigateToHomepage() {
    await this.page.goto(AUTH_CONSTANTS.URLS.HOME);
  }

  async navigateToLogin() {
    const currentUrl = this.page.url();
    if (currentUrl.includes('/sign-in')) {
      return;
    }

    const loginLink = this.page.getByRole('link', { name: AUTH_CONSTANTS.TEXT.LOGIN }).first();
    await expect(loginLink).toBeVisible();
    
    await Promise.all([
      this.page.waitForURL(AUTH_CONSTANTS.URLS.LOGIN_PATTERN),
      loginLink.click()
    ]);
  }

  async submitLogin() {
    const submitButton = this.page.getByRole('button', { name: AUTH_CONSTANTS.TEXT.LOGIN });
    await expect(submitButton).toBeVisible();
    
    await Promise.all([
      this.page.waitForURL(AUTH_CONSTANTS.URLS.BOTS_PATTERN),
      submitButton.click()
    ]);
  }

  async verifySuccessfulLogin() {
    await expect(this.page).toHaveURL(AUTH_CONSTANTS.URLS.BOTS_EXACT);
    const botsSection = this.page.getByText(AUTH_CONSTANTS.TEXT.BOTS).first();
    await expect(botsSection).toBeVisible();
  }

async fillEmail(email: string): Promise<void> {
   await this.page.locator(AUTH_CONSTANTS.SELECTORS.EMAIL).fill(email);
}

async fillPassword(password: string): Promise<void> {
    await this.page.locator(AUTH_CONSTANTS.SELECTORS.PASSWORD).fill(password);
}

async fillCredentials(email: string, password: string): Promise<void> {

  await this.fillEmail(email);
  await this.fillPassword(password);
}
}