import { test } from '@playwright/test';

test('explore login page', async ({ page }) => {
  await page.goto('https://bitsgap.com');
  
  // Ждем загрузки
  await page.waitForTimeout(5000);
  
  // Кликаем Sign In
  await page.click('button:has-text("Sign In")');
  
  // Ждем форму логина
  await page.waitForTimeout(3000);
  
  // Скриншот для анализа
  await page.screenshot({ path: 'login-form.png', fullPage: true });
  
  // Выводим все инпуты на странице
  const inputs = await page.locator('input').all();
  console.log('Found inputs:');
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`- type: ${type}, name: ${name}, placeholder: ${placeholder}`);
  }
  
  // Выводим все кнопки
  const buttons = await page.locator('button').all();
  console.log('Found buttons:');
  for (const button of buttons) {
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    console.log(`- text: "${text}", type: ${type}`);
  }
});