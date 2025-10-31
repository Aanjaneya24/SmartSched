const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_CONN)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Update CORS configuration to allow both ports
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Sched API' });
});

app.get('/ping', (req, res) => {
  res.json({ message: 'Server is active! 🚀' });
});

// Auth Routes
const authRouter = require('./Routes/AuthRouter');
app.use('/auth', authRouter);

// Task Routes
app.use('/tasks', require('./Routes/TaskRouter'));

// Timetable Routes
const timetableRouter = require('./Routes/TimetableRouter');
app.use('/api/timetable', timetableRouter);

// Google Calendar Routes
const googleCalendarRouter = require('./Routes/GoogleCalendarRouter');
app.use('/api/google-calendar', googleCalendarRouter);

// 404 Handler
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

