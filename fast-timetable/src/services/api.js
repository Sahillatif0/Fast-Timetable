import { API_CONFIG, RATE_LIMITS, logger } from '../config/environment';

export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const fetchWithRetry = async (url, options = {}, retries = RATE_LIMITS.MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok) return response;
      
      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      // Retry on server errors (5xx)
      if (i < retries - 1) {
        await delay(RATE_LIMITS.RETRY_DELAY_MS * (i + 1));
        continue;
      }
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(RATE_LIMITS.RETRY_DELAY_MS * (i + 1));
    }
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};