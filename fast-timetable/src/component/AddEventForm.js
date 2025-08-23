import React, { useState, useEffect } from 'react'
import ReactTags from 'react-tagsinput';
import '../style/popup.css'

const InputBox = ({inputType, label, name, value, setEventData, eventData, placeholder, errors}) => {
    const [tags, setTags] = useState([]);
    const [tagValue, setTagValue] = useState('')
    const tagsChange = (newTags)=>{
        setTagValue(newTags);
    }
    const handleChangeInputTag = (input) => {
        if(input.length>2 && input[input.length-1]===' ' && input[input.length-2]===','){
            const tag = input.slice(0, -2).trim();
            if(tag)
                setTags([...tags, tag]);
            input = '';
        }
        setTagValue(input);
    };
    const handleChange = (e) => {
        setEventData({
            ...eventData,
            [e.target.name]: e.target.value,
        });
    };
    useEffect(() => {
        if(inputType==='tags')
            setEventData({...eventData, [name]: tags});
    }, [tags, name]);
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <div className="search-box add-event-search-box">
                {inputType==='textarea'?<textarea name={name} value={value} onChange={handleChange} placeholder={placeholder} style={{resize: 'vertical', height: '100px'}}/>:
                (inputType==='tags'?<ReactTags value={tags} onChange={tagsChange} inputProps={{placeholder: placeholder}} inputValue={tagValue} onChangeInput={handleChangeInputTag} className="custom-react-tagsinput"  addKeys={[13]}  onlyUnique/>:
                <input type={inputType} name={name} value={value} onChange={handleChange} placeholder={placeholder}/>)}
                {errors && <div style={{ color: 'red', marginTop: '-15px', marginLeft: '15px'}}>{errors}</div>}
            </div>
        </div>
    )
}
const AddEventForm = ({setShowAddEventPopup, showNotification}) => {
    const [eventData, setEventData] = useState({name: '', description: '', eventDate: '', eventTime: '', organizer: '', location: '', thumbnail: '', images: [], tags: [], links: []})
    const [errors, setErrors] = useState({});
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
            fetch('https://server-timetable1.vercel.app/addEvent', {
            // fetch('http://localhost:5000/addEvent', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...eventData, eventDate: new Date(year, month - 1, day, hours, minutes)})
           }).then((response) => response.json())
           .then((responseJson) => {
            //    console.log(responseJson);
               setShowAddEventPopup(false)
               showNotification("Event Request Submitted","green" );
            })
            .catch((error) => {
                console.error(error);
                showNotification("Network error",null)
            });
          // Form submission logic here
        }
      };

  return (
    <div className='container'>
        <div className="popup" style={{justifyContent: 'normal', overflowY: 'scroll'}}>
            <div className="popup-header">
                <h2>Add Event</h2>
                <button className="close" onClick={()=>{setShowAddEventPopup(false)}}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
                <InputBox inputType='text' label='Event Name' name='name' value={eventData.name} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Name' errors={errors.name}/>
                <InputBox inputType='textarea' label='Event Description' name='description' value={eventData.description} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Description' errors={errors.description}/>
                <InputBox inputType='date' label='Event Date' name='eventDate' value={eventData.eventDate} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Date' errors={errors.eventDate}/>
                <InputBox inputType='time' label='Event Time' name='eventTime' value={eventData.eventTime} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Time' errors={errors.eventTime}/>
                <InputBox inputType='text' label='Event Organizer' name='organizer' value={eventData.organizer} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Organizer' errors={errors.organizer}/>
                <InputBox inputType='text' label='Event Location' name='location' value={eventData.location} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Location' errors={errors.location}/>
                <InputBox inputType='text' label='Event Thumbnail(Image Link)' name='thumbnail' value={eventData.thumbnail} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Thumbnail' errors={errors.thumbnail}/>
                <InputBox inputType='tags' label='Event Images(Image Links, comma seperated)' name='images' value={eventData.images} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Images' errors={errors.images}/>
                <InputBox inputType='tags' label='Event Links(comma seperated)' name='links' value={eventData.links} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Links' errors={errors.links}/>
                <InputBox inputType='tags' label='Event Tags(comma seperated)' name='tags' value={eventData.tags} setEventData={setEventData} eventData={eventData} placeholder='Enter Event Tags' errors={errors.tags}/>
                
                <button className='add-event-button search-button'>Add Event</button>
            </form>
        </div>
    </div>
  )
}

export default AddEventForm