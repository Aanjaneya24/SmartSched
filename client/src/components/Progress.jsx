import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTask } from '../context/TaskContext';
import api from '../services/api';

function Progress() {
  const { tasks, getTaskStats } = useTask();
  const stats = getTaskStats();
  
  const [progress, setProgress] = useState({
    daily: { completed: 0, total: 0 },
    monthly: { completed: 0, total: 0 }
  });
  const [streak, setStreak] = useState(0);
  const [categoryProgress, setCategoryProgress] = useState([]);

  // Fetch daily/monthly progress from backend
  useEffect(() => {
    api.get('/tasks/progress')
      .then(res => setProgress(res.data))
      .catch(() => setProgress({
        daily: { completed: 0, total: 0 },
        monthly: { completed: 0, total: 0 }
      }));
  }, [tasks]); // Re-fetch when tasks change

  // Fetch streak data
  useEffect(() => {
    api.get('/tasks/streak')
      .then(res => setStreak(res.data.streak))
      .catch(() => setStreak(0));
  }, [tasks]); // Re-fetch when tasks change

  // Fetch category progress
  useEffect(() => {
    api.get('/tasks/category-progress')
      .then(res => setCategoryProgress(res.data))
      .catch(() => setCategoryProgress([]));
  }, [tasks]); // Re-fetch when tasks change

  const dailyPercentage = progress.daily.total === 0 ? 0 : ((progress.daily.completed / progress.daily.total) * 100).toFixed(0);
  const monthlyPercentage = progress.monthly.total === 0 ? 0 : ((progress.monthly.completed / progress.monthly.total) * 100).toFixed(0);

  const suggestions = [
    "Try breaking down large tasks into smaller ones",
    "Take regular breaks between tasks",
    "Set realistic deadlines for better productivity"
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Progress Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Daily Progress Wheel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Today's Progress</h2>
          <div className="w-48 h-48 mx-auto">
            <CircularProgressbar
              value={dailyPercentage}
              text={`${dailyPercentage}%`}
              styles={buildStyles({
                pathColor: '#ec4899',
                textColor: '#374151',
                trailColor: '#f3f4f6'
              })}
            />
          </div>
          <p className="text-center mt-4 text-gray-700 dark:text-slate-200 font-medium">
            {progress.daily.completed} of {progress.daily.total} tasks completed
          </p>
        </div>

        {/* Monthly Goals Progress */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Monthly Goals</h2>
          <div className="w-48 h-48 mx-auto">
            <CircularProgressbar
              value={monthlyPercentage}
              text={`${monthlyPercentage}%`}
              styles={buildStyles({
                pathColor: '#8b5cf6',
                textColor: '#374151',
                trailColor: '#f3f4f6'
              })}
            />
          </div>
          <p className="text-center mt-4 text-gray-700 dark:text-slate-200 font-medium">
            {progress.monthly.completed} of {progress.monthly.total} goals achieved
          </p>
        </div>

        {/* Suggestions Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-600 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Productivity Tips</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-pink-500 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-slate-200 font-medium">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak Section */}
      <div className="mb-4 mt-4 flex items-center gap-4">
        <span className="text-xl font-semibold text-pink-600 dark:text-pink-400">
          🔥 {streak} day streak!
        </span>
        {streak > 0 && <span className="text-gray-600 dark:text-slate-300 font-medium">Keep it up!</span>}
      </div>

      {/* Progress by Category Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Progress by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryProgress.map(cat => {
            const percent = cat.total === 0 ? 0 : Math.round((cat.completed / cat.total) * 100);
            return (
              <div key={cat._id} className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700 transition-all duration-300">
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2 text-lg">{cat._id}</div>
                <div className="w-full bg-blue-100 dark:bg-slate-700 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 font-semibold">{cat.completed} of {cat.total} completed ({percent}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Progress;