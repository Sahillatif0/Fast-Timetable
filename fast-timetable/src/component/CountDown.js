import React, { useState, useEffect } from 'react';

const AnimatedDigit = ({ value }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 250); 
      return () => clearTimeout(timer);
    }
  },[value, prevValue]);

  return (
    <div className="digit-container">
      <div className={`digit-flip ${isFlipping ? 'flipping' : ''}`}>
        <span className="digit-top">{prevValue}</span>
      </div>
    </div>
  );
};

const CountdownTimer = ({ date }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="countdown-timer">
      {Object.entries(timeLeft).length ? (
        Object.entries(timeLeft).map(([interval, value]) => (
          <div key={interval} className="timer-section">
            <div className="timer-value">
              <AnimatedDigit value={formatNumber(value)[0]} />
              <AnimatedDigit value={formatNumber(value)[1]} />
            </div>
            <span className="timer-label">{interval}</span>
          </div>
        ))
      ) : (
        <span>Time's up!</span>
      )}
    </div>
  );
};
export default CountdownTimer;