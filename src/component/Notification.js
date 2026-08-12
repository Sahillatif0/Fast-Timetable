import React from 'react'

const Notification = ({message, background, setNotification}) => {
  return (
    <div style={{background: background?background:"var(--button-color)"}} className="notification">
        <div className="message">
        <i className="fa fa-bell set-margin"></i>
        <span >{message}</span>
        </div>
        <i className="fa fa-close set-margin" onClick={()=>{setNotification(null)}}></i>
    </div>
  )
}

export default Notification