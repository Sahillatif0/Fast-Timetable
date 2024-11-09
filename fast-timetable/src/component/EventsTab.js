import React, { useEffect, useRef, useState } from 'react'
import Search from './Search'
import Events from './Events'
import AddEventForm from './AddEventForm'


const EventsTab = ({showNotification}) => {
    const [searchTxt, setSearchTxt] = useState('')
    const [showAdd, setShowAdd] = useState(true)
    const [events, setEvents] = useState([])
    const [recentEvents, setRecentEvents] = useState([])
    const [tagEvents, setTagEvents] = useState([])
    const [tag, setTag] = useState("")
    const [societyEvents, setSocietyEvents] = useState([])
    const [society, setSociety] = useState("")
    const [pastEvents, setPastEvents] = useState([])
    const [showSearchData, setShowSearchData] = useState(false);
    const [searchEvents, setSearchEvents] = useState([]);
    const [showAddEventPopup, setShowAddEventPopup] = useState(false);

    const localDataRef = useRef(false);

    const formatDateTime = (date) => {
        return date.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: true 
        });
      };
    const getSearchData = ()=>{
        setShowSearchData(true);
        let data = events.filter((event)=>{
            let txt = searchTxt.toLowerCase();
            return (event.name.toLowerCase().includes(txt) || event.location.toLowerCase().includes(txt) || event.tags.includes(txt) || event.links.includes(txt) || event.organizer.toLowerCase().includes(txt) || formatDateTime(new Date(event.eventDate)).toLowerCase().includes(txt)) || event.description.toLowerCase().includes(txt);
        })
        setSearchEvents(data);

    }
    const sortEvents = (evs)=>{
        const currentDate = new Date();

        const upcomingEvents = evs.filter(event => new Date(event.eventDate) >= currentDate);
        const pastEventsS = evs.filter(event => new Date(event.eventDate) < currentDate);
    
        upcomingEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        pastEventsS.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    
        return [...upcomingEvents, ...pastEventsS];
    }
    useEffect(() => {
        if(searchTxt==='')
            setShowSearchData(false);
    }, [searchTxt])
    useEffect(() => {
        const getData = async ()=>{
            try{
                // const response = await fetch('http://localhost:5000/getEvents');
                const response = await fetch('https://server-timetable1.vercel.app/getEvents');
                let data = await response.json() || [];
                data = sortEvents(data)
                setEvents(data);
                localStorage.setItem('all-events', JSON.stringify(data));
                localDataRef.current = false;
            }
            catch(err){
                console.error('error', err);
                setEvents(JSON.parse(localStorage.getItem('all-events')));
                localDataRef.current = true;
            }
            try{
                // const response = await fetch('http://localhost:5000/getRecentEvents');
                const response = await fetch('https://server-timetable1.vercel.app/getRecentEvents');
                let data = await response.json() || [];
                data = sortEvents(data);
                setRecentEvents(data);
                localStorage.setItem('recent-events', JSON.stringify(data));
                localDataRef.current = false;
            }catch(err){
                console.error('error', err);
                setRecentEvents(JSON.parse(localStorage.getItem('recent-events')));
                localDataRef.current = true;
            }
            try{
                // const response = await fetch('http://localhost:5000/getTag');
                const response = await fetch('https://server-timetable1.vercel.app/getTag');
                let data = await response.json() || {events: [], tag: ""};
                data.events = sortEvents(data.events);
                setTagEvents(data.events);
                setTag(data.tag)
                localStorage.setItem('tag-events', JSON.stringify(data));
                localDataRef.current = false;
            }catch(err){
                console.error('error', err);
                let data = JSON.parse(localStorage.getItem('tag-events')) || {events: [], tag: ""};
                setTagEvents(data.events);
                setTag(data.tag);
                localDataRef.current = true;
            }
            try{
                const response = await fetch('https://server-timetable1.vercel.app/getSociety');
                // const response = await fetch('http://localhost:5000/getSociety');
                let data = await response.json() || {events: [], society: ""};
                data.events = sortEvents(data.events);
                setSocietyEvents(data.events);
                setSociety(data.society);
                localStorage.setItem('society-events', JSON.stringify(data));
                localDataRef.current = false;
            }catch(err){
                console.error('error', err);
                let data = JSON.parse(localStorage.getItem('society-events')) || {events: [], society: ""};
                setSocietyEvents(data.events);
                setSociety(data.society);
                localDataRef.current = true;
            }
            try{
                const response = await fetch('https://server-timetable1.vercel.app/getPastEvents');
                // const response = await fetch('http://localhost:5000/getPastEvents');
                let data = await response.json() || []
                data = sortEvents(data);
                setPastEvents(data);
                localStorage.setItem('past-events', JSON.stringify(data));
                localDataRef.current = false;

            }catch(err){
                console.error('error', err);
                setPastEvents(JSON.parse(localStorage.getItem('past-events')));
                localDataRef.current = true;
            }
            if(localDataRef.current){
                showNotification('Network error: showing data from previous session', null); 
            }
        } 
        getData();
        setTimeout(() => {
            setShowAdd(false)
        }, 3000);
        // eslint-disable-next-line
    },[showAddEventPopup])

  return (
    <div className='events-tab'>
        <Search heading="Events" searchHelpTxt="Search for events with name, date, society name, or category" example="e.g. coderscup, acm, 12 Oct, Coding" getData={getSearchData} searchTxt={searchTxt} setSearchTxt={setSearchTxt}/>
        {showSearchData ? <Events heading="Search Results" events={searchEvents}/>:<>
        <Events heading="Whats New" events = {recentEvents} />
        {tag && <Events heading={tag} events={tagEvents} />}
        {society && <Events heading={society} events={societyEvents} />}
        <Events heading="ALL EVENTS" events={events} />
        <Events heading="PAST EVENTS" events={pastEvents}/>
        </>
        }
        {showAdd&&(<div className="download-apk-text add-event-text" onTouchStart={()=>{setShowAdd(true)}} onMouseEnter={()=>{setShowAdd(true)}} onMouseLeave={()=>{setShowAdd(false)}} onClick={()=>{setShowAddEventPopup(true)}}>Add Your Event </div>)}
        <div className="download-apk add-event" style={{borderRadius: '50%', width: '50px', height: '50px'}} onTouchStart={()=>{setShowAdd(true)}} onMouseEnter={()=>{setShowAdd(true)}} onMouseLeave={()=>{setShowAdd(false)}} onClick={()=>{setShowAddEventPopup(true)}}><i className="fa fa-plus" style={{paddingLeft: '0px'}}></i></div>
      {showAddEventPopup && <AddEventForm setShowAddEventPopup={setShowAddEventPopup} showNotification={showNotification}/>}
    </div>
  )
}

export default EventsTab