import React, { useState, useEffect } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useTask } from "../context/TaskContext";
import { useTimetable } from "../context/TimetableContext";
import { useGoogleCalendar } from "../context/GoogleCalendarContext";
import { CheckCircleIcon, PencilIcon, TrashIcon, ClockIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { FaBook, FaCalendarDay, FaTasks } from "react-icons/fa";

function Dashboard() {
  const { user } = useAuth();
  const { 
    tasks, 
    loading: loadingTasks, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion,
    getFilteredTasks 
  } = useTask();
  
  const { getSlotsForDay } = useTimetable();
  const { todayEvents, connected: calendarConnected } = useGoogleCalendar();

  // Calendar state
  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Filter state
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDetail, setEditDetail] = useState('');

  // Calendar generation logic
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Get the day number for first day (0 = Sunday, 1 = Monday, etc.)
      let firstDayNumber = firstDay.getDay();
      // Adjust for Monday start (0 = Monday now)
      firstDayNumber = firstDayNumber === 0 ? 6 : firstDayNumber - 1;

      const days = [];
      
      // Add empty spaces for days before the first day of month
      for (let i = 0; i < firstDayNumber; i++) {
        days.push({ 
          day: new Date(year, month, -firstDayNumber + i + 1).getDate(),
          isCurrentMonth: false 
        });
      }
      
      // Add all days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push({ 
          day, 
          isCurrentMonth: true,
          isToday: new Date().toDateString() === new Date(year, month, day).toDateString()
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentDate]);

  // Complete task
  const handleCompleteTask = async (task) => {
    const result = await toggleTaskCompletion(task._id);
    if (!result.success) {
      console.error("Error completing task:", result.error);
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    const result = await deleteTask(id);
    if (!result.success) {
      console.error("Error deleting task:", result.error);
    }
  };

  // Start editing
  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDetail(task.detail);
  };

  // Save edit
  const handleEditTask = async (e) => {
    e.preventDefault();
    const result = await updateTask(editingTaskId, {
      title: editTitle,
      detail: editDetail,
    });
    
    if (result.success) {
      setEditingTaskId(null);
      setEditTitle('');
      setEditDetail('');
    } else {
      console.error("Error editing task:", result.error);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDetail('');
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
  };

  // Filtered tasks based on category and priority using TaskContext helper
  const filteredTasks = getFilteredTasks({
    category: filterCategory !== 'All' ? filterCategory : undefined,
    priority: filterPriority !== 'All' ? filterPriority : undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">
        Hello, {user ? user.name : 'Guest'}! &nbsp;
        <span className="text-gray-500 dark:text-slate-300">Let's finish today's work</span>
      </h1>

      {/* Today's Schedule Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Today's Schedule
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {/* Today's Classes */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-600 transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <FaBook className="text-blue-600 dark:text-blue-400" />
              Classes ({getSlotsForDay(new Date().getDay()).length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getSlotsForDay(new Date().getDay()).length > 0 ? (
                getSlotsForDay(new Date().getDay()).map((slot) => (
                  <div key={slot._id} className="bg-white dark:bg-slate-700 p-3 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{slot.subject}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-300">
                      <ClockIcon className="w-4 h-4" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    {slot.location && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-300">
                        <MapPinIcon className="w-4 h-4" />
                        {slot.location}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-slate-400 text-sm italic">No classes today</p>
              )}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-600 transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-900 dark:text-green-100">
              <FaTasks className="text-green-600 dark:text-green-400" />
              Tasks ({tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length > 0 ? (
                tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).map((task) => (
                  <div key={task._id} className="bg-white dark:bg-slate-700 p-3 rounded-lg border-l-4 border-green-500 dark:border-green-400">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{task.detail}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${task.priority === 'High' ? 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-100' :
                          task.priority === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-100' :
                          'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-100'}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-slate-400 text-sm italic">No tasks due today</p>
              )}
            </div>
          </div>

          {/* Today's Google Calendar Events */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-600 transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <FaCalendarDay className="text-purple-600 dark:text-purple-400" />
              Calendar Events ({calendarConnected ? todayEvents.filter(event => {
                const todaySlots = getSlotsForDay(new Date().getDay());
                const timetableSubjects = new Set(todaySlots.map(slot => slot.subject?.toLowerCase().trim()));
                return !timetableSubjects.has(event.title?.toLowerCase().trim());
              }).length : 0})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {calendarConnected && todayEvents.length > 0 ? (
                todayEvents.filter(event => {
                  // Filter out events that are duplicates of timetable classes
                  const todaySlots = getSlotsForDay(new Date().getDay());
                  const timetableSubjects = new Set(todaySlots.map(slot => slot.subject?.toLowerCase().trim()));
                  return !timetableSubjects.has(event.title?.toLowerCase().trim());
                }).map((event) => (
                  <div key={event.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                    {!event.isAllDay && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-300">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-300">
                        <MapPinIcon className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                ))
              ) : !calendarConnected ? (
                <p className="text-gray-600 dark:text-slate-400 text-sm italic">Google Calendar not connected</p>
              ) : (
                <p className="text-gray-600 dark:text-slate-400 text-sm italic">No events today</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Calendar Section - 4 columns */}
        <div className="col-span-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 sticky top-4 mt-13 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors duration-200 text-gray-700 dark:text-slate-200 font-bold"
                >
                  ←
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors duration-200 text-gray-700 dark:text-slate-200 font-bold"
                >
                  →
                </button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center py-1 text-gray-600 dark:text-slate-300 font-semibold">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    text-center py-1 rounded-full transition-all duration-200
                    ${day.isCurrentMonth ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-slate-500'}
                    ${day.isToday ? 'bg-pink-500 text-white font-bold shadow-lg' : ''}
                    ${day.isCurrentMonth && !day.isToday ? 'hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer' : ''}
                  `}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Section - 8 columns */}
        <div className="col-span-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">All Tasks</h2>
          {/* Filters */}
          <div className="flex gap-4 mb-6 items-center flex-wrap">
            <select
              className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-orange-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all duration-300 font-medium"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
            </select>
            <select
              className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-orange-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all duration-300 font-medium"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div className="relative ml-auto">
              <input
                type="text"
                placeholder="Search by name..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg w-48 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all duration-300"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Task Cards */}
          {loadingTasks ? (
            <div className="text-gray-600 dark:text-slate-200 font-medium">Loading tasks...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-2">
              {filteredTasks.map((task) => (
                <div key={task._id} className={`p-4 rounded-xl shadow-md border transition-all duration-300 ${
                  task.completed 
                    ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-300 dark:border-green-600" 
                    : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-600"
                }`}>
                  <div className="flex justify-between">
                    <div className="flex-1">
                      {editingTaskId === task._id ? (
                        <form onSubmit={handleEditTask}>
                          <input
                            className="font-semibold mb-1 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white w-full"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            required
                          />
                          <input
                            className="text-sm text-gray-600 dark:text-slate-200 mb-1 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 w-full"
                            value={editDetail}
                            onChange={e => setEditDetail(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2">
                            <button type="submit" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Save</button>
                            <button type="button" onClick={cancelEdit} className="text-gray-500 dark:text-slate-300 hover:underline">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className={`font-semibold text-lg ${task.completed ? "line-through text-gray-500 dark:text-slate-400" : "text-gray-900 dark:text-white"}`}>{task.title}</h3>
                          <p className={`text-sm mt-1 ${task.completed ? "line-through text-gray-500 dark:text-slate-400" : "text-gray-700 dark:text-slate-200"}`}>{task.detail}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-300 mt-2 font-medium">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm
                              ${task.priority === 'High' ? 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-100 ring-1 ring-red-400 dark:ring-red-600' :
                                task.priority === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-100 ring-1 ring-yellow-400 dark:ring-yellow-600' :
                                'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-100 ring-1 ring-green-400 dark:ring-green-600'}`}>
                              {task.priority}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-100 font-bold shadow-sm ring-1 ring-blue-400 dark:ring-blue-600">
                              {task.category}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button className="p-1.5 hover:text-green-600 dark:hover:text-green-400 text-gray-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-all" onClick={() => handleCompleteTask(task)}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all" onClick={() => startEditTask(task)}>
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all" onClick={() => handleDeleteTask(task._id)}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline py-2 mb-4 font-semibold transition-colors">
            Load more
          </button>
        </div>
      </div>

      {/* Stats Section - Updated spacing */}
      <div className="mt-4 grid grid-cols-3 gap-6 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg flex flex-col items-center justify-center border border-orange-200 dark:border-orange-600">
          <h3 className="text-gray-600 dark:text-slate-200 text-sm font-bold mb-1 tracking-wide">COMPLETED TASKS</h3>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">04</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-4 rounded-lg flex flex-col items-center justify-center border border-pink-200 dark:border-pink-600">
          <h3 className="text-gray-600 dark:text-slate-200 text-sm font-bold mb-1 tracking-wide">PENDING TASKS</h3>
          <p className="text-4xl font-bold text-pink-600 dark:text-pink-400">15</p>
        </div>

        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3 flex items-center justify-between">
          <div>
            <h3 className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-1">Tasks created</h3>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">1,500</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-blue-600 dark:text-blue-400 text-sm mb-2 font-semibold">25k+ Active Users</span>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-600 overflow-hidden ring-2 ring-gray-200 dark:ring-slate-500"
                >
                  <img
                    src={`https://i.pravatar.cc/32?img=${i}`}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;