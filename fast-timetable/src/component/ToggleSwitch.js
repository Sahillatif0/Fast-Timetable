import React, { useState, useEffect } from 'react'

const ToggleSwitch = ({activeTab, setActiveTab}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const tabs = [
    { 
      key: 'timetable', 
      label: 'TimeTable', 
      icon: 'fa fa-calendar-days',
      color: '#FF6B6B',
      bgColor: '#FFE5E5',
      description: 'View class schedules'
    },
    { 
      key: 'teachers', 
      label: 'Teachers', 
      icon: 'fa fa-chalkboard-user',
      color: '#45B7D1',
      bgColor: '#E5F4FA',
      description: 'Faculty information'
    },
    { 
      key: 'classrooms', 
      label: 'Free Rooms', 
      icon: 'fa fa-door-open',
      color: '#9B59B6',
      bgColor: '#F3E5F5',
      description: 'Available classrooms'
    }
  ]

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setIsOpen(false)
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  if (isMobile) {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    
    return (
      <div className="dropdown-nav-container">
        <div 
          className="dropdown-nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="dropdown-current-item">
            <div 
              className="dropdown-icon"
              style={{
                '--icon-color': activeTabData.color,
                '--bg-color': activeTabData.bgColor
              }}
            >
              <i className={activeTabData.icon}></i>
            </div>
            <div className="dropdown-content">
              <span className="dropdown-title">{activeTabData.label}</span>
              <span className="dropdown-subtitle">{activeTabData.description}</span>
            </div>
            <div className="dropdown-arrow">
              <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="dropdown-nav-menu">
            {tabs.map((tab, index) => (
              <div
                key={tab.key}
                className={`dropdown-nav-item ${activeTab === tab.key ? 'dropdown-active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  '--delay': `${index * 0.1}s`
                }}
              >
                <div 
                  className="dropdown-icon"
                  style={{
                    '--icon-color': tab.color,
                    '--bg-color': tab.bgColor
                  }}
                >
                  <i className={tab.icon}></i>
                </div>
                <div className="dropdown-content">
                  <span className="dropdown-title">{tab.label}</span>
                  <span className="dropdown-subtitle">{tab.description}</span>
                </div>
                {activeTab === tab.key && (
                  <div className="dropdown-check">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isOpen && (
          <div 
            className="dropdown-overlay" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    )
  }

  // Desktop version - keep the original switch for larger screens
  return (
    <div className="switch three-option-switch">
      <div 
        className={`active-option ${
          activeTab === 'timetable' ? 'option-timetable' : 
          activeTab === 'teachers' ? 'option-teachers' : 'option-classrooms'
        }`}
      ></div>
      <div className={activeTab === 'timetable' ? 'option active-opt' : 'option'} onClick={() => setActiveTab('timetable')}>
        <i className="fa fa-calendar-days option-text"></i>
        <span className='option-text'>TimeTable</span>
      </div>
      <div className={activeTab === 'teachers' ? 'option active-opt' : 'option'} onClick={() => setActiveTab('teachers')}>
        <i className="fa fa-chalkboard-user option-text"></i>
        <span className='option-text'>Teachers</span>
      </div>
      <div className={activeTab === 'classrooms' ? 'option active-opt' : 'option'} onClick={() => setActiveTab('classrooms')}>
        <i className="fa fa-door-open option-text"></i>
        <span className='option-text'>Free Rooms</span>
      </div>
    </div>
  )
}

export default ToggleSwitch