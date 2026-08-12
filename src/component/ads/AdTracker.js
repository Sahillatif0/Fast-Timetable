import { authFetch } from './AdminAuth';
import { API_BASE, getSessionId, getDeviceInfo, adLogger } from './config';

const KEY = 'ad-analytics';
const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { i: [], c: [] }; } catch { return { i: [], c: [] }; } };
const save = (d) => { d.i = d.i.slice(-500); d.c = d.c.slice(-200); localStorage.setItem(KEY, JSON.stringify(d)); };

export const trackAdImpression = (adId, position) => {
  const timestamp = new Date().toISOString();
  const sessionId = getSessionId();
  
  adLogger.log('Impression:', { adId, position });
  
  const d = get();
  d.i.push({ adId, position, t: Date.now() });
  save(d);

  fetch(`${API_BASE}/api/ads/impression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adId,
      position,
      sessionId,
      timestamp,
      url: window.location.pathname,
      device: getDeviceInfo()
    })
  }).then(res => {
    adLogger.log('Impression sent:', res.status);
  }).catch(err => {
    adLogger.error('Impression failed:', err.message);
  });
};

export const trackAdClick = (adId, position, targetUrl) => {
  const timestamp = new Date().toISOString();
  const sessionId = getSessionId();
  
  adLogger.log('Click:', { adId, position, targetUrl });
  
  const d = get();
  d.c.push({ adId, position, url: targetUrl, t: Date.now() });
  save(d);

  fetch(`${API_BASE}/api/ads/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adId,
      position,
      targetUrl,
      sessionId,
      timestamp,
      url: window.location.pathname,
      device: getDeviceInfo()
    })
  }).then(res => {
    adLogger.log('Click sent:', res.status);
  }).catch(err => {
    adLogger.error('Click failed:', err.message);
  });
};

export const getAnalyticsSummary = () => {
  const d = get(), s = {};
  d.i.forEach(e => { s[e.adId] = s[e.adId] || { impressions: 0, clicks: 0 }; s[e.adId].impressions++; });
  d.c.forEach(e => { s[e.adId] = s[e.adId] || { impressions: 0, clicks: 0 }; s[e.adId].clicks++; });
  Object.keys(s).forEach(id => s[id].ctr = s[id].impressions ? ((s[id].clicks / s[id].impressions) * 100).toFixed(1) + '%' : '0%');
  return s;
};

export const fetchServerAnalytics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  console.log(startDate, endDate);
  const res = await authFetch(`${API_BASE}/api/ads/analytics?${params}`);
  const data = await res.json();
  return data.analytics || {};
};

export const fetchDailyStats = async (days = 7) => {
  const res = await fetch(`${API_BASE}/api/ads/analytics/daily?days=${days}`);
  const data = await res.json();
  return data.dailyStats || [];
};

export const clearAnalytics = () => localStorage.removeItem(KEY);
export const exportAnalytics = () => JSON.stringify(get());
