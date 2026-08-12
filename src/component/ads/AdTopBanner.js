import React, { useEffect, useRef } from 'react';
import { trackAdImpression, trackAdClick } from './AdTracker';
import './ads.css';

const AdTopBanner = ({ ad, onClose }) => {
  const tracked = useRef(false);
  useEffect(() => { if (ad && !tracked.current) { tracked.current = true; trackAdImpression(ad.id, 'top-banner'); } }, [ad]);
  if (!ad) return null;

  const handleClick = () => {
    trackAdClick(ad.id, 'top-banner', ad.targetUrl);
    const url = ad.targetUrl?.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="ad-top-banner" onClick={handleClick}>
      <div className="ad-top-banner-content">
        <span className="ad-top-label">Sponsored</span>
        <div className="ad-top-message">
          {ad.icon && <i className={`fa ${ad.icon}`}></i>}
          <span className="ad-top-title">{ad.title}</span>
          <span className="ad-top-divider">•</span>
          <span className="ad-top-desc">{ad.tagline || ad.description}</span>
        </div>
        <button className="ad-top-cta">{ad.ctaText || 'Learn More'} →</button>
      </div>
      <button className="ad-top-close" onClick={(e) => { e.stopPropagation(); onClose?.(); }}><i className="fa fa-times"></i></button>
    </div>
  );
};

export default AdTopBanner;
