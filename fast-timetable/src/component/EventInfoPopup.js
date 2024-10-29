import React from 'react'
import Linkify from 'linkify-react';
import ImageSlideShow from './ImageSlideShow'
import '../style/popup.css'
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
const EventInfoPopup = ({setShowEventPopup, event}) => {
  return (
    <div className="container">
        <div className="popup" style={{justifyContent: 'flex-start', alignItems: 'start', overflowX: 'hidden',overflowY:'scroll', paddingTop: '0px'}}>
        <div className="popup-header event-popup-header">
        <button className="close" style={{fontSize: '25px'}} onClick={()=>{setShowEventPopup(false)}}>&times;</button>
        </div>
        <div className="event-images">
            <ImageSlideShow images={event.images}/>
        </div>
        <h1 className="event-name">{event.name}</h1>
        <div className="event-description popup-desc"><Linkify options={{className: 'event-link'}}>{event.description}</Linkify></div>
        <h2 className='event-details-heading'>Event Details: </h2>
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
            {event.links.map((link)=>{
                return <div className="event-details">
                <i className="fa fa-link"></i>
                <p className="event-link-p">Event Link: <a className="event-link" href={link} rel='noreferrer' target='_blank'>{link}</a></p>
                </div>
            })}
            <div className="event-details">
            <i className="fa fa-tags"></i>
            <p className="event-location">Event Tags</p>
            </div>
            <div className="event-tags">
                {event.tags.map((tag)=>{
                    return <span className="event-tag">{tag}</span>
                })}
            </div>
            {new Date(event.eventDate)>=Date.now() && 
            <div className="count-down-popup">
                <p>Event starts in:</p>
                <CountDown date={event.eventDate}/>
            </div>
        }
            <div className="event-details">
                <i className="fa fa-eye"></i>
            <p className="event-view">{event.views}</p>
            </div>
        </div>
    </div>
  )
}

export default EventInfoPopup