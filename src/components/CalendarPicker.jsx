import React, { useState, useRef, useEffect } from 'react';

function CalendarPicker({ selectedDate, onSelectDate, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select date';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const selectedYear = currentMonth.getFullYear();
    const selectedMonth = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const selectedDay = String(day).padStart(2, '0');
    const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    onSelectDate(dateString);
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    if (!minDate) return false;

    const checkDate = new Date(year, month, day);
    const [minYear, minMonth, minDay] = minDate.split('-').map(Number);
    const minimumDate = new Date(minYear, minMonth - 1, minDay);

    return checkDate < minimumDate;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;

    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);
    return year === selectedYear && month === selectedMonth - 1 && day === selectedDay;
  };

  const isToday = (day) => {
    const today = new Date();
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  // Generate calendar grid
  const calendarDays = [];
  const totalSlots = 42; // 6 rows x 7 days

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isNextMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isNextMonth: false,
    });
  }

  // Next month days
  const remainingSlots = totalSlots - calendarDays.length;
  for (let day = 1; day <= remainingSlots; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isNextMonth: true,
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="calendar-picker-wrapper" ref={calendarRef}>
      <button
        type="button"
        className="calendar-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="calendar-icon">📅</span>
        <span className="calendar-display-date">{formatDisplayDate(selectedDate)}</span>
        <span className="calendar-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
            >
              ‹
            </button>
            <div className="calendar-month-year">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
            >
              ›
            </button>
          </div>

          <div className="calendar-weekdays">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {calendarDays.map((dayObj, index) => (
              <button
                key={index}
                type="button"
                className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${
                  isDateSelected(dayObj.day) && dayObj.isCurrentMonth ? 'selected' : ''
                } ${isToday(dayObj.day) && dayObj.isCurrentMonth ? 'today' : ''} ${
                  isDateDisabled(dayObj.day) && dayObj.isCurrentMonth ? 'disabled' : ''
                }`}
                onClick={() => dayObj.isCurrentMonth && !isDateDisabled(dayObj.day) && handleDateClick(dayObj.day)}
                disabled={!dayObj.isCurrentMonth || isDateDisabled(dayObj.day)}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPicker;
