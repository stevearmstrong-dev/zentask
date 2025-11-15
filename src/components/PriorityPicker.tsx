import React, { useState, useRef, useEffect } from 'react';
import { Priority } from '../types';

interface PriorityPickerProps {
  selectedPriority: Priority;
  onSelectPriority: (priority: Priority) => void;
}

interface PriorityOption {
  value: Priority;
  label: string;
  icon: string;
  description: string;
}

function PriorityPicker({ selectedPriority, onSelectPriority }: PriorityPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const priorities: PriorityOption[] = [
    { value: 'low', label: 'Low', icon: '🟢', description: 'No rush' },
    { value: 'medium', label: 'Medium', icon: '🟡', description: 'Moderate importance' },
    { value: 'high', label: 'High', icon: '🔴', description: 'Urgent' },
  ];

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

  const handleSelect = (value: Priority): void => {
    onSelectPriority(value);
    setIsOpen(false);
  };

  const getDisplayInfo = (): PriorityOption => {
    const priority = priorities.find(p => p.value === selectedPriority);
    return priority || priorities[1]; // Default to medium
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className="priority-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className={`priority-trigger priority-trigger-${selectedPriority}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="priority-trigger-icon">{displayInfo.icon}</span>
        <span className="priority-trigger-text">{displayInfo.label} Priority</span>
        <span className="priority-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="priority-dropdown">
          <div className="priority-header">
            <span className="priority-title">Select Priority</span>
          </div>

          <div className="priority-options">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                className={`priority-option priority-option-${priority.value} ${
                  selectedPriority === priority.value ? 'selected' : ''
                }`}
                onClick={() => handleSelect(priority.value)}
              >
                <span className="priority-option-icon">{priority.icon}</span>
                <div className="priority-option-content">
                  <span className="priority-option-label">{priority.label}</span>
                  <span className="priority-option-description">{priority.description}</span>
                </div>
                {selectedPriority === priority.value && (
                  <span className="priority-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PriorityPicker;
