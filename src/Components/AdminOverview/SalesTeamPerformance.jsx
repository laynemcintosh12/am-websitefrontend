import React, { useEffect, useState } from 'react';
import TooltipIcon from '../Common/TooltipIcon';

const SalesTeamPerformance = ({ isDarkMode, processedTeams }) => {
  const [displayTeams, setDisplayTeams] = useState([]);

  const getTeamStyle = (teamType) => {
    switch (teamType.toLowerCase()) {
      case 'sales':
        return {
          bgColor: isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50',
          badgeColor: isDarkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
        };
      case 'supplement':
        return {
          bgColor: isDarkMode ? 'bg-green-900/50' : 'bg-green-50',
          badgeColor: isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
        };
      default:
        return {
          bgColor: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
          badgeColor: isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
        };
    }
  };

  useEffect(() => {
    if (processedTeams?.length) {
      const teamsToDisplay = processedTeams.map(team => {
        const style = getTeamStyle(team.type);
        
        return {
          team: team.name,
          type: team.type,
          revenue: team.revenue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }),
          conversion: team.conversionRate.toFixed(1), // Use pre-calculated conversion rate
          customerCount: team.customerCount,
          ...style
        };
      });

      setDisplayTeams(teamsToDisplay);
    }
  }, [processedTeams, isDarkMode]);

  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {displayTeams.map((team, index) => (
        <div key={index} className={`p-4 ${team.bgColor} rounded-lg relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {team.team}
              </h3>
              <TooltipIcon content={`
                Team Details:
                • Revenue: Total from finalized customers
                • Conversion: Finalized / Total customers
                • Manager: ${team.leader}
              `} />
            </div>
            <span className={`text-xs ${team.badgeColor} px-2 py-1 rounded-full`}>
              {team.leader}
            </span>
          </div>
          <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {team.revenue}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Revenue from Finalized Projects
          </p>
          <div className="mt-2 flex items-center">
            <span className="text-green-600 text-sm">
              <i className="fas fa-arrow-up mr-1"></i>
              {team.conversion}%
            </span>
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Conversion Rate
            </span>
          </div>
          <div className="absolute inset-0 rounded-lg bg-gray-900 opacity-0 invisible group-hover:opacity-95 group-hover:visible transition-all duration-200">
            <div className="p-4 text-white">
              <h4 className="font-medium">Team Details</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Revenue: Total from finalized customers</li>
                <li>Conversion: Finalized / Total customers</li>
                <li>Manager: {team.leader}</li>
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesTeamPerformance;
