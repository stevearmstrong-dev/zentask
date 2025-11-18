import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import TimePicker from './TimePicker';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: number, updates: Partial<Task>) => void;
  onFocus?: (task: Task) => void;
  onReorderDay: (dayKey: string, orderedIds: number[]) => void;
}

const DAYS_TO_SHOW = 7;
const DEFAULT_BLOCK_DURATION = 60;

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

const parseDayKey = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatRangeLabel = (start: Date, duration: number): string => {
  const end = new Date(start.getTime() + duration * 60000);
  const formatter = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${formatter(start)} → ${formatter(end)}`;
};

const formatTimeInput = (iso?: string): string => {
  if (!iso) return '09:00';
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onUpdateTask,
  onFocus,
  onReorderDay,
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
        .sort((a, b) => {
          if (a.scheduledStart && b.scheduledStart) {
            return new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
          }
          if (a.scheduledStart) return -1;
          if (b.scheduledStart) return 1;
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        gotoDay(days.findIndex((day) => day.key === selectedDay) - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        gotoDay(days.findIndex((day) => day.key === selectedDay) + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [days, selectedDay]);

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

      <UpcomingDayPanel
        dayKey={selectedDay}
        display={days.find((day) => day.key === selectedDay)?.display || ''}
        tasks={selectedTasks}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        onFocus={onFocus}
        composerValue={composerValue}
        onComposerChange={setComposerValue}
        onAddTask={handleAddTask}
        sensors={sensors}
        onUpdateTask={onUpdateTask}
        onReorder={onReorderDay}
      />
    </div>
  );
};

interface UpcomingDayPanelProps {
  dayKey: string;
  display: string;
  tasks: Task[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onAddTask: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  sensors: ReturnType<typeof useSensors>;
  onReorder: (dayKey: string, order: number[]) => void;
  onUpdateTask: (taskId: number, updates: Partial<Task>) => void;
  onFocus?: (task: Task) => void;
}

const UpcomingDayPanel: React.FC<UpcomingDayPanelProps> = ({
  dayKey,
  display,
  tasks,
  composerValue,
  onComposerChange,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  sensors,
  onReorder,
  onUpdateTask,
  onFocus,
}) => {
  const scheduledTasks = tasks.filter((task) => !!task.scheduledStart);
  const unscheduledTasks = tasks.filter((task) => !task.scheduledStart);
  const unscheduledIds = unscheduledTasks.map((task) => `unscheduled-task-${task.id}`);
  const [voiceError] = useState('');

  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [editorStart, setEditorStart] = useState('09:00');
  const [editorDuration, setEditorDuration] = useState(String(DEFAULT_BLOCK_DURATION));

  const openEditor = (task: Task): void => {
    setEditorTask(task);
    setEditorStart(formatTimeInput(task.scheduledStart));
    setEditorDuration(String(task.scheduledDuration || DEFAULT_BLOCK_DURATION));
  };

  const closeEditor = (): void => {
    setEditorTask(null);
    setEditorStart('09:00');
    setEditorDuration(String(DEFAULT_BLOCK_DURATION));
  };

  const saveEditor = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!editorTask) return;
    const timeValue = editorStart && editorStart.includes(':') ? editorStart : '09:00';
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const startDate = parseDayKey(dayKey);
    startDate.setHours(hours, minutes, 0, 0);
    const duration = Math.max(15, parseInt(editorDuration, 10) || DEFAULT_BLOCK_DURATION);
    onUpdateTask(editorTask.id, {
      scheduledStart: startDate.toISOString(),
      scheduledDuration: duration,
      dueDate: dayKey,
    });
    closeEditor();
  };

  const unscheduleTask = (task: Task): void => {
    onUpdateTask(task.id, {
      scheduledStart: undefined,
      scheduledDuration: undefined,
      dueDate: dayKey,
    });
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (unscheduledIds.includes(activeId) && unscheduledIds.includes(overId)) {
      const oldIndex = unscheduledIds.indexOf(activeId);
      const newIndex = unscheduledIds.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedIds = arrayMove(unscheduledIds, oldIndex, newIndex).map((id) =>
          Number(id.replace('unscheduled-task-', ''))
        );
        onReorder(dayKey, reorderedIds);
      }
    }
  };


  return (
    <div className="upcoming-day-panel">
      <div className="upcoming-day-title">{display}</div>

      <section className="scheduled-section">
        <div className="scheduled-section-header">
          <div>
            <h4>Time blocks</h4>
            <p>All scheduled tasks for this day.</p>
          </div>
          <span className="scheduled-count">{scheduledTasks.length}</span>
        </div>
        {scheduledTasks.length === 0 ? (
          <div className="upcoming-day-empty">
            <p>No time blocks yet. Add one from below.</p>
          </div>
        ) : (
          <div className="scheduled-list">
            {scheduledTasks.map((task) => (
              <ScheduledTaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onFocus={onFocus}
                onEdit={() => openEditor(task)}
                onUnschedule={() => unscheduleTask(task)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="upcoming-unscheduled">
        <div className="unscheduled-header">
          <div>
            <h4>Unscheduled</h4>
            <p>Keep tasks here until you assign a time block.</p>
          </div>
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={unscheduledIds} strategy={verticalListSortingStrategy}>
            {unscheduledTasks.length === 0 ? (
              <div className="upcoming-day-empty">
                <p>Everything for this day is scheduled. 🎉</p>
              </div>
            ) : (
              <div className="unscheduled-list">
                {unscheduledTasks.map((task) => (
                  <UnscheduledTaskRow
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    onFocus={onFocus}
                    onSchedule={() => openEditor(task)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      </section>

      {editorTask && (
        <div className="time-block-editor-overlay" onClick={closeEditor}>
          <form
            className="time-block-editor"
            onSubmit={saveEditor}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="editor-header">
              <div>
                <p className="editor-label">Scheduling</p>
                <h5>{editorTask.text}</h5>
              </div>
              <button className="editor-cancel" type="button" onClick={closeEditor}>
                ×
              </button>
            </div>
            <div className="editor-fields">
              <div className="editor-field">
                <label htmlFor="upcoming-time-picker">Start time</label>
                <TimePicker
                  selectedTime={editorStart}
                  onSelectTime={(time) => setEditorStart(time || '')}
                />
              </div>
              <div className="editor-field">
                <label htmlFor="upcoming-duration-input">Duration (minutes)</label>
                <input
                  id="upcoming-duration-input"
                  type="number"
                  min={15}
                  step={15}
                  value={editorDuration}
                  onChange={(event) => setEditorDuration(event.target.value)}
                />
              </div>
            </div>
            <div className="editor-actions">
              <button type="submit">Save block</button>
              <button type="button" onClick={closeEditor}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <form className="upcoming-add-form" onSubmit={onAddTask}>
        <input
          type="text"
          placeholder="Add task"
          value={composerValue}
          onChange={(event) => onComposerChange(event.target.value)}
        />
        <div className="upcoming-add-actions">
          <button type="submit">Add</button>
          <button type="button" onClick={() => onComposerChange('')}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

interface ScheduledTaskCardProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFocus?: (task: Task) => void;
  onEdit: () => void;
  onUnschedule: () => void;
}

const ScheduledTaskCard: React.FC<ScheduledTaskCardProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
  onFocus,
  onEdit,
  onUnschedule,
}) => {
  if (!task.scheduledStart) return null;
  const startDate = new Date(task.scheduledStart);
  const range = formatRangeLabel(startDate, task.scheduledDuration || DEFAULT_BLOCK_DURATION);

  return (
    <div className="scheduled-card">
      <div className="scheduled-card-info">
        <span className="time-badge">{range}</span>
        <div>
          <p className="scheduled-card-title">{task.text}</p>
          <div className="scheduled-card-meta">
            <span className={`priority-chip priority-${task.priority}`}>
              {task.priority.toUpperCase()}
            </span>
            {task.category && <span className="category-chip">{task.category}</span>}
            {task.scheduledDuration && <span className="duration-chip">{task.scheduledDuration} min</span>}
          </div>
        </div>
      </div>
      <div className="scheduled-card-actions">
        {onFocus && !task.completed && (
          <button className="scheduled-card-btn" type="button" onClick={() => onFocus(task)} title="Focus mode">
            🎯
          </button>
        )}
        <button
          className="scheduled-card-btn"
          type="button"
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          onClick={() => onToggleComplete(task.id)}
        >
          {task.completed ? '↺' : '✓'}
        </button>
        <button className="scheduled-card-btn" type="button" onClick={onEdit} title="Edit time block">
          ✏️
        </button>
        <button className="scheduled-card-btn" type="button" onClick={onUnschedule} title="Unassign time">
          ⏏
        </button>
        <button className="scheduled-card-btn danger" type="button" onClick={() => onDeleteTask(task.id)} title="Delete task">
          ✕
        </button>
      </div>
    </div>
  );
};

interface UnscheduledTaskRowProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onSchedule: () => void;
  onFocus?: (task: Task) => void;
}

const UnscheduledTaskRow: React.FC<UnscheduledTaskRowProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
  onSchedule,
  onFocus,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `unscheduled-task-${task.id}`,
    data: { task, source: 'unscheduled' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={`upcoming-task unscheduled ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
            <button className="upcoming-task-btn" onClick={onSchedule} title="Assign time block" type="button">
              ⏱
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
          {!task.scheduledStart && <span className="unscheduled-flag">Unscheduled</span>}
        </div>
      </div>
    </div>
  );
};

export default UpcomingView;
