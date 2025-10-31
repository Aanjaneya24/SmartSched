const Semester = require('../Models/Semester');
const TimetableSlot = require('../Models/TimetableSlot');
const TimetableException = require('../Models/TimetableException');

// Get all semesters for user
const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find({ userId: req.user.userId })
      .sort({ startDate: -1 });
    res.json({ success: true, semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active semester
const getActiveSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({ 
      userId: req.user.userId, 
      isActive: true 
    });
    res.json({ success: true, semester });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create semester
const createSemester = async (req, res) => {
  try {
    console.log('Create semester request body:', req.body);
    console.log('User from token:', req.user);
    
    const { name, startDate, endDate, isActive, color } = req.body;
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const semester = await Semester.create({
      userId: req.user.userId,
      name,
      startDate,
      endDate,
      isActive: isActive || false,
      color: color || '#3b82f6'
    });
    
    console.log('Semester created successfully:', semester);
    res.status(201).json({ success: true, semester });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update semester
const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const semester = await Semester.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }
    
    res.json({ success: true, semester });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete semester (and all its timetable data)
const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete semester
    const semester = await Semester.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }
    
    // Delete all related timetable slots and exceptions
    await TimetableSlot.deleteMany({ semesterId: id });
    await TimetableException.deleteMany({ semesterId: id });
    
    res.json({ success: true, message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set active semester
const setActiveSemester = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deactivate all semesters
    await Semester.updateMany(
      { userId: req.user.userId },
      { isActive: false }
    );
    
    // Activate selected semester
    const semester = await Semester.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isActive: true },
      { new: true }
    );
    
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }
    
    res.json({ success: true, semester });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get weekly timetable for a semester
const getWeeklyTimetable = async (req, res) => {
  try {
    const { semesterId } = req.params;
    
    const slots = await TimetableSlot.find({ 
      userId: req.user.userId,
      semesterId 
    }).sort({ dayOfWeek: 1, startTime: 1 });
    
    // Group by day of week
    const weeklySchedule = {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: []  // Saturday
    };
    
    slots.forEach(slot => {
      weeklySchedule[slot.dayOfWeek].push(slot);
    });
    
    res.json({ success: true, weeklySchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add timetable slot
const addTimetableSlot = async (req, res) => {
  try {
    const { semesterId, dayOfWeek, subject, startTime, endTime, location, instructor, color, notes } = req.body;
    
    const slot = await TimetableSlot.create({
      userId: req.user.userId,
      semesterId,
      dayOfWeek,
      subject,
      startTime,
      endTime,
      location,
      instructor,
      color: color || '#3b82f6',
      notes
    });
    
    res.status(201).json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update timetable slot
const updateTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const slot = await TimetableSlot.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete timetable slot
const deleteTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slot = await TimetableSlot.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's schedule
const getTodaySchedule = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Get active semester
    const semester = await Semester.findOne({ 
      userId: req.user.userId, 
      isActive: true 
    });
    
    if (!semester) {
      return res.json({ success: true, schedule: [], exceptions: [] });
    }
    
    // Get regular slots for today
    const slots = await TimetableSlot.find({ 
      userId: req.user.userId,
      semesterId: semester._id,
      dayOfWeek 
    }).sort({ startTime: 1 });
    
    // Get exceptions for today
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const exceptions = await TimetableException.find({
      userId: req.user.userId,
      semesterId: semester._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });
    
    res.json({ success: true, schedule: slots, exceptions, semester });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add exception (holiday, exam, etc.)
const addException = async (req, res) => {
  try {
    const { semesterId, date, type, title, description, affectedSlots } = req.body;
    
    const exception = await TimetableException.create({
      userId: req.user.userId,
      semesterId,
      date,
      type,
      title,
      description,
      affectedSlots: affectedSlots || []
    });
    
    res.status(201).json({ success: true, exception });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get exceptions for semester
const getExceptions = async (req, res) => {
  try {
    const { semesterId } = req.params;
    
    const exceptions = await TimetableException.find({
      userId: req.user.userId,
      semesterId
    }).sort({ date: 1 });
    
    res.json({ success: true, exceptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete exception
const deleteException = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exception = await TimetableException.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });
    
    if (!exception) {
      return res.status(404).json({ success: false, message: 'Exception not found' });
    }
    
    res.json({ success: true, message: 'Exception deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
