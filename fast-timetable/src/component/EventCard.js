import React from 'react'
import Linkify from 'linkify-react';
import CountDown from './CountDown'

const options = {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: undefined
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
const EventCard = ({eventHeading, event, readMore, updateEventRef, ind}) => {
    let tag = eventHeading.split[' '];
    tag = (typeof(tag)=='object')?tag[0]:tag;

  return (
      <div className="event-card" id={tag+event._id} data-event={JSON.stringify(event)} ref={el=>(updateEventRef(ind, el))}>
        <div className="event-img" style={{backgroundImage: `url(${event.thumbnail?event.thumbnail:'https://i.imgur.com/ZTyC2YT.jpeg'}`}}>
        </div>
        <div className="event-info">
            <h2 className="event-name">{event.name}</h2>
            <p className="event-description trunc-desc"><Linkify >{event.description}</Linkify></p>
            <div className="event-details">
                <i className="fa fa-calendar-days"></i>
                <p className="event-date-time">{formatter.format(new Date(event.eventDate))}</p>
            </div>
            <div className="event-details">
                <i className="fa fa-user"></i>
            <p className="event-organizer">Event Organizer: {event.organizer}</p>
            </div>
            <div className="event-details">
                <i className="fa fa-location-dot"></i>
                <p className="event-location">Event Location: {event.location}</p>
            </div>
            {new Date(event.eventDate)>=Date.now() && 
            <div className="count-down">
                <p>Event starts in:</p>
                <CountDown date={event.eventDate}/>
            </div>
        }
            <div className="event-details">
                <i className="fa fa-eye"></i>
            <p className="event-view">{event.views}</p>
            </div>
            <button className="read-more search-button" onClick={()=>readMore(event)}>Read More</button>
        </div>
    </div>
  )
}

export default EventCard