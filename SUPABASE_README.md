# Supabase Setup Guide

This document explains how to set up the Supabase database for the ToDo App.

## Quick Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-setup.sql`
4. Copy your project URL and anon key to `src/services/supabase.js`

## Database Configuration

### Tasks Table Schema

The `tasks` table stores all user tasks with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key (timestamp-based) |
| `user_email` | text | User's email address for data isolation |
| `text` | text | Task description |
| `completed` | boolean | Task completion status |
| `priority` | text | Priority level (low, medium, high) |
| `due_date` | text | Due date in YYYY-MM-DD format |
| `due_time` | text | Due time in HH:MM format |
| `category` | text | Task category |
| `reminder_minutes` | integer | Minutes before due time to remind |
| `calendar_event_id` | text | Google Calendar event ID (if synced) |
| `sort_order` | integer | Manual ordering index for day-level scheduling |
| `status` | text | Kanban status (`todo`, `inprogress`, `done`) |
| `created_at` | timestamp | Task creation timestamp |

### Row Level Security (RLS)

**RLS is ENABLED for this table.**

This app uses Supabase Auth with email/password authentication. Row Level Security policies ensure that users can only access their own tasks at the database level.

#### RLS Policies

All policies use `auth.jwt() ->> 'email' = user_email` to ensure users can only access tasks where the `user_email` matches their authenticated email address.

- **SELECT**: Users can view their own tasks
- **INSERT**: Users can create tasks (must match their email)
- **UPDATE**: Users can update their own tasks
- **DELETE**: Users can delete their own tasks

### Security Model

- **Supabase Auth**: Full authentication with email/password
- **Email verification**: Required before users can sign in
- **Database-level security**: RLS policies enforce access control
- **Password reset**: Built-in password recovery flow
- **Session management**: JWT tokens with automatic refresh
- **Suitable for**: Production apps, multi-user environments, sensitive data

## Environment Variables

Update the following values in `src/services/supabase.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## Current Configuration

- **Project URL**: https://nylvcqjzczvfkjjbeoef.supabase.co
- **Database**: PostgreSQL
- **Region**: Auto-selected based on project creation
- **RLS**: Enabled with auth-based policies
- **Authentication**: Email/password with email verification required

## Testing the Setup

1. Visit the deployed app: https://stevearmstrong-dev.github.io/react-todo-app
2. Click "Sign Up" to create a new account
3. Enter your name (optional), email, password, and confirm password
4. Click "Sign Up" - you'll see a verification message
5. Check your email inbox for the verification link from Supabase
6. Click the verification link to confirm your email
7. Return to the app and sign in with your email and password
8. Create a new task
9. Verify the task appears in Supabase Table Editor
10. Sign out and sign back in to confirm tasks persist
11. Open the app on another device, sign in with the same account
12. Confirm tasks are synced across devices

## Troubleshooting

### Can't sign in after sign up?
- Check your email for the verification link
- Verification emails may take a few minutes to arrive
- Check spam folder if you don't see the email
- Make sure you clicked the verification link before trying to sign in

### Tasks not appearing in Supabase?
- Ensure you're signed in (not just signed up)
- Check browser console for errors
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Ensure RLS is enabled: `ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;`
- Verify RLS policies are created (run the policies from supabase-setup.sql)

### Tasks disappearing after refresh?
- Ensure you're signed in (session may have expired)
- Check browser console for authentication errors
- Try signing out and signing back in
- Verify your email is verified in Supabase Auth dashboard

### Can't query tasks in SQL Editor?
```sql
-- View all tasks
SELECT * FROM tasks;

-- View tasks for specific user
SELECT * FROM tasks WHERE user_email = 'your@email.com';

-- Count tasks per user
SELECT user_email, COUNT(*) FROM tasks GROUP BY user_email;
```
