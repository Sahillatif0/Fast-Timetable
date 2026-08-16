import React from 'react';

const ContactSection = () => {
  const openWhatsApp = () => window.open(
    'https://wa.me/923052409409?text=Hi%20Sahil!%20I%20found%20you%20through%20the%20FAST%20Timetable%20app.%20I%20would%20like%20to%20connect%20with%20you.',
    '_blank'
  );

  return (
    <section className="contact-section">
      <button
        type="button"
        className="contact-button"
        onClick={openWhatsApp}
        aria-label="Get in touch on WhatsApp"
      >
        <span className="contact-button-icon" aria-hidden="true">
          <i className="fab fa-whatsapp"></i>
        </span>
        <span className="contact-button-text">
          <span className="contact-button-title">Get in touch</span>
          <span className="contact-button-description">Questions, feedback, or just say hi</span>
        </span>
        <span className="contact-button-arrow" aria-hidden="true">
          <i className="fas fa-arrow-right"></i>
        </span>
      </button>
    </section>
  );
};

export default ContactSection;
