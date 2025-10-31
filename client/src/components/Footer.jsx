import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaGithub } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Smart Sched</span>
          </div>

          {/* Copyright Text */}
          <div className="text-gray-600 dark:text-slate-400 text-sm">
            © 2025 Smart Sched. All Rights Reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {[
              { Icon: FaFacebookF, href: '#', label: 'Facebook' },
              { Icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
              { Icon: FaTwitter, href: '#', label: 'Twitter' },
              { Icon: FaGithub, href: '#', label: 'GitHub' }
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 border border-gray-300 dark:border-slate-600 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;