import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nylvcqjzczvfkjjbeoef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bHZjcWp6Y3p2ZmtqamJlb2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODI0NzgsImV4cCI6MjA3ODQ1ODQ3OH0.1UAbbef2icdl8SNsvDNdQUV_49J_BQLB0vfpOcK6r-8';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseService {
  // Fetch all tasks for a user
  async fetchTasks(userEmail) {
    if (!userEmail) return [];

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Create a new task
  async createTask(task, userEmail) {
    if (!userEmail) throw new Error('User email required');

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            id: task.id,
            user_email: userEmail,
            text: task.text,
            completed: task.completed,
            priority: task.priority,
            due_date: task.dueDate,
            due_time: task.dueTime,
            category: task.category,
            reminder_minutes: task.reminderMinutes,
            calendar_event_id: task.calendarEventId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update an existing task
  async updateTask(taskId, updates, userEmail) {
    if (!userEmail) throw new Error('User email required');

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          text: updates.text,
          completed: updates.completed,
          priority: updates.priority,
          due_date: updates.dueDate,
          due_time: updates.dueTime,
          category: updates.category,
          reminder_minutes: updates.reminderMinutes,
          calendar_event_id: updates.calendarEventId,
        })
        .eq('id', taskId)
        .eq('user_email', userEmail)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId, userEmail) {
    if (!userEmail) throw new Error('User email required');

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_email', userEmail);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Delete completed tasks
  async deleteCompletedTasks(userEmail) {
    if (!userEmail) throw new Error('User email required');

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_email', userEmail)
        .eq('completed', true);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting completed tasks:', error);
      throw error;
    }
  }

  // Convert database task to app format
  convertToAppFormat(dbTask) {
    return {
      id: dbTask.id,
      text: dbTask.text,
      completed: dbTask.completed,
      priority: dbTask.priority,
      dueDate: dbTask.due_date,
      dueTime: dbTask.due_time,
      category: dbTask.category,
      reminderMinutes: dbTask.reminder_minutes,
      calendarEventId: dbTask.calendar_event_id,
    };
  }

  // Convert app task to database format
  convertToDbFormat(task, userEmail) {
    return {
      id: task.id,
      user_email: userEmail,
      text: task.text,
      completed: task.completed,
      priority: task.priority,
      due_date: task.dueDate,
      due_time: task.dueTime,
      category: task.category,
      reminder_minutes: task.reminderMinutes,
      calendar_event_id: task.calendarEventId,
    };
  }
}

const supabaseService = new SupabaseService();
export default supabaseService;
