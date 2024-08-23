import './App.css';
import './style/style.css';
import Search from './component/Search';
import Classes from './component/Classes';
import apk from './FAST_Timetable.apk';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(true);
  const [Filter, setFilter] = useState('All');
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1I4xHEoJhvX4D_0cwZ1cucr4-MacrLuUvonLOazu00Xg/gviz/tq?tqx=out:json&gid=';
  const sheetsPageCodes = [
    { gid: 424654452, name: 'Monday' },
    { gid: 925764175, name: 'Tuesday' },
    { gid: 95009550, name: 'Wednesday' },
    { gid: 1189325615, name: 'Thursday' },
    { gid: 1413517496, name: 'Friday' }
  ];

  const getAllData = async (sec) => {
    setLoading(true);
    let matches = [];
    let allClasses = [];
    try{
    const promises = sheetsPageCodes.map(async (code) => {
      let matchesDay = {sheet: code.name, classes: []};

      const response = await fetch(sheetUrl + code.gid);
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
    allClasses.forEach(day=>{
      let dayCl = {sheet: day.sheet, classes: []};
      day.classes.forEach(classDay => {
        if(classDay.val.toLowerCase().includes(sec.toLowerCase()) || classDay.location.toLowerCase().includes(sec.toLowerCase()) || classDay.slot.toLowerCase().includes(sec.toLowerCase())){
          dayCl.classes.push(classDay);
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
    setLoading(false);
  }catch(err){
    console.log(err);
    getAllData(sec);
  }




  };
  useEffect(() => {
    setTimeout(() => {
      setShowDownload(false)
    }, 3000);
  
  }, [])
  
  return (
    <div className="App">
      <div className="info">
        <div className="update">Real Time Updated <i className="fa fa-signal-stream"></i></div>
        <a href="https://github.com/Sahillatif0"><div className="about-dev">About Developer <i className="fa fa-code"></i></div></a>
      </div>
      <Search getData={getAllData} />
      {loading && <div className="loader"></div>}
      <div className='all-days'>
        <div className="day-filter">
          {data.length>0 && 
          <div className={Filter==='All'?"day-filter-item active":"day-filter-item"} onClick={()=>{setFilter('All')}}>All</div>}
          {data.map((d,index)=>(
            <div className={Filter===d.sheet?"day-filter-item active":"day-filter-item"} key={index} onClick={()=>{setFilter(d.sheet)}}>{d.sheet}</div>
          ))}
        </div>
        
      {Filter==='All' && (data.map((d, index) => (
        <>
          <div className="day" key={index} >{d.sheet}</div>
          <Classes data={d.classes}/>
          </>
        )))}
      {Filter!=='All' && (data.map((d, index) => (
        Filter===d.sheet &&
        <>
          <div className="day" key={index} >{d.sheet}</div>
          <Classes data={d.classes}/>
          </>
        )))}
        </div>
      
      <a href={apk} download='FAST Timetable.apk'>
      {showDownload?(<div className="download-apk" onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}>Download APK <i className="fa fa-arrow-down"></i></div>):
      (<div className="download-apk" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowDownload(true)}} onMouseEnter={()=>{setShowDownload(true)}} onMouseLeave={()=>{setShowDownload(false)}}><i className="fa fa-arrow-down" style={{paddingLeft: '0px'}}></i></div>)}
      </a>
    </div>
  );
}

export default App;
