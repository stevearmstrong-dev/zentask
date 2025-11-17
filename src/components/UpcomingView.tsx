import React, { useMemo } from 'react';
import { Task } from '../types';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFocus?: (task: Task) => void;
}

const DAYS_TO_SHOW = 7;

const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseTaskDate = (task: Task): Date | null => {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const deriveDisplayTime = (task: Task): string => {
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

const getSortValue = (task: Task, dayStart: Date): number => {
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    return hours * 60 + minutes;
  }

  if (task.scheduledStart) {
    const scheduled = new Date(task.scheduledStart);
    if (getStartOfDay(scheduled).getTime() === dayStart.getTime()) {
      return scheduled.getHours() * 60 + scheduled.getMinutes();
    }
  }

  return Number.POSITIVE_INFINITY;
};

const formatDayLabel = (date: Date, today: Date): string => {
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onFocus,
}) => {
  const today = getStartOfDay(new Date());

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
      const day = new Date(today);
      day.setDate(day.getDate() + index);
      return day;
    });
  }, [today]);

  const tasksByDay = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      const taskDate = parseTaskDate(task);
      if (!taskDate) return;
      if (taskDate < today) return; // skip past tasks

      const key = task.dueDate as string;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [tasks, today]);

  const hasUpcomingTasks = Object.keys(tasksByDay).length > 0;

  return (
    <div className="upcoming-view">
      <div className="upcoming-header">
        <div>
          <h2>Upcoming</h2>
          <p>Plan the rest of your week, Todoist style.</p>
        </div>
      </div>

      {!hasUpcomingTasks && (
        <div className="upcoming-empty">
          <div className="upcoming-empty-icon">🌤️</div>
          <h3>No future tasks scheduled</h3>
          <p>Add due dates and times to see them here.</p>
        </div>
      )}

      <div className="upcoming-days">
        {days.map((day) => {
          const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
          const dayTasks = (tasksByDay[dayKey] || []).sort(
            (a, b) => getSortValue(a, day) - getSortValue(b, day)
          );

          return (
            <div className="upcoming-day" key={dayKey}>
              <div className="upcoming-day-header">
                <div>
                  <p className="upcoming-day-label">{formatDayLabel(day, today)}</p>
                  <h3 className="upcoming-day-date">{formatFullDate(day)}</h3>
                </div>
                <span className="upcoming-day-count">{dayTasks.length}</span>
              </div>

              {dayTasks.length === 0 ? (
                <div className="upcoming-day-empty">
                  <p>No tasks scheduled</p>
                </div>
              ) : (
                <div className="upcoming-day-schedule">
                  {dayTasks.map((task) => (
                    <div className="upcoming-task" key={task.id}>
                      <div className="upcoming-task-time">{deriveDisplayTime(task)}</div>
                      <div className="upcoming-task-card">
                        <div className="upcoming-task-header">
                          <span className="upcoming-task-title">{task.text}</span>
                          <div className="upcoming-task-actions">
                            {onFocus && !task.completed && (
                              <button
                                className="upcoming-task-btn"
                                onClick={() => onFocus(task)}
                                title="Focus mode"
                              >
                                🎯
                              </button>
                            )}
                            <button
                              className="upcoming-task-btn"
                              onClick={() => onToggleComplete(task.id)}
                              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {task.completed ? '↺' : '✓'}
                            </button>
                            <button
                              className="upcoming-task-btn danger"
                              onClick={() => onDeleteTask(task.id)}
                              title="Delete"
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingView;
