import { Page } from '@playwright/test';

export class WebSocketHelper {
  private messages: any[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async captureWebSocketMessages() {
    console.log('Starting WebSocket message capture...');
    
    this.page.on('websocket', ws => {
      console.log(`WebSocket connected to: ${ws.url()}`);
      
      ws.on('framesent', data => {
        this.processWebSocketData(data.payload, 'sent');
      });
      
      ws.on('framereceived', data => {
        this.processWebSocketData(data.payload, 'received');
      });
    });
  }

  private processWebSocketData(payload: string | Buffer, direction: string) {
    try {
      let payloadString: string;
      
      if (typeof payload === 'string') {
        payloadString = payload;
      } else if (payload instanceof Buffer) {
        payloadString = payload.toString('utf8');
      } else {
        payloadString = String(payload);
      }

      // Фильтруем только сообщения связанные с ордерами
      if (payloadString.includes('order_place') || 
          payloadString.includes('demo@order_place') ||
          payloadString.includes('"type":"limit"')) {
        
        const message = JSON.parse(payloadString);
        this.messages.push({
          ...message,
          direction: direction,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Captured ${direction} WebSocket message:`, {
          type: message.value?.key,
          price: message.value?.params?.price,
          side: message.value?.params?.side
        });
      }
    } catch (error) {
      // Игнорируем не-JSON сообщения
    }
  }

  async waitForOrderPlaceMessage(timeout: number = 15000): Promise<any> {
    console.log(`Waiting for order place message (timeout: ${timeout}ms)...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const orderMessage = this.messages.find(msg => 
        msg.value?.key === 'demo@order_place' || 
        msg.value?.params?.type === 'limit'
      );
      
      if (orderMessage) {
        console.log('Found order place message:', orderMessage);
        return orderMessage;
      }
      
      // Используем правильный метод ожидания
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('All captured messages:', JSON.stringify(this.messages, null, 2));
    throw new Error(`Order place WebSocket message not found within ${timeout}ms`);
  }

  getCapturedMessages(): any[] {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}