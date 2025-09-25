import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function TimeTable() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);

  // Sample recurring schedule data
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: [
      { id: 1, time: '09:00-10:30', title: 'Team Meeting', isRecurring: true },
      { id: 2, time: '11:00-12:00', title: 'Code Review', isRecurring: true }
    ],
    tuesday: [
      { id: 3, time: '10:00-11:30', title: 'Project Planning', isRecurring: true }
    ],
    // Add other days if needed
  });

  // Sample one-time tasks
  const [oneTimetasks, setOneTimetasks] = useState([
    {
      id: 1,
      title: 'Client Presentation',
      date: '2025-08-26',
      time: '14:00-15:00',
      isRecurring: false
    }
  ]);

  // Get visible days (3 days at a time)
  const getVisibleDays = () => {
    const days = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + viewIndex + i);
      days.push(date);
    }
    return days;
  };

  // Helper function to get weekday name in lowercase
  const getWeekday = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  // Get all unique time slots that have tasks
  const getActiveTimeSlots = () => {
    const timesSet = new Set();
    
    // Add recurring tasks times
    Object.values(weeklySchedule).forEach(dayTasks => {
      dayTasks.forEach(task => {
        timesSet.add(task.time.split('-')[0]);
      });
    });
    
    // Add one-time tasks times
    oneTimetasks.forEach(task => {
      timesSet.add(task.time.split('-')[0]);
    });

    return Array.from(timesSet).sort();
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );

  const activeTimeSlots = getActiveTimeSlots();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewIndex(prev => prev - 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {getVisibleDays()[0].toLocaleDateString()} - {getVisibleDays()[2].toLocaleDateString()}
            </span>
            <button 
              onClick={() => setViewIndex(prev => prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-[100px_1fr] divide-x">
          {/* Time Labels */}
          <div className="divide-y">
            {activeTimeSlots.map(time => (
              <div key={time} className="h-20 p-2 text-sm text-gray-500">
                {time}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="grid grid-cols-3 divide-x">
            {getVisibleDays().map(date => (
              <div key={date.toISOString()} className="divide-y">
                <div className="p-4 text-center bg-gray-50">
                  <div className="font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {date.toLocaleDateString()}
                  </div>
                </div>
                {/* Time slots */}
                {activeTimeSlots.map(time => {
                  const weekday = getWeekday(date);
                  const dayTasks = [
                    ...(weeklySchedule[weekday] || []),
                    ...oneTimetasks.filter(task => task.date === date.toISOString().split('T')[0])
                  ].filter(task => task.time.startsWith(time));

                  return (
                    <div key={`${date}-${time}`} className="h-20 p-2 relative">
                      {dayTasks.map(task => (
                        <div 
                          key={task.id}
                          className={`absolute left-0 right-0 mx-2 p-2 rounded text-sm ${
                            task.isRecurring ? 'bg-blue-100 hover:bg-blue-200' : 'bg-green-100 hover:bg-green-200'
                          } transition-colors duration-200 cursor-pointer`}
                        >
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-gray-600">{task.time}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeTable;