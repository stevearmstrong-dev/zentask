import React, { useState } from 'react';
import CalendarPicker from './CalendarPicker';
import CategoryPicker from './CategoryPicker';
import TimePicker from './TimePicker';
import PriorityPicker from './PriorityPicker';
import ReminderPicker from './ReminderPicker';
import VoiceInput from './VoiceInput';

function ToDoForm({ addTask }) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('15');
  const [voiceError, setVoiceError] = useState('');

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
        dueDate: dueDate || getTodayLocalDate(), // Default to today if no date selected
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

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    setVoiceError('');
  };

  const handleInterimTranscript = (transcript) => {
    // Update input with interim results in real-time
    setInput(transcript);
  };

  const handleVoiceError = (error) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(''), 5000);
  };

  const handleVoiceAddTask = () => {
    // Submit the form when voice "Add Task" button is clicked
    if (input.trim()) {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="input-with-voice">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            onInterimTranscript={handleInterimTranscript}
            onError={handleVoiceError}
            onAddTask={handleVoiceAddTask}
          />
        </div>
        {voiceError && <p className="voice-error">{voiceError}</p>}
      </div>

      <div className="form-row form-options">
        <PriorityPicker
          selectedPriority={priority}
          onSelectPriority={setPriority}
        />

        <CalendarPicker
          selectedDate={dueDate}
          onSelectDate={setDueDate}
          minDate={getTodayLocalDate()}
        />

        <TimePicker
          selectedTime={dueTime}
          onSelectTime={setDueTime}
        />

        <CategoryPicker
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        <ReminderPicker
          selectedReminder={reminderMinutes}
          onSelectReminder={setReminderMinutes}
        />

        <button type="submit" className="todo-button">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default ToDoForm;
