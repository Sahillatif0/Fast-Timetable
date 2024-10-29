import React, { useState } from 'react'
import { WithContext as ReactTags } from 'react-tag-input';
import '../style/popup.css'

const AddEventForm = ({setShowAddEventPopup}) => {

    const [eventData, setEventData] = useState({name: '', description: '', eventDate: '', eventTime: '', organizer: '', location: '', thumbnail: '', images: [], tags: [], links: []})
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        setEventData({
          ...eventData,
          [e.target.name]: e.target.value,
        });
        console.log(eventData);
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
    
    
        if (eventData.links.some(link => !/^https?:\/\//.test(link))) {
          newErrors.links = 'All links should start with http:// or https://';
        }
    
        if (eventData.thumbnail && !/^https?:\/\//.test(eventData.thumbnail)) {
          newErrors.thumbnail = 'Thumbnail URL should start with http:// or https://';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
          alert('Form submitted successfully!');
          // Form submission logic here
        }
      };
    const handleDeleteTag = (i) => {
        setEventData({...eventData, tags: eventData.tags.filter((tag, index) => index !== i)})
        // setTags(tags.filter((tag, index) => index !== i));
    };
    const handleAdditionTag = (tag) => {
        // setTags([...tags, tag]);
        setEventData({...eventData, tags: [...eventData.tags, tag]})
    };
    const handleDeleteImage = (i) => {
        setEventData({...eventData, images: eventData.images.filter((tag, index) => index !== i)})
      };
    const handleAdditionImage = (image) => {
        setEventData({...eventData, images: [...eventData.images, image]})
    };
    const handleDeleteLink = (i) => {
        setEventData({...eventData, links: eventData.links.filter((tag, index) => index !== i)})
      };
    const handleAdditionLink = (link) => {
        setEventData({...eventData, links: [...eventData.links, link]})
    };

  return (
    <div className='container'>
        <div className="popup" style={{justifyContent: 'normal', overflowY: 'scroll'}}>
            <div className="popup-header">
                <h2>Add Event</h2>
                <button className="close" onClick={()=>{setShowAddEventPopup(false)}}>&times;</button>
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
                        <textarea  type="text" name='description' value={eventData.description} id="event-desc" onChange={handleChange} placeholder="Enter Event Description" style={{resize: 'vertical'}}/>
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
                <label htmlFor="event-images">Event Other Images(Image Links)</label>
                    <div className="search-box add-event-search-box">
                        <ReactTags
                            tags={eventData.images}
                            handleDelete={handleDeleteImage}
                            handleAddition={handleAdditionImage}
                            placeholder="Add an event image"/>
                    {/* <input type="text" id="event-images" placeholder='Enter Event Images'/> */}
                    </div>
                    {errors.images && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.images}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-links">Event Links</label>
                    <div className="search-box add-event-search-box">
                        <ReactTags
                            tags={eventData.links}
                            handleDelete={handleDeleteLink}
                            handleAddition={handleAdditionLink}
                            placeholder="Add an event link"/>
                    {/* <input type="text" id="event-links" placeholder='Enter Event Links'/> */}
                    </div>
                    {errors.links && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.links}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="event-tags">Event Tags</label>
                    <div className="search-box add-event-search-box">
                    <ReactTags
                        tags={eventData.tags}
                        handleDelete={handleDeleteTag}
                        handleAddition={handleAdditionTag}
                        placeholder="Add a tag"/>
                    {/* <input type="text" id="event-tags" placeholder='Enter Event Tags'/> */}
                    </div>
                    {errors.tags && <span style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors.tags}</span>}
                </div>
                
                <button className='add-event-button search-button'>Add Event</button>
            </form>
        </div>
    </div>
  )
}

export default AddEventForm