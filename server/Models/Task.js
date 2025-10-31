const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  detail: { type: String },
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  startTime: { type: Date },
  endTime: { type: Date },
  googleCalendarEventId: { type: String }, // Store Google Calendar event ID for sync
  syncWithCalendar: { type: Boolean, default: false }, // Whether to sync with Google Calendar
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);