import React from 'react';
import { useAds } from './AdProvider';
import AdTopBanner from './AdTopBanner';
import AdStickyFooter from './AdStickyFooter';
import AdCard from './AdCard';
import AdInterstitial from './AdInterstitial';

const AdWrapper = ({ showTopBanner, setShowTopBanner, showStickyAd, setShowStickyAd, showInterstitial, setShowInterstitial, showSectionAd = true }) => {
  const { getAdForPosition } = useAds();
  const dismiss = (key, setter) => { setter(false); localStorage.setItem(key, Date.now().toString()); };

  return (
    <>
      {showTopBanner && <AdTopBanner ad={getAdForPosition('top-banner')} onClose={() => dismiss('topBannerDismissed', setShowTopBanner)} />}
      {showSectionAd && <AdCard ad={getAdForPosition('card')} size="medium" position="after-content" />}
      {showInterstitial && <AdInterstitial ad={getAdForPosition('interstitial')} onClose={() => setShowInterstitial(false)} />}
      {showStickyAd && <AdStickyFooter ad={getAdForPosition('sticky-footer')} onClose={() => dismiss('stickyAdDismissed', setShowStickyAd)} />}
    </>
  );
};

export default AdWrapper;
