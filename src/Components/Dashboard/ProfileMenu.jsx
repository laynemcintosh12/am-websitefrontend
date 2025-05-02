import React, { useEffect, useState, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const ProfileMenu = ({ isOpen, setIsOpen }) => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const [userName, setUserName] = useState('Loading...');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setSyncing] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  useEffect(() => {
    // Fetch user details from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUserName(userData.user.name); // Set the user's name
      setIsAdmin(userData.user.permissions === 'Admin'); // Check if the user is an Admin
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await Api.syncCustomers();
      console.log('Sync response:', response);
      console.log(`Sync completed. Processed ${response.customersProcessed} customers.`);
      // Refresh the page after sync
      window.location.reload();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {/* Desktop view - show username */}
        <span className="hidden md:block text-sm font-medium">{userName}</span>
        {/* Mobile view - show hamburger icon */}
        <i className="md:hidden fas fa-bars text-xl"></i>
        {/* Arrow icon - only visible on desktop */}
        <i className={`hidden md:block fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} text-xs ml-1`}></i>
      </div>
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg py-1 z-[100]`}>
          <a href="/" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-home text-gray-400 w-5"></i>
            <span>Home</span>
          </a>
          <a href="/profile" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-user text-gray-400 w-5"></i>
            <span>My Profile</span>
          </a>
          <a href="/financials" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-dollar-sign text-gray-400 w-5"></i>
            <span>Financials</span>
          </a>
          {isAdmin && (
            <a href="/admin-overview" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <i className="fas fa-tools text-gray-400 w-5"></i>
              <span>Admin Overview</span>
            </a>
          )}
          {isAdmin && (
            <a href="/admin-accounting" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <i className="fas fa-tools text-gray-400 w-5"></i>
              <span>Admin Accounting</span>
            </a>
          )}
          {isAdmin && (
            <a href="/admin-settings" className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <i className="fas fa-tools text-gray-400 w-5"></i>
              <span>Admin Settings</span>
            </a>
          )}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center px-4 py-2 text-sm w-full text-left ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className={`fas fa-sync text-gray-400 w-5 ${isSyncing ? 'animate-spin' : ''}`}></i>
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} text-gray-400 w-5`}></i>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
          >
            <i className="fas fa-sign-out-alt text-red-400 w-5"></i>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;