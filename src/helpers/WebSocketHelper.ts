import { Page } from '@playwright/test';

export class WebSocketHelper {
  private messages: any[] = [];
  private page: Page;
  private isCapturing: boolean = false;

  constructor(page: Page) {
    this.page = page;
  }

  async captureWebSocketMessages() {
    if (this.isCapturing) {
      return; // Уже запущено
    }

    this.isCapturing = true;
    
    // Подписываемся на WebSocket сообщения
    this.page.on('websocket', ws => {
      console.log(`WebSocket opened: ${ws.url()}`);
      
      ws.on('framesent', data => {
        this.processWebSocketMessage(data.payload);
      });

      ws.on('framereceived', data => {
        this.processWebSocketMessage(data.payload);
      });
    });
  }

  private processWebSocketMessage(payload: string | Buffer) {
    try {
      const payloadString = this.convertPayloadToString(payload);
      
      // Фильтруем только нужные сообщения
      if (this.isOrderPlaceMessage(payloadString)) {
        const message = JSON.parse(payloadString);
        this.messages.push(message);
        console.log('Captured relevant WebSocket message:', {
          type: message.value?.key,
          price: message.value?.params?.price
        });
      }
    } catch (error) {
      // Игнорируем не-JSON сообщения
    }
  }

  private convertPayloadToString(payload: string | Buffer): string {
    if (typeof payload === 'string') {
      return payload;
    } else if (payload instanceof Buffer) {
      return payload.toString('utf8');
    } else {
      return String(payload);
    }
  }

  private isOrderPlaceMessage(payloadString: string): boolean {
    return payloadString.includes('order_place') || 
           payloadString.includes('demo@order_place') ||
           payloadString.includes('"type":"limit"');
  }

  async waitForOrderPlaceMessage(timeout: number = 15000): Promise<any> {
    console.log('Waiting for order place WebSocket message...');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const orderMessage = this.messages.find(msg => {
        const isOrderPlace = msg.value?.key === 'demo@order_place';
        const isLimitOrder = msg.value?.params?.type === 'limit';
        const hasPrice = msg.value?.params?.price;
        
        return (isOrderPlace || isLimitOrder) && hasPrice;
      });
      
      if (orderMessage) {
        console.log('Order place message found:', {
          price: orderMessage.value?.params?.price,
          type: orderMessage.value?.params?.type
        });
        return orderMessage;
      }
      
      await this.page.waitForTimeout(200);
    }
    
    console.log('Captured messages:', this.messages);
    throw new Error(`Order place WebSocket message not found within ${timeout}ms timeout`);
  }

  getCapturedMessages(): any[] {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
    this.isCapturing = false;
  }

  // Метод для отладки
  logAllMessages() {
    console.log('All captured WebSocket messages:');
    this.messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, JSON.stringify(msg, null, 2));
    });
  }
}