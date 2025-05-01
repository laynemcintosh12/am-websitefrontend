import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const HelpfulResources = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 sm:p-6 rounded-lg shadow-sm`}>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Helpful Resources</h3>
      <div className="space-y-2 sm:space-y-4">
        <a href="#" className={`block p-3 sm:p-4 border ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} rounded-lg cursor-pointer`}>
          <div className="flex items-center space-x-3">
            <i className="fab fa-google-drive text-red-500 text-lg sm:text-xl"></i>
            <div>
              <h4 className="text-sm sm:text-base font-medium">Google Drive Folder</h4>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Access shared documents</p>
            </div>
          </div>
        </a>
        <a href="#" className={`block p-3 sm:p-4 border ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} rounded-lg cursor-pointer`}>
          <div className="flex items-center space-x-3">
            <i className="fas fa-graduation-cap text-blue-500 text-lg sm:text-xl"></i>
            <div>
              <h4 className="text-sm sm:text-base font-medium">Training Materials</h4>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Learn new skills</p>
            </div>
          </div>
        </a>
        <a href="#" className={`block p-3 sm:p-4 border ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} rounded-lg cursor-pointer`}>
          <div className="flex items-center space-x-3">
            <i className="fas fa-book text-green-500 text-lg sm:text-xl"></i>
            <div>
              <h4 className="text-sm sm:text-base font-medium">Documentation</h4>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Read user guides</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default HelpfulResources;