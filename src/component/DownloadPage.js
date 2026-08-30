import React, { useEffect, useState } from 'react'

const DownloadPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already running standalone
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="download-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '20px' }}>
      
      {/* PWA Install Option */}
      {isInstallable ? (
        <div onClick={handleInstallClick} className="download-page-link" style={{ cursor: 'pointer', width: '100%', maxWidth: '340px' }}>
          <div className="download-page-card" style={{ backgroundColor: '#5349be', color: '#ffffff' }}>
            <div className="download-page-icon">
              <i className="fa fa-mobile-screen-button" style={{ color: '#ffffff' }}></i>
            </div>
            <h3 className="download-page-title" style={{ color: '#ffffff' }}>Install App (PWA)</h3>
            <p className="download-page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Recommended (Installs instantly, auto-updates)</p>
            <div className="download-page-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
              Add to Home Screen
            </div>
          </div>
        </div>
      ) : isIos ? (
        <div className="download-page-card" style={{ width: '100%', maxWidth: '340px', cursor: 'default' }}>
          <div className="download-page-icon">
            <i className="fa fa-share-from-square" style={{ color: '#5349be' }}></i>
          </div>
          <h3 className="download-page-title">Install on iOS</h3>
          <p className="download-page-subtitle" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
            Tap the <span style={{ fontWeight: 'bold' }}>Share</span> button in Safari, then select <span style={{ fontWeight: 'bold' }}>"Add to Home Screen"</span>.
          </p>
          <div className="download-page-badge">
            Safari Browser
          </div>
        </div>
      ) : null}

    </div>
  )
}

export default DownloadPage
