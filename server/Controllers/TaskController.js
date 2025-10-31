const Task = require('../Models/Task');
const User = require('../Models/User');
const { google } = require('googleapis');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-in-production';

// Decrypt tokens
const decrypt = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Get OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Get authenticated Calendar client for a user
const getCalendarClient = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user.googleCalendar?.connected) {
    return null; // User hasn't connected Google Calendar
  }

  const oauth2Client = getOAuth2Client();
  const accessToken = decrypt(user.googleCalendar.accessToken);
  const refreshToken = user.googleCalendar.refreshToken ? decrypt(user.googleCalendar.refreshToken) : null;
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Create Google Calendar event from task
const createCalendarEvent = async (userId, task) => {
  try {
    const calendar = await getCalendarClient(userId);
    if (!calendar) return null;

    // Calculate event times
    const startTime = task.startTime || new Date();
    const endTime = task.endTime || new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    const event = {
      summary: task.title,
      description: task.detail || '',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: true
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.data.id;
  } catch (error) {
    console.error('Error creating calendar event:', error.message);
    return null;
  }
};

// Update Google Calendar event
const updateCalendarEvent = async (userId, eventId, task) => {
  try {
    const calendar = await getCalendarClient(userId);
    if (!calendar || !eventId) return;

    const startTime = task.startTime || new Date();
    const endTime = task.endTime || new Date(startTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: task.title,
      description: task.detail || '',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event
    });
  } catch (error) {
    console.error('Error updating calendar event:', error.message);
  }
};

// Delete Google Calendar event
const deleteCalendarEvent = async (userId, eventId) => {
  try {
    const calendar = await getCalendarClient(userId);
    if (!calendar || !eventId) return;

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error.message);
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, detail, category, priority, dueDate, startTime, endTime, syncWithCalendar } = req.body;
    
    const task = new Task({
      user: req.user.userId,
      title,
      detail,
      category,
      priority,
      dueDate,
      startTime,
      endTime,
      syncWithCalendar: syncWithCalendar || false
    });

    // Sync with Google Calendar if requested
    if (syncWithCalendar) {
      const eventId = await createCalendarEvent(req.user.userId, task);
      if (eventId) {
        task.googleCalendarEventId = eventId;
      }
    }

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, detail, completed, category, priority, dueDate, startTime, endTime, syncWithCalendar } = req.body;
    
    const task = await Task.findOne({ _id: id, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    task.title = title !== undefined ? title : task.title;
    task.detail = detail !== undefined ? detail : task.detail;
    task.completed = completed !== undefined ? completed : task.completed;
    task.category = category !== undefined ? category : task.category;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.startTime = startTime !== undefined ? startTime : task.startTime;
    task.endTime = endTime !== undefined ? endTime : task.endTime;

    // Handle Google Calendar sync
    if (syncWithCalendar !== undefined) {
      if (syncWithCalendar && !task.googleCalendarEventId) {
        // Enable sync - create event
        const eventId = await createCalendarEvent(req.user.userId, task);
        if (eventId) {
          task.googleCalendarEventId = eventId;
          task.syncWithCalendar = true;
        }
      } else if (!syncWithCalendar && task.googleCalendarEventId) {
        // Disable sync - delete event
        await deleteCalendarEvent(req.user.userId, task.googleCalendarEventId);
        task.googleCalendarEventId = null;
        task.syncWithCalendar = false;
      } else if (syncWithCalendar && task.googleCalendarEventId) {
        // Update existing event
        await updateCalendarEvent(req.user.userId, task.googleCalendarEventId, task);
        task.syncWithCalendar = true;
      }
    } else if (task.googleCalendarEventId && task.syncWithCalendar) {
      // Update calendar event if it exists and sync is enabled
      await updateCalendarEvent(req.user.userId, task.googleCalendarEventId, task);
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.user.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete from Google Calendar if synced
    if (task.googleCalendarEventId) {
      await deleteCalendarEvent(req.user.userId, task.googleCalendarEventId);
    }

    await Task.findOneAndDelete({ _id: id, user: req.user.userId });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};

// Get progress stats
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Daily progress
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const dailyTotal = await Task.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const dailyCompleted = await Task.countDocuments({
      user: userId,
      completed: true,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Monthly progress
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTotal = await Task.countDocuments({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const monthlyCompleted = await Task.countDocuments({
      user: userId,
      completed: true,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    res.json({
      daily: { completed: dailyCompleted, total: dailyTotal },
      monthly: { completed: monthlyCompleted, total: monthlyTotal }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress', error: err.message });
  }
};

// Get completion streak
exports.getStreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    let streak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);

    // Check up to 30 days back
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23,59,59,999);

      const completed = await Task.findOne({
        user: userId,
        completed: true,
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      if (completed) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching streak', error: err.message });
  }
};

// Get category progress
exports.getCategoryProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const categories = await Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: "$category",
        total: { $sum: 1 },
        completed: { $sum: { $cond: ["$completed", 1, 0] } }
      }}
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category progress', error: err.message });
  }
};