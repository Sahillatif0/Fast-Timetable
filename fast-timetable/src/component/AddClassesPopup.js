import React, { useState } from 'react'
import '../style/popup.css'

const AddClassesPopup = ({setShowAddClassesPopup, setSavedClasses, savedClasses, getData, showNotification}) => {
    const [searchTxt, setSearchTxt] = useState('');
    const [addClasses, setAddClasses] = useState(savedClasses);
    const [loading, setLoading] = useState(false);
    const [showAddedClasses, setShowAddedClasses] = useState(false);
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
    // console.log(withoutDays);
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
                <input type="text" placeholder="e.g. bcs-3a, basit ali, coal" className='add-search-input' value={searchTxt} onKeyDown={handleKeyPress} onChange={(e)=>{setSearchTxt(e.target.value);searchData(e.target.value)}}/>
                <button className='search-button' onClick={()=>{searchData(searchTxt.trim())}} >Search</button>
            </div>
            
            <button 
                className={`added-classes-toggle ${addClasses.length > 0 ? 'has-items' : ''}`}
                onClick={() => setShowAddedClasses(!showAddedClasses)}
            >
                <i className={`fa ${showAddedClasses ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                <span>My Classes</span>
                {addClasses.length > 0 && <span className="added-count-badge">{addClasses.length}</span>}
            </button>
            
            {showAddedClasses && (
                <div className="added-classes-section">
                    {addClasses.length > 0 ? (
                        <div className="added-classes-list">
                            {addClasses.map((item, index) => (
                                <div key={item.val || index} className="added-class-tag">
                                    <span>{item.val}</span>
                                    <button 
                                        className="remove-class-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newAddClasses = addClasses.filter((_, i) => i !== index);
                                            setAddClasses(newAddClasses);
                                            const newClasses = classes.map(c => 
                                                c.val === item.val ? { ...c, checked: false } : c
                                            );
                                            setClasses(newClasses);
                                        }}
                                        title="Remove class"
                                    >
                                        <i className="fa fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-classes-message">
                            <i className="fa fa-info-circle"></i>
                            <span>No classes added yet. Select classes from the list below.</span>
                        </div>
                    )}
                </div>
            )}
            
            <div className="popup-content">
            {loading && <div className="loader"></div>}
                {classes.map((each, ind)=>{
                    return <div key={each.val || ind} className='each-class' onClick={() => {
                        let newClasses = [...classes];
                        let newaddClasses = [...addClasses];
                        if(!newClasses[ind].checked){
                            newaddClasses.push(each);
                            setAddClasses(newaddClasses);
                        }
                        else{
                            newaddClasses = newaddClasses.filter((item)=>item.val!==newClasses[ind].val);
                            setAddClasses(newaddClasses);
                        }
                        newClasses[ind].checked = !newClasses[ind].checked;
                        setClasses(newClasses);
                      }}>
                        <input type="checkbox" name={each.key} checked={each.checked || false} onChange={(e) => { 
                            e.stopPropagation(); 
                            let newClasses = [...classes]; 
                            let newaddClasses = [...addClasses]; 
                            if(e.target.checked){
                                newaddClasses.push(each);
                                setAddClasses(newaddClasses);
                            }
                            else{
                                newaddClasses = newaddClasses.filter((item)=>item.val!==newClasses[ind].val);
                                setAddClasses(newaddClasses);
                            } 
                            newClasses[ind].checked = e.target.checked; 
                            setClasses(newClasses);
                        }}/>
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