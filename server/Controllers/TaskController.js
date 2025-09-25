const Task = require('../Models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, detail } = req.body;
    const task = new Task({
      user: req.user.userId,
      title,
      detail
    });
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
    const { title, detail, completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { title, detail, completed },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
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