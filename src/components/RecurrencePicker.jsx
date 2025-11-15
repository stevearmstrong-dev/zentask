import React, { useState } from 'react';

function RecurrencePicker({ selectedRecurrence, onSelectRecurrence }) {
  const [isOpen, setIsOpen] = useState(false);

  const recurrenceOptions = [
    { value: 'none', label: 'Does not repeat', icon: '○' },
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'biweekly', label: 'Every 2 weeks', icon: '🗓️' },
    { value: 'monthly', label: 'Monthly', icon: '📊' },
    { value: 'yearly', label: 'Yearly', icon: '🎂' },
  ];

  const getCurrentOption = () => {
    return recurrenceOptions.find(opt => opt.value === (selectedRecurrence || 'none'));
  };

  const handleSelect = (value) => {
    onSelectRecurrence(value === 'none' ? null : value);
    setIsOpen(false);
  };

  return (
    <div className="recurrence-picker">
      <button
        type="button"
        className="picker-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Set recurrence"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="picker-icon">{getCurrentOption()?.icon}</span>
          <span className="picker-label">{getCurrentOption()?.label}</span>
        </div>
        <span className="picker-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="picker-overlay" onClick={() => setIsOpen(false)} />
          <div className="recurrence-dropdown picker-dropdown">
            {recurrenceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`recurrence-option picker-option ${
                  (selectedRecurrence || 'none') === option.value ? 'selected' : ''
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                {(selectedRecurrence || 'none') === option.value && (
                  <span className="option-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default RecurrencePicker;
