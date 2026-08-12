import React, { useRef } from 'react'

const ToggleMyClasses = ({toggle, setToggle}) => {
  const optionRef = useRef(null)
  const changeOption = (option)=>{
    if(option === 'my-classes'){
        setToggle(true);
        optionRef.current.style.left = '7px';
    }
    else{
      setToggle(false);
      optionRef.current.style.left = '50%';
    }
  }
  return (
    <div className="switch mb-2">
        <div className={`option active-option ${toggle?"active-option-2":""}`}  ref={optionRef}></div>
        <div className={toggle?'option active-opt':'option'} onClick={()=>changeOption('my-classes')}>
            <i className="fa fa-user option-text"></i>
            <span className='option-text'>My Classes</span>
        </div>
        <div className={!toggle?'option active-opt':'option'} onClick={()=>changeOption('all-classes')}>
            <i className="fa fa-layer-group option-text"></i>
            <span className='option-text'>All Classes</span>
        </div>
    </div>
  )
}

export default ToggleMyClasses