import React from 'react';
import ToDo from './ToDo';

function TodayView({ tasks, toggleComplete, deleteTask, editTask, onUpdateTime }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Helper function to parse task date in local timezone
  const getTaskDate = (task) => {
    if (!task.dueDate) return null;
    // Parse date string (YYYY-MM-DD) in local timezone to avoid UTC conversion issues
    const [year, month, day] = task.dueDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Filter overdue tasks (due before today and not completed)
  const overdueTasks = tasks.filter(task => {
    if (task.completed || !task.dueDate) return false;
    const taskDate = getTaskDate(task);
    return taskDate < today;
  });

  // Filter today's tasks (due today and not completed)
  const todayTasks = tasks.filter(task => {
    if (task.completed || !task.dueDate) return false;
    const taskDate = getTaskDate(task);
    return taskDate.getTime() === today.getTime();
  });

  // Filter completed tasks from today
  const completedTodayTasks = tasks.filter(task => {
    if (!task.completed || !task.dueDate) return false;
    const taskDate = getTaskDate(task);
    return taskDate.getTime() === today.getTime();
  });

  // Calculate progress
  const totalTodayTasks = todayTasks.length + completedTodayTasks.length;
  const completedCount = completedTodayTasks.length;
  const progressPercentage = totalTodayTasks > 0
    ? Math.round((completedCount / totalTodayTasks) * 100)
    : 0;

  // Format date
  const formatDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <div className="today-view">
      {/* Today Header */}
      <div className="today-header">
        <div className="today-title-section">
          <h2 className="today-title">Today</h2>
          <p className="today-date">{formatDate()}</p>
        </div>

        {totalTodayTasks > 0 && (
          <div className="today-progress">
            <div className="progress-circle">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercentage / 100)}`}
                  transform="rotate(-90 30 30)"
                  strokeLinecap="round"
                />
              </svg>
              <span className="progress-text">{progressPercentage}%</span>
            </div>
            <div className="progress-details">
              <p className="progress-label">Progress</p>
              <p className="progress-count">{completedCount} of {totalTodayTasks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overdue Section */}
      {overdueTasks.length > 0 && (
        <div className="task-section overdue-section">
          <div className="section-header">
            <h3 className="section-title overdue-title">
              <span className="overdue-icon">⚠️</span>
              Overdue
              <span className="task-count-badge overdue-badge">{overdueTasks.length}</span>
            </h3>
          </div>
          <div className="task-list">
            {overdueTasks.map((task) => (
              <ToDo
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                editTask={editTask}
                onUpdateTime={onUpdateTime}
                isOverdue={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks Section */}
      <div className="task-section today-tasks-section">
        <div className="section-header">
          <h3 className="section-title">
            Tasks for Today
            {todayTasks.length > 0 && (
              <span className="task-count-badge">{todayTasks.length}</span>
            )}
          </h3>
        </div>

        {todayTasks.length === 0 && overdueTasks.length === 0 ? (
          <div className="empty-today">
            <div className="empty-today-icon">🎉</div>
            <h3 className="empty-today-title">All clear!</h3>
            <p className="empty-today-message">
              No tasks scheduled for today. Enjoy your day!
            </p>
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="empty-state-small">
            <p>No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="task-list">
            {todayTasks.map((task) => (
              <ToDo
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                editTask={editTask}
                onUpdateTime={onUpdateTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Today Section */}
      {completedTodayTasks.length > 0 && (
        <div className="task-section completed-section">
          <div className="section-header">
            <h3 className="section-title completed-title">
              <span className="completed-icon">✓</span>
              Completed
              <span className="task-count-badge completed-badge">{completedTodayTasks.length}</span>
            </h3>
          </div>
          <div className="task-list">
            {completedTodayTasks.map((task) => (
              <ToDo
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                editTask={editTask}
                onUpdateTime={onUpdateTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TodayView;
