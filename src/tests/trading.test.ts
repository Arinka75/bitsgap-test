import { test, expect } from '../fixtures/test.fixture';

test('should place limit order and verify via WebSocket and order table', async ({ 
  loginPage, 
  tradingPage, 
  webSocketHelper 
}) => {
  // Шаг 1: Переключение в Demo режим
  await loginPage.switchToDemoMode();
  
  // Шаг 2: Переход на страницу Trading
  await tradingPage.navigate();
  
  // Шаг 3: Начинаем перехват WebSocket сообщений ДО любых действий
  await webSocketHelper.captureWebSocketMessages();
  
  // Даем время для установки WebSocket соединений
  await loginPage.page.waitForTimeout(2000);
  
  // Шаг 4: Выбор Limit Order
  await tradingPage.selectLimitOrder();
  
  // Шаг 5: Установка случайных параметров ордера
  const randomPrice = await tradingPage.setRandomPrice(1000, 50000);
  console.log(`Random price set: ${randomPrice}`);
  
  const randomVolume = await tradingPage.setRandomVolume(10, 60);
  console.log(`Random volume set: ${randomVolume}`);
  
  // Шаг 6: Клик на кнопку BUY
  await tradingPage.clickBuy();
  
  // Шаг 7: Проверка WebSocket сообщения
  const orderMessage = await webSocketHelper.waitForOrderPlaceMessage(15000);
  
  // Проверяем, что цена в WebSocket сообщении совпадает с установленной
  const wsPrice = orderMessage.value?.params?.price;
  expect(parseFloat(wsPrice)).toBeCloseTo(randomPrice, 2);
  
  // Шаг 8: Проверка ордера в таблице
  const orderInTable = await tradingPage.getOrderFromTable(randomPrice);
  expect(orderInTable).not.toBeNull();
  expect(orderInTable?.price).toBeCloseTo(randomPrice, 2);
  expect(orderInTable?.type).toContain('Limit');
  expect(orderInTable?.status).toMatch(/Open|New/);
});