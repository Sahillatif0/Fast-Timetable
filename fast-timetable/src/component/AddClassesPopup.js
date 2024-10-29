import React, { useState } from 'react'
import '../style/popup.css'

const AddClassesPopup = ({setShowAddClassesPopup, setSavedClasses, savedClasses, getData, showNotification}) => {
    const [searchTxt, setSearchTxt] = useState('');
    const [addClasses, setAddClasses] = useState(savedClasses);
    const [loading, setLoading] = useState(false);
    let allClasses = JSON.parse(localStorage.getItem('allClasses'));
    let withoutDays = [];
    allClasses.forEach(day => {
        withoutDays = withoutDays.concat(day.classes);
    });
    withoutDays = withoutDays.reduce((accumulator, current) => {
        if (!accumulator.some(item => item.val === current.val)) {
            addClasses.forEach(each=>{
                if(each.val===current.val)
                    current.checked = true
            })
          accumulator.push(current);
        }
        return accumulator;
      }, []);
    console.log(withoutDays);
    let [classes, setClasses] = useState(withoutDays);
    const searchData = (searching)=>{
        setLoading(true)
        let newClasses = [];
        withoutDays.forEach(each => {
            if(each.val.toLowerCase().includes(searching.toLowerCase())){
                newClasses.push(each);
            }
        });
        setClasses(newClasses);
        setLoading(false);
    }
    const handleKeyPress = (e) => {
        if(e.key==='Enter')
            searchData(searchTxt.trim());
    }
  return (
    <div className="container">
        <div className="popup">
            <div className="popup-header">
            <h2>Add Classes</h2>
            <button className="close" onClick={()=>{setShowAddClassesPopup(false)}}>&times;</button>
            </div>
            <div className="search-box sb-pp">
                <i className="fa fa-magnifying-glass"></i>
                <input type="text" placeholder="e.g. bcs-3a, basit ali, coal" value={searchTxt} onKeyDown={handleKeyPress} onChange={(e)=>{setSearchTxt(e.target.value);searchData(e.target.value)}}/>
                <button className='search-button' onClick={()=>{}} >Search</button>
            </div>
            <div className="popup-content">
            {loading && <div className="loader"></div>}
                {classes.map((each, ind)=>{
                    return <div className='each-class' onClick={() => {
                        let newClasses = [...classes];
                        let newaddClasses = addClasses;
                        if(!newClasses[ind].checked){
                            newaddClasses.push(each);
                            setAddClasses(newaddClasses);
                        }
                        else{
                            newaddClasses = newaddClasses.filter((each)=>each.val!==newClasses[ind].val);
                            setAddClasses(newaddClasses);
                        }
                        newClasses[ind].checked = !newClasses[ind].checked;
                        setClasses(newClasses);
                      }}>
                        <input type="checkbox" name={each.key} checked={each.checked} onChange={(e) => { e.stopPropagation(); let newClasses = [...classes]; let newaddClasses = addClasses; if(e.target.checked){
                            newaddClasses.push(each);
                            setAddClasses(newaddClasses);
                        }
                        else{
                            newaddClasses = newaddClasses.filter((each)=>each.val!==newClasses[ind].val);
                            setAddClasses(newaddClasses);
                        } newClasses[ind].checked = e.target.checked; setClasses(newClasses);}}/>
                        <label htmlFor={each.key}>{each.val}</label>
                    </div>
                })}
            </div>
            <div className="popup-footer">
                <button className="add" onClick={()=>{setSavedClasses(addClasses); localStorage.setItem('savedClasses', JSON.stringify(addClasses)); setShowAddClassesPopup(false); getData('', true); showNotification('classes added successfully', null)}}>Add</button>
                </div>
        </div>
    </div>
  )
}

export default AddClassesPopup