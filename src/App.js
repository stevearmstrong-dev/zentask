import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ToDoForm from './components/ToDoForm';
import ToDo from './components/ToDo';
import Dashboard from './components/Dashboard';
import TodayView from './components/TodayView';
import Onboarding from './components/Onboarding';
import Greeting from './components/Greeting';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import PasswordReset from './components/Auth/PasswordReset';
import QuickAddTasks from './components/QuickAddTasks';
import PomodoroTimer from './components/PomodoroTimer';
import Sidebar from './components/Sidebar';
import supabaseService from './services/supabase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('today'); // 'today', 'tasks', 'dashboard', or 'pomodoro'
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authView, setAuthView] = useState('signin'); // 'signin', 'signup', 'reset'
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
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

  // Check for authenticated user on mount and listen to auth changes
  useEffect(() => {
    // Check for guest mode
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuestMode(true);
      setUserName('Guest');
      setAuthLoading(false);
      // Load tasks from localStorage for guest
      const savedTasks = localStorage.getItem('guestTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      return;
    }

    // Check current session
    supabaseService.getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);
        setUserName(currentUser.user_metadata?.name || currentUser.email.split('@')[0]);
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabaseService.getAuthStateChangeListener((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setUserEmail(session.user.email);
        setUserName(session.user.user_metadata?.name || session.user.email.split('@')[0]);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserEmail('');
        setUserName('');
        setTasks([]);
      }
    });

    // Cleanup listener
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Load initial preferences from localStorage
  useEffect(() => {
    const loadInitialData = async () => {
      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }

      // Check onboarding status (only for authenticated users)
      if (user) {
        const hasCompletedOnboarding = localStorage.getItem(`hasCompletedOnboarding_${user.id}`);
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }
    };

    loadInitialData();
  }, [user]);

  // Load tasks from Supabase when user signs in
  useEffect(() => {
    const loadTasksFromSupabase = async () => {
      if (userEmail) {
        const dbTasks = await supabaseService.fetchTasks(userEmail);
        const appTasks = dbTasks.map(task => supabaseService.convertToAppFormat(task));
        setTasks(appTasks);
      }
    };

    loadTasksFromSupabase();
  }, [userEmail]);

  // Save guest tasks to localStorage
  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem('guestTasks', JSON.stringify(tasks));
    }
  }, [tasks, isGuestMode]);

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

        // Parse date string in local timezone to avoid UTC conversion issues
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const dueDateTime = new Date(year, month - 1, day);
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
    };

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
    if (user) {
      localStorage.setItem(`hasCompletedOnboarding_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleSignOut = async () => {
    // Handle guest mode sign out
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      localStorage.removeItem('guestTasks');
      setIsGuestMode(false);
      setUserName('');
      setTasks([]);
      return;
    }

    // Handle authenticated user sign out
    try {
      await supabaseService.signOut();
      // State will be updated by auth listener
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuestMode(true);
    setUserName('Guest');
    setAuthLoading(false);

    // Load any existing guest tasks
    const savedTasks = localStorage.getItem('guestTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
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

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className={`todo-app ${darkMode ? 'dark-mode' : ''}`}>
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!user && !isGuestMode) {
    if (authView === 'signup') {
      return (
        <SignUp
          onSignUpSuccess={() => setAuthView('signin')}
          onSwitchToSignIn={() => setAuthView('signin')}
        />
      );
    }

    if (authView === 'reset') {
      return (
        <PasswordReset
          onBackToSignIn={() => setAuthView('signin')}
        />
      );
    }

    return (
      <SignIn
        onSignInSuccess={() => {}}
        onSwitchToSignUp={() => setAuthView('signup')}
        onSwitchToReset={() => setAuthView('reset')}
        onGuestMode={handleGuestMode}
      />
    );
  }

  // Main app (authenticated users only)
  return (
    <div className={`todo-app ${darkMode ? 'dark-mode' : ''}`}>
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} addTask={addTask} />
      )}

      <div className="app-layout">
        <Sidebar
          activeView={view}
          onViewChange={setView}
          userName={userName}
          onSignOut={handleSignOut}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <div className="main-content">
          {view !== 'today' && view !== 'pomodoro' && <Greeting userName={userName} />}

        {view === 'today' ? (
          <>
            <QuickAddTasks addTask={addTask} />
            <ToDoForm addTask={addTask} />
            <TodayView
              tasks={tasks}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
            />
          </>
        ) : view === 'tasks' ? (
          <>
            <QuickAddTasks addTask={addTask} />
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
        ) : view === 'pomodoro' ? (
          <PomodoroTimer />
        ) : (
          <Dashboard tasks={tasks} />
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
