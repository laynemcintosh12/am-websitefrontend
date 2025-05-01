import React, { useContext } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Header = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Company Overview
        </h1>
      </div>
    </div>
  );
};

export default Header;
