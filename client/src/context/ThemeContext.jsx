import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize with false (light mode) by default
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        const isDark = JSON.parse(saved);
        setDarkMode(isDark);
        console.log('Loaded dark mode from localStorage:', isDark);
      }
    } catch (error) {
      console.error('Error reading darkMode from localStorage:', error);
    }
  }, []);

  // Update document class and localStorage when darkMode changes
  useEffect(() => {
    try {
      const html = document.documentElement;
      if (darkMode) {
        html.classList.add('dark');
        console.log('Dark mode enabled');
      } else {
        html.classList.remove('dark');
        console.log('Dark mode disabled');
      }
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error setting darkMode:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    console.log('Toggle clicked! Current darkMode:', darkMode);
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
