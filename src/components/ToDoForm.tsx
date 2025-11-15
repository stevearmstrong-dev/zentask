import React, { useState } from 'react';
import { Priority, Recurrence } from '../types';
import CalendarPicker from './CalendarPicker';
import CategoryPicker from './CategoryPicker';
import TimePicker from './TimePicker';
import PriorityPicker from './PriorityPicker';
import ReminderPicker from './ReminderPicker';
import RecurrencePicker from './RecurrencePicker';
import VoiceInput from './VoiceInput';

interface NewTask {
  text: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  category: string;
  reminderMinutes: number | null;
  recurrence: Recurrence | null;
}

interface ToDoFormProps {
  addTask: (task: NewTask) => void;
}

function ToDoForm({ addTask }: ToDoFormProps) {
  const [input, setInput] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [reminderMinutes, setReminderMinutes] = useState<number | string>('15');
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const [voiceError, setVoiceError] = useState<string>('');

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getTodayLocalDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (input.trim()) {
      addTask({
        text: input,
        priority: priority,
        dueDate: dueDate || getTodayLocalDate(), // Default to today if no date selected
        dueTime: dueTime,
        category: category.trim(),
        reminderMinutes: reminderMinutes ? parseInt(reminderMinutes.toString()) : null,
        recurrence: recurrence
      });
      setInput('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setCategory('');
      setReminderMinutes('15');
      setRecurrence(null);
    }
  };

  const handleVoiceTranscript = (transcript: string): void => {
    setInput(transcript);
    setVoiceError('');
  };

  const handleInterimTranscript = (transcript: string): void => {
    // Update input with interim results in real-time
    setInput(transcript);
  };

  const handleVoiceError = (error: string): void => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(''), 5000);
  };

  const handleVoiceAddTask = (): void => {
    // Submit the form when voice "Add Task" button is clicked
    if (input.trim()) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
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

        <RecurrencePicker
          selectedRecurrence={recurrence}
          onSelectRecurrence={setRecurrence}
        />

        <button type="submit" className="todo-button">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default ToDoForm;
