import React, { createContext, useState, useContext, useEffect } from 'react';
import * as timetableService from '../services/timetableService';
import { googleCalendarService } from '../services/googleCalendarService';

const TimetableContext = createContext();

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};

export const TimetableProvider = ({ children }) => {
  const [semesters, setSemesters] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Day names mapping
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch all semesters
  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await timetableService.getSemesters();
      if (response.success) {
        setSemesters(response.semesters);
        const active = response.semesters.find(s => s.isActive);
        if (active) {
          setActiveSemester(active);
          await fetchWeeklyTimetable(active._id);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active semester
  const fetchActiveSemester = async () => {
    try {
      const response = await timetableService.getActiveSemester();
      if (response.success && response.semester) {
        setActiveSemester(response.semester);
        await fetchWeeklyTimetable(response.semester._id);
      }
    } catch (error) {
      console.error('Error fetching active semester:', error);
    }
  };

  // Fetch weekly timetable
  const fetchWeeklyTimetable = async (semesterId) => {
    try {
      const response = await timetableService.getWeeklyTimetable(semesterId);
      if (response.success) {
        setWeeklySchedule(response.weeklySchedule);
      }
    } catch (error) {
      console.error('Error fetching weekly timetable:', error);
    }
  };

  // Fetch today's schedule
  const fetchTodaySchedule = async () => {
    try {
      const response = await timetableService.getTodaySchedule();
      if (response.success) {
        setTodaySchedule(response.schedule);
        if (response.semester) {
          setActiveSemester(response.semester);
        }
      }
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    }
  };

  // Fetch exceptions
  const fetchExceptions = async (semesterId) => {
    try {
      const response = await timetableService.getExceptions(semesterId);
      if (response.success) {
        setExceptions(response.exceptions);
      }
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    }
  };

  // Create semester
  const createSemester = async (semesterData) => {
    try {
      console.log('Creating semester:', semesterData);
      const response = await timetableService.createSemester(semesterData);
      console.log('Create semester response:', response);
      if (response.success) {
        await fetchSemesters();
        return { success: true, semester: response.semester };
      }
      return { success: false };
    } catch (error) {
      console.error('Error creating semester:', error);
      console.error('Error details:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  };

  // Update semester
  const updateSemester = async (id, updates) => {
    try {
      const response = await timetableService.updateSemester(id, updates);
      if (response.success) {
        await fetchSemesters();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating semester:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete semester
  const deleteSemester = async (id) => {
    try {
      const response = await timetableService.deleteSemester(id);
      if (response.success) {
        await fetchSemesters();
        setWeeklySchedule({});
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting semester:', error);
      return { success: false, error: error.message };
    }
  };

  // Activate semester
  const activateSemester = async (id) => {
    try {
      const response = await timetableService.setActiveSemester(id);
      if (response.success) {
        setActiveSemester(response.semester);
        await fetchSemesters();
        await fetchWeeklyTimetable(id);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error activating semester:', error);
      return { success: false, error: error.message };
    }
  };

  // Add timetable slot
  const addSlot = async (slotData) => {
    try {
      const response = await timetableService.addTimetableSlot(slotData);
      if (response.success) {
        await fetchWeeklyTimetable(slotData.semesterId);
        
        // Auto-sync to Google Calendar - Create events for all occurrences in semester
        if (response.slot && activeSemester) {
          try {
            // Check if Google Calendar is connected
            const calendarStatus = await googleCalendarService.getStatus();
            
            if (calendarStatus.connected) {
              const slot = response.slot;
              const semesterStart = new Date(activeSemester.startDate);
              const semesterEnd = new Date(activeSemester.endDate);
              
              // Parse time (HH:MM format)
              const [startHour, startMin] = slot.startTime.split(':');
              const [endHour, endMin] = slot.endTime.split(':');
              
              // Find all occurrences of this day between semester start and end
              const getAllOccurrences = (dayOfWeek, startDate, endDate) => {
                const occurrences = [];
                const current = new Date(startDate);
                
                // Move to first occurrence of this day
                while (current.getDay() !== dayOfWeek && current <= endDate) {
                  current.setDate(current.getDate() + 1);
                }
                
                // Collect all occurrences
                while (current <= endDate) {
                  occurrences.push(new Date(current));
                  current.setDate(current.getDate() + 7); // Next week
                }
                
                return occurrences;
              };
              
              const occurrences = getAllOccurrences(slot.dayOfWeek, semesterStart, semesterEnd);
              
              // Limit to next 10 occurrences to avoid rate limits
              const limitedOccurrences = occurrences.slice(0, 10);
              console.log(`📅 Creating ${limitedOccurrences.length} events for ${slot.subject} (next 10 weeks)...`);
              
              // Create event for each occurrence with delay to avoid rate limits
              let successCount = 0;
              for (let i = 0; i < limitedOccurrences.length; i++) {
                const occurrence = limitedOccurrences[i];
                try {
                  const startDateTime = new Date(occurrence);
                  startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);
                  
                  const endDateTime = new Date(occurrence);
                  endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);
                  
                  const eventData = {
                    title: slot.subject || 'Class',
                    description: `${slot.location ? 'Room: ' + slot.location : ''}${slot.instructor ? '\nInstructor: ' + slot.instructor : ''}${slot.notes ? '\nNotes: ' + slot.notes : ''}`.trim(),
                    start: startDateTime.toISOString(),
                    end: endDateTime.toISOString(),
                    location: slot.location || '',
                  };
                  
                  await googleCalendarService.createEvent(eventData);
                  successCount++;
                  
                  // Add delay between requests to avoid rate limiting (200ms)
                  if (i < limitedOccurrences.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                  }
                } catch (eventErr) {
                  console.warn(`Failed to create event for ${occurrence.toDateString()}:`, eventErr);
                }
              }
              
              console.log(`✅ Synced ${successCount}/${limitedOccurrences.length} class events to Google Calendar`);
            }
          } catch (calendarErr) {
            console.warn('Failed to sync timetable to Google Calendar:', calendarErr);
            // Don't fail slot creation if calendar sync fails
          }
        }
        
        return { success: true, slot: response.slot };
      }
      return { success: false };
    } catch (error) {
      console.error('Error adding slot:', error);
      return { success: false, error: error.message };
    }
  };

  // Update timetable slot
  const updateSlot = async (id, updates) => {
    try {
      const response = await timetableService.updateTimetableSlot(id, updates);
      if (response.success && activeSemester) {
        await fetchWeeklyTimetable(activeSemester._id);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating slot:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete timetable slot
  const deleteSlot = async (id) => {
    try {
      const response = await timetableService.deleteTimetableSlot(id);
      if (response.success && activeSemester) {
        await fetchWeeklyTimetable(activeSemester._id);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting slot:', error);
      return { success: false, error: error.message };
    }
  };

  // Add exception
  const addException = async (exceptionData) => {
    try {
      const response = await timetableService.addException(exceptionData);
      if (response.success) {
        await fetchExceptions(exceptionData.semesterId);
        return { success: true, exception: response.exception };
      }
      return { success: false };
    } catch (error) {
      console.error('Error adding exception:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete exception
  const deleteException = async (id) => {
    try {
      const response = await timetableService.deleteException(id);
      if (response.success && activeSemester) {
        await fetchExceptions(activeSemester._id);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting exception:', error);
      return { success: false, error: error.message };
    }
  };

  // Get slots for a specific day
  const getSlotsForDay = (dayOfWeek) => {
    return weeklySchedule[dayOfWeek] || [];
  };

  // Get current class (if any)
  const getCurrentClass = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return todaySchedule.find(slot => {
      return currentTime >= slot.startTime && currentTime <= slot.endTime;
    });
  };

  // Get next class
  const getNextClass = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return todaySchedule.find(slot => slot.startTime > currentTime);
  };

  const value = {
    semesters,
    activeSemester,
    weeklySchedule,
    todaySchedule,
    exceptions,
    loading,
    dayNames,
    fetchSemesters,
    fetchActiveSemester,
    fetchWeeklyTimetable,
    fetchTodaySchedule,
    fetchExceptions,
    createSemester,
    updateSemester,
    deleteSemester,
    activateSemester,
    addSlot,
    updateSlot,
    deleteSlot,
    addException,
    deleteException,
    getSlotsForDay,
    getCurrentClass,
    getNextClass,
  };

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
};
