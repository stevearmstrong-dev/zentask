import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Task, Recurrence } from './types';
import ToDoForm from './components/ToDoForm';
import ToDo from './components/ToDo';
import Dashboard from './components/Dashboard';
import TodayView from './components/TodayView';
import UpcomingView from './components/UpcomingView';
import Onboarding from './components/Onboarding';
import Greeting from './components/Greeting';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import PasswordReset from './components/Auth/PasswordReset';
import QuickAddTasks from './components/QuickAddTasks';
import PomodoroTimer from './components/PomodoroTimer';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import TimeBlocksView from './components/TimeBlocksView';
import Sidebar from './components/Sidebar';
import { ViewType } from './components/Sidebar';
import FocusMode from './components/FocusMode';
import CelebrationToast from './components/CelebrationToast';
import { getQuoteByCategory } from './data/navalQuotes';
import supabaseService from './services/supabase';
import { User } from '@supabase/supabase-js';

type FilterType = 'all' | 'active' | 'completed';
type AuthViewType = 'signin' | 'signup' | 'reset';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [view, setView] = useState<ViewType>('today');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [authView, setAuthView] = useState<AuthViewType>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [celebrationQuote, setCelebrationQuote] = useState<string | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  const normalizeTask = (task: Task): Task => ({
    ...task,
    sortOrder: typeof task.sortOrder === 'number' ? task.sortOrder : 0,
  });

  const parseTasksFromStorage = (raw: string): Task[] => {
    try {
      const parsed: Task[] = JSON.parse(raw);
      return parsed.map(normalizeTask);
    } catch {
      return [];
    }
  };

  const getNextSortOrder = (dueDate?: string): number => {
    if (!dueDate) return 0;
    const sameDayTasks = tasks.filter((task) => task.dueDate === dueDate);
    if (sameDayTasks.length === 0) return 0;
    const maxOrder = Math.max(...sameDayTasks.map((task) => task.sortOrder || 0));
    return Number.isFinite(maxOrder) ? maxOrder + 1 : 0;
  };

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
        setTasks(parseTasksFromStorage(savedTasks));
      }
      return;
    }

    // Check current session
    supabaseService.getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email || '');
        setUserName(currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '');
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabaseService.getAuthStateChangeListener((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '');
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
    const loadInitialData = async (): Promise<void> => {
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
    const loadTasksFromSupabase = async (): Promise<void> => {
      if (userEmail) {
        const dbTasks = await supabaseService.fetchTasks(userEmail);
        const appTasks = dbTasks.map(task => supabaseService.convertToAppFormat(task));
        setTasks(appTasks.map(normalizeTask));
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
    const checkReminders = (): void => {
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

  const showNotification = (task: Task): void => {
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

  // Calculate next occurrence date based on recurrence pattern
  const getNextOccurrenceDate = (currentDate: string, recurrence: Recurrence): string | null => {
    if (!recurrence || !currentDate) return null;

    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    switch (recurrence) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return null;
    }

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');
    return `${nextYear}-${nextMonth}-${nextDay}`;
  };

  // Capitalize first letter if it's lowercase
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    const firstChar = text.charAt(0);
    // Only capitalize if first character is a lowercase letter (a-z)
    if (/[a-z]/.test(firstChar)) {
      return firstChar.toUpperCase() + text.slice(1);
    }
    return text;
  };

  const addTask = async (taskData: Partial<Task>): Promise<void> => {
    const resolvedDueDate = taskData.dueDate || '';
    const resolvedSortOrder = typeof taskData.sortOrder === 'number'
      ? taskData.sortOrder
      : getNextSortOrder(resolvedDueDate);
    const resolvedDueTime = taskData.dueTime || '';

    let scheduledStart = taskData.scheduledStart;
    if (!scheduledStart && resolvedDueDate && resolvedDueTime) {
      const [year, month, day] = resolvedDueDate.split('-').map(Number);
      const [hours, minutes] = resolvedDueTime.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
      scheduledStart = startDate.toISOString();
    }

    const newTask: Task = {
      id: Date.now(),
      text: capitalizeFirstLetter(taskData.text || ''),
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: resolvedDueDate,
      dueTime: resolvedDueTime,
      category: taskData.category || '',
      reminderMinutes: taskData.reminderMinutes || null,
      recurrence: taskData.recurrence || null,
      timeSpent: 0,
      isTracking: false,
      trackingStartTime: null,
      scheduledStart,
      scheduledDuration: taskData.scheduledDuration || (scheduledStart ? 60 : undefined),
      sortOrder: resolvedSortOrder,
    };

    // Save to Supabase if user is signed in
    if (userEmail) {
      try {
        await supabaseService.createTask(newTask, userEmail);
      } catch (error) {
        console.error('Failed to save task to Supabase:', error);
      }
    }

    setTasks((prev) => [normalizeTask(newTask), ...prev]);
  };

  const toggleComplete = async (id: number): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    // Show celebration when completing a task
    if (!task.completed && updatedTask.completed) {
      const quote = getQuoteByCategory('completion');
      setCelebrationQuote(quote);
    }

    // If completing a recurring task, create next occurrence
    if (!task.completed && task.recurrence && updatedTask.completed) {
      const nextDate = getNextOccurrenceDate(task.dueDate, task.recurrence);
      if (nextDate) {
        const nextTask: Task = {
          id: Date.now() + 1, // Ensure unique ID
          text: task.text,
          completed: false,
          priority: task.priority,
          dueDate: nextDate,
          dueTime: task.dueTime,
          category: task.category,
          reminderMinutes: task.reminderMinutes,
          recurrence: task.recurrence,
          timeSpent: 0,
          isTracking: false,
          trackingStartTime: null,
        };

        // Save next occurrence to Supabase
        if (userEmail) {
          try {
            await supabaseService.createTask(nextTask, userEmail);
          } catch (error) {
            console.error('Failed to create recurring task in Supabase:', error);
          }
        }

        // Add next occurrence to tasks
        setTasks([...tasks.map((t) => t.id === id ? updatedTask : t), nextTask]);

        // Update current task in Supabase
        if (userEmail) {
          try {
            await supabaseService.updateTask(id, updatedTask, userEmail);
          } catch (error) {
            console.error('Failed to update task in Supabase:', error);
          }
        }
        return;
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
      tasks.map((t) =>
        t.id === id ? updatedTask : t
      )
    );
  };

  const deleteTask = async (id: number): Promise<void> => {
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

  const editTask = async (id: number, updatedData: Partial<Task>): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    const updatedTask = { ...task, ...updatedData } as Task;

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

  const reorderTasksWithinDay = async (dayKey: string, orderedIds: number[]): Promise<void> => {
    const orderMap = new Map<number, number>();
    orderedIds.forEach((id, index) => orderMap.set(id, index));

    const changed: Task[] = [];
    const nextTasks = tasks.map((task) => {
      if (task.dueDate === dayKey && orderMap.has(task.id)) {
        const sortOrder = orderMap.get(task.id)!;
        if ((task.sortOrder || 0) !== sortOrder) {
          const updated = { ...task, sortOrder };
          changed.push(updated);
          return updated;
        }
      }
      return task;
    });

    if (changed.length === 0) return;

    setTasks(nextTasks);

    if (userEmail) {
      changed.forEach((task) => {
        supabaseService.updateTask(task.id, {
          sortOrder: task.sortOrder,
        }, userEmail).catch((error) => {
          console.error('Failed to update task order in Supabase:', error);
        });
      });
    }
  };

  const updateTaskTime = async (id: number, timeData: Partial<Task>): Promise<void> => {
    // If starting tracking, stop all other tasks
    if (timeData.isTracking) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === id) {
          // Start tracking this task
          return { ...task, ...timeData };
        } else if (task.isTracking) {
          // Stop tracking other tasks
          const elapsed = Math.floor((Date.now() - (task.trackingStartTime || 0)) / 1000);
          const stoppedTask: Task = {
            ...task,
            timeSpent: (task.timeSpent || 0) + elapsed,
            isTracking: false,
            trackingStartTime: null,
          };

          // Update stopped task in Supabase
          if (userEmail) {
            supabaseService.updateTask(task.id, stoppedTask, userEmail).catch((error) => {
              console.error('Failed to update stopped task in Supabase:', error);
            });
          }

          return stoppedTask;
        }
        return task;
      });

      setTasks(updatedTasks);
    } else {
      // Just update the specific task (stopping or resetting)
      const task = tasks.find((t) => t.id === id);
      const updatedTask = { ...task, ...timeData } as Task;

      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    }

    // Update in Supabase
    if (userEmail) {
      const task = tasks.find((t) => t.id === id);
      const updatedTask = { ...task, ...timeData } as Task;

      try {
        await supabaseService.updateTask(id, updatedTask, userEmail);
      } catch (error) {
        console.error('Failed to update task time in Supabase:', error);
      }
    }
  };

  const clearCompleted = async (): Promise<void> => {
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

  const handleOnboardingComplete = (): void => {
    if (user) {
      localStorage.setItem(`hasCompletedOnboarding_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleSignOut = async (): Promise<void> => {
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

  const handleGuestMode = (): void => {
    localStorage.setItem('guestMode', 'true');
    setIsGuestMode(true);
    setUserName('Guest');
    setAuthLoading(false);

    // Load any existing guest tasks
    const savedTasks = localStorage.getItem('guestTasks');
    if (savedTasks) {
      setTasks(parseTasksFromStorage(savedTasks));
    }
  };

  const getFilteredTasks = (): Task[] => {
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
      {focusedTask && (
        <FocusMode
          task={focusedTask}
          onClose={() => setFocusedTask(null)}
          onComplete={toggleComplete}
          onUpdateTime={updateTaskTime}
        />
      )}

      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} addTask={addTask} />
      )}

      {celebrationQuote && (
        <CelebrationToast
          quote={celebrationQuote}
          onClose={() => setCelebrationQuote(null)}
        />
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
          {view !== 'pomodoro' && view !== 'matrix' && view !== 'timeblocks' && <Greeting userName={userName} />}

        {view === 'today' ? (
          <>
            <QuickAddTasks addTask={addTask} />
            <ToDoForm addTask={addTask} />
            <TodayView
              tasks={tasks}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
              onUpdateTime={updateTaskTime}
              onFocus={setFocusedTask}
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
                    onUpdateTime={updateTaskTime}
                    onFocus={setFocusedTask}
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
        ) : view === 'upcoming' ? (
          <UpcomingView
            tasks={tasks}
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
            onAddTask={addTask}
            onUpdateTask={editTask}
            onFocus={setFocusedTask}
            onReorderDay={reorderTasksWithinDay}
          />
        ) : view === 'pomodoro' ? (
          <PomodoroTimer />
        ) : view === 'matrix' ? (
          <EisenhowerMatrix
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            editTask={editTask}
            onUpdateTime={updateTaskTime}
            onFocus={setFocusedTask}
          />
        ) : view === 'timeblocks' ? (
          <TimeBlocksView
            tasks={tasks}
            onUpdateTask={updateTaskTime}
            onTaskClick={setFocusedTask}
          />
        ) : (
          <Dashboard tasks={tasks} />
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
