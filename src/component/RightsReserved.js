import React, {useEffect, useRef, useState} from 'react';

const RightsReserved = () => {
  const currentYear = new Date().getFullYear();
  const [obj, setObj] = useState({height: '100px'});
  const footerRef = useRef(null);
  useEffect(()=>{
      const heightobj = {height: `calc(100vh - ${footerRef.current.getBoundingClientRect().y}px)`};
        setObj(heightobj);
  },[])
  return (
    <footer style={{...styles.footer,...obj}} ref={footerRef}>
      <p style={styles.text}>
        © {currentYear} FAST Timetable. All rights reserved.
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: '10px',
    width: '100%'
  },
  text: {
    margin: 0,
    color: '#6c757d',
    fontSize: '14px',
  },
};

export default RightsReserved;
