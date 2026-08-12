import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE, adLogger } from './config';

const AdContext = createContext();

// Default ads array (empty - ads loaded from server)
const DEFAULT_ADS = [];

const AD_SETTINGS = { inlineAdFrequency: 4 };

// Local storage key (same as AdAdmin)
const LOCAL_ADS_KEY = 'local-ads-data';
const getLocalAds = () => { try { return JSON.parse(localStorage.getItem(LOCAL_ADS_KEY)) || []; } catch { return []; } };

export const AdProvider = ({ children }) => {
  const [ads, setAds] = useState(DEFAULT_ADS);

  useEffect(() => {
    fetch(`${API_BASE}/api/ads`)
      .then(res => {
        if (!res.ok) throw new Error('Backend unavailable');
        return res.json();
      })
      .then(data => data.ads?.length > 0 && setAds(data.ads))
      .catch(() => {
        // Fall back to local storage, then default
        const localAds = getLocalAds().filter(ad => ad.isActive !== false);
        if (localAds.length > 0) {
          adLogger.log('Using local ads:', localAds.length);
          setAds(localAds);
        } else {
          adLogger.log('Using default ads');
        }
      });
  }, []);

  const getAdForPosition = useCallback((position) => {
    const eligible = ads.filter(ad => ad.positions.includes(position));
    if (!eligible.length) return null;
    
    const sorted = eligible.sort((a, b) => (a.priority || 2) - (b.priority || 2));
    
    const weighted = sorted.flatMap(ad => {
      const weight = 4 - (ad.priority || 2);
      return Array(weight).fill(ad);
    });
    
    return weighted[Math.floor(Math.random() * weighted.length)];
  }, [ads]);

  return (
    <AdContext.Provider value={{ ads, getAdForPosition, settings: AD_SETTINGS }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error('useAds must be used within AdProvider');
  return context;
};
