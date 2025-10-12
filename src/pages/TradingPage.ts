import { Page, expect } from '@playwright/test';

export class TradingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Локаторы
  private readonly tradingTab = 'text=Trading';
  private readonly limitOrderButton = 'button:has-text("Limit")';
  private readonly priceInput = 'input[name="price"]';
  private readonly volumeSlider = '.volume-slider'; // Пример
  private readonly buyButton = 'button:has-text("BUY")';
  private readonly ordersTable = '.orders-table';
  private readonly orderRow = '.order-row';

  async navigate() {
    await this.page.click(this.tradingTab);
    await this.waitForTradingPageReady();
  }

  async waitForTradingPageReady() {
    // Ждем загрузки ключевых элементов
    await expect(this.page.locator(this.priceInput)).toBeVisible();
    await expect(this.page.locator(this.buyButton)).toBeVisible();
  }

  async selectLimitOrder() {
    // Явно выбираем Limit Order даже если выбран по умолчанию
    await this.page.click(this.limitOrderButton);
    await expect(this.page.locator(this.limitOrderButton)).toHaveClass(/active/);
  }

  async setRandomPrice(minPrice: number = 1000, maxPrice: number = 50000): Promise<number> {
    const randomPrice = this.generateRandomPrice(minPrice, maxPrice);
    await this.page.fill(this.priceInput, randomPrice.toString());
    return randomPrice;
  }

  async setRandomVolume(minPercent: number = 10, maxPercent: number = 60): Promise<number> {
    const slider = this.page.locator(this.volumeSlider);
    const sliderBoundingBox = await slider.boundingBox();
    
    if (!sliderBoundingBox) throw new Error('Slider not found');
    
    // Генерируем случайную позицию для ползунка
    const randomPosition = this.generateRandomNumber(minPercent, maxPercent);
    const clickX = sliderBoundingBox.width * (randomPosition / 100);
    
    await slider.click({ position: { x: clickX, y: sliderBoundingBox.height / 2 } });
    
    // Получаем фактическое значение объема из UI
    const volumeValue = await this.getActualVolume();
    return volumeValue;
  }

  async clickBuy() {
    await this.page.click(this.buyButton);
  }

  async getOrderFromTable(expectedPrice: number) {
    // Ждем появления ордера в таблице
    await expect(this.page.locator(this.orderRow).first()).toBeVisible();
    
    const orders = await this.page.locator(this.orderRow).all();
    
    for (const order of orders) {
      const priceText = await order.locator('.order-price').textContent();
      const typeText = await order.locator('.order-type').textContent();
      const statusText = await order.locator('.order-status').textContent();
      
      const orderPrice = parseFloat(priceText?.replace(/[^\d.]/g, '') || '0');
      
      if (Math.abs(orderPrice - expectedPrice) < 0.01 && 
          typeText?.includes('Limit') && 
          (statusText?.includes('Open') || statusText?.includes('New'))) {
        return { price: orderPrice, type: typeText, status: statusText };
      }
    }
    
    return null;
  }

  private generateRandomPrice(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private async getActualVolume(): Promise<number> {
    // Получаем фактическое значение объема из UI после перемещения ползунка
    const volumeDisplay = await this.page.locator('.volume-display').textContent();
    return parseFloat(volumeDisplay?.replace(/[^\d.]/g, '') || '0');
  }
}