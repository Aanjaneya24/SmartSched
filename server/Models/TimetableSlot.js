const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true
    // Format: "HH:MM" (24-hour)
  },
  endTime: {
    type: String,
    required: true
    // Format: "HH:MM" (24-hour)
  },
  location: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
timetableSlotSchema.index({ userId: 1, semesterId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
