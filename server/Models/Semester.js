const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
}, {
  timestamps: true
});

// Ensure only one active semester per user
semesterSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('Semester', semesterSchema);
