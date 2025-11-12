import React, { useState } from 'react';

function ToDoForm({ addTask }) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('15');

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addTask({
        text: input,
        priority: priority,
        dueDate: dueDate,
        dueTime: dueTime,
        category: category.trim(),
        reminderMinutes: reminderMinutes ? parseInt(reminderMinutes) : null
      });
      setInput('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setCategory('');
      setReminderMinutes('15');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          className="todo-input"
          placeholder="Add a new task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
      </div>

      <div className="form-row form-options">
        <select
          className="todo-select priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <input
          type="date"
          className="todo-date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={getTodayLocalDate()}
          placeholder="Due date"
        />

        <input
          type="time"
          className="todo-time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          placeholder="Time"
        />

        <input
          type="text"
          className="todo-category"
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <select
          className="todo-select reminder-select"
          value={reminderMinutes}
          onChange={(e) => setReminderMinutes(e.target.value)}
        >
          <option value="">No Reminder</option>
          <option value="5">5 min before</option>
          <option value="15">15 min before</option>
          <option value="30">30 min before</option>
          <option value="60">1 hour before</option>
          <option value="1440">1 day before</option>
        </select>

        <button type="submit" className="todo-button">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default ToDoForm;
