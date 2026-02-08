import React, { useEffect, useRef } from 'react';
import { trackAdImpression, trackAdClick } from './AdTracker';
import './ads.css';

const AdNative = ({ ad, variant = 'class' }) => {
  const ref = useRef(null), tracked = useRef(false);

  useEffect(() => {
    if (!ad || tracked.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !tracked.current) { tracked.current = true; trackAdImpression(ad.id, `native-${variant}`); } }, { threshold: 0.5 });
    ref.current && obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ad, variant]);

  if (!ad) return null;
  const handleClick = () => {
    trackAdClick(ad.id, `native-${variant}`, ad.targetUrl);
    const url = ad.targetUrl?.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return variant === 'class' ? (
    <div ref={ref} className="single-class ad-native-class" onClick={handleClick}>
      <div className="ad-native-badge">Ad</div>
      <span id="class-name" style={{ color: 'var(--button-color)' }}>{ad.title}</span>
      <span className="class-location text"><i className="fa fa-bullhorn" style={{ marginRight: 6 }}></i>{ad.tagline || 'Sponsored'}</span>
      <span className="class-teacher text">{ad.description}</span>
      <span className="class-time text" style={{ color: 'var(--button-color)' }}><i className="fa fa-external-link" style={{ marginRight: 6 }}></i>Learn More</span>
    </div>
  ) : (
    <div ref={ref} className="event-card ad-native-event" onClick={handleClick}>
      <div className="ad-native-badge">Sponsored</div>
      <div className="event-img" style={{ backgroundImage: `url(${ad.imageUrl || ''})` }}></div>
      <div className="event-info">
        <h2 className="event-name">{ad.title}</h2>
        <p className="event-description trunc-desc">{ad.description}</p>
        <div className="event-details"><i className="fa fa-bullhorn"></i><p className="event-organizer">{ad.sponsor}</p></div>
        <button className="read-more search-button">Learn More <i className="fa fa-arrow-right"></i></button>
      </div>
    </div>
  );
};

export default AdNative;
