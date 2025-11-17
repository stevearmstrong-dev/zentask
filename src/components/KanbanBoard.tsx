import React, { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  icon: string;
  accent: string;
}

const KANBAN_COLUMNS: ColumnDefinition[] = [
  {
    id: 'todo',
    title: 'To Do',
    description: 'Ideas and upcoming work',
    icon: '🧠',
    accent: '#73ABFF',
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    description: 'Currently active tasks',
    icon: '⚙️',
    accent: '#F5A524',
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Wrapped and celebrated',
    icon: '🎉',
    accent: '#4CAF50',
  },
];

const statusIds: TaskStatus[] = ['todo', 'inprogress', 'done'];

const getTaskStatus = (task: Task): TaskStatus => {
  if (task.status) return task.status;
  return task.completed ? 'done' : 'todo';
};

const formatDue = (task: Task): string | null => {
  if (!task.dueDate) return null;

  // Parse local date to avoid timezone shifts
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (!task.dueTime) return dateLabel;

  const [hours, minutes] = task.dueTime.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return `${dateLabel} · ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onToggleComplete,
  onDeleteTask,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const columnTasks = useMemo(() => {
    const bucket: Record<TaskStatus, Task[]> = {
      todo: [],
      inprogress: [],
      done: [],
    };

    tasks.forEach((task) => {
      const status = getTaskStatus(task);
      bucket[status].push(task);
    });

    return bucket;
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    if (typeof overId !== 'string' || !statusIds.includes(overId as TaskStatus)) return;

    const activeId = typeof active.id === 'string' ? active.id : String(active.id);
    if (!activeId.startsWith('task-')) return;

    const taskId = Number(activeId.replace('task-', ''));
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = overId as TaskStatus;
    const currentStatus = getTaskStatus(task);
    if (currentStatus === nextStatus) return;

    onStatusChange(taskId, nextStatus);
  };

  return (
    <div className="kanban-section">
      <div className="kanban-header">
        <div>
          <h2>Kanban Board</h2>
          <p>Drag tasks across columns to reflect their progress.</p>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks[column.id]}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

interface KanbanColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onToggleComplete,
  onDeleteTask,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className={`kanban-column ${isOver ? 'is-over' : ''}`}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <span className="kanban-column-icon" style={{ color: column.accent }}>
            {column.icon}
          </span>
          <div>
            <h3>{column.title}</h3>
            <p>{column.description}</p>
          </div>
        </div>
        <div
          className="kanban-column-count"
          style={{ background: column.accent }}
        >
          {tasks.length}
        </div>
      </div>

      <div className="kanban-tasks" ref={setNodeRef}>
        {tasks.length === 0 ? (
          <div className="kanban-empty">
            <p>No tasks here yet.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface KanbanTaskCardProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

const getRoundedTransform = (transform: { x: number; y: number } | null) => {
  if (!transform) return undefined;
  const x = Math.round(transform.x);
  const y = Math.round(transform.y);
  return `translate3d(${x}px, ${y}px, 0)`;
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
  });

  const style = transform
    ? {
        transform: getRoundedTransform(transform),
      }
    : undefined;

  const dueLabel = formatDue(task);

  return (
    <div
      className={`kanban-task ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="kanban-task-header">
        <span className="kanban-task-priority">{(task.priority || 'medium').toUpperCase()}</span>
        <div className="kanban-task-actions">
          <button
            className="kanban-task-btn"
            onClick={() => onToggleComplete(task.id)}
            title={task.completed ? 'Mark as Incomplete' : 'Mark as Done'}
            type="button"
          >
            {task.completed ? '↺' : '✓'}
          </button>
          <button
            className="kanban-task-btn danger"
            onClick={() => onDeleteTask(task.id)}
            title="Delete Task"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
      <p className="kanban-task-text">{task.text}</p>

      <div className="kanban-task-meta">
        {task.category && <span className="kanban-task-tag">{task.category}</span>}
        {dueLabel && <span className="kanban-task-due">{dueLabel}</span>}
        {task.scheduledDuration && (
          <span className="kanban-task-duration">{task.scheduledDuration} min planned</span>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
