import React from 'react';
import { Task } from '../types';
import ToDo from './ToDo';

interface EisenhowerMatrixProps {
  tasks: Task[];
  toggleComplete: (id: number) => void;
  deleteTask: (id: number) => void;
  editTask: (id: number, updates: Partial<Task>) => void;
  onUpdateTime: (id: number, timeSpent: number) => void;
}

function EisenhowerMatrix({ tasks, toggleComplete, deleteTask, editTask, onUpdateTime }: EisenhowerMatrixProps) {
  // Helper function to check if task is due today or overdue
  const isUrgent = (task: Task): boolean => {
    if (!task.dueDate || task.completed) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parse date string in local timezone
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    // Urgent if due today or overdue
    return dueDate <= today;
  };

  // Helper function to check if task is important
  const isImportant = (task: Task): boolean => {
    return task.priority === 'high';
  };

  // Categorize tasks into quadrants
  const quadrant1 = tasks.filter(task => !task.completed && isUrgent(task) && isImportant(task)); // Urgent & Important
  const quadrant2 = tasks.filter(task => !task.completed && !isUrgent(task) && isImportant(task)); // Not Urgent & Important
  const quadrant3 = tasks.filter(task => !task.completed && isUrgent(task) && !isImportant(task)); // Urgent & Not Important
  const quadrant4 = tasks.filter(task => !task.completed && !isUrgent(task) && !isImportant(task)); // Not Urgent & Not Important

  const renderQuadrant = (quadrantTasks: Task[], title: string, subtitle: string, icon: string, colorClass: string) => (
    <div className={`matrix-quadrant ${colorClass}`}>
      <div className="quadrant-header">
        <div className="quadrant-title">
          <span className="quadrant-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <p className="quadrant-subtitle">{subtitle}</p>
        <span className="quadrant-count">{quadrantTasks.length}</span>
      </div>
      <div className="quadrant-tasks">
        {quadrantTasks.length === 0 ? (
          <p className="empty-quadrant">No tasks in this quadrant</p>
        ) : (
          quadrantTasks.map((task) => (
            <ToDo
              key={task.id}
              task={task}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
              onUpdateTime={onUpdateTime}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="eisenhower-matrix">
      <div className="matrix-header">
        <h2 className="matrix-title">Eisenhower Matrix</h2>
        <p className="matrix-description">
          Organize tasks by urgency and importance to focus on what truly matters
        </p>
      </div>

      <div className="matrix-grid">
        {/* Quadrant 1: Urgent & Important */}
        {renderQuadrant(
          quadrant1,
          'Do First',
          'Urgent & Important',
          '🔥',
          'quadrant-urgent-important'
        )}

        {/* Quadrant 2: Not Urgent & Important */}
        {renderQuadrant(
          quadrant2,
          'Schedule',
          'Not Urgent & Important',
          '📅',
          'quadrant-not-urgent-important'
        )}

        {/* Quadrant 3: Urgent & Not Important */}
        {renderQuadrant(
          quadrant3,
          'Delegate',
          'Urgent & Not Important',
          '⚡',
          'quadrant-urgent-not-important'
        )}

        {/* Quadrant 4: Not Urgent & Not Important */}
        {renderQuadrant(
          quadrant4,
          'Eliminate',
          'Not Urgent & Not Important',
          '🗑️',
          'quadrant-not-urgent-not-important'
        )}
      </div>

      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-dot urgent-important"></span>
          <span>High priority + Due today/overdue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot not-urgent-important"></span>
          <span>High priority + Due later</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot urgent-not-important"></span>
          <span>Medium/Low priority + Due today/overdue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot not-urgent-not-important"></span>
          <span>Medium/Low priority + Due later</span>
        </div>
      </div>
    </div>
  );
}

export default EisenhowerMatrix;
