import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ToDoForm from './components/ToDoForm';
import ToDo from './components/ToDo';
import Dashboard from './components/Dashboard';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('tasks'); // 'tasks' or 'dashboard'
  const [notificationPermission, setNotificationPermission] = useState('default');
  const notifiedTasksRef = useRef(new Set());

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Load tasks and dark mode preference from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      tasks.forEach(task => {
        if (task.completed || !task.dueDate || !task.reminderMinutes) return;

        const taskKey = `${task.id}-${task.reminderMinutes}`;
        if (notifiedTasksRef.current.has(taskKey)) return;

        const dueDateTime = new Date(task.dueDate);
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':');
          dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          dueDateTime.setHours(23, 59, 59, 999);
        }

        const reminderTime = new Date(dueDateTime.getTime() - task.reminderMinutes * 60 * 1000);

        // Check if it's time to show the reminder (within 1 minute window)
        if (now >= reminderTime && now < new Date(reminderTime.getTime() + 60000)) {
          showNotification(task);
          notifiedTasksRef.current.add(taskKey);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, notificationPermission]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (task) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification('Task Reminder', {
        body: `${task.text}${task.dueTime ? ` at ${task.dueTime}` : ''}`,
        icon: '📝',
        badge: '🔔',
        tag: `task-${task.id}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      text: taskData.text,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || '',
      dueTime: taskData.dueTime || '',
      category: taskData.category || '',
      reminderMinutes: taskData.reminderMinutes || null,
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (id, updatedData) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    );
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter((task) => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter((task) => task.completed);
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const activeCount = tasks.filter((task) => !task.completed).length;

  return (
    <div className={`todo-app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="todo-container">
        <div className="header">
          <h1 className="todo-title">ToDo App</h1>
          <div className="header-controls">
            <button
              className="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="view-switcher">
              <button
                className={view === 'tasks' ? 'view-btn active' : 'view-btn'}
                onClick={() => setView('tasks')}
              >
                Tasks
              </button>
              <button
                className={view === 'dashboard' ? 'view-btn active' : 'view-btn'}
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {view === 'tasks' ? (
          <>
            <ToDoForm addTask={addTask} />

            <div className="search-filter-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>

            <div className="todo-list">
              {filteredTasks.length === 0 ? (
                <p className="empty-state">
                  {searchQuery ? 'No tasks match your search.' :
                    filter === 'completed'
                      ? 'No completed tasks yet!'
                      : filter === 'active'
                        ? 'No active tasks! Add one above.'
                        : 'No tasks yet! Add your first task above.'}
                </p>
              ) : (
                filteredTasks.map((task) => (
                  <ToDo
                    key={task.id}
                    task={task}
                    toggleComplete={toggleComplete}
                    deleteTask={deleteTask}
                    editTask={editTask}
                  />
                ))
              )}
            </div>

            {tasks.length > 0 && (
              <div className="todo-footer">
                <span className="task-count">
                  {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
                </span>
                {tasks.some((task) => task.completed) && (
                  <button className="clear-completed" onClick={clearCompleted}>
                    Clear Completed
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <Dashboard tasks={tasks} />
        )}
      </div>
    </div>
  );
}

export default App;
