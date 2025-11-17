import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (taskData: Partial<Task>) => void;
  onTaskDrop: (payload: {
    taskId: number;
    sourceDate: string;
    targetDate: string;
    targetIndex: number;
  }) => void;
  onFocus?: (task: Task) => void;
}

const DAYS_TO_SHOW = 7;

const getStartOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDisplayLabel = (date: Date, base: Date): string => {
  const diffDays = Math.round((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Tomorrow';
  if (diffDays === 1) return 'In 2 days';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatFullDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
  onTaskDrop,
  onFocus,
}) => {
  const today = getStartOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + index);
      return {
        key: formatKey(date),
        date,
        navLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        display: formatFullDate(date),
      };
    });
  }, [tomorrow]);

  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.key || '');
  const [composerValue, setComposerValue] = useState('');
  const navRef = React.useRef<HTMLDivElement | null>(null);

  const tasksByDay = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const effectiveDate = getEffectiveDate(task);
      if (!effectiveDate) return;
      const dayStart = getStartOfDay(effectiveDate);
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

  const visibleDays = days;

  const selectedTasks = tasksByDay[selectedDay] || [];

  React.useEffect(() => {
    if (visibleDays.length === 0) return;
    if (!visibleDays.some((day) => day.key === selectedDay)) {
      setSelectedDay(visibleDays[0].key);
    }
  }, [visibleDays, selectedDay]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const currentIndex = days.findIndex((day) => day.key === selectedDay);
      if (currentIndex === -1) return;
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedDay(days[currentIndex - 1].key);
        navRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
      }
      if (event.key === 'ArrowRight' && currentIndex < days.length - 1) {
        setSelectedDay(days[currentIndex + 1].key);
        navRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [days, selectedDay]);

  React.useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector<HTMLButtonElement>(`[data-day-key="${selectedDay}"]`);
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedDay]);

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const value = composerValue.trim();
    if (!value || !selectedDay) return;
    const sortOrder = selectedTasks.length;
    onAddTask({
      text: value,
      dueDate: selectedDay,
      sortOrder,
    });
    setComposerValue('');
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.data.current?.taskId as number | undefined;
    const sourceDay = active.data.current?.dayKey as string | undefined;
    if (!taskId || !sourceDay) return;

    let targetDay = sourceDay;
    let targetIndex: number | null = null;

    const overType = over.data?.current?.type as string | undefined;
    if (overType === 'task') {
      targetDay = over.data!.current!.dayKey;
      const overTaskId = over.data!.current!.taskId as number;
      const dayTasks = (tasksByDay[targetDay] || []).filter((task) => task.id !== taskId);
      const idx = dayTasks.findIndex((task) => task.id === overTaskId);
      targetIndex = idx >= 0 ? idx : dayTasks.length;
    } else if (overType === 'day-list') {
      targetDay = over.data!.current!.dayKey;
      targetIndex = (tasksByDay[targetDay] || []).filter((task) => task.id !== taskId).length;
    } else if (overType === 'nav') {
      targetDay = over.data!.current!.dayKey;
      targetIndex = (tasksByDay[targetDay] || []).filter((task) => task.id !== taskId).length;
    } else {
      return;
    }

    onTaskDrop({
      taskId,
      sourceDate: sourceDay,
      targetDate: targetDay,
      targetIndex: targetIndex ?? 0,
    });
  };

  return (
    <div className="upcoming-view">
      <div className="upcoming-header">
        <div>
          <h2>Upcoming</h2>
          <p>Tap a day to review and rearrange what’s ahead.</p>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="upcoming-nav-wrapper">
          <button
            type="button"
            className="nav-arrow"
            disabled={selectedDay === days[0]?.key}
            onClick={() => {
              const currentIndex = days.findIndex((day) => day.key === selectedDay);
              const nextIndex = Math.max(0, currentIndex - 1);
              setSelectedDay(days[nextIndex].key);
              navRef.current?.scrollBy({ left: -100, behavior: 'smooth' });
            }}
          >
            ←
          </button>
          <div className="upcoming-nav" ref={navRef}>
            {visibleDays.map((day) => (
              <NavDayButton
                key={day.key}
                day={day}
                isSelected={day.key === selectedDay}
                onSelect={() => setSelectedDay(day.key)}
              />
            ))}
          </div>
          <button
            type="button"
            className="nav-arrow"
            disabled={selectedDay === days[days.length - 1]?.key}
            onClick={() => {
              const currentIndex = days.findIndex((day) => day.key === selectedDay);
              const nextIndex = Math.min(days.length - 1, currentIndex + 1);
              setSelectedDay(days[nextIndex].key);
              navRef.current?.scrollBy({ left: 100, behavior: 'smooth' });
            }}
          >
            →
          </button>
        </div>

        <UpcomingDayPanel
          dayKey={selectedDay}
          display={days.find((d) => d.key === selectedDay)?.display || ''}
          tasks={selectedTasks}
          composerValue={composerValue}
          onComposerChange={setComposerValue}
          onAddTask={handleAddTask}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onFocus={onFocus}
        />
      </DndContext>
    </div>
  );
};

interface NavDayButtonProps {
  day: { key: string; date: Date; navLabel: string };
  isSelected: boolean;
  onSelect: () => void;
}

const NavDayButton: React.FC<NavDayButtonProps> = ({ day, isSelected, onSelect }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `nav-${day.key}`,
    data: { type: 'nav', dayKey: day.key },
  });

  return (
    <button
      ref={setNodeRef}
      className={`upcoming-nav-item ${isSelected ? 'selected' : ''} ${isOver ? 'drop' : ''}`}
      onClick={onSelect}
      type="button"
      data-day-key={day.key}
    >
      <span className="upcoming-nav-weekday">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
      <span className="upcoming-nav-date">{day.date.getDate()}</span>
    </button>
  );
};

interface UpcomingDayPanelProps {
  dayKey: string;
  display: string;
  tasks: Task[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onAddTask: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
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
  onFocus,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${dayKey}`,
    data: { type: 'day-list', dayKey },
  });

  const items: UniqueIdentifier[] = tasks.map((task) => `task-${task.id}`);

  return (
    <div className="upcoming-day-panel">
      <div className="upcoming-day-title">{display}</div>

      <div className={`upcoming-day-schedule single ${isOver ? 'drop-highlight' : ''}`} ref={setNodeRef}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="upcoming-day-empty">
              <p>No tasks scheduled</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                dayKey={dayKey}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onFocus={onFocus}
              />
            ))
          )}
        </SortableContext>
      </div>

      <form className="upcoming-add-form" onSubmit={onAddTask}>
        <input
          type="text"
          placeholder="Add task"
          value={composerValue}
          onChange={(e) => onComposerChange(e.target.value)}
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

interface SortableTaskRowProps {
  task: Task;
  dayKey: string;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFocus?: (task: Task) => void;
}

const SortableTaskRow: React.FC<SortableTaskRowProps> = ({
  task,
  dayKey,
  onToggleComplete,
  onDeleteTask,
  onFocus,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: 'task', dayKey, taskId: task.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={`upcoming-task ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
          {task.scheduledDuration && <span className="duration-chip">{task.scheduledDuration} min</span>}
        </div>
      </div>
    </div>
  );
};

export default UpcomingView;
