import React, { useState, useEffect } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/taskService";
import { CheckCircleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function Dashboard() {
  const { user } = useAuth();

  // Calendar state
  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
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

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const res = await taskService.getTasks();
        setTasks(res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await taskService.createTask({ title, detail, category, priority });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDetail('');
      setCategory('General');
      setPriority('Medium');
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Complete task
  const handleCompleteTask = async (task) => {
    try {
      const updated = await taskService.updateTask(task._id, {
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map(t => t._id === task._id ? updated.data : t));
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
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
    try {
      const updated = await taskService.updateTask(editingTaskId, {
        title: editTitle,
        detail: editDetail,
      });
      setTasks(tasks.map(t => t._id === editingTaskId ? updated.data : t));
      setEditingTaskId(null);
      setEditTitle('');
      setEditDetail('');
    } catch (err) {
      console.error("Error editing task:", err);
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

  // Filtered tasks based on category and priority
  const filteredTasks = tasks.filter(task => {
    return (filterCategory === 'All' || task.category === filterCategory) &&
           (filterPriority === 'All' || task.priority === filterPriority);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8">
        Hello, {user ? user.name : 'Guest'}! &nbsp;
        <span className="text-gray-500">Let's finished today's work</span>
      </h1>

      {/* Task Input Section */}
      <form className="flex gap-4 mb-8 flex-wrap" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Type Title Of Task"
          className="px-4 py-2 bg-gray-100 rounded-md w-48"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Detail Of Your Task"
          className="px-4 py-2 bg-gray-100 rounded-md flex-1"
          value={detail}
          onChange={e => setDetail(e.target.value)}
        />
        <select
          className="px-4 py-2 bg-gray-100 rounded-md"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Study">Study</option>
        </select>
        <select
          className="px-4 py-2 bg-gray-100 rounded-md"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          +
        </button>
      </form>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Calendar Section - 4 columns */}
        <div className="col-span-4">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4 mt-13">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  ←
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  →
                </button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center py-1 text-gray-600 font-medium">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    text-center py-1 rounded-full
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${day.isToday ? 'bg-pink-500 text-white' : ''}
                    ${day.isCurrentMonth && !day.isToday ? 'hover:bg-gray-200 cursor-pointer' : ''}
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
          {/* Filters */}
          <div className="flex gap-4 mb-6 items-center flex-wrap">
            <select
              className="px-4 py-2 bg-orange-50 rounded-md"
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
              className="px-4 py-2 bg-orange-50 rounded-md"
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
                className="pl-8 pr-4 py-2 border rounded-md w-48"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
            </div>
          </div>

          {/* Task Cards */}
          {loadingTasks ? (
            <div>Loading tasks...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-2">
              {filteredTasks.map((task) => (
                <div key={task._id} className={`p-4 rounded-lg ${task.completed ? "bg-green-100" : "bg-orange-50"}`}>
                  <div className="flex justify-between">
                    <div>
                      {editingTaskId === task._id ? (
                        <form onSubmit={handleEditTask}>
                          <input
                            className="font-semibold mb-1 px-2 py-1 rounded border"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            required
                          />
                          <input
                            className="text-sm text-gray-600 mb-1 px-2 py-1 rounded border"
                            value={editDetail}
                            onChange={e => setEditDetail(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2">
                            <button type="submit" className="text-blue-600">Save</button>
                            <button type="button" onClick={cancelEdit} className="text-gray-500">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className={`font-semibold ${task.completed ? "line-through text-gray-400" : ""}`}>{task.title}</h3>
                          <p className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-600"}`}>{task.detail}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold
                              ${task.priority === 'High' ? 'bg-red-200 text-red-800' :
                                task.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'}`}>
                              {task.priority}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                              {task.category}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 hover:text-green-600" onClick={() => handleCompleteTask(task)}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button className="p-1 hover:text-blue-600" onClick={() => startEditTask(task)}>
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="p-1 hover:text-red-600" onClick={() => handleDeleteTask(task._id)}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full text-center text-blue-600 hover:underline py-1 mb-4">
            Load more
          </button>
        </div>
      </div>

      {/* Stats Section - Updated spacing */}
      <div className="mt-4 grid grid-cols-3 gap-6 bg-white p-3 rounded-lg shadow-sm">
        <div className="bg-orange-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-600 text-sm font-medium mb-1">COMPLETED TASKS</h3>
          <p className="text-4xl font-bold">04</p>
        </div>
        
        <div className="bg-pink-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-600 text-sm font-medium mb-1">PENDING TASKS</h3>
          <p className="text-4xl font-bold">15</p>
        </div>

        <div className="bg-white border rounded-lg p-3 flex items-center justify-between">
          <div>
            <h3 className="text-blue-600 text-sm font-medium mb-1">Tasks created</h3>
            <p className="text-4xl font-bold">1,500</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-blue-600 text-sm mb-2">25k+ Active Users</span>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
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