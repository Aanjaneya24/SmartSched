import api from './api';

// Semester APIs
export const getSemesters = async () => {
  try {
    const response = await api.get('/api/timetable/semesters');
    return response.data;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
};

export const getActiveSemester = async () => {
  try {
    const response = await api.get('/api/timetable/semesters/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active semester:', error);
    throw error;
  }
};

export const createSemester = async (semesterData) => {
  try {
    const response = await api.post('/api/timetable/semesters', semesterData);
    return response.data;
  } catch (error) {
    console.error('Error creating semester:', error);
    throw error;
  }
};

export const updateSemester = async (id, updates) => {
  try {
    const response = await api.put(`/api/timetable/semesters/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating semester:', error);
    throw error;
  }
};

export const deleteSemester = async (id) => {
  try {
    const response = await api.delete(`/api/timetable/semesters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting semester:', error);
    throw error;
  }
};

export const setActiveSemester = async (id) => {
  try {
    const response = await api.put(`/api/timetable/semesters/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating semester:', error);
    throw error;
  }
};

// Timetable Slot APIs
export const getWeeklyTimetable = async (semesterId) => {
  try {
    const response = await api.get(`/api/timetable/timetable/${semesterId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly timetable:', error);
    throw error;
  }
};

export const getTodaySchedule = async () => {
  try {
    const response = await api.get('/api/timetable/timetable/today/schedule');
    return response.data;
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    throw error;
  }
};

export const addTimetableSlot = async (slotData) => {
  try {
    const response = await api.post('/api/timetable/timetable/slots', slotData);
    return response.data;
  } catch (error) {
    console.error('Error adding timetable slot:', error);
    throw error;
  }
};

export const updateTimetableSlot = async (id, updates) => {
  try {
    const response = await api.put(`/api/timetable/timetable/slots/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating timetable slot:', error);
    throw error;
  }
};

export const deleteTimetableSlot = async (id) => {
  try {
    const response = await api.delete(`/api/timetable/timetable/slots/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting timetable slot:', error);
    throw error;
  }
};

// Exception APIs
export const getExceptions = async (semesterId) => {
  try {
    const response = await api.get(`/api/timetable/timetable/${semesterId}/exceptions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    throw error;
  }
};

export const addException = async (exceptionData) => {
  try {
    const response = await api.post('/api/timetable/timetable/exceptions', exceptionData);
    return response.data;
  } catch (error) {
    console.error('Error adding exception:', error);
    throw error;
  }
};

export const deleteException = async (id) => {
  try {
    const response = await api.delete(`/api/timetable/timetable/exceptions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting exception:', error);
    throw error;
  }
};
