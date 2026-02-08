/**
 * Environment Configuration
 * Centralizes all environment-dependent settings
 */

// API Endpoints - use environment variables with fallbacks
export const API_CONFIG = {
  // Ad system API (requires backend server)
  AD_API_BASE: process.env.REACT_APP_API_BASE || 'http://localhost:3000',
  
  DATA_API: process.env.REACT_APP_DATA_API,
};

// Feature flags
export const FEATURES = {
  ENABLE_ADS: process.env.REACT_APP_ENABLE_ADS !== 'false',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
  DEBUG_MODE: process.env.REACT_APP_DEBUG === 'true',
};

// App version and metadata
export const APP_INFO = {
  VERSION_CODE: 13,
  VERSION_NAME: '3.1.0',
  APP_NAME: 'FAST Timetable',
};

export const RATE_LIMITS = {
  API_CALL_DEBOUNCE_MS: 300,
  AD_IMPRESSION_THROTTLE_MS: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
};



// Logging utility that respects debug mode
export const logger = {
  log: (...args) => {
    if (FEATURES.DEBUG_MODE) {
      console.log('[Fast-Timetable]', ...args);
    }
  },
  error: (...args) => {
    console.error('[Fast-Timetable Error]', ...args);
  },
  warn: (...args) => {
    if (FEATURES.DEBUG_MODE) {
      console.warn('[Fast-Timetable]', ...args);
    }
  },
};

export default API_CONFIG;
