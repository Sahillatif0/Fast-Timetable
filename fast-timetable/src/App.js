import './App.css';
import './style/style.css';
import './style/notification.css';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Notification from './component/Notification';
import html_parse from 'html-react-parser';
import CheckUpdate from './component/CheckUpdate';
import Info from './component/Info';
import DOMPurify from 'dompurify';
import Timetable from './component/Timetable';
import ToggleSwitch from './component/ToggleSwitch';
import RightsReserved from './component/RightsReserved';
import ContactSection from './component/ContactSection';
import UpdateNotification from './component/UpdateNotification';
import { AdProvider, useAds, AdCard, AuthProvider, ProtectedRoute } from './component/ads';
import AdWrapper from './component/ads/AdWrapper';
import { APP_INFO, logger } from './config/environment';

// Lazy-loaded components
const AdAdmin = lazy(() => import('./component/ads/AdAdmin'));
const AdDashboard = lazy(() => import('./component/ads/AdDashboard'));
const DownloadPage = lazy(() => import('./component/DownloadPage'));
const Teachers = lazy(() => import('./component/Teachers'));
const Classrooms = lazy(() => import('./component/Classrooms'));

const apk = '/Fast-Timetable.apk'

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <div className="loader"></div>
  </div>
);

const SectionAdCard = () => {
  const { getAdForPosition } = useAds();
  const ad = getAdForPosition('card');
  return ad ? <AdCard ad={ad} size="medium" position="after-content" /> : null;
};

function App() {
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(true);
  const [NotificationVar, setNotification] = useState(null); // eslint-disable-next-line 
  const [versionCode] = useState(APP_INFO.VERSION_CODE); 
  const [showUpdate, setShowUpdate] = useState(false);
  const [apkLink, setApkLink] = useState('');

  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable', 'teachers', 'classrooms'
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showStickyAd, setShowStickyAd] = useState(() => {
    const dismissed = localStorage.getItem('stickyAdDismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 60 * 60 * 1000) return false;
    return true;
  });
  const [showTopBanner, setShowTopBanner] = useState(() => {
    const dismissed = localStorage.getItem('topBannerDismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 60 * 60 * 1000) return false;
    return true;
  });
  const tabSwitchCount = useRef(0);

  const fetchedData = useRef(false);
  const [adsComponent, setAdsComponent] = useState(null);

  const showNotification = (message, color)=>{
    setNotification(<Notification message={message} background={color} setNotification={setNotification}/>)
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }

  const handleTabSwitch = (newTab) => {
    if (newTab !== activeTab) {
      tabSwitchCount.current++;
      
      if (tabSwitchCount.current % 3 === 0) {
        setShowInterstitial(true);
      }
      
      setActiveTab(newTab);
    }
  };
  
useEffect(() => {
  setTimeout(() => {
      setShowDownload(false)
    }, 3000);
    const fetchSheetData =  async () =>{
      try{
      const response = await fetch(process.env.REACT_APP_DATA_API + "/data");
      const text = await response.text();
      const json = JSON.parse(text);
      if(json.versionCode>versionCode){
        setShowUpdate(true);
        localStorage.setItem('vcode', 'true');
      }
      else localStorage.setItem('vcode', 'false');
      setApkLink(json.apklink);
      const sanitizedHtml = json.component ? DOMPurify.sanitize(json.component) : null;
      setAdsComponent(sanitizedHtml ? html_parse(sanitizedHtml) : null);
      localStorage.setItem('apk', json.apklink);
    }
    catch(err){
        logger.error('Failed to fetch sheet data:', err);
        setShowUpdate('true'===localStorage.getItem('vcode'));
      }
    }
    const fun = async ()=>{
      await fetchSheetData();
      fetchedData.current = true;
    }
    
    fun();
  }, [apkLink, showUpdate, versionCode])
  
  return (
    <AuthProvider>
    <AdProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <div className="App">
          {/* Ads from Centralized AdProvider */}
          <AdWrapper 
            showTopBanner={showTopBanner}
            setShowTopBanner={setShowTopBanner}
            showStickyAd={showStickyAd}
            setShowStickyAd={setShowStickyAd}
            showInterstitial={showInterstitial}
            setShowInterstitial={setShowInterstitial}
            showSectionAd={false}
          />
          
          <Info/>
          <ToggleSwitch activeTab={activeTab} setActiveTab={handleTabSwitch} />
           {activeTab === 'timetable' && <Timetable loading={loading} setLoading={setLoading} showNotification={showNotification}/>}
           {activeTab === 'teachers' && <Suspense fallback={<LoadingFallback />}><Teachers /></Suspense>}
           {activeTab === 'classrooms' && <Suspense fallback={<LoadingFallback />}><Classrooms /></Suspense>}
           

           <SectionAdCard />
           
           <a href={apk} download='FAST Timetable.apk'>
           {showDownload&&(<div className="download-apk-text" onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}>Download APK </div>)}
           <div className="download-apk" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}><i className="fa fa-arrow-down" style={{paddingLeft: '0px'}}></i></div>
           </a>
     
           {NotificationVar}
           <ContactSection />
           {adsComponent}
           
           <UpdateNotification />
     
           {showUpdate && <CheckUpdate apkLink={apkLink}/>}
           <RightsReserved/>
         </div>
        }/>
        <Route path='/admin/ads' element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdAdmin/></Suspense></ProtectedRoute>}/>
        <Route path='/admin/dashboard' element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdDashboard/></Suspense></ProtectedRoute>}/>
        <Route path='/download' element={<Suspense fallback={<LoadingFallback />}><DownloadPage apk={apk}/></Suspense>}/>
      </Routes>
    </BrowserRouter>
    </AdProvider>
    </AuthProvider>
  );
}

export default App;
