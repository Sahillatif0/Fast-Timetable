import React from 'react'

const AdminEvent = ({type, event, readMore, onEdit, change, setChange}) => {
    event.addDate = new Date(event.addDate).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    const pkTime = new Date(event.eventDate.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    event.eventDate = `${pkTime.getFullYear()}-${String(pkTime.getMonth() + 1).padStart(2, '0')}-${String(pkTime.getDate()).padStart(2, '0')} ${String(pkTime.getHours()).padStart(2, '0')}:${String(pkTime.getMinutes()).padStart(2, '0')}:${String(pkTime.getSeconds()).padStart(2, '0')}`;
    const onApprove =()=>{
        let url = 'https://server-timetable1.vercel.app/disapproveEvent?id='+event._id;
        // fetch('http://localhost:5000/approveEvent?id='+event._id,)
        if(type==="Approve")
            url = 'https://server-timetable1.vercel.app/approveEvent?id='+event._id;
        fetch(url)
        .then(data=>{
            // console.log(data);
        })
        .catch(err=>{
            console.error('error', err);
        })
        setChange(change+1);
    }
    const onDelete =()=>{
        // fetch('http://localhost:5000/deleteEvent?id='+event._id,)
        fetch('https://server-timetable1.vercel.app/deleteEvent?id='+event._id,)
        .then(data=>{
            // console.log(data);
        })
        .catch(err=>{
            console.error('error', err);
        })
        setChange(change+1);
    }
  return (
    <div className="admin-event-card">
        <div className="admin-event-title">{event.name}</div>
        <div className="admin-event-date">Add Date: {event.addDate}</div>
        <div className="admin-event-date">Date: {event.eventDate}</div>
        <div className="admin-event-by">Organizer: {event.organizer}</div>
        <div className="buttons">
        <div className="search-button admin-btn" onClick={()=>{readMore(event)}}>Read More <i className="fa fa-circle-info"></i></div>
        <div className="search-button admin-btn edit-btn" onClick={()=>{onEdit(event)}} >Edit <i className="fa fa-pencil"></i></div>
        <div className="search-button admin-btn approve-btn" onClick={onApprove}>{type} <i className="fa fa-circle-check"></i></div>
        <div className="search-button admin-btn delete-btn" onClick={onDelete}>Delete <i className="fa fa-circle-trash"></i></div>
        </div>
    </div>
  )
}

export default AdminEvent