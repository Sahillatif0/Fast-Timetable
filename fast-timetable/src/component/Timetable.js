import React from 'react'
import Classes from './Classes';
import { useEffect, useRef, useState } from 'react';
import AddClassesPopup from './AddClassesPopup';
import Search from './Search';
import ToggleMyClasses from './ToggleMyClasses';

const Timetable = ({loading, setLoading, showNotification}) => {
  const weekday = ["Monday","Monday","Tuesday","Wednesday","Thursday","Friday","Monday"];
  const d = new Date();
  let currentDay = weekday[(d.getDay())];
    let saved = JSON.parse(localStorage.getItem('savedClasses'));
  saved = saved?saved:[];
  const [data, setData] = useState([]);
  const [savedClasses, setSavedClasses] = useState(saved);
  const [Filter, setFilter] = useState(currentDay?currentDay:"All");
  const [showMyClasses, setShowMyClasses] = useState(true);
  const [showAddClassesPopup, setShowAddClassesPopup] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');

  const [startY, setStartY] = useState(0);
  const [isPulled, setIsPulled] = useState(false);

  let showMyRef = useRef(showMyClasses);
  const sheetUrl = useRef('');
  const sheetsPageCodes = useRef([]);
  const fetchedData = useRef(false);

  const setAllData = async (allClasses, sec, onlyMyClasses) => {
    let matches = [];
    allClasses.forEach(day=>{
      let dayCl = {sheet: day.sheet, classes: []};
      day.classes.forEach(classDay => {
          if(showMyRef.current){
            savedClasses.forEach(each=>{
              if(onlyMyClasses){
                if(classDay.val.toLowerCase().includes(each.val.toLowerCase())){
                  dayCl.classes.push(classDay);
                }    
              }
              else{
                if(classDay.val.toLowerCase().includes(each.val.toLowerCase()) && ((classDay.val.toLowerCase().includes(sec.toLowerCase()) || classDay.location.toLowerCase().includes(sec.toLowerCase()) || classDay.slot.toLowerCase().includes(sec.toLowerCase())))){
                  dayCl.classes.push(classDay);
                }
              }
          })
          }
          else{
          if((classDay.val.toLowerCase().includes(sec.toLowerCase()) || classDay.location.toLowerCase().includes(sec.toLowerCase()) || classDay.slot.toLowerCase().includes(sec.toLowerCase()))){
            dayCl.classes.push(classDay);
            console.log("each adding class")
          }
        }
      });
      dayCl.classes = dayCl.classes.map(cl=>{
        let time = cl.slot.split('-')[0];
        let timeSplit = Number(time.split(':')[0]);
        if(timeSplit<7)
          timeSplit+=12;
        cl.time = timeSplit+':'+time.split(':')[1];
        return cl;
      })
      dayCl.classes = dayCl.classes.sort((a, b) => {
        if(a.time.split(':')[0]===b.time.split(':')[0]){
          return Number(a.time.split(':')[1])-Number(b.time.split(':')[1]);
        }
        return Number(a.time.split(':')[0])-Number(b.time.split(':')[0]);
      });
      matches.push(dayCl);
    })
    setData(matches);
  }
  const getAllData = async (sec, onlyMyClasses) => {
    setLoading(true);
    let allClasses = [];
    try{
    const promises = sheetsPageCodes.current.map(async (code) => {
      let matchesDay = {sheet: code.name, classes: []};

      const response = await fetch(sheetUrl.current + code.gid);
      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;
      rows.forEach((row, rowIndex) => {
        row.c.forEach((cell, colIndex) => {
          if (cell && cell.v && (rowIndex>2 && colIndex>0)) {
            const firstCellInRow = rows[rowIndex].c[0]?.v || '';
            let firstCellInCol = rows[1].c[colIndex]?.v || '';
            if(cell.v.toLowerCase().includes("lab") && firstCellInCol){
              firstCellInCol = firstCellInCol.split('-')[0] + '-' + rows[1].c[colIndex+2]?.v.split('-')[1] || ''
            }
            const match = {
              val: cell.v,
              location: firstCellInRow,
              slot: firstCellInCol,
              time: ''
            };
            matchesDay.classes.push(match);
          }
        });
      });

      return matchesDay;
    });

    allClasses = await Promise.all(promises);
    localStorage.setItem('allClasses', JSON.stringify(allClasses));
    await setAllData(allClasses,sec, onlyMyClasses);
    setLoading(false);
  }catch(err){
    console.log(err);
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      console.error('Network error occurred:', err);
      let allClasses = JSON.parse(localStorage.getItem('allClasses'));
      if(allClasses){
        setAllData(allClasses,sec, onlyMyClasses);
        showNotification('Network error: showing data from previous session', null);
      }
      else
        showNotification('Network error', 'red');
      setLoading(false);
    } else {
      getAllData(sec, onlyMyClasses);
    }
  }

  
  
  
};

useEffect(()=>{
  console.log(showMyClasses);
}, [showMyClasses])

useEffect(() => {
    const fetchSheetData =  async () =>{
      try{
      const response = await fetch("https://server-timetable2.vercel.app/data");
      const text = await response.text();
      const json = JSON.parse(text);
      sheetUrl.current = json.karachi.url;
      sheetsPageCodes.current = json.karachi.codes;
      localStorage.setItem('url', json.karachi.url);
      localStorage.setItem('cod', JSON.stringify(json.karachi.codes));
    }
    catch(err){
        console.log(err);
        sheetUrl.current = localStorage.getItem('url');
        sheetsPageCodes.current = JSON.parse(localStorage.getItem('cod'));
      }
    }
    const fun = async ()=>{
      await fetchSheetData();
      fetchedData.current = true;
    }
    const handleTouchStart = (event) => {
      if (window.scrollY === 0) {
        setStartY(event.touches[0].clientY);
      }
    };
    const handleTouchMove = (event) => {
      const currentY = event.touches[0].clientY;
      if (window.scrollY === 0 && currentY > startY) {
        const pullDistance = currentY - startY;
  
        if (pullDistance > 50) {
          setIsPulled(true);
        }
      }
    };
    const handleTouchEnd = () => {
      if (isPulled && !loading) {
        getAllData(searchTxt, searchTxt?true:false);
      }
      setIsPulled(false);
    };
    fun();
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line
  }, [startY,isPulled, loading, searchTxt])
  useEffect(()=>{
    setLoading(true);
    let intrvl = setInterval(() => {
      if(fetchedData.current){
          getAllData('', true);
          clearInterval(intrvl);
      }
    }, 500);
    // eslint-disable-next-line
  },[]);

  const handleShowMyClasses = (val) =>{
    setShowMyClasses(val);
    showMyRef.current = val;
    if(showMyRef.current)
      getAllData('', true);
    else
      getAllData(searchTxt, false);
  }
  
  return (
    <>
    <Search heading="Fast Timetable" searchHelpTxt="Search for your class, specific teacher, specific subject" example="e.g. bcs-3a, basit ali, coal" getData={getAllData} searchTxt={searchTxt} setSearchTxt={setSearchTxt}/>
    {loading && <div className="loader"></div>}
      {/* <div className={showMyClasses?"day-filter-item active":"day-filter-item no-active"} onClick={()=>{setShowMyClasses(!showMyClasses); showMyRef.current=!showMyClasses; if(showMyRef.current)getAllData('', true);else getAllData(searchTxt, false)}}>My Classes</div> */}
      <ToggleMyClasses toggle={showMyClasses} setToggle={handleShowMyClasses} />
      <div className='all-days'>
        <div className="day-filter">
          {data.length>0 && 
          <div className={Filter==='All'?"day-filter-item active":"day-filter-item"} onClick={()=>{setFilter('All')}}>All</div>}
          {data.map((d,index)=>(
            <div className={Filter===d.sheet?"day-filter-item active":"day-filter-item"} key={"day"+index} onClick={()=>{setFilter(d.sheet)}}>{d.sheet}</div>
          ))}
        </div>
        
      {showMyClasses && <div className="empty-action-btn" onClick={()=>{setShowAddClassesPopup(true);}}>
              <i className="fa fa-plus"></i>
              Add My Classes  
            </div>}
      {(showMyClasses && savedClasses.length===0) ? 
      (
          <div className='empty-state-card'>
            <div className="empty-icon">
              <i className="fa fa-calendar-plus"></i>
            </div>
            <h3>No Classes Added</h3>
            <p>Start by adding your classes to see your personalized timetable</p>
            <div className="empty-action-btn" onClick={()=>{setShowAddClassesPopup(true);}}>
              <i className="fa fa-plus"></i>
              Add Classes
            </div>
          </div>
        ):
      (Filter==='All' ? (data.map((d, index) => (
        <>
          <div className="day" key={"dayclasses"+index} >{d.sheet}</div>
          <Classes data={d.classes} />
          </>
        ))):
      Filter!=='All' && (data.map((d, index) => (
        Filter===d.sheet &&
        <>
          <div className="day" key={"dayclassesDay" + index} >{d.sheet}</div>
          <Classes data={d.classes} key={"dayclasses" + index}/>
          </>
        ))))}
        </div>

      {showAddClassesPopup && <AddClassesPopup setShowAddClassesPopup={setShowAddClassesPopup} savedClasses={savedClasses} setSavedClasses={setSavedClasses} getData={getAllData} showNotification={showNotification}/>}
    </>
  );
}

export default Timetable