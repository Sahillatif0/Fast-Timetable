import React from 'react'

const SingleClass = ({cl}) => {
    
  return (
    <div className="single-class">
        <span id="class-name">{cl.val.split('\n')[0]}</span>
        <span className="class-location text">Location: {cl.location}</span>
        <span className="class-teacher text">Instructor: {cl.val.split('\n')[1]}</span>
        <span className="class-time text">Starting Slot: {cl.location=="City Campus"?cl.val.split('\n')[2]:cl.slot}</span>
    </div>
  )
}

export default SingleClass