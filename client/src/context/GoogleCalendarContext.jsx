import { createContext, useContext, useState, useEffect } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';

const GoogleCalendarContext = createContext();

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};

export const GoogleCalendarProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [events, setEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const status = await googleCalendarService.getStatus();
      setConnected(status.connected);
      setGoogleEmail(status.googleEmail);
      
      // If connected, fetch today's events
      if (status.connected) {
        await fetchTodayEvents();
      }
    } catch (err) {
      console.error('Error checking calendar status:', err);
      // Don't show error on status check as user might not be logged in
      setConnected(false);
    }
  };

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get OAuth URL from backend
      const { authUrl } = await googleCalendarService.getAuthUrl();

      // Open popup window for OAuth
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll for popup closure or successful auth
      const pollTimer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(pollTimer);
          // Recheck connection status after popup closes
          checkConnectionStatus();
          setLoading(false);
        }
      }, 1000);

      return { success: true };
    } catch (err) {
      console.error('Error connecting Google Calendar:', err);
      setError(err.response?.data?.message || 'Failed to connect Google Calendar');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      await googleCalendarService.disconnect();
      setConnected(false);
      setGoogleEmail(null);
      setEvents([]);
      setTodayEvents([]);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      setError(err.response?.data?.message || 'Failed to disconnect');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const fetchEvents = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleCalendarService.getEvents(params);
      setEvents(data.events || []);
      setLoading(false);
      return { success: true, events: data.events };
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const data = await googleCalendarService.getTodayEvents();
      setTodayEvents(data.events || []);
      return { success: true, events: data.events };
    } catch (err) {
      console.error('Error fetching today events:', err);
      return { success: false, error: err.message };
    }
  };

  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await googleCalendarService.createEvent(eventData);
      
      // Refresh events after creating
      await fetchEvents();
      await fetchTodayEvents();
      
      setLoading(false);
      return { success: true, event: result.event };
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const cleanupUndefinedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await googleCalendarService.cleanupUndefinedEvents();
      
      // Refresh events after cleanup
      await fetchEvents();
      await fetchTodayEvents();
      
      setLoading(false);
      return { 
        success: true, 
        deleted: result.deleted,
        failed: result.failed,
        total: result.total,
        message: result.message 
      };
    } catch (err) {
      console.error('Error cleaning up events:', err);
      setError(err.response?.data?.message || 'Failed to cleanup events');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const value = {
    connected,
    googleEmail,
    events,
    todayEvents,
    loading,
    error,
    connect,
    disconnect,
    fetchEvents,
    fetchTodayEvents,
    createEvent,
    cleanupUndefinedEvents,
    checkConnectionStatus
  };

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};
