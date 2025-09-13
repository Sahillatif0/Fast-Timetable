import './App.css';
import './style/style.css';
import './style/notification.css';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import apk from './Fast-Timetable.apk';
import Notification from './component/Notification';
import html_parse from 'html-react-parser';
import CheckUpdate from './component/CheckUpdate';
import Info from './component/Info';
import Timetable from './component/Timetable';
import ToggleSwitch from './component/ToggleSwitch';
import EventsTab from './component/EventsTab';
import RightsReserved from './component/RightsReserved';
import ApproveEvent from './component/ApproveEvent';
import ContactSection from './component/ContactSection';
import DownloadPage from './component/DownloadPage';
import Teachers from './component/Teachers';
import Classrooms from './component/Classrooms';
import UpdateNotification from './component/UpdateNotification';


function App() {
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(true);
  const [NotificationVar, setNotification] = useState(null); // eslint-disable-next-line 
  const [versionCode, setversionCode] = useState(11); 
  const [showUpdate, setShowUpdate] = useState(false);
  const [apkLink, setApkLink] = useState('');

  const [toggle, setToggle] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable', 'events', 'teachers'

  const fetchedData = useRef(false);
  const [adsComponent, setAdsComponent] = useState(null);

  const showNotification = (message, color)=>{
    setNotification(<Notification message={message} background={color} setNotification={setNotification}/>)
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }
  
useEffect(() => {
  setTimeout(() => {
      setShowDownload(false)
    }, 3000);
    const fetchSheetData =  async () =>{
      try{
      const response = await fetch("https://server-timetable2.vercel.app/data");
      const text = await response.text();
      const json = JSON.parse(text);
      if(json.versionCode>versionCode){
        setShowUpdate(true);
        localStorage.setItem('vcode', 'true');
      }
      else localStorage.setItem('vcode', 'false');
      setApkLink(json.apklink);
      setAdsComponent(json.component?html_parse(json.component):null);
      localStorage.setItem('apk', json.apklink);
    }
    catch(err){
        console.log(err);
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
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <div className="App">
          <Info/>
          <ToggleSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
           {activeTab === 'timetable' && <Timetable loading={loading} setLoading={setLoading} showNotification={showNotification}/>}
           {activeTab === 'events' && <EventsTab showNotification={showNotification}/>}
           {activeTab === 'teachers' && <Teachers />}
           {activeTab === 'classrooms' && <Classrooms />}
           
           <a href={apk} download='FAST Timetable.apk'>
           {showDownload&&(<div className="download-apk-text" onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}>Download APK </div>)}
           <div className="download-apk" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}><i className="fa fa-arrow-down" style={{paddingLeft: '0px'}}></i></div>
           </a>
     
           {NotificationVar}
           <ContactSection />
           {adsComponent}
           
           {/* Update Notification - Shows once per version */}
           <UpdateNotification />
     
           {showUpdate && <CheckUpdate apkLink={apkLink}/>}
           <RightsReserved/>
         </div>
        }/>
        <Route path='/admin' element={<ApproveEvent/>}/>
        <Route path='/download' element={<DownloadPage apk={apk}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
