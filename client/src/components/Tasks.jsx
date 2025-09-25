import React, { useState } from 'react';
import { FaTrash, FaEdit, FaClock } from 'react-icons/fa';

function Tasks() {
  const [priorityTasks, setPriorityTasks] = useState([
    { id: 1, title: 'Complete Project Proposal', deadline: '2pm', priority: 'high' },
    { id: 2, title: 'Team Meeting', deadline: '4pm', priority: 'medium' },
  ]);

  const [completedTasks] = useState([
    { id: 3, title: 'Morning Standup', completedAt: '10:00 AM' },
    { id: 4, title: 'Email Responses', completedAt: '11:30 AM' },
  ]);

  const [availableTimeSlots] = useState([
    { time: '1:00 PM - 2:00 PM', productivity: 'High' },
    { time: '3:30 PM - 4:30 PM', productivity: 'Medium' },
    { time: '5:00 PM - 6:00 PM', productivity: 'High' },
  ]);

  const handleDeleteTask = (taskId) => {
    setPriorityTasks(tasks => tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Task Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Priority Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Priority Tasks
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
              {priorityTasks.length}
            </span>
          </h2>
          <div className="space-y-3">
            {priorityTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">Due by {task.deadline}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <FaEdit />
                  </button>
                  <button 
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Available Time Slots */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Best Time Slots Today</h2>
          <div className="space-y-3">
            {availableTimeSlots.map((slot, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaClock className="text-green-600 mr-2" />
                    <span className="font-medium">{slot.time}</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    slot.productivity === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {slot.productivity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previously Completed Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  Completed at {task.completedAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;