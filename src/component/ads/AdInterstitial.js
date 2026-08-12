import React, { useEffect, useState, useRef } from 'react';
import { trackAdImpression, trackAdClick } from './AdTracker';
import './ads.css';

const AdInterstitial = ({ ad, onClose, autoCloseDelay = 5 }) => {
  const [countdown, setCountdown] = useState(autoCloseDelay);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ad) return;
    if (!tracked.current) { tracked.current = true; trackAdImpression(ad.id, 'interstitial'); }
    document.body.style.overflow = 'hidden';
    const t = setInterval(() => setCountdown(p => p <= 1 ? (clearInterval(t), 0) : p - 1), 1000);
    return () => { clearInterval(t); document.body.style.overflow = 'auto'; };
  }, [ad]);

  if (!ad) return null;
  const handleClick = () => { const url = ad.targetUrl?.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`; trackAdClick(ad.id, 'interstitial', url); window.open(url, '_blank', 'noopener,noreferrer'); };

  return (
    <div className="ad-interstitial-overlay">
      <div className="ad-interstitial">
        <div className="ad-interstitial-header">
          <span className="ad-label">Advertisement</span>
          <button className={`ad-close-btn ${countdown === 0 ? 'active' : ''}`} onClick={() => countdown === 0 && onClose?.()} disabled={countdown > 0}>
            {countdown > 0 ? `Skip in ${countdown}s` : <>Close <i className="fa fa-times"></i></>}
          </button>
        </div>
        <div className="ad-interstitial-content" onClick={handleClick}>
          {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="ad-interstitial-image" />}
          <div className="ad-interstitial-info">
            <h2>{ad.title}</h2>
            <p>{ad.description}</p>
            {ad.sponsor && <span className="ad-sponsor">Sponsored by {ad.sponsor}</span>}
            <button className="ad-cta-button">{ad.ctaText || 'Learn More'} <i className="fa fa-arrow-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdInterstitial;
