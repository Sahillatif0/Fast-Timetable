import React, { useState } from 'react'
import ReactTags from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import '../style/popup.css'

const EditEventInfo = ({setShowEditPopup, event, change, setChange}) => {
    const [tagValue, setTagValue] = useState('')
    const [imageValue, setImageValue] = useState('')
    const [linkValue, setLinkValue] = useState('')
    const [eventData, setEventData] = useState({...event,eventDate: event.eventDate.split(' ')[0],eventTime: event.eventDate.split(' ')[1]})
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        setEventData({
          ...eventData,
          [e.target.name]: e.target.value,
        });
        // console.log(eventData);
      };
      const tagsChange = (newTags)=>{
        setEventData({...eventData, tags: newTags});
    }
    const imagesChange = (newImages)=>{
        setEventData({...eventData, images: newImages});
    }
    const linksChange = (newLinks)=>{
        setEventData({...eventData, links: newLinks});
    }
    const handleChangeInputTag = (input) => {
        if(input.length>2 && input[input.length-1]===' ' && input[input.length-2]===','){
            const tag = input.slice(0, -2).trim();
            if(tag)
                setEventData({...eventData, tags: [...eventData.tags, tag]});
            input = '';
        }
        setTagValue(input);
        };
    const handleChangeInputImage = (input) => {
        if(input.length>2 && input[input.length-1]===' ' && input[input.length-2]===','){
            const tag = input.slice(0, -2).trim();
            if(tag)
                setEventData({...eventData, images: [...eventData.images, tag]});
            input = '';
        }
        setImageValue(input);
        };
    const handleChangeInputLinks = (input) => {
        if(input.length>2 && input[input.length-1]===' ' && input[input.length-2]===','){
            const tag = input.slice(0, -2).trim();
            if(tag)
                setEventData({...eventData, links: [...eventData.links, tag]});
            input = '';
        }
        setLinkValue(input);
        };
      const validate = () => {
        const newErrors = {};
        if (!eventData.name) newErrors.name = 'Event name is required';
        if (!eventData.description) newErrors.description = 'Description is required';
        if (!eventData.eventDate) newErrors.eventDate = 'Event date is required';
        if (!eventData.eventTime) newErrors.eventTime = 'Event time is required';
        if (!eventData.organizer) newErrors.organizer = 'Organizer is required';
        if (!eventData.location) newErrors.location = 'Location is required';
        if (!eventData.thumbnail) newErrors.thumbnail = 'Thumbnail is required';
        if (eventData.images.length === 0) newErrors.images = 'At least one image is required';
        if (eventData.tags.length === 0) newErrors.tags = 'At least one tag is required';
        if (eventData.links.length === 0) newErrors.links = 'At least one link is required';
    
    
        // if (eventData.links.some(link => !/^https?:\/\//.test(link))) {
        //   newErrors.links = 'All links should start with http:// or https://';
        // }
    
        if (eventData.thumbnail && !/^https?:\/\//.test(eventData.thumbnail)) {
          newErrors.thumbnail = 'Thumbnail URL should start with http:// or https://';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const [year, month, day] = eventData.eventDate.split("-").map(Number);
            const [hours, minutes] = eventData.eventTime.split(":").map(Number);
            fetch('https://server-timetable1.vercel.app/updateEvent', {
            // fetch('http://localhost:5000/updateEvent', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...eventData, eventDate: new Date(year, month - 1, day, hours, minutes)})
           }).then((response) => response.json())
           .then((responseJson) => {
                setChange(change+1);
            //    console.log(responseJson);
            })
            .catch((error) => {
                console.error(error);
            });
            setShowEditPopup(false);
        }
      };

  return (
    <div className='container'>
        <div className="popup" style={{justifyContent: 'normal', overflowY: 'scroll'}}>
            <div className="popup-header">
                <h2>Add Event</h2>
                <button className="close" onClick={()=>{setShowEditPopup(false)}}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="event-name">Event Name</label>
                    <div className="search-box add-event-search-box">
                        <input type="text" name='name' value={eventData.name} onChange={handleChange} id="event-name" placeholder="Enter Event Name"/>
                    </div>
                    {errors.name && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.name}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="event-desc">Event Description</label>
                    <div className="search-box add-event-search-box" style={{width: "90%"}}>
                        <textarea  type="text" name='description' value={eventData.description} id="event-desc" onChange={handleChange} placeholder="Enter Event Description" style={{resize: 'vertical', height: '100px'}}/>
                    </div>
                    {errors.description && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.description}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-date">Event Date</label>
                    <div className="search-box add-event-search-box">
                    <input type="date" name='eventDate' value={eventData.eventDate} onChange={handleChange} id="event-date"/>
                    </div>
                    {errors.eventDate && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.eventDate}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-time">Event Time</label>
                    <div className="search-box add-event-search-box">
                    <input name='eventTime' value={eventData.eventTime} type="time" onChange={handleChange} id="event-time"/>
                    </div>
                    {errors.eventTime && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.eventTime}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-organizer">Event Organizer</label>
                    <div className="search-box add-event-search-box">
                    <input type="text" name='organizer' value={eventData.organizer} id="event-organizer" onChange={handleChange} placeholder='Enter Event Organizer'/>
                    </div>
                    {errors.organizer && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.organizer}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-location">Event Location</label>
                    <div className="search-box add-event-search-box">
                    <input type="text" name='location' value={eventData.location} id="event-location" onChange={handleChange} placeholder='Enter Event Location'/>
                    </div>
                    {errors.location && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.location}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-thumbnail">Event Thumbnail(Image Link)</label>
                    <div className="search-box add-event-search-box">
                    <input type="text" name='thumbnail' value={eventData.thumbnail} id="event-thumbnail" onChange={handleChange} placeholder='Enter Event Thumbnail'/>
                    </div>
                    {errors.thumbnail && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.thumbnail}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-images">Event Other Images(Image Links, comma seperated)</label>
                    <div className="search-box add-event-search-box">
                        <ReactTags value={eventData.images} onChange={imagesChange} inputProps={{placeholder: "Add an event image"}} inputValue={imageValue} onChangeInput={handleChangeInputImage} className="custom-react-tagsinput" onlyUnique/>
                    {/* <input type="text" id="event-images" placeholder='Enter Event Images'/> */}
                    </div>
                    {errors.images && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.images}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-links">Event Links(comma seperated)</label>
                    <div className="search-box add-event-search-box">
                    <ReactTags value={eventData.links} onChange={linksChange} inputProps={{placeholder: "Add an event link"}} inputValue={linkValue} onChangeInput={handleChangeInputLinks} className="custom-react-tagsinput" onlyUnique/>
                    {/* <input type="text" id="event-links" placeholder='Enter Event Links'/> */}
                    </div>
                    {errors.links && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.links}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-tags">Event Tags(comma seperated)</label>
                    <div className="search-box add-event-search-box">
                    <ReactTags value={eventData.tags} onChange={tagsChange} inputProps={{placeholder: "Add an event tag"}} inputValue={tagValue} onChangeInput={handleChangeInputTag} className="custom-react-tagsinput" onlyUnique/>
                    
                    {/* <input type="text" id="event-tags" placeholder='Enter Event Tags'/> */}
                    </div>
                    {errors.tags && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.tags}</span>}
                </div>
                
                <button className='add-event-button search-button'>Update Event</button>
            </form>
        </div>
    </div>
  )
}

export default EditEventInfo