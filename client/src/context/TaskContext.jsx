import { createContext, useContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { googleCalendarService } from '../services/googleCalendarService';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      const newTask = response.data;
      setTasks(prevTasks => [newTask, ...prevTasks]); // Add to beginning

      // Auto-sync to Google Calendar if task has a due date
      if (newTask.dueDate) {
        try {
          // Check if Google Calendar is connected
          const calendarStatus = await googleCalendarService.getStatus();
          
          if (calendarStatus.connected) {
            // Parse due date and create a 1-hour event
            const dueDate = new Date(newTask.dueDate);
            const endDate = new Date(dueDate);
            endDate.setHours(dueDate.getHours() + 1); // 1 hour duration
            
            // Create event in Google Calendar
            const eventData = {
              title: `📋 ${newTask.title}`, // Add task emoji
              description: `${newTask.description || 'Task from Smart Sched'}\n\nPriority: ${newTask.priority || 'Medium'}\nCategory: ${newTask.category || 'General'}`,
              start: dueDate.toISOString(),
              end: endDate.toISOString(),
              location: '',
            };
            
            await googleCalendarService.createEvent(eventData);
            console.log('✅ Task synced to Google Calendar:', newTask.title);
          }
        } catch (calendarErr) {
          console.warn('Failed to sync task to Google Calendar:', calendarErr);
          // Don't fail task creation if calendar sync fails
        }
      }

      return { success: true, task: newTask };
    } catch (err) {
      console.error('Error creating task:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create task' 
      };
    }
  };

  // Update an existing task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskService.updateTask(taskId, updates);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.data : task
        )
      );
      return { success: true, task: response.data };
    } catch (err) {
      console.error('Error updating task:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update task' 
      };
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return { success: false, error: 'Task not found' };

      const response = await taskService.updateTask(taskId, { 
        completed: !task.completed 
      });
      
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t._id === taskId ? response.data : t
        )
      );
      return { success: true, task: response.data };
    } catch (err) {
      console.error('Error toggling task:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to toggle task' 
      };
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete task' 
      };
    }
  };

  // Refresh tasks (useful for manual refresh)
  const refreshTasks = () => {
    fetchTasks();
  };

  // Filter tasks by criteria
  const getFilteredTasks = (filters = {}) => {
    let filtered = [...tasks];

    if (filters.completed !== undefined) {
      filtered = filtered.filter(task => task.completed === filters.completed);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      high: tasks.filter(t => t.priority === 'High' && !t.completed).length,
      medium: tasks.filter(t => t.priority === 'Medium' && !t.completed).length,
      low: tasks.filter(t => t.priority === 'Low' && !t.completed).length,
    };

    const byCategory = tasks.reduce((acc, task) => {
      const category = task.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      completionRate,
      byPriority,
      byCategory,
    };
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    refreshTasks,
    getFilteredTasks,
    getTaskStats,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
