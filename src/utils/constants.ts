// Константы для тестов авторизации
export const AUTH_CONSTANTS = {
  URLS: {
    HOME: 'https://app.bitsgap.com',
    LOGIN_PATTERN: '**/sign-in**',
    BOTS_PATTERN: '**/bot**',
    BOTS_BASE: '/bot',
    BOTS_EXACT: 'https://app.bitsgap.com/bot',
    TRADING: 'https://app.bitsgap.com/trading',
    TRADING_PATTERN: '**/trading**'
  },
  SELECTORS: {
    EMAIL: 'input#email',
    PASSWORD: 'input#password',
    LOGIN_BUTTON: 'button:has-text("Log in")',
    LOGIN_LINK: 'a:has-text("Log in")'
  },
  TIMEOUTS: {
    NAVIGATION: 30000,
    ELEMENT_VISIBLE: 15000,
    AUTH: 15000,
    TEST: 60000
  },
  TEXT: {
    LOGIN: 'Log in',
    BOTS: 'Bots'
  }
} as const;

// Константы для тестов трейдинга
export const TRADING_CONSTANTS = {
  ORDER_CONFIG: {
    PRICE: {
      MIN: 300000,
      MAX: 500000
    },
    VOLUME: {
      TARGET_PERCENTAGE: 28
    }
  },
  TIMEOUTS: {
    TEST: 120000,
    NAVIGATION: 15000,
    ELEMENT: 10000,
    PAGE_LOAD: 3000,
    ELEMENT_ACTION: 2000,
    MODAL_WAIT: 5000,
    ORDER_TABLE_WAIT: 10000,
    WEBSOCKET_WAIT: 3000
  },
  SELECTORS: {
    SETTINGS_BUTTON: '[data-test-id="header-settings"]',
    DEMO_MODE_TOGGLE: '[data-test-id="header-settings-demo"]',
    DEMO_MODAL: '[role="dialog"][aria-modal="true"]',
    STAY_ON_DEMO_BUTTON: 'button:has-text("Stay on Demo")',
    LIMIT_ORDER_BUTTON: 'button:has-text("Limit")',
    PRICE_INPUT: 'div:has-text("Price") input',
    VOLUME_SLIDER: 'input[type="range"]',
    BUY_BUTTON: 'button:has-text("Buy BTC")',
    SCREENSHOT_BUTTON: 'div[class*="fwg3B"]',
    ORDERS_TABLE: '[data-test-id*="orders_table"]',
    TABLE_ROW: '[data-test-id*="orders_table-row"]',
    STATUS_ELEMENT: '[data-test-id*="status"]'
  },
  TEXT: {
    STAY_ON_DEMO: 'Stay on Demo',
    LIMIT: 'Limit',
    BUY_BTC: 'Buy BTC'
  },
} as const;

// Общие константы для всех тестов
export const TEST_CONSTANTS = {
  SCREENSHOT_PATH: 'test-results/screenshots/',
  AUTH_STATE_PATH: 'storageState.json',
  DEFAULT_TIMEOUT: 30000
} as const;