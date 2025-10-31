const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/auth');
const {
  getSemesters,
  getActiveSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  setActiveSemester,
  getWeeklyTimetable,
  addTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  getTodaySchedule,
  addException,
  getExceptions,
  deleteException
} = require('../Controllers/TimetableController');

// Semester routes
router.get('/semesters', authMiddleware, getSemesters);
router.get('/semesters/active', authMiddleware, getActiveSemester);
router.post('/semesters', authMiddleware, createSemester);
router.put('/semesters/:id', authMiddleware, updateSemester);
router.delete('/semesters/:id', authMiddleware, deleteSemester);
router.put('/semesters/:id/activate', authMiddleware, setActiveSemester);

// Timetable slots routes
router.get('/timetable/:semesterId', authMiddleware, getWeeklyTimetable);
router.get('/timetable/today/schedule', authMiddleware, getTodaySchedule);
router.post('/timetable/slots', authMiddleware, addTimetableSlot);
router.put('/timetable/slots/:id', authMiddleware, updateTimetableSlot);
router.delete('/timetable/slots/:id', authMiddleware, deleteTimetableSlot);

// Exception routes
router.get('/timetable/:semesterId/exceptions', authMiddleware, getExceptions);
router.post('/timetable/exceptions', authMiddleware, addException);
router.delete('/timetable/exceptions/:id', authMiddleware, deleteException);

module.exports = router;
