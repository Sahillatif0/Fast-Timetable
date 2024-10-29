import React, { useState, useEffect } from 'react';

const ImageSlideshow = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="slideshow-container">
      <div className="slides-wrapper" style={{width: `${images.length * 100}%`}}>
        {images.map((image, index) => (
          <div key={index} className={`slide ${index === currentIndex ? 'active' : ''}`} style={{ transform: `translateX(-${currentIndex * 100}%)`, flex: `0 0 ${100 / images.length}%` }}>
            <img src={image} alt={image} />
          </div>
        ))}
      </div>
      <button className="nav-button prev" onClick={goToPrevious}>
        &#10094;
      </button>
      <button className="nav-button next" onClick={goToNext}>
        &#10095;
      </button>
      <div className="dots-container">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};
export default ImageSlideshow