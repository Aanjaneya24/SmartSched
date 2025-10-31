import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import { TaskProvider } from "./context/TaskContext";
import { GoogleCalendarProvider } from "./context/GoogleCalendarContext";
import { TimetableProvider } from "./context/TimetableContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Progress from "./components/Progress";
import Tasks from "./components/Tasks";
import TimeTable from "./components/TimeTable";
import GoogleCalendarIntegration from "./components/GoogleCalendarIntegration";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TaskProvider>
          <GoogleCalendarProvider>
            <TimetableProvider>
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
              <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimeTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <GoogleCalendarIntegration />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">
                    404 - Page Not Found
                  </h2>
                  <p className="text-gray-600 mt-2">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
            </TimetableProvider>
          </GoogleCalendarProvider>
        </TaskProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
