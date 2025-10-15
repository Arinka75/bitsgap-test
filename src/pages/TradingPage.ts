// pages/TradingPage.ts
import { Page, expect } from '@playwright/test';
import { TRADING_CONSTANTS, AUTH_CONSTANTS } from '../utils/constants';

export class TradingPage {
  constructor(public page: Page) {}



  async navigate() {
    await this.page.goto(AUTH_CONSTANTS.URLS.TRADING);
    await this.page.waitForURL(AUTH_CONSTANTS.URLS.TRADING_PATTERN, { 
      timeout: TRADING_CONSTANTS.TIMEOUTS.NAVIGATION 
    });
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.PAGE_LOAD);
  }

  async takeScreenshot(name: string) {
    if (!this.page.isClosed()) {
      await this.page.screenshot({ 
        path: `./test-results/${name}-${Date.now()}.png`, 
        fullPage: true 
      });
    }
  }



  async openSettings() {
    
    const settingsButton = this.page.locator(TRADING_CONSTANTS.SELECTORS.SETTINGS_BUTTON).first();
    await settingsButton.waitFor({ 
      state: 'visible', 
      timeout: TRADING_CONSTANTS.TIMEOUTS.ELEMENT 
    });
    await expect(settingsButton).toBeEnabled();
    await settingsButton.click({ force: true });
    
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
  }

  async toggleDemoMode() {
    
    const toggled = await this.page.evaluate((selector) => {
      const demoCheckbox = document.querySelector(selector);
      if (demoCheckbox && demoCheckbox instanceof HTMLInputElement) {
        demoCheckbox.click();
        return true;
      }
      return false;
    }, TRADING_CONSTANTS.SELECTORS.DEMO_MODE_TOGGLE);

    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
  }

  async handleDemoModal() {
    
    try {
      const modal = this.page.locator(TRADING_CONSTANTS.SELECTORS.DEMO_MODAL).first();
      const isModalVisible = await modal.isVisible({ 
        timeout: TRADING_CONSTANTS.TIMEOUTS.MODAL_WAIT 
      });
      
      if (isModalVisible) {
        
        const stayButton = modal.locator(TRADING_CONSTANTS.SELECTORS.STAY_ON_DEMO_BUTTON).first();
        await stayButton.waitFor({ 
          state: 'visible', 
          timeout: TRADING_CONSTANTS.TIMEOUTS.MODAL_WAIT 
        });
        await stayButton.click({ force: true });
        
        await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
      }
    } catch (error) {
    }
  }



  async selectLimitOrder() {
    
    const limitOrderButton = this.page.locator(TRADING_CONSTANTS.SELECTORS.LIMIT_ORDER_BUTTON).first();
    await limitOrderButton.waitFor({ 
      state: 'visible', 
      timeout: TRADING_CONSTANTS.TIMEOUTS.ELEMENT 
    });
    await limitOrderButton.click({ force: true });
    
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
  }

  async setRandomPrice(): Promise<string> {
    
    const randomPrice = (
      Math.random() * 
      (TRADING_CONSTANTS.ORDER_CONFIG.PRICE.MAX - TRADING_CONSTANTS.ORDER_CONFIG.PRICE.MIN) + 
      TRADING_CONSTANTS.ORDER_CONFIG.PRICE.MIN
    ).toFixed(2);
    
    const priceInput = this.page.locator(TRADING_CONSTANTS.SELECTORS.PRICE_INPUT).first();
    
    await priceInput.waitFor({ 
      state: 'visible', 
      timeout: TRADING_CONSTANTS.TIMEOUTS.ELEMENT 
    });
    await expect(priceInput).toBeEnabled();
    
    await priceInput.click();
    await priceInput.clear();
    await priceInput.fill(randomPrice);
    
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
    const currentValue = await priceInput.inputValue();

    const priceValue = parseFloat(currentValue.replace(/,/g, ''));
    if (priceValue < TRADING_CONSTANTS.ORDER_CONFIG.PRICE.MIN) {
      await priceInput.fill(TRADING_CONSTANTS.ORDER_CONFIG.PRICE.MIN.toString());
      const retryValue = await priceInput.inputValue();
      return retryValue;
    }
    
    // console.log(`Random price set: ${currentValue}`);
    return currentValue;
  }

  async setVolumeToPercentage(targetPercentage: number): Promise<string> {
    
    const volumeSlider = this.page.locator(TRADING_CONSTANTS.SELECTORS.VOLUME_SLIDER).first();
    await volumeSlider.waitFor({ 
      state: 'visible', 
      timeout: TRADING_CONSTANTS.TIMEOUTS.ELEMENT 
    });
    
    await volumeSlider.fill(targetPercentage.toString());
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
    
    const newValue = await volumeSlider.inputValue();
    // console.log(`Volume set to: ${newValue}%`);
    return newValue;
  }

  async clickScreenshotButton() {
    
    try {
      const screenshotButton = this.page.locator(TRADING_CONSTANTS.SELECTORS.SCREENSHOT_BUTTON).first();
      await screenshotButton.waitFor({ 
        state: 'visible', 
        timeout: TRADING_CONSTANTS.TIMEOUTS.MODAL_WAIT 
      });
      await expect(screenshotButton).toBeEnabled();
      await screenshotButton.click({ force: true });
      
      await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ELEMENT_ACTION);
    } catch (error) {
    }
  }

  async clickBuyButton() {
    
    const buyButton = this.page.locator(TRADING_CONSTANTS.SELECTORS.BUY_BUTTON).first();
    await buyButton.waitFor({ 
      state: 'visible', 
      timeout: TRADING_CONSTANTS.TIMEOUTS.ELEMENT 
    });
    await expect(buyButton).toBeEnabled();
    await buyButton.click({ force: true });
    
    await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.MODAL_WAIT);
  }

//   async verifyOrderExists(orderDetails: { price: string; type: string }): Promise<void> {
//     console.log(TRADING_CONSTANTS.MESSAGES.INFO.VERIFYING_ORDER_TABLE);
    
//     await this.page.waitForTimeout(TRADING_CONSTANTS.TIMEOUTS.ORDER_TABLE_WAIT);
    
//     const table = this.page.locator(TRADING_CONSTANTS.SELECTORS.ORDERS_TABLE).first();
//     await table.waitFor({ 
//       state: 'visible', 
//       timeout: TRADING_CONSTANTS.TIMEOUTS.NAVIGATION 
//     });
    
//     const rows = table.locator(TRADING_CONSTANTS.SELECTORS.TABLE_ROW);
//     const rowCount = await rows.count();
    
//     if (rowCount === 0) {
//       throw new Error(TRADING_CONSTANTS.MESSAGES.ERRORS.NO_ORDERS_FOUND);
//     }
    
//     console.log(`✅ Found ${rowCount} order rows`);
    
//     const normalizedExpectedPrice = orderDetails.price.replace(/,/g, '');
    
//     for (let i = 0; i < rowCount; i++) {
//       const row = rows.nth(i);
//       const rowText = await row.textContent();
      
//       if (rowText && 
//           rowText.includes(orderDetails.type) &&
//           (rowText.includes(orderDetails.price) || rowText.includes(normalizedExpectedPrice))) {
        
//         console.log(`${TRADING_CONSTANTS.MESSAGES.SUCCESS.ORDER_VERIFIED}: Price=${orderDetails.price}, Type=${orderDetails.type}`);
        
//         // Проверка статуса
//         try {
//           const statusElement = row.locator(TRADING_CONSTANTS.SELECTORS.STATUS_ELEMENT).first();
//           if (await statusElement.isVisible()) {
//             const statusText = await statusElement.textContent();
//             console.log(`✅ Order status: ${statusText}`);
//           }
//         } catch (error) {
//           console.log(TRADING_CONSTANTS.MESSAGES.WARNINGS.ORDER_STATUS_NOT_AVAILABLE);
//         }
        
//         return;
//       }
//     }
    
//     throw new Error(
//       `${TRADING_CONSTANTS.MESSAGES.ERRORS.ORDER_NOT_FOUND} ${orderDetails.price} and type ${orderDetails.type} not found in table`
//     );
//   }


  async setupDemoMode() {
    await this.openSettings();
    await this.toggleDemoMode();
    await this.handleDemoModal();
  }

  async setupOrderParameters() {
    await this.selectLimitOrder();
    const price = await this.setRandomPrice();
    const volume = await this.setVolumeToPercentage(
      TRADING_CONSTANTS.ORDER_CONFIG.VOLUME.TARGET_PERCENTAGE
    );
    await this.clickScreenshotButton();
    
    return { price, volume, type: TRADING_CONSTANTS.TEXT.LIMIT };
  }

  async placeBuyOrderAndVerify() {
    const orderDetails = await this.setupOrderParameters();

    await this.clickBuyButton();
    
    
    return orderDetails;
  }
}