// Константы для тестов авторизации
export const AUTH_CONSTANTS = {
  URLS: {
    HOME: 'https://app.bitsgap.com',
    LOGIN_PATTERN: '**/sign-in**',
    BOTS_PATTERN: '**/bot**',
    BOTS_BASE: '/bot',
    BOTS_EXACT: 'https://app.bitsgap.com/bot'
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

// Общие константы для всех тестов
export const TEST_CONSTANTS = {
  SCREENSHOT_PATH: 'test-results/screenshots/',
  AUTH_STATE_PATH: '.auth/storageState.json',
  DEFAULT_TIMEOUT: 30000
} as const;