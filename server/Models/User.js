const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  googleCalendar: {
    connected: {
      type: Boolean,
      default: false
    },
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
    email: String  // Google account email (can be different from app email)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
