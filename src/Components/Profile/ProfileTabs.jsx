import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const { isDarkMode } = useDarkMode();
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'Quick Contacts', label: 'Quick Contacts' },
  ];

  return (
    <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;