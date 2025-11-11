import React, { useState } from 'react';

function ToDo({ task, toggleComplete, deleteTask, editTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editDueTime, setEditDueTime] = useState(task.dueTime || '');
  const [editCategory, setEditCategory] = useState(task.category || '');
  const [editReminderMinutes, setEditReminderMinutes] = useState(task.reminderMinutes || '');

  const handleEdit = () => {
    if (editValue.trim()) {
      editTask(task.id, {
        text: editValue,
        priority: editPriority,
        dueDate: editDueDate,
        dueTime: editDueTime,
        category: editCategory.trim(),
        reminderMinutes: editReminderMinutes ? parseInt(editReminderMinutes) : null
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(task.text);
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
    setEditCategory(task.category || '');
    setEditReminderMinutes(task.reminderMinutes || '');
    setIsEditing(false);
  };

  const getPriorityClass = () => {
    return `priority-${task.priority || 'medium'}`;
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;

    const now = new Date();
    const dueDateTime = new Date(task.dueDate);

    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return dueDateTime < now;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getReminderText = (minutes) => {
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
            <select
              className="todo-select-edit"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              className="todo-date-edit"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
            <input
              type="time"
              className="todo-time-edit"
              value={editDueTime}
              onChange={(e) => setEditDueTime(e.target.value)}
            />
            <input
              type="text"
              className="todo-category-edit"
              placeholder="Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            />
            <select
              className="todo-select-edit"
              value={editReminderMinutes}
              onChange={(e) => setEditReminderMinutes(e.target.value)}
            >
              <option value="">No Reminder</option>
              <option value="5">5 min before</option>
              <option value="15">15 min before</option>
              <option value="30">30 min before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
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
