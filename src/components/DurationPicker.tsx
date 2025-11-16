import React, { useState, useRef, useEffect } from 'react';

interface DurationPickerProps {
  selectedDuration?: number;
  onSelectDuration: (duration: number | undefined) => void;
}

function DurationPicker({ selectedDuration, onSelectDuration }: DurationPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'Duration';
    if (minutes < 60) return `${minutes} min`;
    if (minutes === 60) return '1 hour';
    if (minutes % 60 === 0) return `${minutes / 60} hours`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const presets = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
  ];

  const handleSelect = (value: number) => {
    onSelectDuration(value);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectDuration(undefined);
    setIsOpen(false);
  };

  return (
    <div className="duration-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="duration-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="duration-icon">⏱️</span>
        <span className="duration-display">{formatDuration(selectedDuration)}</span>
        <span className="duration-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="duration-dropdown">
          <div className="duration-picker-header">
            <span className="duration-picker-title">Task Duration</span>
          </div>

          <div className="duration-presets-grid">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`duration-preset-btn ${selectedDuration === preset.value ? 'selected' : ''}`}
                onClick={() => handleSelect(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="duration-picker-actions">
            <button
              type="button"
              className="duration-clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DurationPicker;
