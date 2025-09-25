import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const authLinks = [
    { name: "HOME", path: "/", id: "home" },
    { name: "PROGRESS", path: "/progress", id: "progress" },
    { name: "TASKS", path: "/tasks", id: "tasks" },
    { name: "TIMETABLE", path: "/timetable", id: "timetable" },
  ];

  const publicLinks = [
    { name: "LOGIN", path: "/login", id: "login" },
    { name: "SIGNUP", path: "/signup", id: "signup" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">SS</span>
          </div>
          <span className="text-xl font-semibold">Smart Sched</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`relative px-2 py-1 text-sm font-medium tracking-wide
                    ${
                      activeLink === link.path
                        ? "text-pink-500"
                        : "text-gray-600 hover:text-pink-500"
                    }
                    transition-colors duration-200
                    before:content-['']
                    before:absolute
                    before:bottom-0
                    before:left-0
                    before:w-full
                    before:h-0.5
                    before:bg-pink-500
                    before:transform
                    before:scale-x-0
                    before:transition-transform
                    before:duration-200
                    hover:before:scale-x-100
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
                  className={`relative px-2 py-1 text-sm font-medium tracking-wide
                    ${
                      activeLink === link.path
                        ? "text-pink-500"
                        : "text-gray-600 hover:text-pink-500"
                    }
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
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {user.name}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 focus:outline-none"
            >
              Logout
            </button>
            <div className="w-10 h-10 bg-pink-100 rounded-full overflow-hidden flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-pink-600 font-medium text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

