import React, { useState, useRef, useEffect } from 'react';

function ReminderPicker({ selectedReminder, onSelectReminder }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const reminders = [
    { value: '', label: 'No Reminder', icon: '🔕', description: 'No notification' },
    { value: '5', label: '5 minutes', icon: '⏱️', description: '5 min before' },
    { value: '15', label: '15 minutes', icon: '⏰', description: '15 min before' },
    { value: '30', label: '30 minutes', icon: '⏰', description: '30 min before' },
    { value: '60', label: '1 hour', icon: '🕐', description: '1 hour before' },
    { value: '1440', label: '1 day', icon: '📅', description: '1 day before' },
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  const handleSelect = (value) => {
    onSelectReminder(value);
    setIsOpen(false);
  };

  const getDisplayInfo = () => {
    const reminder = reminders.find(r => String(r.value) === String(selectedReminder));
    return reminder || reminders[0]; // Default to no reminder
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className="reminder-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="reminder-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="reminder-trigger-icon">{displayInfo.icon}</span>
        <span className="reminder-trigger-text">{displayInfo.label}</span>
        <span className="reminder-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="reminder-dropdown">
          <div className="reminder-header">
            <span className="reminder-title">Set Reminder</span>
          </div>

          <div className="reminder-options">
            {reminders.map((reminder) => (
              <button
                key={reminder.value}
                type="button"
                className={`reminder-option ${
                  String(selectedReminder) === String(reminder.value) ? 'selected' : ''
                }`}
                onClick={() => handleSelect(reminder.value)}
              >
                <span className="reminder-option-icon">{reminder.icon}</span>
                <div className="reminder-option-content">
                  <span className="reminder-option-label">{reminder.label}</span>
                  <span className="reminder-option-description">{reminder.description}</span>
                </div>
                {String(selectedReminder) === String(reminder.value) && (
                  <span className="reminder-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderPicker;
