import React from 'react';

const BalanceMetrics = ({ totalEarned, potentialCommission, totalPaid, currentBalance, formatCurrency, isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-colors duration-300`}>
        <span className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} mb-2`}>
          {formatCurrency(totalEarned)}
        </span>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Earned</p>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-colors duration-300`}>
        <span className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'} mb-2`}>
          {formatCurrency(potentialCommission)} {/* This will now only show sum of positive amounts */}
        </span>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Potential Commission</p>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-colors duration-300`}>
        <span className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-600'} mb-2`}>
          {formatCurrency(totalPaid)}
        </span>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Paid</p>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-colors duration-300`}>
        <span className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} mb-2`}>
          {formatCurrency(currentBalance)}
        </span>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Balance</p>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-colors duration-300`}>
        <span className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} mb-2`}>
          {formatCurrency(currentBalance + potentialCommission)}
        </span>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Projected Balance</p>
      </div>
    </div>
  );
};

export default BalanceMetrics;