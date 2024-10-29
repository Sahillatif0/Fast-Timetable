import React, { useEffect, useRef, useState } from 'react'
import EventCard from './EventCard'
import EventInfoPopup from './EventInfoPopup'   

const Events = ({heading, events}) => {
    const containerRef = useRef(null);
    const eventCardRef = useRef([]);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const componentWidth = useRef(0);
    const screenWidth = useRef(window.innerWidth);
    const [screenWidthState, setScreenWidth] = useState(screenWidth);
    const [componentWidthState, setComponentWidth] = useState(componentWidth);
    const [eventPerScreen, setEventPerScreen] = useState(1);
    const [popupEvent, setPopupEvent] = useState(events?events[0]:{});
    const [loading, setloading] = useState(false);

    const updateEventRef = (ind, el)=>{
        eventCardRef.current[ind] = el;
        return eventCardRef.current[ind];
    }

    const goToSlide = (index) => {
        const left = (index * componentWidth.current);
        containerRef.current.scrollTo({
                left: left,
                behavior: 'smooth'
            });
        setCurrentIndex(index);
    }
    const goToPrevious = () => {
        const left = ((currentIndex-1) * componentWidth.current);
        containerRef.current.scrollTo({
                left: left,
                behavior: 'smooth'
            });
        setCurrentIndex(currentIndex-1);
    }
    const goToNext = () => {
        const left = ((currentIndex+1) * componentWidth.current);
        containerRef.current.scrollTo({
                left: left,
                behavior: 'smooth'
            });
        setCurrentIndex(currentIndex+1);
    }

    const readMore = (event)=>{
        setPopupEvent(event);
        setShowEventPopup(true);
    }
    useEffect(() => {
        let tim;
        const observer = new IntersectionObserver(
            (entries) => {
                let cacheData = JSON.parse(localStorage.getItem('views-cache'))  || [];
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let event = JSON.parse(entry.target.dataset.event);
                        let cacheIndex = cacheData.findIndex(cache => cache.eventId === event._id);
                        
                        if (cacheIndex !== -1 && cacheData[cacheIndex].lastview + 1000*60*60*12 < Date.now()) {
                            fetch(`https://server-timetable1.vercel.app/visitedEvent?id=${event._id}`).catch(err=>{console.error(err)});
                            cacheData[cacheIndex].lastview = Date.now();
                        } else if(cacheIndex === -1) {
                                fetch(`https://server-timetable1.vercel.app/visitedEvent?id=${event._id}`).catch(err=>{console.error(err)})
                                cacheData.push({ eventId: event._id, lastview: Date.now() });
                        }
                    }
              });
                localStorage.setItem('views-cache', JSON.stringify(cacheData));
              console.log(cacheData);
            },
            { threshold: 0.7 }
          );
              eventCardRef.current?.forEach((element) => observer.observe(element));
        
        const updateScreenWidth = ()=>{
            screenWidth.current = (window.screen.width>window.innerWidth)?window.innerWidth:window.screen.width;
            setScreenWidth(screenWidth.current);
        }
            
        const components = document.querySelector('.event-card');
        if(components && events){
        componentWidth.current =  (components.offsetWidth + 36);
        setComponentWidth(componentWidth.current);
        let ind = (screenWidth.current/componentWidth.current) | 0;
        ind = events.length>ind?ind:events.length;
        setEventPerScreen(ind);
        console.log(ind, componentWidth.current);
        containerRef.current.style.width = ind*componentWidth.current + 'px';
        console.log(screenWidth.current);
        const handleScroll = ()=>{
            clearTimeout(tim);
            tim = setTimeout(() => {
                const scrollPosition = containerRef.current.scrollLeft;
                const nearestComponentIndex = Math.round(scrollPosition / componentWidth.current);
                setCurrentIndex(nearestComponentIndex);
                const left = (nearestComponentIndex * componentWidth.current);
                containerRef.current.scrollTo({
                        left: left,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        
        containerRef.current.addEventListener('scroll', handleScroll);
        }
        window.addEventListener('resize', updateScreenWidth);
        return ()=>{
            window.removeEventListener('resize', updateScreenWidth);
            observer.disconnect();
        }

    },[screenWidthState, componentWidthState, events])
    useEffect(()=>{
        let timeout = setTimeout(() => {
            setloading(false);
        }, 10000);
        if(events.length===0)
            setloading(true)
        else{
            setloading(false);
            clearTimeout(timeout);
        }
    }, [events])
  return (
    <>
        <h1 className='events-heading' >{heading.toUpperCase()}</h1>
            <div className='events' ref={containerRef} style={{minWidth: '330px'}}>
                {!loading ? (events.length>0 ? 
                <>
                {currentIndex!==0 && <div className="slide-arrow prev" onClick={goToPrevious}>&#10094;</div>}
                {events.map((event, index) => (
                    <EventCard key={event.id} eventHeading={heading} event={event} readMore={readMore} updateEventRef={updateEventRef} ind={index}/>
                ))} 
                {currentIndex!==(events.length-eventPerScreen) && <div className="slide-arrow next" onClick={goToNext}>&#10095;</div>}
                </>:
                <div className='no-event'> No Events</div>):<div className='no-event'><div className='loader'></div></div>}
        </div>

        <div className="dots-container">
        {events && events.map((_, index) => (
            index<=(events?.length - eventPerScreen) && 
        <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
        ></span>
        ))}
        </div>
        {showEventPopup&& <EventInfoPopup setShowEventPopup={setShowEventPopup} event={popupEvent}/>}
    </>
  )
}

export default Events