import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from '../context/GoogleCalendarContext';
import { useTimetable } from '../context/TimetableContext';
import { useTask } from '../context/TaskContext';
import { FaGoogle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

function GoogleCalendarIntegration() {
  const {
    connected,
    googleEmail,
    events,
    todayEvents,
    loading,
    error,
    connect,
    disconnect,
    fetchEvents,
    cleanupUndefinedEvents
  } = useGoogleCalendar();

  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week'); // week, month, or list
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const { getSlotsForDay, dayNames, activeSemester } = useTimetable();
  const { tasks } = useTask();

  useEffect(() => {
    if (connected) {
      // Fetch events for next 30 days
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      fetchEvents({
        timeMin: now.toISOString(),
        timeMax: thirtyDaysLater.toISOString(),
        maxResults: 50
      });
    }
  }, [connected]);

  const handleConnect = async () => {
    const result = await connect();
    if (!result.success && result.error) {
      // Check if error is due to missing credentials
      if (result.error.includes('503') || result.error.includes('not configured')) {
        setShowSetupInstructions(true);
      }
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect Google Calendar?')) {
      await disconnect();
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('This will delete all undefined or invalid events from your Google Calendar. Continue?')) {
      try {
        console.log('🧹 Starting cleanup...');
        const result = await cleanupUndefinedEvents();
        console.log('🧹 Cleanup result:', result);
        
        if (result.success) {
          alert(`✅ Cleanup complete!\n\nDeleted: ${result.deleted} events\nFailed: ${result.failed} events\nTotal found: ${result.total} events`);
        } else {
          alert(`❌ Cleanup failed: ${result.error}`);
        }
      } catch (err) {
        console.error('❌ Cleanup error:', err);
        alert(`❌ Cleanup error: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateToCheck = new Date(year, month, day);
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get tasks for a specific day
  const getTasksForDay = (dayIndex) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay()) + (currentWeekOffset * 7));
    
    return tasks.filter(task => {
      if (!task.dueDate || !task.title) return false; // Filter out undefined tasks
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === targetDate.toDateString();
    });
  };

  // Get Google Calendar events for a specific day (excluding timetable classes)
  const getCalendarEventsForDay = (dayIndex) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay()) + (currentWeekOffset * 7));
    
    // Get timetable slots for this day to filter out duplicates
    const daySlots = getSlotsForDay(dayIndex);
    const timetableSubjects = new Set(daySlots.map(slot => slot.subject?.toLowerCase().trim()));
    
    return events.filter(event => {
      if (!event.title || event.title === 'undefined') return false; // Filter out undefined events
      
      const eventDate = new Date(event.start);
      if (eventDate.toDateString() !== targetDate.toDateString()) return false;
      
      // Filter out events that match timetable class subjects (auto-synced classes)
      const eventTitle = event.title.toLowerCase().trim();
      if (timetableSubjects.has(eventTitle)) {
        return false; // This is a duplicate of a timetable class
      }
      
      return true;
    });
  };

  // Get date for a specific day index
  const getDateForDay = (dayIndex) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay()) + (currentWeekOffset * 7));
    return targetDate;
  };

  // Check if a date is within the active semester
  const isWithinSemester = (date) => {
    if (!activeSemester || !activeSemester.startDate || !activeSemester.endDate) {
      return false; // If no active semester, don't show classes
    }
    
    const semesterStart = new Date(activeSemester.startDate);
    const semesterEnd = new Date(activeSemester.endDate);
    
    // Set time to midnight for accurate date comparison
    semesterStart.setHours(0, 0, 0, 0);
    semesterEnd.setHours(23, 59, 59, 999);
    date = new Date(date);
    date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    
    return date >= semesterStart && date <= semesterEnd;
  };

  // Check if a day is a holiday (based on Google Calendar events with "holiday" keyword)
  const isHoliday = (dayIndex) => {
    const dayEvents = getCalendarEventsForDay(dayIndex);
    return dayEvents.some(event => 
      event.title?.toLowerCase().includes('holiday') || 
      event.title?.toLowerCase().includes('vacation') ||
      event.title?.toLowerCase().includes('break') ||
      event.description?.toLowerCase().includes('holiday')
    );
  };

  if (!connected) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        {showSetupInstructions ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-red-600">⚙️ Google Calendar Setup Required</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-gray-800 mb-4">
                Google Calendar integration is not configured. Follow these steps to set it up:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the Google Calendar API</li>
                <li>Create OAuth 2.0 credentials (Web application)</li>
                <li>Add authorized redirect URI: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8000/api/google-calendar/callback</code></li>
                <li>Copy your Client ID and Client Secret</li>
                <li>Update the <code className="bg-gray-200 px-2 py-1 rounded">server/.env</code> file with:
                  <pre className="bg-gray-800 text-white p-3 rounded mt-2 text-xs overflow-x-auto">
{`GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-calendar/callback`}
                  </pre>
                </li>
                <li>Restart the backend server</li>
              </ol>
            </div>
            <button
              onClick={() => setShowSetupInstructions(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="text-center">
            <FaGoogle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Google Calendar</h2>
            <p className="text-gray-600 mb-6">
              Sync your Google Calendar events and manage them directly from Smart Sched
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <FaGoogle /> Connect with Google
                </>
              )}
            </button>
            {error && (
              <div className="mt-4">
                <p className="text-red-600 text-sm mb-2">{error}</p>
                {error.includes('not configured') && (
                  <button
                    onClick={() => setShowSetupInstructions(true)}
                    className="text-blue-600 text-sm underline hover:text-blue-800"
                  >
                    View Setup Instructions
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <FaGoogle className="text-green-600 text-xl" />
          </div>
          <div>
            <p className="font-semibold">Google Calendar Connected</p>
            <p className="text-sm text-gray-600">{googleEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCleanup}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
            title="Remove undefined or invalid events from Google Calendar"
          >
            <FaTrash />
            Cleanup
          </button>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">
            Weekly Schedule
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition text-gray-700 dark:text-white"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition text-gray-700 dark:text-white"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-600">
        <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-slate-600">
          {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
            const dateForDay = getDateForDay(dayIndex);
            const isWithinSemesterPeriod = isWithinSemester(dateForDay);
            
            // Only show timetable slots if within semester period
            const daySlots = (getSlotsForDay && isWithinSemesterPeriod) ? getSlotsForDay(dayIndex) : [];
            const dayTasks = getTasksForDay(dayIndex);
            const dayCalendarEvents = getCalendarEventsForDay(dayIndex);
            const isTodayDate = new Date().toDateString() === dateForDay.toDateString();
            const isHolidayDay = isHoliday(dayIndex);
            
            return (
              <div key={dayIndex} className="min-h-[400px]">
                <div className={`p-4 border-b border-gray-200 dark:border-slate-600 ${
                  isTodayDate ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-slate-700'
                }`}>
                  <h3 className={`font-bold text-center ${
                    isTodayDate ? 'text-purple-900 dark:text-purple-200' : 'text-gray-900 dark:text-white'
                  }`}>
                    {dayNames[dayIndex]}
                  </h3>
                  <p className="text-xs text-center text-gray-600 dark:text-slate-400 mt-1">
                    {dateForDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="p-2 space-y-2">
                  {!isWithinSemesterPeriod && daySlots.length === 0 && activeSemester && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                        {new Date(dateForDay) < new Date(activeSemester.startDate) 
                          ? '📅 Before semester' 
                          : '📅 After semester'}
                      </p>
                    </div>
                  )}
                  {daySlots.length === 0 && dayTasks.length === 0 && dayCalendarEvents.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8 font-medium">
                      No events
                    </p>
                  ) : (
                    <>
                      {/* Timetable Classes (Blue) - Blurred on holidays */}
                      {daySlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <div
                            key={slot._id}
                            className={`p-3 rounded-lg shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500 ${
                              isHolidayDay ? 'opacity-40 blur-[0.5px]' : ''
                            }`}
                            style={{ backgroundColor: '#3b82f615' }}
                            title={isHolidayDay ? 'Class cancelled - Holiday' : ''}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  📘 {slot.subject}
                                  {isHolidayDay && <span className="ml-2 text-xs text-red-600 dark:text-red-400">🚫 Holiday</span>}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 font-semibold">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                {slot.location && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    📍 {slot.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Tasks (Green) */}
                      {dayTasks.map(task => (
                        <div
                          key={task._id}
                          className="p-3 rounded-lg shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-all duration-200 border-l-4 border-green-500"
                          style={{ backgroundColor: '#10b98115' }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">
                                ✓ {task.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                                Task
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Google Calendar Events (Purple) */}
                      {dayCalendarEvents.map(event => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500"
                          style={{ backgroundColor: '#8b5cf615' }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">
                                📅 {event.title}
                              </p>
                              {!event.isAllDay && (
                                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 font-semibold">
                                  {new Date(event.start).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              )}
                              {event.location && (
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                  📍 {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GoogleCalendarIntegration;
