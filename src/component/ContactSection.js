import React, { useState } from 'react';

const ContactSection = () => {
  const [activeCard, setActiveCard] = useState(null);

  const contactOptions = [
    {
      id: 'feedback',
      title: 'Submit Feedback',
      description: 'Share your thoughts and help us improve',
      icon: 'fas fa-comment-dots',
      color: 'var(--feedback-color, #4CAF50)',
      gradient: 'linear-gradient(135deg, #4CAF50, #45a049)',
      action: () => window.open('https://wa.me/923048105667?text=Hi%20Sahil!%20I%20would%20like%20to%20share%20my%20feedback%20about%20the%20FAST%20Timetable%20app.%20Here%20are%20my%20thoughts:', '_blank')
    },
    {
      id: 'ads',
      title: 'Post Ads',
      description: 'Advertise your services to students',
      icon: 'fas fa-bullhorn',
      color: 'var(--ads-color, #FF9800)',
      gradient: 'linear-gradient(135deg, #FF9800, #F57C00)',
      action: () => window.open('https://wa.me/923048105667?text=Hi%20Sahil!%20I%20am%20interested%20in%20posting%20an%20advertisement%20on%20the%20FAST%20Timetable%20app.%20Let%27s%20discuss%20the%20details.', '_blank')
    },
    {
      id: 'collaborate',
      title: 'Collaborate',
      description: 'Partner with us on exciting projects',
      icon: 'fas fa-handshake',
      color: 'var(--collaborate-color, #2196F3)',
      gradient: 'linear-gradient(135deg, #2196F3, #1976D2)',
      action: () => window.open('https://wa.me/923048105667?text=Hi%20Sahil!%20I%20would%20like%20to%20collaborate%20with%20you%20on%20a%20project.%20Let%27s%20discuss%20the%20possibilities!', '_blank')
    },
    {
      id: 'features',
      title: 'Suggest Features',
      description: 'Help shape the future of this app',
      icon: 'fas fa-lightbulb',
      color: 'var(--features-color, #9C27B0)',
      gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
      action: () => window.open('https://wa.me/923048105667?text=Hi%20Sahil!%20I%20have%20a%20feature%20suggestion%20for%20the%20FAST%20Timetable%20app.%20Let%20me%20share%20my%20idea%20with%20you!', '_blank')
    }
  ];

  return (
    <div className="contact-section">
      <div className="contact-header">
        <h3 className="contact-title">
          <i className="fas fa-paper-plane"></i>
          Get in Touch
        </h3>
        <p className="contact-subtitle">Choose how you'd like to connect with us</p>
      </div>
      
      <div className="contact-grid">
        {contactOptions.map((option) => (
          <div
            key={option.id}
            className={`contact-card ${activeCard === option.id ? 'contact-active' : ''}`}
            onMouseEnter={() => setActiveCard(option.id)}
            onMouseLeave={() => setActiveCard(null)}
            onClick={option.action}
            style={{ '--card-gradient': option.gradient }}
          >
            <div className="contact-card-inner">
              <div className="contact-icon">
                <i className={option.icon}></i>
              </div>
              <div className="contact-content">
                <h4 className="contact-card-title">{option.title}</h4>
                <p className="contact-card-description">{option.description}</p>
              </div>
              <div className="contact-arrow">
                <i className="fab fa-whatsapp"></i>
              </div>
            </div>
            <div className="contact-card-glow"></div>
          </div>
        ))}
      </div>
      
      <div className="contact-footer">
        <div className="quick-contact">
          <span className="quick-contact-text">Quick Contact:</span>
          <div className="quick-contact-buttons">
            <a 
              href="mailto:sahillatif072@gmail.com" 
              className="quick-contact-btn quick-email"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-envelope"></i>
              Email
            </a>
            <a 
              href="https://wa.me/923048105667?text=Hi%20Sahil!%20I%20found%20you%20through%20the%20FAST%20Timetable%20app.%20I%20would%20like%20to%20connect%20with%20you." 
              className="quick-contact-btn quick-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
