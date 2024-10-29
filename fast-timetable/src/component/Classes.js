import React from 'react'
import SingleClass from './SingleClass';

const Classes = ({data}) => {
    return (
        <div className="class-box">
            {data.length>0?data.map((cl, ind)=>{
                return <SingleClass cl={cl} key={"singleclass"+ind}/>
            }):
            <span className="enjoy">No classes. Enjoy 🎊</span> }
        </div>
    )
}

export default Classes