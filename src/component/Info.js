

const Info = () => {

  return (
    <div className="info-impressive">
      <div className="status-section">
        <div className="live-indicator">
          <div className="pulse-dot"></div>
          <span className="status-text">Live Updates</span>
          <div className="signal-bars">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
          </div>
        </div>
      </div>
      
      <div 
        className="developer-showcase" onClick={(e) => {window.open('https://www.linkedin.com/in/sahil-latif/', '_blank')}}
      >
        <div className="dev-badge">
          <div className="dev-avatar">
            <img 
              src="https://avatars.githubusercontent.com/u/89584018?v=4" 
              alt="Sahil Latif"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="avatar-placeholder" style={{display: 'none'}}>
              <i className="fas fa-code"></i>
            </div>
          </div>
          
          <div className="dev-info" >
            <div className="dev-header">
              <span className="dev-name">Sahil Latif</span>
              <div className="verification-badge">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <span className="dev-role">Full Stack Developer</span>
            {/* <div className="tech-preview">
              <span className="tech-tag">React</span>
              <span className="tech-tag">Node.js</span>
              <span className="tech-tag">+3</span>
            </div> */}
          </div>    
        </div>
        
        <div className="social-actions">
          <a 
            href="https://www.linkedin.com/in/sahil-latif/" 
            target='_blank' 
            rel='noreferrer'
            className="social-btn linkedin"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fab fa-linkedin-in"></i>
            <span>Connect</span>
          </a>
          <a 
            href="https://github.com/Sahillatif0" 
            target='_blank' 
            rel='noreferrer'
            className="social-btn github"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fab fa-github"></i>
            <span>Follow</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Info