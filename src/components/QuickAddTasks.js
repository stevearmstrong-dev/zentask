import React, { useState } from 'react';

function QuickAddTasks({ addTask }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const quickTasks = [
    // Hydration
    { text: 'Drink water', category: 'Hydration', priority: 'low', icon: '💧' },

    // Food
    { text: 'Make coffee', category: 'Food', priority: 'low', icon: '☕' },
    { text: 'Cook meal', category: 'Food', priority: 'medium', icon: '🍳' },
    { text: 'Meal prep', category: 'Food', priority: 'medium', icon: '🥗' },

    // Health
    { text: 'Exercise', category: 'Health', priority: 'medium', icon: '💪' },
    { text: 'Meditate', category: 'Health', priority: 'low', icon: '🧘' },
    { text: 'Take vitamins', category: 'Health', priority: 'low', icon: '💊' },

    // Coding
    { text: 'Code for 1 hour', category: 'Coding', priority: 'high', icon: '💻' },

    // Personal
    { text: 'Pray', category: 'Personal', priority: 'medium', icon: '🙏' },
    { text: 'Read for 30 min', category: 'Personal', priority: 'low', icon: '📚' },
    { text: 'Journal', category: 'Personal', priority: 'low', icon: '📝' },

    // Home
    { text: 'Clean room', category: 'Home', priority: 'medium', icon: '🧹' },
    { text: 'Do laundry', category: 'Home', priority: 'low', icon: '🧺' },

    // Education
    { text: 'Study', category: 'Education', priority: 'high', icon: '📖' },
  ];

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleQuickAdd = (task) => {
    addTask({
      text: `${task.icon} ${task.text}`,
      priority: task.priority,
      category: task.category,
      dueDate: getTodayLocalDate(),
      dueTime: '',
      reminderMinutes: null
    });
  };

  return (
    <div className="quick-add-section">
      <div className="quick-add-header">
        <h3 className="quick-add-title">
          <span className="quick-add-icon">⚡</span>
          Quick Add
        </h3>
        <button
          type="button"
          className="quick-add-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="quick-add-grid">
          {quickTasks.map((task, index) => (
            <button
              key={index}
              type="button"
              className={`quick-add-task priority-${task.priority}`}
              onClick={() => handleQuickAdd(task)}
            >
              <span className="quick-task-icon">{task.icon}</span>
              <span className="quick-task-text">{task.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickAddTasks;
