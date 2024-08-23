import React, { useState } from 'react'

const Search = ({getData}) => {
    const [searchTxt, setSearchTxt] = useState('');
    const handleKeyPress = (e) => {
        if(e.key==='Enter')
            getData(searchTxt);
    }
  return (
    <div className="box">
        <h1>Fast Timetable</h1>
        <p>Search for your class, specific teacher, specific subject</p>
        <div className="search-box">
            <i className="fa fa-magnifying-glass"></i>
            <input type="text" placeholder="e.g. bcs-3a, basit ali, coal" value={searchTxt} onKeyDown={handleKeyPress} onChange={(e)=>setSearchTxt(e.target.value)}/>
            <button className='search-button' onClick={()=>{getData(searchTxt)}} >Search</button>
        </div>

    </div>
  )
}

export default Search