import React, { useState, useRef, useEffect } from 'react';

function TimePicker({ selectedTime, onSelectTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('PM');
  const timePickerRef = useRef(null);

  // Initialize from selectedTime prop
  useEffect(() => {
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const hourNum = parseInt(hours);
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayPeriod = hourNum >= 12 ? 'PM' : 'AM';

      setHour(String(displayHour).padStart(2, '0'));
      setMinute(minutes);
      setPeriod(displayPeriod);
    }
  }, [selectedTime]);

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayTime = (timeString) => {
    if (!timeString) return 'Select time';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleApply = () => {
    let hours = parseInt(hour);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const timeString = `${String(hours).padStart(2, '0')}:${minute}`;
    onSelectTime(timeString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectTime('');
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="time-picker-wrapper" ref={timePickerRef}>
      <button
        type="button"
        className="time-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="time-icon">🕐</span>
        <span className="time-display">{formatDisplayTime(selectedTime)}</span>
        <span className="time-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="time-dropdown">
          <div className="time-picker-header">
            <span className="time-picker-title">Select Time</span>
          </div>

          <div className="time-selectors">
            <div className="time-selector-column">
              <label className="time-selector-label">Hour</label>
              <div className="time-scroll-container">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`time-option ${hour === h ? 'selected' : ''}`}
                    onClick={() => setHour(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="time-selector-separator">:</div>

            <div className="time-selector-column">
              <label className="time-selector-label">Minute</label>
              <div className="time-scroll-container">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`time-option ${minute === m ? 'selected' : ''}`}
                    onClick={() => setMinute(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="time-selector-column period-column">
              <label className="time-selector-label">Period</label>
              <div className="period-toggle">
                <button
                  type="button"
                  className={`period-option ${period === 'AM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={`period-option ${period === 'PM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <div className="time-picker-actions">
            <button
              type="button"
              className="time-clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="time-apply-btn"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;
