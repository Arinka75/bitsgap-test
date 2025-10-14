import { Page } from '@playwright/test';

export class AuthHelpers {
  static async waitForNavigationWithFallback(
    page: Page, 
    primaryUrl: string, 
    fallbackUrls: string[] = [],
    timeout: number = 15000
  ) {
    try {
      await page.waitForURL(primaryUrl, { timeout });
      return true;
    } catch {
      for (const url of fallbackUrls) {
        try {
          await page.waitForURL(url, { timeout: 5000 });
          return true;
        } catch {
          continue;
        }
      }
      
      await page.waitForURL('**/app/**', { timeout: 10000 });
      return true;
    }
  }

  static async takeScreenshot(page: Page, name: string) {
    try {
      await page.screenshot({ 
        path: `test-results/${name}-${Date.now()}.png`, 
        fullPage: true 
      });
    } catch (error) {
    }
  }
}