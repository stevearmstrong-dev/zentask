import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ToDoForm from './components/ToDoForm';
import ToDo from './components/ToDo';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Greeting from './components/Greeting';
import GoogleCalendarButton from './components/GoogleCalendarButton';
import googleCalendarService from './services/googleCalendar';
import supabaseService from './services/supabase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('tasks'); // 'tasks' or 'dashboard'
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState('');
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
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

  // Load tasks, dark mode, onboarding status, and userName from localStorage on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }

      // Check onboarding status
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }

      // Load user name
      const savedUserName = localStorage.getItem('userName');
      if (savedUserName) {
        setUserName(savedUserName);
      }

      // Load tasks from localStorage (fallback for non-signed-in users)
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }

      setIsLoadingTasks(false);
    };

    loadInitialData();
  }, []);

  // Load tasks from Supabase when user signs in
  useEffect(() => {
    const loadTasksFromSupabase = async () => {
      if (userEmail) {
        setIsLoadingTasks(true);
        const dbTasks = await supabaseService.fetchTasks(userEmail);
        const appTasks = dbTasks.map(task => supabaseService.convertToAppFormat(task));
        setTasks(appTasks);
        setIsLoadingTasks(false);
      }
    };

    loadTasksFromSupabase();
  }, [userEmail]);

  // Save tasks to localStorage whenever they change (fallback for non-signed-in users)
  useEffect(() => {
    if (!userEmail) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, userEmail]);

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

  const addTask = async (taskData) => {
    const newTask = {
      id: Date.now(),
      text: taskData.text,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || '',
      dueTime: taskData.dueTime || '',
      category: taskData.category || '',
      reminderMinutes: taskData.reminderMinutes || null,
      calendarEventId: null,
    };

    // Sync to Google Calendar if connected and task has a due date
    if (isCalendarConnected && newTask.dueDate) {
      try {
        const event = await googleCalendarService.createEvent(newTask);
        newTask.calendarEventId = event.id;
      } catch (error) {
        console.error('Failed to sync task to calendar:', error);
      }
    }

    // Save to Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.createTask(newTask, userEmail);
      } catch (error) {
        console.error('Failed to save task to Supabase:', error);
      }
    }

    setTasks([newTask, ...tasks]);
  };

  const toggleComplete = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    // Update in Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.updateTask(id, updatedTask, userEmail);
      } catch (error) {
        console.error('Failed to update task in Supabase:', error);
      }
    }

    setTasks(
      tasks.map((t) =>
        t.id === id ? updatedTask : t
      )
    );
  };

  const deleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);

    // Delete from Google Calendar if synced
    if (isCalendarConnected && task?.calendarEventId) {
      try {
        await googleCalendarService.deleteEvent(task.calendarEventId);
      } catch (error) {
        console.error('Failed to delete event from calendar:', error);
      }
    }

    // Delete from Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.deleteTask(id, userEmail);
      } catch (error) {
        console.error('Failed to delete task from Supabase:', error);
      }
    }

    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = async (id, updatedData) => {
    const task = tasks.find((t) => t.id === id);
    const updatedTask = { ...task, ...updatedData };

    // Update in Google Calendar if synced
    if (isCalendarConnected && task?.calendarEventId && updatedData.dueDate) {
      try {
        await googleCalendarService.updateEvent(task.calendarEventId, updatedTask);
      } catch (error) {
        console.error('Failed to update event in calendar:', error);
      }
    }

    // Update in Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.updateTask(id, updatedTask, userEmail);
      } catch (error) {
        console.error('Failed to update task in Supabase:', error);
      }
    }

    setTasks(
      tasks.map((task) =>
        task.id === id ? updatedTask : task
      )
    );
  };

  const clearCompleted = async () => {
    // Delete from Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.deleteCompletedTasks(userEmail);
      } catch (error) {
        console.error('Failed to delete completed tasks from Supabase:', error);
      }
    }

    setTasks(tasks.filter((task) => !task.completed));
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleCalendarSignInChange = (signedIn) => {
    setIsCalendarConnected(signedIn);

    // Get user email when signed in
    if (signedIn) {
      const profile = googleCalendarService.getUserProfile();
      if (profile && profile.email) {
        setUserEmail(profile.email);
        if (profile.name) {
          setUserName(profile.name);
        }
      }
    } else {
      setUserEmail('');
    }
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
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} addTask={addTask} />
      )}

      <div className="todo-container">
        <div className="header">
          <div className="header-left">
            <h1 className="todo-title">ToDo App</h1>
          </div>
          <div className="header-controls">
            <GoogleCalendarButton onSignInChange={handleCalendarSignInChange} />
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

        <Greeting userName={userName} />

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
