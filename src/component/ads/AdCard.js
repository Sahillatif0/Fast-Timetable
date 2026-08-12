import React, { useEffect, useRef } from 'react';
import { trackAdImpression, trackAdClick } from './AdTracker';
import './ads.css';

const AdCard = ({ ad, size = 'medium', position = 'section' }) => {
  const ref = useRef(null), tracked = useRef(false);

  useEffect(() => {
    if (!ad || tracked.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !tracked.current) { tracked.current = true; trackAdImpression(ad.id, `card-${position}`); } }, { threshold: 0.5 });
    ref.current && obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ad, position]);

  if (!ad) return null;
  const handleClick = () => { const url = ad.targetUrl?.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`; trackAdClick(ad.id, `card-${position}`, url); window.open(url, '_blank', 'noopener,noreferrer'); };

  return (
    <div ref={ref} className={`ad-card ad-card-${size}`} onClick={handleClick}>
      <div className="ad-card-badge">Sponsored</div>
      {ad.imageUrl && <div className="ad-card-image"><img src={ad.imageUrl} alt={ad.title} /></div>}
      <div className="ad-card-body">
        <h3 className="ad-card-title">{ad.title}</h3>
        <p className="ad-card-description">{ad.description}</p>
        <div className="ad-card-footer">
          <span className="ad-card-sponsor"><i className="fa fa-bullhorn"></i> {ad.sponsor}</span>
          <button className="ad-card-cta">{ad.ctaText || 'Learn More'} <i className="fa fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
