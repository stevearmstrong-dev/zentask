import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Task } from '../types';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (task: Partial<Task>) => void;
  onFocus?: (task: Task) => void;
}

const DAYS_TO_SHOW = 7;

const getStartOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatFullDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const formatTime = (task: Task): string => {
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (task.scheduledStart) {
    const date = new Date(task.scheduledStart);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return 'All day';
};

const getEffectiveDate = (task: Task): Date | null => {
  if (task.dueDate) {
    const [year, month, day] = task.dueDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  if (task.scheduledStart) {
    return new Date(task.scheduledStart);
  }
  return null;
};

const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onFocus,
}) => {
  const today = getStartOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + index);
      return {
        key: formatKey(date),
        date,
        display: formatFullDate(date),
      };
    });
  }, [tomorrow]);

  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.key || '');
  const [composerValue, setComposerValue] = useState('');
  const navRef = useRef<HTMLDivElement | null>(null);

  const tasksByDay = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const date = getEffectiveDate(task);
      if (!date) return;
      const dayStart = getStartOfDay(date);
      if (dayStart < tomorrow) return;
      const key = formatKey(dayStart);
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key]
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    });
    return groups;
  }, [tasks, tomorrow]);

  const selectedTasks = tasksByDay[selectedDay] || [];

  useEffect(() => {
    if (days.length === 0) return;
    if (!days.some((day) => day.key === selectedDay)) {
      setSelectedDay(days[0].key);
    }
  }, [days, selectedDay]);

  useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector<HTMLButtonElement>(`[data-day-key="${selectedDay}"]`);
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedDay]);

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!composerValue.trim()) return;
    onAddTask({ text: composerValue.trim(), dueDate: selectedDay, sortOrder: selectedTasks.length });
    setComposerValue('');
  };

  const gotoDay = (index: number): void => {
    const nextIndex = Math.min(Math.max(index, 0), days.length - 1);
    setSelectedDay(days[nextIndex].key);
  };

  return (
    <div className="upcoming-view">
      <div className="upcoming-header">
        <div>
          <h2>Upcoming</h2>
          <p>Tap a day to review and plan the week ahead.</p>
        </div>
      </div>

      <div className="upcoming-nav-wrapper">
        <button
          type="button"
          className="nav-arrow"
          onClick={() => gotoDay(days.findIndex((day) => day.key === selectedDay) - 1)}
          disabled={selectedDay === days[0]?.key}
        >
          ←
        </button>
        <div className="upcoming-nav" ref={navRef}>
          {days.map((day) => (
            <button
              key={day.key}
              className={`upcoming-nav-item ${selectedDay === day.key ? 'selected' : ''}`}
              type="button"
              data-day-key={day.key}
              onClick={() => setSelectedDay(day.key)}
            >
              <span className="upcoming-nav-weekday">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="upcoming-nav-date">{day.date.getDate()}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="nav-arrow"
          onClick={() => gotoDay(days.findIndex((day) => day.key === selectedDay) + 1)}
          disabled={selectedDay === days[days.length - 1]?.key}
        >
          →
        </button>
      </div>

      <div className="upcoming-day-panel">
        <div className="upcoming-day-title">
          {days.find((day) => day.key === selectedDay)?.display || ''}
        </div>

        <div className="upcoming-day-schedule single">
          {selectedTasks.length === 0 ? (
            <div className="upcoming-day-empty">
              <p>No tasks scheduled</p>
            </div>
          ) : (
            selectedTasks.map((task) => (
              <div className="upcoming-task" key={task.id}>
                <div className="upcoming-task-time">{formatTime(task)}</div>
                <div className="upcoming-task-card">
                  <div className="upcoming-task-header">
                    <span className="upcoming-task-title">{task.text}</span>
                    <div className="upcoming-task-actions">
                      {onFocus && !task.completed && (
                        <button
                          className="upcoming-task-btn"
                          onClick={() => onFocus(task)}
                          title="Focus mode"
                          type="button"
                        >
                          🎯
                        </button>
                      )}
                      <button
                        className="upcoming-task-btn"
                        onClick={() => onToggleComplete(task.id)}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        type="button"
                      >
                        {task.completed ? '↺' : '✓'}
                      </button>
                      <button
                        className="upcoming-task-btn danger"
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="upcoming-task-meta">
                    <span className={`priority-chip priority-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    {task.category && <span className="category-chip">{task.category}</span>}
                    {task.scheduledDuration && (
                      <span className="duration-chip">{task.scheduledDuration} min</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="upcoming-add-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add task"
            value={composerValue}
            onChange={(event) => setComposerValue(event.target.value)}
          />
          <div className="upcoming-add-actions">
            <button type="submit">Add</button>
            <button type="button" onClick={() => setComposerValue('')}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpcomingView;
