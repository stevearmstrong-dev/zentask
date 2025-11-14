# ToDo App

A modern, full-stack ToDo application built with React and Supabase, featuring user authentication, task management, scheduling, reminders, and analytics.

## Live Demo

**[View Live App](https://stevearmstrong-dev.github.io/react-todo-app)**

## Features

### Authentication
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Email Verification**: Email confirmation for new accounts
- **Password Reset**: Secure password recovery flow
- **User Profiles**: Personalized greetings and user avatars

### Task Management
- **Today View**: Focus on today's tasks with progress tracking
- **All Tasks View**: Complete task list with search and filtering
- **Dashboard View**: Analytics and insights into your productivity
- **Task Operations**: Create, edit, delete, and mark tasks as complete
- **Onboarding**: Interactive tutorial for new users

### Task Features
- **Priority Levels**: High, medium, and low priority tags with visual indicators
- **Scheduling**: Set due dates and specific times for tasks
- **Reminders**: Browser notifications (5 min, 15 min, 30 min, 1 hour, 1 day before due time)
- **Categories**: Organize tasks with custom categories
- **Search & Filter**: Search tasks by text/category and filter by status (all, active, completed)
- **Overdue Detection**: Automatic detection and warnings for overdue tasks

### User Experience
- **Dark Mode**: Toggle between light and dark themes with preference persistence
- **Analytics Dashboard**: Visual charts showing:
  - Task completion rate
  - Priority breakdown
  - Category distribution
  - Overdue tasks count
  - Tasks due this week
- **Progress Tracking**: Visual progress indicators for daily goals
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

### Frontend
- **React 18.0.0**: Modern React with hooks and functional components
- **Vite 6.4.1**: Fast build tool and dev server with HMR
- **Chart.js 4.5.1**: Powerful charting library
- **react-chartjs-2 5.3.1**: React wrapper for Chart.js
- **CSS3**: Custom styling with Apple-inspired minimal design

### Backend & Services
- **Supabase 2.81.1**: Backend-as-a-Service for authentication and database
- **Supabase Auth**: Secure user authentication and session management
- **Supabase Database**: PostgreSQL database with real-time capabilities
- **Browser Notification API**: Native browser notifications for task reminders

### Deployment
- **GitHub Pages**: Automated deployment pipeline
- **gh-pages 6.3.0**: Deployment automation tool

## Getting Started

### Prerequisites
- Node.js 20.11.1 or higher
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stevearmstrong-dev/react-todo-app.git
cd react-todo-app
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
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Development

Run the app in development mode:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will automatically reload when you make changes.

### Building for Production

Build the app for production:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory, optimized and minified for deployment.

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run predeploy` - Automatically runs before deploy (builds the app)

## Project Structure

```
react-todo-app/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── SignIn.js
│   │   │   ├── SignUp.js
│   │   │   └── PasswordReset.js
│   │   ├── Dashboard.js
│   │   ├── Greeting.js
│   │   ├── Onboarding.js
│   │   ├── ToDo.js
│   │   ├── ToDoForm.js
│   │   └── TodayView.js
│   ├── services/
│   │   └── supabase.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── public/
├── build/
├── .env
├── vite.config.js
└── package.json
```

## Key Features Explained

### Today View
The Today view provides a focused interface showing:
- Tasks scheduled for today
- Overdue tasks from previous days
- Completed tasks from today
- Visual progress indicator showing daily completion rate

### Dashboard Analytics
The dashboard provides insights with:
- Pie chart showing completion vs active tasks
- Bar chart breaking down active tasks by priority
- Doughnut chart showing tasks by category
- Statistics cards for quick metrics overview

### Supabase Integration
All tasks are stored in Supabase and synced across devices:
- Real-time data synchronization
- Secure user authentication with email verification
- PostgreSQL database with optimal indexing
- Server-side data validation
- Cross-device task synchronization

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard:
1. Go to Project Settings > API
2. Copy the Project URL and anon/public key
3. Never commit the `.env` file to version control

## Database Schema

The Supabase tasks table schema:

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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

## Vite Configuration

The app uses a custom Vite configuration (`vite.config.js`):
- **Base Path**: `/react-todo-app/` for GitHub Pages
- **Output Directory**: `build/` (GitHub Pages compatible)
- **JSX Support**: Configured for `.js` files with JSX syntax
- **HMR**: Hot Module Replacement enabled for fast development

## Troubleshooting

### Date Display Issues
If tasks show dates one day off, ensure you're using the latest version. We've fixed UTC/local timezone conversion issues in:
- Date picker selection
- Task card display
- Today view filtering
- Dashboard statistics
- Reminder calculations

### Browser Notifications Not Working
1. Ensure notification permissions are granted
2. Check browser settings (Chrome: Settings > Privacy and security > Site settings > Notifications)
3. HTTPS is required for notifications in production

### Supabase Connection Issues
1. Verify `.env` file exists with correct credentials
2. Check Supabase project is active
3. Ensure anon key has proper permissions
4. Check browser console for specific error messages

### Build Errors
If you encounter build errors:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Deployment Issues
If GitHub Pages deployment fails:
1. Ensure `homepage` in `package.json` matches your GitHub repo
2. Check GitHub Pages settings (Settings > Pages > Source: gh-pages branch)
3. Wait a few minutes for deployment to propagate

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR - changes appear immediately without full page reload.

### State Management
The app uses React hooks for state management:
- `useState` for local component state
- `useEffect` for side effects and data fetching
- `useRef` for tracking notification state

### Date Handling
All dates use local timezone parsing to avoid off-by-one errors:
```javascript
const [year, month, day] = dateString.split('-').map(Number);
const date = new Date(year, month - 1, day);
```

## Performance Optimization

The app includes several optimizations:
- Lazy loading for chart components
- Efficient re-renders with React hooks
- LocalStorage for theme preferences
- Debounced search filtering
- Optimized Vite build with code splitting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: Notification API support varies by browser. Check [caniuse.com](https://caniuse.com/notifications) for compatibility.

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
- Database and authentication powered by Supabase
- Charts powered by Chart.js
- Deployed on GitHub Pages
