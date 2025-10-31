import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTimetable } from '../context/TimetableContext';

function TimeTable() {
  const {
    semesters,
    activeSemester,
    weeklySchedule,
    todaySchedule,
    loading,
    dayNames,
    fetchSemesters,
    fetchActiveSemester,
    fetchTodaySchedule,
    createSemester,
    updateSemester,
    deleteSemester,
    activateSemester,
    addSlot,
    updateSlot,
    deleteSlot,
    getSlotsForDay,
    getCurrentClass,
    getNextClass
  } = useTimetable();

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [semesterForm, setSemesterForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6'
  });

  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 1,
    subject: '',
    startTime: '09:00',
    endTime: '10:30',
    location: '',
    instructor: '',
    color: '#3b82f6',
    notes: ''
  });

  const colorPresets = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  useEffect(() => {
    fetchSemesters();
    fetchTodaySchedule();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodaySchedule();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', semesterForm);
    
    try {
      const result = await createSemester({
        ...semesterForm,
        isActive: semesters.length === 0
      });
      
      console.log('Create result:', result);
      
      if (result.success) {
        alert('Semester created successfully!');
        setSemesterForm({ name: '', startDate: '', endDate: '', color: '#3b82f6' });
        setShowSemesterModal(false);
      } else {
        alert(`Failed to create semester: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Caught error:', error);
      alert(`Error creating semester: ${error.message}`);
    }
  };

  const handleDeleteSemester = async (id) => {
    if (window.confirm('Delete this semester and all its classes?')) {
      await deleteSemester(id);
    }
  };

  const handleActivateSemester = async (id) => {
    await activateSemester(id);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!activeSemester) {
      alert('Please create and select a semester first');
      return;
    }

    const result = await addSlot({
      ...slotForm,
      semesterId: activeSemester._id
    });

    if (result.success) {
      resetSlotForm();
      setShowSlotModal(false);
      fetchTodaySchedule();
    }
  };

  const handleEditSlot = async (e) => {
    e.preventDefault();
    const result = await updateSlot(editingSlot._id, slotForm);
    if (result.success) {
      setEditingSlot(null);
      resetSlotForm();
      setShowSlotModal(false);
      fetchTodaySchedule();
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Delete this class from all weeks?')) {
      await deleteSlot(id);
      fetchTodaySchedule();
    }
  };

  const openEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      dayOfWeek: slot.dayOfWeek,
      subject: slot.subject,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location || '',
      instructor: slot.instructor || '',
      color: slot.color || '#3b82f6',
      notes: slot.notes || ''
    });
    setShowSlotModal(true);
  };

  const resetSlotForm = () => {
    setSlotForm({
      dayOfWeek: selectedDay !== null ? selectedDay : 1,
      subject: '',
      startTime: '09:00',
      endTime: '10:30',
      location: '',
      instructor: '',
      color: '#3b82f6',
      notes: ''
    });
  };

  const openAddSlotModal = (dayOfWeek) => {
    setSelectedDay(dayOfWeek);
    setSlotForm({
      ...slotForm,
      dayOfWeek
    });
    setEditingSlot(null);
    setShowSlotModal(true);
  };

  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timetable</h1>
        <button
          onClick={() => setShowSemesterModal(true)}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
        >
          <AcademicCapIcon className="w-5 h-5" />
          Manage Semesters
        </button>
      </div>

      {semesters.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg dark:shadow-2xl mb-6 border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
            Active Semester
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            value={activeSemester?._id || ''}
            onChange={(e) => handleActivateSemester(e.target.value)}
          >
            {semesters.map(sem => (
              <option key={sem._id} value={sem._id}>
                {sem.name} ({new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {todaySchedule.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-6 rounded-xl shadow-lg dark:shadow-2xl mb-6 border border-indigo-200 dark:border-indigo-700 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Today's Schedule - {dayNames[new Date().getDay()]}
          </h2>

          {currentClass && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/40 border-l-4 border-green-500 dark:border-green-400 rounded-lg">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">Current Class</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{currentClass.subject}</p>
              <p className="text-sm text-green-700 dark:text-green-300">{currentClass.startTime} - {currentClass.endTime}</p>
            </div>
          )}

          {nextClass && !currentClass && (
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Next Class</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{nextClass.subject}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Starts at {nextClass.startTime}</p>
            </div>
          )}

          <div className="space-y-2">
            {todaySchedule.map(slot => (
              <div
                key={slot._id}
                className="p-3 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-between border border-gray-200 dark:border-slate-600"
                style={{ borderLeftColor: slot.color, borderLeftWidth: '4px' }}
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{slot.subject}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    {slot.startTime} - {slot.endTime}
                  </p>
                  {slot.location && (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      <MapPinIcon className="w-4 h-4 inline mr-1" />
                      {slot.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditSlot(slot)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSemester && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-slate-600">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">
              Click on a day to add classes
            </p>
          </div>

          <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-slate-600">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
              const daySlots = getSlotsForDay(dayIndex);
              return (
                <div key={dayIndex} className="min-h-[400px]">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <h3 className="font-bold text-center text-gray-900 dark:text-white">
                      {dayNames[dayIndex]}
                    </h3>
                    <button
                      onClick={() => openAddSlotModal(dayIndex)}
                      className="mt-2 w-full px-2 py-1 bg-indigo-600 dark:bg-indigo-500 text-white text-sm rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Class
                    </button>
                  </div>

                  <div className="p-2 space-y-2">
                    {daySlots.length === 0 ? (
                      <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8 font-medium">
                        No classes
                      </p>
                    ) : (
                      daySlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <div
                            key={slot._id}
                            className="p-3 rounded-lg shadow-sm dark:shadow-md cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-all duration-200 border-l-4"
                            style={{
                              backgroundColor: `${slot.color}15`,
                              borderLeftColor: slot.color
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  {slot.subject}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 font-semibold">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                {slot.location && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    📍 {slot.location}
                                  </p>
                                )}
                                {slot.instructor && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    👤 {slot.instructor}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditSlot(slot)}
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot._id)}
                                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!activeSemester && !loading && (
        <div className="text-center py-20">
          <AcademicCapIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-2">
            No Active Semester
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            Create a semester to start managing your timetable
          </p>
          <button
            onClick={() => setShowSemesterModal(true)}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold shadow-lg"
          >
            Create Semester
          </button>
        </div>
      )}

      {showSemesterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Semesters</h2>
              <button
                onClick={() => setShowSemesterModal(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateSemester} className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Create New Semester</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                      Semester Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Fall 2025"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      value={semesterForm.name}
                      onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      value={semesterForm.startDate}
                      onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      value={semesterForm.endDate}
                      onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold"
                >
                  Create Semester
                </button>
              </form>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Your Semesters</h3>
                <div className="space-y-2">
                  {semesters.map(sem => (
                    <div
                      key={sem._id}
                      className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {sem.name}
                          {sem.isActive && (
                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">
                          {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSemester(sem._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingSlot ? 'Edit Class' : 'Add Class'}
              </h2>
              <button
                onClick={() => {
                  setShowSlotModal(false);
                  setEditingSlot(null);
                  resetSlotForm();
                }}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingSlot ? handleEditSlot : handleAddSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Day of Week
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  value={slotForm.dayOfWeek}
                  onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: parseInt(e.target.value) })}
                  required
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Subject/Class Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Location/Room
                </label>
                <input
                  type="text"
                  placeholder="e.g., Room 301"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={slotForm.location}
                  onChange={(e) => setSlotForm({ ...slotForm, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Instructor/Professor
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={slotForm.instructor}
                  onChange={(e) => setSlotForm({ ...slotForm, instructor: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        slotForm.color === preset.value
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setSlotForm({ ...slotForm, color: preset.value })}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  value={slotForm.notes}
                  onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold"
                >
                  {editingSlot ? 'Update Class' : 'Add Class'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSlotModal(false);
                    setEditingSlot(null);
                    resetSlotForm();
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeTable;
