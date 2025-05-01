import React from 'react';

const IdealCandidatesSection = ({ candidates, isDarkMode }) => {
  return (
    <div className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 overflow-hidden">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Perfect For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <div key={index} className="text-center">
              <i className={`fas ${candidate.icon} text-5xl ${isDarkMode ? 'text-yellow-600' : 'text-yellow-500'} mb-6`}></i>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {candidate.title}
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {candidate.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdealCandidatesSection;