const mongoose = require('mongoose');

const timetableExceptionSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['holiday', 'exam', 'custom', 'cancelled'],
    default: 'holiday'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  affectedSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimetableSlot'
  }]
}, {
  timestamps: true
});

// Index for date-based queries
timetableExceptionSchema.index({ userId: 1, semesterId: 1, date: 1 });

module.exports = mongoose.model('TimetableException', timetableExceptionSchema);
