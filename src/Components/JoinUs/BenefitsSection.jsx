import React from 'react';

const BenefitsSection = ({ benefits, isDarkMode }) => {
  return (
    <div className={`py-12 sm:py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div className="container mx-auto px-4 overflow-hidden">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Why Join Us?
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center hover:transform hover:scale-[1.02] transition-transform">
              <div className={`w-20 h-20 flex-shrink-0 ${isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500'} rounded-full flex items-center justify-center mr-8`}>
                <i className={`fas ${benefit.icon} text-3xl ${isDarkMode ? 'text-gray-900' : 'text-white'}`}></i>
              </div>
              <div className="flex-grow">
                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {benefit.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;