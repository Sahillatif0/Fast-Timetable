import React, { useEffect, useRef, useState } from 'react';
import { trackAdImpression, trackAdClick } from './AdTracker';
import './ads.css';

const AdStickyFooter = ({ ad, onClose }) => {
  const [min, setMin] = useState(false);
  const tracked = useRef(false);
  useEffect(() => { if (ad && !tracked.current) { tracked.current = true; trackAdImpression(ad.id, 'sticky-footer'); } }, [ad]);
  if (!ad) return null;

  const handleClick = () => { const url = ad.targetUrl?.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`; trackAdClick(ad.id, 'sticky-footer', url); window.open(url, '_blank', 'noopener,noreferrer'); };

  return (
    <div className={`ad-sticky-footer ${min ? 'minimized' : ''}`}>
      <div className="ad-sticky-controls">
        <button className="ad-sticky-btn" onClick={() => setMin(!min)}><i className={`fa fa-chevron-${min ? 'up' : 'down'}`}></i></button>
        <button className="ad-sticky-btn" onClick={onClose}><i className="fa fa-times"></i></button>
      </div>
      {!min ? (
        <div className="ad-sticky-content" onClick={handleClick}>
          <span className="ad-sticky-label">Ad</span>
          {ad.imageUrl && <img src={ad.imageUrl} alt="" className="ad-sticky-img" />}
          <div className="ad-sticky-text"><strong>{ad.title}</strong><span>{ad.tagline || ad.sponsor}</span></div>
          <button className="ad-sticky-cta">{ad.ctaText || 'Learn More'}</button>
        </div>
      ) : (
        <div className="ad-sticky-minimized" onClick={() => setMin(false)}><span className="ad-sticky-label">Ad</span><span>{ad.sponsor} - Tap to expand</span></div>
      )}
    </div>
  );
};

export default AdStickyFooter;
