# ◯ Zentask

**Calm, mindful productivity**

A modern, full-stack productivity application built with React and Supabase. Zentask combines intelligent task management with a Pomodoro timer, voice input, and beautiful analytics to help you find your flow.

## Live Demo

**[View Live App](https://stevearmstrong-dev.github.io/zentask)**

## Features

### Core Productivity

- **Today View**: Focus on today's tasks with progress tracking and completion metrics
- **Eisenhower Matrix**: Organize tasks by urgency and importance into four actionable quadrants
- **Time Blocks**: Drag-and-drop scheduling with 15-minute intervals and visual task spanning
- **Pomodoro Timer**: Built-in focus timer with work/break cycles, session tracking, and customizable durations
- **Time Tracking**: Track time spent on each task with start/stop/reset controls and analytics
- **Duration Estimation**: Set expected task duration for better planning
- **Voice Input**: Add tasks hands-free using voice recognition (Chrome/Edge)
- **Quick Add**: Rapidly create tasks with one-click priority and category presets
- **Smart Reminders**: Browser notifications (5 min, 15 min, 30 min, 1 hour, 1 day before due time)
- **Recurring Tasks**: Daily, weekly, biweekly, monthly, and yearly auto-regeneration

### Authentication & Sync

- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Email Verification**: Email confirmation for new accounts
- **Password Reset**: Secure password recovery flow
- **Guest Mode**: Try the app without creating an account (localStorage-based)
- **Cross-Device Sync**: Tasks sync automatically across all your devices

### Task Management

- **Sidebar Navigation**: Clean navigation between Today, All Tasks, Dashboard, and Pomodoro
- **Priority Levels**: High, medium, and low priority with visual indicators
- **Scheduling**: Set due dates and specific times for tasks
- **Duration Planning**: Estimate task duration (15min to 4+ hours)
- **Categories**: Organize tasks with predefined or custom categories
- **Kanban Board**: Drag-and-drop board with Todo / In Progress / Done columns
- **Upcoming Timeline**: Todoist-style view grouping the next 7 days with time-blocked tasks
- **Drag-to-Reschedule**: Reorder and move tasks across upcoming days via drag-and-drop
- **Search & Filter**: Search by text/category and filter by status (all, active, completed)
- **Overdue Detection**: Automatic detection and warnings for overdue tasks
- **Task Operations**: Create, edit, delete, and mark tasks complete

### Analytics & Insights

- **Dashboard View**: Visual analytics showing:
  - Task completion rate with pie charts
  - Priority breakdown with bar charts
  - Category distribution with doughnut charts
  - Time tracking statistics and charts
  - Overdue tasks count and warnings
  - Tasks due this week
  - Productivity trends

### User Experience

- **Dark Mode**: Beautiful dark theme with preference persistence
- **Unified Blue Theme**: Cohesive blue-tinted design across all UI elements
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Sidebar Navigation**: Professional sidebar with user profile and quick controls
- **Onboarding**: Interactive tutorial for new users
- **Progress Tracking**: Visual indicators for daily goals and completion rates
- **Glassmorphic Design**: Modern blur effects and gradient backgrounds
- **Smooth Animations**: Polished hover effects and transitions throughout

## Technologies Used

### Frontend

- **JavaScript (ES6+)**: Modern JavaScript with arrow functions, async/await, and modules
- **TypeScript 5.9.3**: Type-safe development with static typing
- **React 18.0.0**: Modern React with hooks and functional components
- **Vite 6.4.1**: Lightning-fast build tool with HMR
- **Chart.js 4.5.1**: Powerful charting library for analytics
- **react-chartjs-2 5.3.1**: React wrapper for Chart.js
- **CSS3**: Custom styling with glassmorphism and modern design patterns

### Backend & Services

- **Supabase 2.81.1**: Backend-as-a-Service for authentication and database
- **PostgreSQL**: Robust relational database with real-time capabilities
- **Browser APIs**:
  - Notification API for task reminders
  - SpeechRecognition API for voice input
  - LocalStorage for preferences and guest mode

### Deployment

- **GitHub Pages**: Automated deployment with GitHub Actions
- **gh-pages 6.3.0**: Deployment automation

## Getting Started

### Prerequisites

- Node.js 20.11.1 or higher
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stevearmstrong-dev/zentask.git
cd zentask
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database table:
```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY,
  user_email TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  due_time TEXT,
  category TEXT,
  reminder_minutes INTEGER,
  recurrence TEXT,
  scheduled_duration INTEGER,
  calendar_event_id TEXT,
  time_spent INTEGER DEFAULT 0,
  is_tracking BOOLEAN DEFAULT false,
  tracking_start_time BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_tracking ON tasks(is_tracking);
```

### Development

Run the app in development mode:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will automatically reload with HMR when you make changes.

### Building for Production

Build the app for production:
```bash
npm run build
```

The optimized build artifacts will be in the `build/` directory.

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run predeploy` - Automatically runs before deploy

## Project Structure

```
zentask/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── SignIn.tsx         # Authentication forms
│   │   │   ├── SignUp.tsx
│   │   │   └── PasswordReset.tsx
│   │   ├── CalendarPicker.tsx     # Date selection component
│   │   ├── CategoryPicker.tsx     # Category management
│   │   ├── Dashboard.tsx          # Analytics dashboard
│   │   ├── DurationPicker.tsx     # Task duration estimation
│   │   ├── EisenhowerMatrix.tsx   # Eisenhower Matrix view
│   │   ├── Greeting.tsx           # Personalized greeting
│   │   ├── Onboarding.tsx         # New user tutorial
│   │   ├── PomodoroTimer.tsx      # Focus timer with sessions
│   │   ├── PriorityPicker.tsx     # Priority selection
│   │   ├── QuickAddTasks.tsx      # One-click task creation
│   │   ├── RecurrencePicker.tsx   # Task recurrence selection
│   │   ├── ReminderPicker.tsx     # Reminder time selection
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── TimeBlockEditor.tsx    # Edit scheduled time blocks
│   │   ├── TimeBlocksView.tsx     # Drag-and-drop time scheduling
│   │   ├── TimePicker.tsx         # Time selection component
│   │   ├── ToDo.tsx               # Individual task component
│   │   ├── ToDoForm.tsx           # Task creation form
│   │   ├── TodayView.tsx          # Today's tasks view
│   │   └── VoiceInput.tsx         # Voice recognition input
│   ├── services/
│   │   └── supabase.js            # Supabase client and utilities
│   ├── types.ts                   # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── App.css                    # Global styles
│   └── index.js                   # React entry point
├── public/
│   ├── index.html                 # HTML template
│   └── manifest.json              # PWA manifest
├── .env                           # Environment variables
├── vite.config.js                 # Vite configuration
└── package.json                   # Dependencies and scripts
```

## Key Features Explained

### Pomodoro Timer

The integrated Pomodoro timer helps you maintain focus with:
- **Three modes**: Work (25 min), Short Break (5 min), Long Break (15 min)
- **Customizable durations**: Adjust times to fit your workflow
- **Session tracking**: Visual session counter with tomato emojis
- **Auto-switching**: Automatically cycles between work and breaks
- **Notifications**: Browser alerts when sessions complete
- **Settings panel**: Easy configuration without leaving the timer

### Time Tracking

Track how much time you spend on each task:
- **Start/Stop controls**: Green play button to start, orange pause button to stop
- **Automatic single-timer enforcement**: Starting a new timer automatically stops other running timers
- **Real-time display**: Live countdown showing hours, minutes, and seconds
- **Persistent tracking**: Time data syncs to Supabase and persists across sessions
- **Reset functionality**: Clear tracked time with reset button (only shows when time > 0)
- **Disabled for completed tasks**: Can't track time on finished tasks
- **Dashboard analytics**: View total time tracked and time breakdown by priority
- **Visual feedback**: Pulsing animation on active timer, monospace time display

### Voice Input

Add tasks naturally using your voice:
- **Speech recognition**: Powered by browser SpeechRecognition API
- **Real-time transcription**: See your words appear as you speak
- **Simple mode**: One utterance at a time for reliability
- **Visual feedback**: Microphone icon shows recording status
- **Error handling**: Clear error messages for permissions or network issues

### Today View

Stay focused on what matters with:
- **Smart filtering**: Shows today's tasks and overdue items
- **Progress tracking**: Visual completion percentage
- **Quick actions**: Complete, edit, or delete tasks inline
- **Overdue warnings**: Clear indicators for missed deadlines
- **Completed tasks**: See your daily accomplishments

### Eisenhower Matrix

Prioritize effectively using the Eisenhower Matrix methodology:
- **Four Quadrants**: Tasks automatically organized by urgency and importance
  - **Do First** (🔥): High priority + Due today/overdue - Critical tasks requiring immediate attention
  - **Schedule** (📅): High priority + Due later - Important tasks to plan and schedule
  - **Delegate** (⚡): Medium/Low priority + Due today/overdue - Urgent but less important tasks
  - **Eliminate** (🗑️): Medium/Low priority + Due later - Tasks to reconsider or remove
- **Visual Organization**: Color-coded quadrants with task counts
- **Interactive**: Full task management within each quadrant (complete, edit, delete, time tracking)
- **Legend**: Clear explanation of categorization rules
- **Responsive Design**: 2x2 grid on desktop, stacked on mobile
- **Unified Theme**: Beautiful glassmorphic design with blue gradients

### Time Blocks

Schedule your day with precision using the time blocks view:
- **15-Minute Intervals**: Granular time slots from 8 AM to 8 PM
- **Drag-and-Drop Scheduling**: Easily drag unscheduled tasks to specific time slots
- **Visual Task Spanning**: Tasks visually span their estimated duration across multiple slots
- **Interactive Editing**: Click to edit task times and durations
- **Smart Slot Detection**: Shows when slots are occupied by ongoing tasks
- **Focus Mode Integration**: Quick access to focus mode from any scheduled task
- **Responsive Layout**: Side-by-side view of unscheduled tasks and timeline

### Dashboard Analytics

Gain insights into your productivity:
- **Completion rate**: Pie chart showing done vs active tasks
- **Priority breakdown**: Bar chart of tasks by priority level
- **Category distribution**: Doughnut chart of task categories
- **Quick stats**: Overdue count and tasks due this week
- **Visual design**: Beautiful charts with smooth animations

### Sidebar Navigation

Professional navigation with:
- **View switching**: Quick access to Today, All Tasks, Dashboard, Matrix, Time Blocks, Pomodoro
- **User profile**: Avatar and username display
- **Quick controls**: Dark mode toggle and sign out button
- **Active state**: Clear visual indication of current view
- **Mobile responsive**: Converts to bottom tab bar on mobile

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project:
1. Go to Project Settings > API
2. Copy the Project URL and anon/public key
3. **Never commit the `.env` file** to version control

## Database Schema

The Supabase tasks table:

```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY,
  user_email TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  due_time TEXT,
  category TEXT,
  reminder_minutes INTEGER,
  recurrence TEXT,
  scheduled_duration INTEGER,
  calendar_event_id TEXT,
  time_spent INTEGER DEFAULT 0,
  is_tracking BOOLEAN DEFAULT false,
  tracking_start_time BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_tracking ON tasks(is_tracking);
```

## Vite Configuration

Custom configuration for GitHub Pages:
- **Base Path**: `/zentask/` for GitHub Pages deployment
- **Output Directory**: `build/` for compatibility
- **TypeScript Support**: `.tsx` files with full type checking
- **HMR**: Hot Module Replacement for instant updates

## Troubleshooting

### Voice Input Not Working

1. **Browser compatibility**: Use Chrome or Edge (Firefox/Safari not supported)
2. **Microphone permission**: Grant microphone access when prompted
3. **HTTPS required**: Voice recognition needs secure context (localhost or HTTPS)
4. **Check browser console**: Look for specific error messages

### Browser Notifications Not Working

1. Grant notification permissions in browser settings
2. Check: Chrome > Settings > Privacy > Site settings > Notifications
3. HTTPS required for production notifications
4. Ensure notifications aren't blocked for the site

### Supabase Connection Issues

1. Verify `.env` file exists with correct credentials
2. Check Supabase project is active (not paused)
3. Ensure anon key has proper permissions
4. Check browser console for connection errors

### Build Errors

Clear and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Deployment Issues

1. Ensure `homepage` in `package.json` matches repo name
2. Check GitHub Pages: Settings > Pages > Source: gh-pages branch
3. Wait 2-3 minutes for deployment to propagate
4. Clear browser cache if changes don't appear

## Development Tips

### Hot Module Replacement

Vite provides instant HMR - CSS and component changes appear immediately without reload.

### State Management

Uses React hooks throughout:
- `useState` for component state
- `useEffect` for side effects and data fetching
- `useRef` for notification tracking and DOM references
- `useContext` would be added for global state (future enhancement)

### Date Handling

All dates use local timezone to avoid off-by-one errors:
```javascript
// Correct way - parse in local timezone
const [year, month, day] = dateString.split('-').map(Number);
const date = new Date(year, month - 1, day);

// Avoid - new Date(dateString) uses UTC
```

## Performance Optimization

Built-in optimizations:
- **Code splitting**: Vite automatically splits code for optimal loading
- **Lazy loading**: Charts load on demand
- **Efficient re-renders**: React hooks prevent unnecessary updates
- **LocalStorage caching**: Theme and guest tasks cached locally
- **Debounced search**: Search waits for typing to finish
- **Optimized builds**: Minification and tree-shaking enabled

## Browser Support

- ✅ Chrome (recommended - all features supported)
- ✅ Edge (all features supported)
- ⚠️ Firefox (no voice input support)
- ⚠️ Safari (no voice input support)

Check [caniuse.com](https://caniuse.com/) for:
- [Notification API](https://caniuse.com/notifications)
- [SpeechRecognition API](https://caniuse.com/speech-recognition)

## Roadmap

Planned features for future releases:

- [x] **Recurring Tasks**: Daily, weekly, biweekly, monthly, yearly auto-regeneration ✓
- [x] **Time Tracking**: Track actual time spent on tasks ✓
- [x] **Eisenhower Matrix**: Urgent/Important quadrant view ✓
- [x] **Focus Mode**: Distraction-free single-task view with time tracking and Pomodoro ✓
- [x] **Time Blocks**: Drag-and-drop time scheduling with 15-minute intervals ✓
- [x] **Duration Estimation**: Set expected task duration for planning ✓
- [ ] **Subtasks**: Break tasks into smaller checklist items
- [ ] **Kanban Board**: Drag-and-drop task workflow
- [ ] **Habit Tracker**: Daily habits with streak counters
- [ ] **Tags System**: Multiple tags per task
- [ ] **Calendar View**: Monthly/weekly calendar visualization
- [ ] **Keyboard Shortcuts**: Global power user shortcuts
- [ ] **Task Templates**: Pre-defined task templates
- [ ] **Export/Import**: Backup and migrate tasks

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with React and Vite
- Database and authentication by Supabase
- Charts powered by Chart.js
- Icons from Unicode emoji
- Deployed on GitHub Pages
- Inspired by mindful productivity and the Pomodoro Technique

---

**Find your flow with Zentask** ◯

[Live Demo](https://stevearmstrong-dev.github.io/zentask) • [Report Bug](https://github.com/stevearmstrong-dev/zentask/issues) • [Request Feature](https://github.com/stevearmstrong-dev/zentask/issues)
