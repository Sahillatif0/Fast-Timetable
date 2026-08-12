
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

// Debug mode flag
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

const getSessionId = () => {
  let id = sessionStorage.getItem('ad-session');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ad-session', id);
  }
  return id;
};

const getDeviceInfo = () => ({
  language: navigator.language,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

// Debug logging utility
export const adLogger = {
  log: (...args) => DEBUG && console.log('[Ad System]', ...args),
  error: (...args) => console.error('[Ad System Error]', ...args),
  warn: (...args) => DEBUG && console.warn('[Ad System]', ...args),
};

export { getSessionId, getDeviceInfo };
