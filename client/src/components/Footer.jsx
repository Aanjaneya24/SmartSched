import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaGithub } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-pink-100 border-t border-pink-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">SS</span>
            </div>
            <span className="text-lg font-semibold">Smart Sched</span>
          </div>

          {/* Copyright Text */}
          <div className="text-gray-600 text-sm">
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
                className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
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