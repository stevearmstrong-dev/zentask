-- Supabase Database Setup for ToDo App
-- This file contains the complete database schema and configuration

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id bigint PRIMARY KEY,
  user_email text NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  due_date text,
  due_time text,
  category text,
  reminder_minutes integer,
  calendar_event_id text,
  status text DEFAULT 'todo',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_email for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_email_idx ON tasks(user_email);

-- Enable Row Level Security for authenticated users
-- This app now uses Supabase Auth with email/password authentication
-- RLS policies ensure users can only access their own tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Create RLS policies for authenticated users
-- Users can only access tasks where user_email matches their authenticated email
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);
