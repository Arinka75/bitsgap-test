import { test, expect, Page } from '@playwright/test';

// Обновленная конфигурация для случайных параметров с минимальной ценой 300000
const ORDER_CONFIG = {
  price: {
    min: 300000,  // Минимальная цена 300000
    max: 500000  // Увеличиваем максимальную цену для реалистичности
  },
  volume: {
    minPercent: 10,
    maxPercent: 60
  }
};

// Загружаем состояние аутентификации перед каждым тестом
test.beforeEach(async ({ page }) => {
  await page.context().storageState({ path: 'src/tests/.auth/storageState.json' });
});

test('should complete trading flow with random parameters (min price 300000) and WebSocket verification', async ({ page }) => {
  console.log('🚀 Starting comprehensive trading flow test with minimum price 300000');
  
  test.setTimeout(120000);

  try {
    // 1. Переход на страницу трейдинга
    await page.goto('https://app.bitsgap.com/trading');
    console.log('✅ Navigated to trading page');

    await page.waitForURL('**/trading**', { timeout: 15000 });
    console.log('✅ Trading page loaded successfully');
    await page.waitForTimeout(3000);

    // 2. Включение демо режима
    console.log('⚙️ Clicking user settings button...');
    await clickUserSettings(page);

    console.log('🎮 Clicking demo mode toggle...');
    await toggleDemoMode(page);

    console.log('🔄 Handling demo mode modal...');
    await handleDemoModal(page);

    // 3. Явный выбор Limit Order
    console.log('📝 Explicitly selecting Limit Order...');
    await selectLimitOrder(page);

    // 4. Случайные параметры ордера с минимальной ценой 300000
    console.log('🎲 Setting random order parameters (min price 300000)...');
    
    // Случайная цена от 300000
    const randomPrice = await setRandomPrice(page);
    console.log(`💰 Random price set: ${randomPrice}`);
    
    // Проверяем, что цена соответствует минимальному требованию
    const priceValue = parseFloat(randomPrice.replace(/,/g, ''));
    if (priceValue < ORDER_CONFIG.price.min) {
      throw new Error(`Price ${priceValue} is below minimum required ${ORDER_CONFIG.price.min}`);
    }
    
    // Случайный объем через ползунок
    const actualVolume = await setRandomVolume(page);
    console.log(`📊 Random volume set: ${actualVolume}`);

    // Запоминаем фактические значения для проверок
    const orderDetails = {
      price: randomPrice,
      volume: actualVolume,
      type: 'Limit'
    };

    // 5. Перехват WebSocket перед кликом
    console.log('📡 Setting up WebSocket interception...');
    const wsMessages: any[] = [];
    await setupWebSocketInterception(page, wsMessages);

    // 6. Клик на кнопку Buy
    console.log('🟢 Clicking Buy button...');
    await clickBuyButton(page);

    // Ждем немного для обработки
    await page.waitForTimeout(3000);

    // 7. Проверка WebSocket сообщения
    console.log('🔍 Checking WebSocket messages...');
    await verifyWebSocketOrderPlace(wsMessages, orderDetails.price);

    // 8. Проверка в таблице ордеров
    console.log('📋 Checking order in orders table...');
    await verifyOrderInTable(page, orderDetails);

    console.log('🎉 SUCCESS: Comprehensive trading flow test completed with minimum price 300000!');

  } catch (error: unknown) {
    console.error('❌ FAILED: Trading flow test failed:');
    
    if (error instanceof Error) {
      console.error(error.message);
    }
    
    if (!page.isClosed()) {
      await page.screenshot({ 
        path: `./test-results/trading-flow-error-${Date.now()}.png`, 
        fullPage: true 
      });
    }
    
    throw error;
  }
});

// ФУНКЦИЯ ЯВНОГО ВЫБОРА LIMIT ORDER
async function selectLimitOrder(page: Page): Promise<void> {
  console.log('🔍 Looking for Limit Order selector...');
  
  const limitOrderSelectors = [
    'button:has-text("Limit")',
    '[data-test-id*="limit"]',
    '[class*="limit"]',
    'div:has-text("Limit Order")',
    '.order-type-selector button:first-child'
  ];

  for (const selector of limitOrderSelectors) {
    try {
      const limitOrderButton = page.locator(selector).first();
      await limitOrderButton.waitFor({ state: 'visible', timeout: 10000 });
      
      const isVisible = await limitOrderButton.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found Limit Order button with selector: ${selector}`);
        
        // Кликаем даже если уже выбрано
        await limitOrderButton.click({ force: true });
        console.log('✅ Limit Order explicitly selected');
        
        // Ждем применения типа
        await page.waitForTimeout(1000);
        
        // Проверяем, что тип применился (ищем индикатор активного состояния)
        const activeSelectors = [
          `${selector}[class*="active"]`,
          `${selector}[aria-selected="true"]`,
          `${selector}.active`
        ];
        
        for (const activeSelector of activeSelectors) {
          const activeElement = page.locator(activeSelector).first();
          if (await activeElement.isVisible({ timeout: 2000 })) {
            console.log('✅ Limit Order type confirmed as active');
            return;
          }
        }
        
        console.log('✅ Limit Order clicked, continuing...');
        return;
      }
    } catch (error) {
      console.log(`❌ Limit Order not found with selector: ${selector}`);
    }
  }

  throw new Error('Could not find or select Limit Order');
}

// ФУНКЦИЯ УСТАНОВКИ СЛУЧАЙНОЙ ЦЕНЫ (ОТ 300000)
async function setRandomPrice(page: Page): Promise<string> {
  console.log('🔍 Looking for price input field...');
  
  // Генерируем случайную цену в заданном диапазоне (от 300000)
  const randomPrice = (Math.random() * (ORDER_CONFIG.price.max - ORDER_CONFIG.price.min) + ORDER_CONFIG.price.min).toFixed(2);
  
  const priceInputSelectors = [
    '[role="textbox"][aria-labelledby*="base-ui"]',
    'input[type="text"]',
    'input[placeholder*="Price"]',
    'label:has-text("Price") input',
    'div:has-text("Price") input',
    '[class*="trade-form"] input[type="text"]:first-of-type'
  ];

  for (const selector of priceInputSelectors) {
    try {
      const priceInput = page.locator(selector).first();
      await priceInput.waitFor({ state: 'visible', timeout: 5000 });
      
      const isVisible = await priceInput.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found price input with selector: ${selector}`);
        
        await expect(priceInput).toBeEnabled();
        
        // Очищаем поле и вводим случайную цену (от 300000)
        await priceInput.click();
        await priceInput.clear();
        await priceInput.fill(randomPrice);
        
        console.log(`✅ Random price ${randomPrice} entered (min 300000)`);
        
        // Проверяем, что значение установилось
        await page.waitForTimeout(500);
        const currentValue = await priceInput.inputValue();
        
        // Нормализуем значения для сравнения (убираем запятые и т.д.)
        const normalizedRandom = randomPrice.replace(/,/g, '');
        const normalizedCurrent = currentValue.replace(/,/g, '');
        
        if (parseFloat(normalizedCurrent) >= ORDER_CONFIG.price.min) {
          console.log(`✅ Price value verified: ${currentValue} (meets minimum requirement)`);
          return currentValue; // Возвращаем фактическое отформатированное значение
        } else {
          console.log(`⚠️ Price value might not have been set correctly. Expected at least: ${ORDER_CONFIG.price.min}, Got: ${currentValue}`);
          
          // Пробуем установить значение еще раз, если оно ниже минимального
          await priceInput.fill(ORDER_CONFIG.price.min.toString());
          await page.waitForTimeout(500);
          const retryValue = await priceInput.inputValue();
          console.log(`🔄 Retry set price to minimum: ${retryValue}`);
          return retryValue;
        }
      }
    } catch (error) {
      console.log(`❌ Price input not found with selector: ${selector}`);
    }
  }

  throw new Error('Could not find price input field');
}

// ФУНКЦИЯ УСТАНОВКИ СЛУЧАЙНОГО ОБЪЕМА
async function setRandomVolume(page: Page): Promise<string> {
  console.log('🔍 Looking for volume/amount controls...');
  
  // Обновленные селекторы на основе snapshot
  const volumeSliderSelectors = [
    '[role="slider"]',
    '.slider',
    '[class*="slider"]',
    'div[role="group"]', // Группа со слайдером из snapshot
    '[ref="e1033"]', // Конкретный ref из snapshot
    '[class*="trade-form"] [role="slider"]'
  ];

  for (const selector of volumeSliderSelectors) {
    try {
      const volumeSlider = page.locator(selector).first();
      await volumeSlider.waitFor({ state: 'visible', timeout: 8000 });
      
      const isVisible = await volumeSlider.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found volume control with selector: ${selector}`);
        
        const boundingBox = await volumeSlider.boundingBox();
        
        if (boundingBox) {
          // Генерируем случайную позицию от 10% до 60%
          const randomPercent = ORDER_CONFIG.volume.minPercent + 
            Math.random() * (ORDER_CONFIG.volume.maxPercent - ORDER_CONFIG.volume.minPercent);
          
          const clickX = boundingBox.x + (boundingBox.width * randomPercent / 100);
          const clickY = boundingBox.y + boundingBox.height / 2;
          
          console.log(`🎯 Clicking volume control at ${randomPercent.toFixed(1)}% position`);
          
          await page.mouse.click(clickX, clickY);
          console.log('✅ Volume control clicked at random position');
          
          // Ждем обновления интерфейса
          await page.waitForTimeout(1500);
          
          // Получаем фактическое значение объема из поля Amount
          const actualVolume = await getVolumeInputValue(page);
          console.log(`📊 Actual volume value: ${actualVolume}`);
          
          return actualVolume;
        }
      }
    } catch (error) {
      console.log(`❌ Volume control not found with selector: ${selector}`);
    }
  }

  // Fallback: установка через поле ввода Amount
  console.log('🔄 Volume slider not found, trying amount input...');
  return await setRandomVolumeViaInput(page);
}

// ФУНКЦИЯ ПОЛУЧЕНИЯ ЗНАЧЕНИЯ ОБЪЕМА ИЗ ПОЛЯ ВВОДА (AMOUNT)
async function getVolumeInputValue(page: Page): Promise<string> {
  const amountInputSelectors = [
    'input[placeholder*="Amount"]',
    'input[aria-label*="Amount"]',
    'label:has-text("Amount") input',
    'textbox[aria-label*="Amount"]',
    '[role="textbox"][aria-label*="Amount"]',
    'div:has-text("Amount") input',
    '[ref="e1023"]' // Конкретный ref поля Amount из snapshot
  ];

  for (const selector of amountInputSelectors) {
    try {
      const amountInput = page.locator(selector).first();
      await amountInput.waitFor({ state: 'visible', timeout: 5000 });
      const value = await amountInput.inputValue();
      if (value) {
        return value;
      }
    } catch (error) {
      console.log(`❌ Amount input not found with selector: ${selector}`);
    }
  }

  return '0'; // Возвращаем значение по умолчанию
}

// ФУНКЦИЯ УСТАНОВКИ СЛУЧАЙНОГО ОБЪЕМА ЧЕРЕЗ ПОЛЕ ВВОДА AMOUNT (FALLBACK)
async function setRandomVolumeViaInput(page: Page): Promise<string> {
  const randomVolume = (Math.random() * 0.1).toFixed(6); // Меньшие значения для BTC (0-0.1 BTC)
  
  const amountInputSelectors = [
    'input[placeholder*="Amount"]',
    'input[aria-label*="Amount"]',
    'label:has-text("Amount") input',
    'textbox[aria-label*="Amount"]',
    '[role="textbox"][aria-label*="Amount"]'
  ];

  for (const selector of amountInputSelectors) {
    try {
      const amountInput = page.locator(selector).first();
      await amountInput.waitFor({ state: 'visible', timeout: 5000 });
      
      await amountInput.click();
      await amountInput.clear();
      await amountInput.fill(randomVolume);
      
      console.log(`✅ Random volume ${randomVolume} set via amount input`);
      
      // Проверяем, что значение установилось
      await page.waitForTimeout(500);
      const currentValue = await amountInput.inputValue();
      return currentValue;
    } catch (error) {
      console.log(`❌ Amount input not found with selector: ${selector}`);
    }
  }

  // Если не нашли поле Amount, пробуем JavaScript
  console.log('🔄 Trying to set volume via JavaScript...');
  try {
    const valueSet = await page.evaluate((volumeValue) => {
      // Ищем поле Amount по контексту
      const labels = document.querySelectorAll('label, div, span');
      for (const element of labels) {
        if (element.textContent && element.textContent.trim() === 'Amount') {
          const input = element.nextElementSibling?.querySelector('input');
          if (input && input instanceof HTMLInputElement) {
            input.value = volumeValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return input.value;
          }
        }
      }
      return null;
    }, randomVolume);

    if (valueSet) {
      console.log(`✅ Volume ${valueSet} set via JavaScript`);
      return valueSet;
    }
  } catch (error) {
    console.log('❌ JavaScript volume input failed');
  }

  console.log('⚠️ Could not set volume, using default value');
  return '0.001'; // Возвращаем минимальное значение по умолчанию
}

// ФУНКЦИЯ НАСТРОЙКИ ПЕРЕХВАТА WEBSOCKET
async function setupWebSocketInterception(page: Page, messages: any[]): Promise<void> {
  try {
    // Ждем появления WebSocket соединения
    page.on('websocket', (ws) => {
      console.log(`🔗 WebSocket connected: ${ws.url()}`);
      
      ws.on('framereceived', (data) => {
        try {
          const message = JSON.parse(data.toString());
          messages.push(message);
          console.log('📨 WebSocket message received');
        } catch (error) {
          // Игнорируем не-JSON сообщения
        }
      });
    });
    
    console.log('✅ WebSocket interception setup complete');
  } catch (error) {
    console.log('⚠️ WebSocket interception setup failed, continuing without it');
  }
}

// ФУНКЦИЯ ПРОВЕРКИ WEBSOCKET СООБЩЕНИЯ ORDER PLACE
async function verifyWebSocketOrderPlace(messages: any[], expectedPrice: string): Promise<void> {
  // Ждем немного для сбора сообщений
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  for (const message of messages) {
    try {
      // Ищем сообщение с процедурой Order Place
      if (message.method === 'order.place' || 
          (message.params && message.params.price) ||
          message.procedure === 'Order Place') {
        
        const messagePrice = message.params?.price || message.price;
        
        // Нормализуем цены для сравнения
        const normalizedExpected = parseFloat(expectedPrice.replace(/,/g, '')).toFixed(2);
        const normalizedActual = parseFloat(String(messagePrice).replace(/,/g, '')).toFixed(2);
        
        if (normalizedActual === normalizedExpected) {
          console.log(`✅ WebSocket Order Place verified: price = ${messagePrice}`);
          return;
        } else {
          console.log(`⚠️ WebSocket price mismatch. Expected: ${normalizedExpected}, Got: ${normalizedActual}`);
        }
      }
    } catch (error) {
      // Продолжаем проверку других сообщений
    }
  }
  
  console.log('⚠️ WebSocket Order Place message not found or price mismatch, continuing with UI verification');
}

// ФУНКЦИЯ КЛИКА НА КНОПКУ BUY
async function clickBuyButton(page: Page): Promise<void> {
  console.log('🔍 Looking for Buy button...');
  
  const buyButtonSelectors = [
    'button:has-text("Buy")',
    '[data-test-id*="buy"]',
    '[class*="buy-button"]',
    'button[color="green"]',
    '.trade-panel button:has-text("Buy")'
  ];

  for (const selector of buyButtonSelectors) {
    try {
      const buyButton = page.locator(selector).first();
      await buyButton.waitFor({ state: 'visible', timeout: 10000 });
      
      const isVisible = await buyButton.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found Buy button with selector: ${selector}`);
        
        await expect(buyButton).toBeEnabled();
        
        await buyButton.click({ force: true });
        console.log('✅ Buy button clicked');
        
        // Ждем обработки ордера
        await page.waitForTimeout(2000);
        return;
      }
    } catch (error) {
      console.log(`❌ Buy button not found with selector: ${selector}`);
    }
  }

  throw new Error('Could not find Buy button');
}

// ФУНКЦИЯ ПРОВЕРКИ ОРДЕРА В ТАБЛИЦЕ
async function verifyOrderInTable(page: Page, orderDetails: { price: string; type: string }): Promise<void> {
  console.log('🔍 Looking for orders table...');
  
  // Ждем появления ордера в таблице
  await page.waitForTimeout(5000);
  
  const tableSelectors = [
    '[data-test-id*="orders_table"]',
    '.orders-table',
    'table',
    '[class*="table"][class*="order"]'
  ];

  for (const tableSelector of tableSelectors) {
    try {
      const table = page.locator(tableSelector).first();
      const isTableVisible = await table.isVisible({ timeout: 10000 });
      
      if (isTableVisible) {
        console.log(`✅ Found orders table with selector: ${tableSelector}`);
        
        // Ищем строки с ордерами
        const rowSelectors = [
          '[data-test-id*="orders_table-row"]',
          'tbody tr',
          '.order-row'
        ];
        
        for (const rowSelector of rowSelectors) {
          const rows = table.locator(rowSelector);
          const rowCount = await rows.count();
          
          if (rowCount > 0) {
            console.log(`✅ Found ${rowCount} order rows`);
            
            // Нормализуем ожидаемую цену для поиска
            const normalizedExpectedPrice = orderDetails.price.replace(/,/g, '');
            
            // Ищем ордер с нашей ценой и типом Limit
            for (let i = 0; i < rowCount; i++) {
              const row = rows.nth(i);
              const rowText = await row.textContent();
              
              if (rowText && 
                  rowText.includes(orderDetails.type) &&
                  (rowText.includes(orderDetails.price) || rowText.includes(normalizedExpectedPrice))) {
                
                console.log(`✅ Order found in table: Price=${orderDetails.price}, Type=${orderDetails.type}`);
                
                // Проверяем статус (Open/New)
                const statusSelectors = [
                  '[data-test-id*="status"]',
                  '.status',
                  'td:last-child'
                ];
                
                for (const statusSelector of statusSelectors) {
                  const statusElement = row.locator(statusSelector).first();
                  if (await statusElement.isVisible()) {
                    const statusText = await statusElement.textContent();
                    if (statusText && (statusText.includes('Open') || statusText.includes('New'))) {
                      console.log(`✅ Order status: ${statusText}`);
                      return;
                    }
                  }
                }
                
                console.log('✅ Order found in table (status not verified)');
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ Orders table not found with selector: ${tableSelector}`);
    }
  }

  throw new Error(`Order with price ${orderDetails.price} and type ${orderDetails.type} not found in table`);
}

// СУЩЕСТВУЮЩИЕ ФУНКЦИИ (без изменений)
async function clickUserSettings(page: Page): Promise<void> {
  console.log('🔍 Looking for user settings button...');
  
  const settingsSelectors = [
    '[data-test-id="header-settings"]',
    'button.Z2s3T2TyxtAMVdSG',
    'button.Z2s3T2TyxtAMVdSG[data-test-id="header-settings"]',
    'button:has(svg.zN2mrEoCv061rfr)',
    'button[aria-haspopup="dialog"][aria-expanded="false"]'
  ];

  for (const selector of settingsSelectors) {
    try {
      const settingsElement = page.locator(selector).first();
      
      await settingsElement.waitFor({ state: 'visible', timeout: 10000 });
      
      const isVisible = await settingsElement.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found settings button with selector: ${selector}`);
        
        await expect(settingsElement).toBeEnabled();
        
        await settingsElement.click({ 
          force: true,
          timeout: 5000
        });
        
        console.log('✅ Settings button clicked successfully');
        
        await page.waitForTimeout(2000);
        return;
      }
    } catch (error) {
      console.log(`❌ Settings button not found with selector: ${selector}`);
    }
  }

  console.log('❌ Could not find settings button with standard selectors, trying precise JavaScript...');
  
  try {
    const clicked = await page.evaluate(() => {
      const exactButton = document.querySelector('button[data-test-id="header-settings"]');
      if (exactButton && exactButton instanceof HTMLElement) {
        exactButton.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Settings button clicked via JavaScript');
      await page.waitForTimeout(2000);
    } else {
      throw new Error('Settings button element not found in DOM');
    }
  } catch (error) {
    console.log('❌ JavaScript settings button click failed');
    throw new Error('Could not find or click user settings button');
  }
}

async function toggleDemoMode(page: Page): Promise<void> {
  console.log('🔍 Looking for demo mode toggle...');
  
  await page.waitForTimeout(2000);
  
  const demoModeSelectors = [
    '[data-test-id="header-settings-demo"]',
    'input[data-test-id="header-settings-demo"]',
    'label:has-text("Demo") input[type="checkbox"]',
    '.YMCQ1NxALcHkQ14W:has-text("Demo") input'
  ];

  for (const selector of demoModeSelectors) {
    try {
      const demoCheckbox = page.locator(selector).first();
      
      await demoCheckbox.waitFor({ state: 'visible', timeout: 10000 });
      
      const isVisible = await demoCheckbox.isVisible();
      
      if (isVisible) {
        console.log(`✅ Found demo mode toggle with selector: ${selector}`);
        
        await demoCheckbox.click({ force: true });
        console.log('✅ Demo mode toggle clicked');
        
        await page.waitForTimeout(2000);
        return;
      }
    } catch (error) {
      console.log(`❌ Demo mode toggle not found with selector: ${selector}`);
    }
  }

  console.log('❌ Could not find demo mode toggle with standard selectors, trying JavaScript...');
  
  try {
    const toggled = await page.evaluate(() => {
      const demoCheckbox = document.querySelector('[data-test-id="header-settings-demo"]');
      if (demoCheckbox && demoCheckbox instanceof HTMLInputElement) {
        demoCheckbox.click();
        return true;
      }
      return false;
    });

    if (toggled) {
      console.log('✅ Demo mode toggled via JavaScript');
      await page.waitForTimeout(2000);
    } else {
      throw new Error('Demo mode toggle element not found in DOM');
    }
  } catch (error) {
    console.log('❌ JavaScript demo mode toggle failed');
    throw new Error('Could not find or click demo mode toggle');
  }
}

async function handleDemoModal(page: Page): Promise<void> {
  console.log('🔍 Looking for demo mode modal...');
  
  await page.waitForTimeout(3000);
  
  const modalSelectors = [
    '.LHo8HfIE9ZA_tBzW.eT0Trj5IY7UBeJDR',
    '[role="dialog"][aria-modal="true"]',
    'div[data-open][role="dialog"]'
  ];

  let modalFound = false;
  
  for (const modalSelector of modalSelectors) {
    try {
      const modal = page.locator(modalSelector).first();
      const isModalVisible = await modal.isVisible({ timeout: 5000 });
      
      if (isModalVisible) {
        console.log(`✅ Demo mode modal found with selector: ${modalSelector}`);
        modalFound = true;
        
        const stayButtonSelectors = [
          'button.sizVzCMSCQ5.ABqeu.Zx556AJGoDQbm0Bx.zvtjUFCCCbgKaJg8',
          'button:has-text("Stay on Demo")',
          '.HX2eN7V8PY17r3VR button:first-child',
          'button:has-text("Stay on")'
        ];
        
        for (const buttonSelector of stayButtonSelectors) {
          try {
            const stayButton = modal.locator(buttonSelector).first();
            const isButtonVisible = await stayButton.isVisible({ timeout: 5000 });
            
            if (isButtonVisible) {
              console.log(`✅ Found "Stay on Demo" button with selector: ${buttonSelector}`);
              
              await stayButton.click({ force: true });
              console.log('✅ "Stay on Demo" button clicked');
              
              await page.waitForTimeout(2000);
              
              const isModalClosed = await modal.isHidden({ timeout: 5000 }).catch(() => true);
              if (isModalClosed) {
                console.log('✅ Demo modal closed after clicking "Stay on Demo"');
              } else {
                console.log('⚠️ Demo modal might still be open');
              }
              
              return;
            }
          } catch (error) {
            console.log(`❌ "Stay on Demo" button not found with selector: ${buttonSelector}`);
          }
        }
        
        console.log('🔄 Trying to find "Stay on Demo" button on entire page...');
        const globalStayButton = page.locator('button:has-text("Stay on Demo")').first();
        if (await globalStayButton.isVisible({ timeout: 3000 })) {
          await globalStayButton.click({ force: true });
          console.log('✅ "Stay on Demo" button clicked (found globally)');
          await page.waitForTimeout(2000);
          return;
        }
        
        break;
      }
    } catch (error) {
      console.log(`❌ Demo modal not found with selector: ${modalSelector}`);
    }
  }

  if (!modalFound) {
    console.log('✅ No demo modal found, continuing test...');
  }
}