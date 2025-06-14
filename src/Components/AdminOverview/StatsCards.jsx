import React from 'react';
import TooltipIcon from '../Common/TooltipIcon';

const StatsCards = ({ companyStats, isDarkMode }) => {
  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    if (isNaN(num)) return '$0.00';
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    const num = Number(value || 0);
    return isNaN(num) ? '0%' : `${num.toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    const num = Number(value || 0);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const cards = [
    // Top row - 4 most important metrics
    {
      title: "Total Revenue",
      value: formatCurrency(companyStats.totalRevenue),
      icon: "hand-holding-usd",
      color: "blue",
      tooltip: "Total revenue from customers with Finalized status"
    },
    {
      title: "Total Commissions",
      value: formatCurrency(companyStats.totalCommissionsPaid),
      icon: "money-bill-wave",
      color: "green",
      tooltip: "Sum of all commissions earned by team members from finalized customers"
    },
    {
      title: "Success Rate",
      value: formatPercentage(companyStats.conversionRate),
      icon: "trophy",
      color: "pink",
      tooltip: "Percentage of finalized customers vs total finalized and lost customers"
    },
    {
      title: "Total Customers",
      value: formatNumber(companyStats.totalYearlyCustomers),
      icon: "users",
      color: "purple",
      tooltip: "Total customers created in current year"
    },
    // Bottom row - 5 secondary metrics
    {
      title: "Prospective Customers",
      value: formatNumber(companyStats.totalProspectiveCustomers),
      icon: "handshake",
      color: "teal",
      tooltip: "Customers in Lead, Appt Scheduled, or Inspection Complete status"
    },
    {
      title: "Active Projects",
      value: formatNumber(companyStats.totalCurrentCustomers),
      icon: "clipboard-list",
      color: "yellow",
      tooltip: "Customers with active project status"
    },
    {
      title: "Completed Projects",
      value: formatNumber(companyStats.totalFinalizedCustomers),
      icon: "check-double",
      color: "green",
      tooltip: "Total number of finalized customers"
    },
    {
      title: "Avg. Job Price",
      value: formatCurrency(companyStats.averageJobPrice),
      icon: "file-invoice-dollar",
      color: "indigo",
      tooltip: "Average total job price for finalized customers"
    },
    {
      title: "Avg Margin Increase",
      value: formatCurrency(companyStats.averageMarginIncrease),
      icon: "chart-line",
      color: "orange",
      tooltip: "Average margin increase for finalized customers with assigned supplementers"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      {cards.slice(0, 4).map((card, index) => (
        <div key={`top-${index}`} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          {/* Card content */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className={`fas fa-${card.icon} text-${card.color}-500 text-2xl`}></i>
            </div>
            <div className="ml-5 flex-grow">
              <div className="flex items-center">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {card.title}
                </p>
                {card.tooltip && <TooltipIcon content={card.tooltip} />}
              </div>
              <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {card.value}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {card.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <div className="col-span-full">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {cards.slice(4).map((card, index) => (
            <div key={`bottom-${index}`} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              {/* Card content */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className={`fas fa-${card.icon} text-${card.color}-500 text-2xl`}></i>
                </div>
                <div className="ml-5 flex-grow">
                  <div className="flex items-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {card.title}
                    </p>
                    {card.tooltip && <TooltipIcon content={card.tooltip} />}
                  </div>
                  <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
