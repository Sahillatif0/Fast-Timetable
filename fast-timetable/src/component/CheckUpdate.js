import React from 'react'

const CheckUpdate = ({apkLink}) => {
  return (
    <div className="container">
        <div className="update-box">
            <div className="update-heading">
            <div className="icon" ></div>
            <h1>Update Available</h1>
            </div>
            <p>Update your app to get the latest features and improvements</p>
            <div onClick={()=>{fetch('https://server-timetable1.vercel.app/update'); window.open(apkLink, '_blank')}} className='search-button update-button'>Update</div>
            </div>
    </div>
  )
}

export default CheckUpdate