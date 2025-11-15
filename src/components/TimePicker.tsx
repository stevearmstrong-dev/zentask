import React, { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

interface ClockPosition {
  x: number;
  y: number;
}

function TimePicker({ selectedTime, onSelectTime }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [selectingMinutes, setSelectingMinutes] = useState<boolean>(false);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Initialize from selectedTime prop
  useEffect(() => {
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const hourNum = parseInt(hours);
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayPeriod: 'AM' | 'PM' = hourNum >= 12 ? 'PM' : 'AM';

      setHour(displayHour);
      setMinute(parseInt(minutes));
      setPeriod(displayPeriod);
    }
  }, [selectedTime]);

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingMinutes(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayTime = (timeString?: string): string => {
    if (!timeString) return 'Select time';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const handleHourClick = (selectedHour: number): void => {
    setHour(selectedHour);
    setSelectingMinutes(true);
  };

  const handleMinuteClick = (selectedMinute: number): void => {
    setMinute(selectedMinute);
  };

  const applyTime = (h: number = hour, m: number = minute, p: 'AM' | 'PM' = period): void => {
    let hours = h;
    if (p === 'PM' && hours !== 12) {
      hours += 12;
    } else if (p === 'AM' && hours === 12) {
      hours = 0;
    }

    const timeString = `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onSelectTime(timeString);
    setIsOpen(false);
    setSelectingMinutes(false);
  };

  const handleApply = (): void => {
    applyTime();
  };

  const handleClear = (): void => {
    onSelectTime('');
    setIsOpen(false);
    setSelectingMinutes(false);
  };

  const handleBack = (): void => {
    setSelectingMinutes(false);
  };

  // Generate clock positions for hours (12 numbers in a circle)
  const getClockPosition = (value: number, total: number = 12): ClockPosition => {
    // Adjust for 12-hour clock (12 should be at top, not 0)
    const adjustedValue = value === 12 ? 0 : value;
    const angle = (adjustedValue * 360) / total - 90;
    const radian = (angle * Math.PI) / 180;
    const radius = 72; // Reduced from 85 to prevent circles from being cut off at edges
    const x = 100 + radius * Math.cos(radian);
    const y = 100 + radius * Math.sin(radian);
    return { x, y };
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteIntervals = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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
            <span className="time-picker-title">
              {selectingMinutes ? 'Select Minute' : 'Select Hour'}
            </span>
            {selectingMinutes && (
              <button
                type="button"
                className="time-back-btn"
                onClick={handleBack}
              >
                ← Back
              </button>
            )}
          </div>

          {!selectingMinutes ? (
            <>
              {/* Hour Clock Face */}
              <div className="clock-container">
                <svg className="clock-face" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#73ABFF', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#5A8FE6', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(115, 171, 255, 0.2)"
                    strokeWidth="2"
                  />
                  {hours.map((h) => {
                    const pos = getClockPosition(h);
                    const isSelected = hour === h;
                    return (
                      <g key={h}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          className={`clock-number ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleHourClick(h)}
                          style={{ cursor: 'pointer' }}
                        />
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`clock-text ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleHourClick(h)}
                          style={{ cursor: 'pointer', pointerEvents: 'none' }}
                        >
                          {h}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* AM/PM Toggle */}
                <div className="period-toggle-clock">
                  <button
                    type="button"
                    className={`period-btn ${period === 'AM' ? 'selected' : ''}`}
                    onClick={() => setPeriod('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`period-btn ${period === 'PM' ? 'selected' : ''}`}
                    onClick={() => setPeriod('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Minute Selection - Grid of buttons */}
              <div className="minute-grid">
                {minuteIntervals.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`minute-btn ${minute === m ? 'selected' : ''}`}
                    onClick={() => handleMinuteClick(m)}
                  >
                    :{String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>

              {/* AM/PM Toggle for Minutes View */}
              <div className="period-toggle-minutes">
                <button
                  type="button"
                  className={`period-btn ${period === 'AM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={`period-btn ${period === 'PM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>

              <div className="time-current-selection">
                Selected: {hour}:{String(minute).padStart(2, '0')} {period}
              </div>
            </>
          )}

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
              disabled={!selectingMinutes}
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
