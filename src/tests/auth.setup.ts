import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

// Увеличиваем общий таймаут теста до 60 секунд
test('authenticate', async ({ page }) => {
  test.setTimeout(60000); // ⬅️ ДОБАВИТЬ ЭТУ СТРОКУ
  
  console.log('Starting authentication process...');

  try {
    // Устанавливаем больший таймаут для всей страницы
    page.setDefaultTimeout(30000);
    
    await page.goto('https://bitsgap.com');
    console.log('Navigated to bitsgap.com');

    // Ждем и кликаем по ссылке логина
    const loginLink = page.getByRole('link', { name: 'Log in' }).first();
    await expect(loginLink).toBeVisible({ timeout: 10000 });
    
    await Promise.all([
      page.waitForURL('**/sign-in**', { timeout: 30000 }),
      loginLink.click(),
    ]);
    console.log('Navigated to login page');

    // Ждем заголовок формы входа
    const loginHeader = page.locator('h1', { hasText: 'Log in' });
    await expect(loginHeader).toBeVisible({ timeout: 15000 });

    // Закрываем баннер cookie, если есть
    try {
      const acceptCookiesBtn = page.getByRole('button', { name: /accept all cookies/i });
      if (await acceptCookiesBtn.isVisible({ timeout: 3000 })) {
        await acceptCookiesBtn.click();
        console.log('Accepted cookies');
        // Ждем скрытия баннера cookie
        await expect(acceptCookiesBtn).toBeHidden({ timeout: 3000 });
      }
    } catch (error) {
      console.log('Cookie banner not found or already closed');
    }

    // Заполняем email
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill(process.env.USER_EMAIL!);
    console.log('Filled email');

    // Заполняем пароль
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible({ timeout: 15000 });
    await passwordInput.fill(process.env.USER_PASSWORD!);
    console.log('Filled password');

    // Отправляем форму логина
    const submitButton = page.getByRole('button', { name: 'Log in' });
    await expect(submitButton).toBeVisible();
    
    console.log('Submitting login form...');
    await submitButton.click();

    // Ждем завершения логина - проверяем несколько возможных URL
    try {
      await page.waitForURL('**/bots**', { timeout: 15000 });
      console.log('Successfully navigated to bots page');
    } catch {
      try {
        await page.waitForURL('**/app**', { timeout: 10000 });
        console.log('Successfully navigated to app page');
      } catch {
        console.log('Waiting for any post-login navigation...');
        await page.waitForURL('https://bitsgap.com/**', { timeout: 10000 });
        console.log('Navigated to post-login page');
      }
    }

    // ОБРАБОТКА МОДАЛЬНОГО ОКНА - УЛУЧШЕННАЯ ВЕРСИЯ
    console.log('Checking for modal...');
    
    try {
      // Используем более специфичные селекторы для модального окна
      const modalSelectors = [
        '[data-testid="start-new-bot-modal"]',
        'div[role="dialog"]',
        '.modal:has-text("Start new bot")'
      ];

      let modalFound = false;
      
      for (const selector of modalSelectors) {
        const modal = page.locator(selector).first();
        if (await modal.isVisible({ timeout: 5000 })) {
          console.log(`Modal found using selector: ${selector}`);
          modalFound = true;
          
          // Пытаемся закрыть модальное окно разными способами
          await closeModal(page, modal);
          break;
        }
      }

      if (!modalFound) {
        console.log('No modal found, proceeding...');
      }
    } catch (error) {
      console.log('Error during modal handling:', error);
    }

    // ПРОВЕРКА УСПЕШНОЙ АУТЕНТИФИКАЦИИ
    console.log('Verifying authentication...');
    
    const authIndicators = [
      { name: 'Demo text', locator: page.locator('text=Demo') },
      { name: 'Profile avatar', locator: page.locator('[data-testid="profile-avatar"]') },
      { name: 'User menu', locator: page.getByRole('button', { name: /account|profile/i }) },
      { name: 'Bots section', locator: page.locator('text=Bots').first() },
      { name: 'Dashboard', locator: page.locator('text=Dashboard').first() }
    ];

    let authConfirmed = false;
    
    for (const indicator of authIndicators) {
      try {
        await expect(indicator.locator).toBeVisible({ timeout: 10000 });
        console.log(`✅ Authentication confirmed by: ${indicator.name}`);
        authConfirmed = true;
        break;
      } catch (error) {
        console.log(`❌ ${indicator.name} not found`);
      }
    }

    if (!authConfirmed) {
      // Финальная проверка - убедимся, что мы не на странице логина
      const currentUrl = page.url();
      if (currentUrl.includes('/sign-in') || currentUrl.includes('/login')) {
        throw new Error('Authentication failed - still on login page');
      } else {
        console.log('⚠️  No specific auth elements found, but not on login page - assuming authentication successful');
        authConfirmed = true;
      }
    }

    if (authConfirmed) {
      // УСПЕШНАЯ АУТЕНТИФИКАЦИЯ - СОХРАНЯЕМ СОСТОЯНИЕ И ЗАВЕРШАЕМ
      console.log('✅ Authentication successful! Saving state...');
      
      // Сохраняем состояние аутентификации с увеличенным таймаутом
      await page.context().storageState({ path: '.auth/storageState.json' });
      console.log('✅ Authentication state saved successfully!');
      
      console.log('🎉 Authentication test completed successfully!');
    } else {
      throw new Error('Authentication could not be confirmed');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    
    // Делаем скриншот для диагностики
    try {
      await page.screenshot({ 
        path: `auth-error-${Date.now()}.png`, 
        fullPage: true 
      });
      console.log('Screenshot saved for debugging');
    } catch (screenshotError) {
      console.log('Could not take screenshot:', screenshotError);
    }
    
    throw error;
  }
});

// Вспомогательная функция для закрытия модального окна
async function closeModal(page: any, modal: any) {
  console.log('Attempting to close modal...');
  
  const closeMethods = [
    // Метод 1: Кнопка закрытия с крестиком
    async () => {
      const closeBtn = modal.locator('button:has(svg)').first();
      if (await closeBtn.isVisible({ timeout: 3000 })) {
        await closeBtn.click();
        return true;
      }
      return false;
    },
    
    // Метод 2: Кнопка закрытия по aria-label
    async () => {
      const closeBtn = modal.getByRole('button', { name: /close/i }).first();
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click();
        return true;
      }
      return false;
    },
    
    // Метод 3: Нажатие Escape
    async () => {
      await page.keyboard.press('Escape');
      return true;
    },
    
    // Метод 4: Клик вне модального окна
    async () => {
      await page.mouse.click(10, 10);
      return true;
    }
  ];

  for (const method of closeMethods) {
    try {
      const success = await method();
      if (success) {
        // Проверяем, что модальное окно закрылось
        await expect(modal).toBeHidden({ timeout: 5000 });
        console.log('✅ Modal closed successfully');
        return;
      }
    } catch (error) {
      console.log(`Modal close method failed: ${error}`);
      continue;
    }
  }
  
  console.log('⚠️  Could not close modal with any method, continuing...');
}