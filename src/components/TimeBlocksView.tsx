import React, { useState } from 'react';
import { Task } from '../types';
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TimeBlockEditor from './TimeBlockEditor';

interface TimeBlocksViewProps {
  tasks: Task[];
  onUpdateTask: (id: number, updates: Partial<Task>) => void;
  onTaskClick: (task: Task) => void;
}

// Draggable Task Component
interface DraggableTaskProps {
  task: Task;
  getPriorityColor: (priority: string) => string;
}

function DraggableTask({ task, getPriorityColor }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task, type: 'unscheduled' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className="unscheduled-task"
      style={style}
      {...listeners}
      {...attributes}
    >
      <div
        className="task-priority-indicator"
        style={{ backgroundColor: getPriorityColor(task.priority) }}
      />
      <div className="task-content">
        <div className="task-text">{task.text}</div>
        {task.category && (
          <span className="task-category">{task.category}</span>
        )}
      </div>
    </div>
  );
}

// Draggable Scheduled Block Component
interface DraggableBlockProps {
  task: Task;
  getPriorityColor: (priority: string) => string;
  onUnschedule: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  onEdit: (task: Task) => void;
}

function DraggableBlock({ task, getPriorityColor, onUnschedule, onTaskClick, onEdit }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled-${task.id}`,
    data: { task, type: 'scheduled' },
  });

  // Calculate height based on duration (80px per hour)
  const durationInMinutes = task.scheduledDuration || 60;
  const heightInPx = (durationInMinutes / 60) * 80;

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className="time-block"
      style={{
        ...style,
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        minHeight: `${heightInPx}px`,
      }}
      {...listeners}
      {...attributes}
    >
      <div className="time-block-header">
        <span className="time-block-title">{task.text}</span>
        <div className="time-block-actions">
          <button
            className="time-block-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit time"
          >
            ✏️
          </button>
          <button
            className="time-block-remove"
            onClick={(e) => {
              e.stopPropagation();
              onUnschedule(task);
            }}
            title="Unschedule"
          >
            ×
          </button>
        </div>
      </div>
      <div className="time-block-time">
        {task.scheduledStart && (() => {
          const start = new Date(task.scheduledStart);
          const end = new Date(start.getTime() + (task.scheduledDuration || 60) * 60000);
          return `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;
        })()}
      </div>
      <div className="time-block-meta">
        {task.category && (
          <span className="block-category">{task.category}</span>
        )}
        <span className="block-duration">
          {task.scheduledDuration || 60} min
        </span>
        <button
          className="block-focus-btn"
          onClick={(e) => {
            e.stopPropagation();
            onTaskClick(task);
          }}
        >
          🎯 Focus
        </button>
      </div>
    </div>
  );
}

// Droppable Time Slot Component
interface DroppableSlotProps {
  hour: number;
  children: React.ReactNode;
}

function DroppableSlot({ hour, children }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${hour}`,
    data: { hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={`time-content ${isOver ? 'drop-target' : ''}`}
    >
      {children}
    </div>
  );
}

function TimeBlocksView({ tasks, onUpdateTask, onTaskClick }: TimeBlocksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate] = useState<Date>(new Date());
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const draggedTask = active.data.current?.task as Task;
    const targetHour = over.data.current?.hour as number;

    if (!draggedTask || targetHour === undefined) return;

    // Schedule the task at the target hour
    const startTime = new Date(selectedDate);
    startTime.setHours(targetHour, 0, 0, 0);

    onUpdateTask(draggedTask.id, {
      scheduledStart: startTime.toISOString(),
      scheduledDuration: draggedTask.scheduledDuration || 60,
    });
  };

  const handleDragStart = (event: any) => {
    setActiveTask(event.active.data.current?.task);
  };

  // Get unscheduled tasks (no scheduledStart)
  const unscheduledTasks = tasks.filter(
    (task) => !task.completed && !task.scheduledStart
  );

  // Get scheduled tasks for today
  const scheduledTasks = tasks.filter((task) => {
    if (!task.scheduledStart) return false;
    const taskDate = new Date(task.scheduledStart);
    return (
      taskDate.toDateString() === selectedDate.toDateString() &&
      !task.completed
    );
  });

  // Generate hourly time slots (8 AM - 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      let label;
      if (hour === 12) {
        label = '12:00 PM'; // Noon
      } else if (hour > 12) {
        label = `${hour - 12}:00 PM`;
      } else {
        label = `${hour}:00 AM`;
      }
      slots.push({
        hour,
        label,
        time: `${hour}:00`,
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Schedule a task at a specific time
  const scheduleTask = (task: Task, hour: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);

    onUpdateTask(task.id, {
      scheduledStart: startTime.toISOString(),
      scheduledDuration: 60, // Default 1 hour
    });

    setSelectedTask(null);
  };

  // Unschedule a task
  const unscheduleTask = (task: Task) => {
    onUpdateTask(task.id, {
      scheduledStart: undefined,
      scheduledDuration: undefined,
    });
  };

  // Get all tasks that START in a specific hour, sorted by start time
  const getTasksAtHour = (hour: number) => {
    return scheduledTasks
      .filter((task) => {
        if (!task.scheduledStart) return false;
        const taskStart = new Date(task.scheduledStart);
        const taskHour = taskStart.getHours();

        // Only show task in the slot where it STARTS
        return taskHour === hour;
      })
      .sort((a, b) => {
        // Sort by start time (earliest first)
        const aTime = new Date(a.scheduledStart!).getTime();
        const bTime = new Date(b.scheduledStart!).getTime();
        return aTime - bTime;
      });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffd93d';
      case 'low':
        return '#6bcf7f';
      default:
        return '#999';
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="time-blocks-container">
        <div className="time-blocks-header">
          <h2>🕒 Time Blocks</h2>
          <p className="time-blocks-date">{formatDate(selectedDate)}</p>
        </div>

        <div className="time-blocks-content">
        {/* Left: Unscheduled Tasks */}
        <div className="unscheduled-tasks">
          <h3>Unscheduled Tasks ({unscheduledTasks.length})</h3>
          {unscheduledTasks.length === 0 ? (
            <p className="empty-state">All tasks are scheduled! 🎉</p>
          ) : (
            <div className="task-list">
              {unscheduledTasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          )}
          <div className="schedule-hint">
            🖱️ Drag tasks to time slots to schedule
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="timeline-view">
          <h3>Today's Schedule</h3>
          <div className="timeline">
            {timeSlots.map((slot) => {
              const tasksAtSlot = getTasksAtHour(slot.hour);

              return (
                <div key={slot.hour} className="time-slot">
                  <div className="time-label">{slot.label}</div>
                  <DroppableSlot hour={slot.hour}>
                    {tasksAtSlot.length > 0 ? (
                      <div className="time-slot-tasks">
                        {tasksAtSlot.map((task) => (
                          <DraggableBlock
                            key={task.id}
                            task={task}
                            getPriorityColor={getPriorityColor}
                            onUnschedule={unscheduleTask}
                            onTaskClick={onTaskClick}
                            onEdit={setEditingTask}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="time-slot-empty">Drop here</div>
                    )}
                  </DroppableSlot>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeTask ? (
          <div className="drag-overlay-task">
            <div
              className="task-priority-indicator"
              style={{ backgroundColor: getPriorityColor(activeTask.priority) }}
            />
            <div className="task-content">
              <div className="task-text">{activeTask.text}</div>
              {activeTask.category && (
                <span className="task-category">{activeTask.category}</span>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Time Block Editor Modal */}
      {editingTask && (
        <TimeBlockEditor
          task={editingTask}
          onSave={(updates) => {
            onUpdateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </DndContext>
  );
}

export default TimeBlocksView;
