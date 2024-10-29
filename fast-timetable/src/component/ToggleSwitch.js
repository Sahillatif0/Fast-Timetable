import React, { useRef } from 'react'

const ToggleSwitch = ({toggle, setToggle}) => {
  const optionRef = useRef(null)
  const changeOption = (option)=>{
    if(option === 'time'){
        setToggle(true);
        optionRef.current.style.left = '7px';
    }
    else{
      setToggle(false);
      optionRef.current.style.left = '50%';
    }
  }
  return (
    <div className="switch">
        <div className='option active-option' ref={optionRef}></div>
        <div className={!toggle?'option':'option active-opt'} onClick={()=>changeOption('time')}>
            <i className="fa fa-calendar-days option-text"></i>
            <span className='option-text'>TimeTable</span>
        </div>
        <div className={toggle?'option':'option active-opt'} onClick={()=>changeOption('events')}>
            <i className="fa fa-list-check option-text"></i>
            <span className='option-text'>Events</span>
        </div>
    </div>
  )
}

export default ToggleSwitch