import React, { useState } from 'react';
import { Task, Priority } from '../types';
import CalendarPicker from './CalendarPicker';
import CategoryPicker from './CategoryPicker';
import TimePicker from './TimePicker';
import PriorityPicker from './PriorityPicker';
import ReminderPicker from './ReminderPicker';
import TimeTracker from './TimeTracker';

interface ToDoProps {
  task: Task;
  toggleComplete: (id: number) => void;
  deleteTask: (id: number) => void;
  editTask: (id: number, updates: Partial<Task>) => void;
  onUpdateTime: (id: number, timeSpent: number) => void;
}

function ToDo({ task, toggleComplete, deleteTask, editTask, onUpdateTime }: ToDoProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate || '');
  const [editDueTime, setEditDueTime] = useState<string>(task.dueTime || '');
  const [editCategory, setEditCategory] = useState<string>(task.category || '');
  const [editReminderMinutes, setEditReminderMinutes] = useState<number | string>(task.reminderMinutes || '');

  const handleEdit = (): void => {
    if (editValue.trim()) {
      editTask(task.id, {
        text: editValue,
        priority: editPriority,
        dueDate: editDueDate,
        dueTime: editDueTime,
        category: editCategory.trim(),
        reminderMinutes: editReminderMinutes ? parseInt(editReminderMinutes.toString()) : null
      });
      setIsEditing(false);
    }
  };

  const handleCancel = (): void => {
    setEditValue(task.text);
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
    setEditCategory(task.category || '');
    setEditReminderMinutes(task.reminderMinutes || '');
    setIsEditing(false);
  };

  const getPriorityClass = (): string => {
    return `priority-${task.priority || 'medium'}`;
  };

  const isOverdue = (): boolean => {
    if (!task.dueDate || task.completed) return false;

    const now = new Date();
    // Parse date string in local timezone to avoid UTC conversion issues
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const dueDateTime = new Date(year, month - 1, day);

    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return dueDateTime < now;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    // Parse date string in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getReminderText = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min before`;
    if (minutes === 60) return '1 hour before';
    if (minutes === 1440) return '1 day before';
    return `${Math.floor(minutes / 60)} hours before`;
  };

  return (
    <div className={`todo-item ${task.completed ? 'completed' : ''} ${getPriorityClass()} ${isOverdue() ? 'overdue' : ''}`}>
      {isEditing ? (
        <div className="todo-edit">
          <input
            type="text"
            className="todo-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
          />
          <div className="edit-options">
            <PriorityPicker
              selectedPriority={editPriority}
              onSelectPriority={setEditPriority}
            />
            <CalendarPicker
              selectedDate={editDueDate}
              onSelectDate={setEditDueDate}
              minDate=""
            />
            <TimePicker
              selectedTime={editDueTime}
              onSelectTime={setEditDueTime}
            />
            <CategoryPicker
              selectedCategory={editCategory}
              onSelectCategory={setEditCategory}
            />
            <ReminderPicker
              selectedReminder={editReminderMinutes}
              onSelectReminder={setEditReminderMinutes}
            />
          </div>
          <div className="todo-edit-actions">
            <button className="btn-save" onClick={handleEdit}>
              Save
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-content">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />
            <div className="todo-details">
              <div className="todo-text-row">
                <span className="todo-text">{task.text}</span>
                {task.recurrence && (
                  <span className="recurring-indicator">
                    <span className="recurring-indicator-icon">🔄</span>
                    {task.recurrence === 'daily' && 'Daily'}
                    {task.recurrence === 'weekly' && 'Weekly'}
                    {task.recurrence === 'biweekly' && 'Biweekly'}
                    {task.recurrence === 'monthly' && 'Monthly'}
                    {task.recurrence === 'yearly' && 'Yearly'}
                  </span>
                )}
                <span className={`priority-badge priority-badge-${task.priority || 'medium'}`}>
                  {(task.priority || 'medium').toUpperCase()}
                </span>
              </div>
              <div className="todo-meta">
                {task.category && (
                  <span className="category-tag">
                    {task.category}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`due-date ${isOverdue() ? 'overdue-text' : ''}`}>
                    Due: {formatDate(task.dueDate)}
                    {task.dueTime && ` at ${formatTime(task.dueTime)}`}
                    {isOverdue() && ' ⚠️'}
                  </span>
                )}
                {task.reminderMinutes && !task.completed && (
                  <span className="reminder-badge">
                    🔔 {getReminderText(task.reminderMinutes)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <TimeTracker task={task} onUpdateTime={onUpdateTime} />
          <div className="todo-actions">
            <button
              className="btn-edit"
              onClick={() => setIsEditing(true)}
              disabled={task.completed}
            >
              Edit
            </button>
            <button className="btn-delete" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ToDo;
