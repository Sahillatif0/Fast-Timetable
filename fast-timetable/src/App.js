import './App.css';
import './style/style.css';
import { useEffect, useRef, useState } from 'react';
import apk from './FAST_TImetable.apk';
import Notification from './component/Notification';
import html_parse from 'html-react-parser';
import CheckUpdate from './component/CheckUpdate';
import Info from './component/Info';
import Timetable from './component/Timetable';
import ToggleSwitch from './component/ToggleSwitch';
import EventsTab from './component/EventsTab';
import RightsReserved from './component/RightsReserved';


function App() {
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(true);
  const [NotificationVar, setNotification] = useState(null); // eslint-disable-next-line 
  const [versionCode, setversionCode] = useState(9); 
  const [showUpdate, setShowUpdate] = useState(false);
  const [apkLink, setApkLink] = useState('');

  const [toggle, setToggle] = useState(true);

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
      const response = await fetch("https://server-timetable1.vercel.app/data");
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
    <div className="App">
     <Info/>
     <ToggleSwitch toggle={toggle} setToggle={setToggle}/>
      {toggle?<Timetable loading={loading} setLoading={setLoading} showNotification={showNotification}/>:<EventsTab/>}
      
      <a href={apk} download='FAST Timetable.apk'>
      {/* {showDownload?(<div className="download-apk" onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}>Download APK <i className="fa fa-arrow-down"></i></div>):
      (<div className="download-apk" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}><i className="fa fa-arrow-down" style={{paddingLeft: '0px'}}></i></div>)} */}
      {showDownload&&(<div className="download-apk-text" onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}>Download APK </div>)}
      <div className="download-apk" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}><i className="fa fa-arrow-down" style={{paddingLeft: '0px'}}></i></div>
      </a>

      {NotificationVar}
      {adsComponent}

      {showUpdate && <CheckUpdate apkLink={apkLink}/>}
      <RightsReserved/>
    </div>
  );
}

export default App;
