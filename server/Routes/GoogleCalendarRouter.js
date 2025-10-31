const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/auth');
const {
  getAuthUrl,
  handleCallback,
  disconnect,
  getStatus,
  getEvents,
  getTodayEvents,
  createEvent,
  cleanupUndefinedEvents
} = require('../Controllers/GoogleCalendarController');

// Handle OAuth callback - NO AUTH REQUIRED (Google's redirect won't have JWT)
router.get('/callback', handleCallback);

// All other routes require authentication
router.use(authMiddleware);

// Get OAuth URL to initiate connection
router.get('/auth-url', getAuthUrl);

// Disconnect Google Calendar
router.post('/disconnect', disconnect);

// Check connection status
router.get('/status', getStatus);

// Get calendar events
router.get('/events', getEvents);

// Get today's events
router.get('/events/today', getTodayEvents);

// Create new event
router.post('/events', createEvent);

// Clean up undefined events
router.post('/cleanup-undefined', cleanupUndefinedEvents);

module.exports = router;
