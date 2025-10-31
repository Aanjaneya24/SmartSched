import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const authLinks = [
    { name: "HOME", path: "/", id: "home" },
    { name: "PROGRESS", path: "/progress", id: "progress" },
    { name: "TASKS", path: "/tasks", id: "tasks" },
    { name: "TIMETABLE", path: "/timetable", id: "timetable" },
    { name: "CALENDAR", path: "/calendar", id: "calendar" },
  ];

  const publicLinks = [
    { name: "LOGIN", path: "/login", id: "login" },
    { name: "SIGNUP", path: "/signup", id: "signup" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleDarkMode = () => {
    console.log('Button clicked in Navbar');
    toggleDarkMode();
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md dark:shadow-2xl px-8 py-4 transition-colors duration-300 border-b border-gray-200 dark:border-slate-600">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 dark:from-pink-500 dark:to-pink-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
            <span className="text-white font-bold text-sm">SS</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent transition-all duration-300">Smart Sched</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-semibold tracking-wide rounded-lg
                    ${
                      activeLink === link.path
                        ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/40"
                        : "text-gray-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }
                    transition-all duration-300
                  `}
                  onClick={() => setActiveLink(link.path)}
                >
                  {link.name}
                </Link>
              ))}
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-semibold tracking-wide rounded-lg
                    ${
                      activeLink === link.path
                        ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/40"
                        : "text-gray-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }
                    transition-all duration-300
                  `}
                  onClick={() => setActiveLink(link.path)}
                >
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Profile/Logout Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={handleToggleDarkMode}
            type="button"
            className="p-2.5 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-amber-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {user && (
            <>
              <div className="text-sm font-semibold text-gray-700 dark:text-slate-100 transition-colors duration-300">
                Welcome, <span className="text-pink-600 dark:text-pink-400 font-bold">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-white hover:bg-pink-600 dark:hover:bg-pink-500 border-2 border-pink-600 dark:border-pink-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
              >
                Logout
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 rounded-full overflow-hidden flex items-center justify-center shadow-lg ring-2 ring-pink-400 dark:ring-pink-600 transition-all duration-300">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-pink-700 dark:text-pink-200 font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

