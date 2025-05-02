import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import TooltipIcon from '../Common/TooltipIcon';

const formatCurrency = (amount, decimals = 2) => {
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

const CustomerDataBlocks = ({ userData }) => {
  const { isDarkMode } = useDarkMode();
  
  if (!userData?.metrics) {
    console.log('No metrics found in userData');
    return <div className="animate-pulse">Loading...</div>;
  }

  const metrics = userData.metrics;
  const isAffiliate = userData.role?.includes('Affiliate');
  const hasTeamMetrics = metrics.teamMetrics && 
    Object.keys(metrics.teamMetrics).length > 0 && 
    (metrics.teamMetrics.currentCustomers > 0 || 
     metrics.teamMetrics.totalCustomers > 0 || 
     metrics.teamMetrics.finalizedCustomers > 0);
  
  const blocks = [
    // Team Stats (show for users with team metrics, except Affiliates)
    ...(!isAffiliate && hasTeamMetrics ? [
      {
        title: "Team Current Customers",
        value: metrics.teamMetrics?.currentCustomers || 0,
        subtitle: "Active projects",
        icon: "users",
        color: "blue",
        tooltip: "Team customers not in statuses: Finalized, Lost, Lead, Appt Scheduled, Inspection Complete"
      },
      {
        title: "Team Total Customers",
        value: metrics.teamMetrics?.totalCustomers || 0,
        subtitle: "All projects",
        icon: "user-friends",
        color: "green",
        tooltip: "All team customers excluding Lost statuses"
      },
      {
        title: "Team Finalized Customers",
        value: metrics.teamMetrics?.finalizedCustomers || 0,
        subtitle: "Completed projects",
        icon: "check-circle",
        color: "purple",
        tooltip: "Team customers with Finalized status"
      }
    ] : []),
    // Personal Stats
    {
      title: "Current Customers",
      value: metrics.currentCustomers,
      subtitle: "Your active projects",
      icon: "user",
      color: "blue",
      tooltip: "Your customers not in finalized or lost statuses"
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      subtitle: "All your projects",
      icon: "users",
      color: "indigo",
      tooltip: "All your customers excluding lost statuses"
    },
    {
      title: "Finalized Customers",
      value: metrics.finalizedCustomers,
      subtitle: "Completed projects",
      icon: "check-double",
      color: "green",
      tooltip: "Your customers with Finalized status"
    },
    {
      title: metrics.isSupplementRole ? "Avg. Margin" : "Conversion Rate",
      value: metrics.isSupplementRole 
        ? formatCurrency(metrics.performanceMetric || 0, 2)  // Add 2 decimal places for margin
        : `${(metrics.performanceMetric || 0).toFixed(1)}%`,  // Keep 1 decimal for conversion rate
      subtitle: metrics.isSupplementRole ? "Per project" : "Success rate",
      icon: metrics.isSupplementRole ? "chart-line" : "percentage",
      color: "yellow",
      tooltip: metrics.isSupplementRole 
        ? "Average margin increase for finalized customers"
        : "Percentage of customers that reached finalized status compared to those that were lost (Finalized / (Finalized + Lost))"
    }
  ];

  return (
    <div className="space-y-6">
      {!isAffiliate && hasTeamMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {blocks.slice(0, 3).map((block, index) => (
            <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className={`fas fa-${block.icon} text-${block.color}-500 text-2xl`}></i>
                </div>
                <div className="ml-5 flex-grow">
                  <div className="flex items-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {block.title}
                    </p>
                    {block.tooltip && <TooltipIcon content={block.tooltip} />}
                  </div>
                  <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {typeof block.value === 'number' ? block.value.toLocaleString() : block.value}
                  </p>
                  <p className={`text-sm text-${block.color}-500`}>
                    {block.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {blocks.slice(!isAffiliate && hasTeamMetrics ? 3 : 0).map((block, index) => (
          <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className={`fas fa-${block.icon} text-${block.color}-500 text-2xl`}></i>
              </div>
              <div className="ml-5 flex-grow">
                <div className="flex items-center">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {block.title}
                  </p>
                  {block.tooltip && <TooltipIcon content={block.tooltip} />}
                </div>
                <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {typeof block.value === 'number' ? block.value.toLocaleString() : block.value}
                </p>
                <p className={`text-sm text-${block.color}-500`}>
                  {block.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDataBlocks;