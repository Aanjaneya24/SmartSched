import React, { useState } from 'react';
import { FaTrash, FaEdit, FaClock, FaPlus, FaCheck, FaGoogle, FaCalendarPlus } from 'react-icons/fa';
import { useTask } from '../context/TaskContext';
import { useGoogleCalendar } from '../context/GoogleCalendarContext';

function Tasks() {
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion,
    getTaskStats 
  } = useTask();

  const { connected: googleConnected } = useGoogleCalendar();

  // Get default start and end times
  const getDefaultStartTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const getDefaultEndTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight (12:00 AM)
    return tomorrow.toISOString().slice(0, 16);
  };

  // Form state for new task
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    detail: '',
    category: 'General',
    priority: 'Medium',
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    syncWithCalendar: false
  });

  // Edit state
  const [editingTask, setEditingTask] = useState(null);

  const stats = getTaskStats();

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const result = await createTask(newTask);
    if (result.success) {
      setNewTask({ 
        title: '', 
        detail: '', 
        category: 'General', 
        priority: 'Medium',
        startTime: getDefaultStartTime(),
        endTime: getDefaultEndTime(),
        syncWithCalendar: false
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    const result = await updateTask(editingTask._id, {
      title: editingTask.title,
      detail: editingTask.detail,
      category: editingTask.category,
      priority: editingTask.priority,
    });

    if (result.success) {
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleToggleComplete = async (taskId) => {
    await toggleTaskCompletion(taskId);
  };

  // Separate tasks into categories
  const priorityTasks = tasks.filter(task => !task.completed && (task.priority === 'High' || task.priority === 'Medium'));
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const [availableTimeSlots] = useState([
    { time: '1:00 PM - 2:00 PM', productivity: 'High' },
    { time: '3:30 PM - 4:30 PM', productivity: 'Medium' },
    { time: '5:00 PM - 6:00 PM', productivity: 'High' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
        >
          <FaPlus /> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl mb-8 border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <textarea
              placeholder="Task Details"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
              rows="3"
              value={newTask.detail}
              onChange={(e) => setNewTask({...newTask, detail: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 font-medium"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 font-medium"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            {/* Date/Time fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1 font-semibold">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1 font-semibold">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                />
              </div>
            </div>

            {/* Google Calendar Sync */}
            {googleConnected && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                <input
                  type="checkbox"
                  id="syncWithCalendar"
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                  checked={newTask.syncWithCalendar}
                  onChange={(e) => setNewTask({...newTask, syncWithCalendar: e.target.checked})}
                />
                <label htmlFor="syncWithCalendar" className="flex items-center gap-2 cursor-pointer">
                  <FaGoogle className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-purple-200">
                    Sync with Google Calendar
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold shadow-lg transition-all duration-300">
                Create Task
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-200 font-medium">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Priority Tasks */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              Priority Tasks
              <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-sm rounded-full font-bold">
                {priorityTasks.length}
              </span>
            </h2>
            <div className="space-y-3">
              {priorityTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-slate-300 text-center py-4 font-medium">No priority tasks</p>
              ) : (
                priorityTasks.map(task => (
                  <div key={task._id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 transition-all duration-300">
                    {editingTask?._id === task._id ? (
                      <form onSubmit={handleUpdateTask} className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                        />
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          value={editingTask.detail}
                          onChange={(e) => setEditingTask({...editingTask, detail: e.target.value})}
                        />
                        <div className="flex gap-1">
                          <button type="submit" className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded font-semibold">Save</button>
                          <button type="button" onClick={() => setEditingTask(null)} className="px-2 py-1 bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded font-semibold">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">{task.title}</h3>
                            {task.detail && <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">{task.detail}</p>}
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200' :
                                task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200' :
                                'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200'
                              }`}>
                                {task.priority}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 font-bold">
                                {task.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            onClick={() => handleToggleComplete(task._id)}
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            onClick={() => setEditingTask(task)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Best Available Time Slots */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Best Time Slots Today</h2>
            <div className="space-y-3">
              {availableTimeSlots.map((slot, index) => (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaClock className="text-green-600 dark:text-green-400 mr-2" />
                      <span className="font-bold text-gray-900 dark:text-white">{slot.time}</span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full font-bold ${
                      slot.productivity === 'High' ? 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-200'
                    }`}>
                      {slot.productivity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              Completed Tasks
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-sm rounded-full font-bold">
                {completedTasks.length}
              </span>
            </h2>
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-slate-300 text-center py-4 font-medium">No completed tasks yet</p>
              ) : (
                completedTasks.map(task => (
                  <div key={task._id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-green-500 dark:border-green-400 border border-gray-200 dark:border-slate-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold line-through text-gray-600 dark:text-slate-400">{task.title}</h3>
                        {task.detail && <p className="text-sm text-gray-500 dark:text-slate-400 line-through font-medium">{task.detail}</p>}
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300 font-bold">
                            {task.category}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete task"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;