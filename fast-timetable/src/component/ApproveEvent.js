import React, {useEffect, useState} from 'react'
import EventInfoPopup from './EventInfoPopup'
import AdminEvent from './AdminEvent';
import '../style/admin.css'
import EditEventInfo from './EditEventInfo';

const ApproveEvent = () => {
    const [showPopup, setshowPopup] = useState(false);
    const [showEditPopup, setshowEditPopup] = useState(false);
    const [Infoevent, setInfoevent] = useState({});
    const [editEvent, seteditEvent] = useState({});
    const [change, setChange] = useState(0);
    const [isAdmin, setisAdmin] = useState(false)
    const [pass, setPass] = useState('')
    const [errorMsg, setErrorMsg] = useState("")
    const [toggle, setToggle] = useState(false)


    const [unapprovedEvents, setUnapprovedEvents] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);
    const submitPass = ()=>{
        fetch('https://server-timetable1.vercel.app/authadmin', {
        // fetch('http://localhost:5000/authadmin', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pass: pass})
       }).then((response) => response.json())
       .then((responseJson) => {
           if(responseJson.valid){
                setisAdmin(true);
                setErrorMsg("");
           }
            else{
                setisAdmin(false);
                setErrorMsg("Wrong Password");
            }
        })
        .catch((error) => {
            console.error(error);
            setErrorMsg("Error Occured!");
        });
    }
    const handleChange = (e)=>{
        setPass(e.target.value);
    }
    const readMore = (event)=>{
        setInfoevent(event);
        setshowPopup(true);
    }
    const onEdit = (event)=>{
        seteditEvent(event);
        setshowEditPopup(true);
    }
    useEffect(() => {
        if(isAdmin){
            fetch('https://server-timetable1.vercel.app/unapprovedEvents')
            // fetch('http://localhost:5000/unapprovedEvents')
            .then(response=>response.json())
            .then(data=>setUnapprovedEvents(data))
            .catch(err=>{
                    console.error('error', err);
            })
            fetch('https://server-timetable1.vercel.app/getEvents')
            // fetch('http://localhost:5000/getEvents')
            .then(response=>response.json())
            .then(data=>setApprovedEvents(data))
            .catch(err=>{
                    console.error('error', err);
            })
        }
    },[showEditPopup, change, isAdmin, toggle])
    

  return (
    <>
        {isAdmin?<>
        <div className="toggle-switch">
            <div className={toggle?"toggle-option active":"toggle-option"} onClick={()=>{setToggle(true)}}>UNAPPROVED</div>
            <div className={(!toggle)?"toggle-option active":"toggle-option"} onClick={()=>{setToggle(false)}}>APPROVED</div>
        </div>
        <h1 className="events-heading">Events</h1>
        <div className='to-be-approved-events'>
            {toggle ? unapprovedEvents.map(event=>{
                return <AdminEvent key={event._id} type="Approve" event={event} readMore={readMore} onEdit={onEdit} change={change} setChange={setChange}/>
            }): approvedEvents.map(event=>{
                return <AdminEvent key={event._id} type="DisApprove" event={event} readMore={readMore} onEdit={onEdit} change={change} setChange={setChange}/>})
            }
        </div>
        {showPopup && <EventInfoPopup setShowEventPopup={setshowPopup} event={Infoevent}/>}
        {showEditPopup && <EditEventInfo setShowEditPopup={setshowEditPopup} event={editEvent}/>}
        </>:<>
        <div style={{display: 'flex', flexDirection: 'column',  justifyContent: 'center',alignItems:'center', height: '100vh'}}>
            <div>
            Enter Password: 
            <div className="search-box">
                <input type="password" value={pass} onChange={handleChange} placeholder='Enter admin password'/>
                <div className="search-button" onClick={submitPass} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Enter</div>
            </div>
            </div>
        {<span style={{color: 'red'}}>{errorMsg}</span>}
        </div>
        </>}
    </>
  )
}

export default ApproveEvent