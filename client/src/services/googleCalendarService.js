import api from './api';

export const googleCalendarService = {
  // Get Google OAuth URL
  getAuthUrl: async () => {
    const response = await api.get('/api/google-calendar/auth-url');
    return response.data;
  },

  // Check connection status
  getStatus: async () => {
    const response = await api.get('/api/google-calendar/status');
    return response.data;
  },

  // Disconnect Google Calendar
  disconnect: async () => {
    const response = await api.post('/api/google-calendar/disconnect');
    return response.data;
  },

  // Get calendar events
  getEvents: async (params = {}) => {
    const response = await api.get('/api/google-calendar/events', { params });
    return response.data;
  },

  // Get today's events
  getTodayEvents: async () => {
    const response = await api.get('/api/google-calendar/events/today');
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await api.post('/api/google-calendar/events', eventData);
    return response.data;
  },

  // Clean up undefined events
  cleanupUndefinedEvents: async () => {
    const response = await api.post('/api/google-calendar/cleanup-undefined');
    return response.data;
  }
};
