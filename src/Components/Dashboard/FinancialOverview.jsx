import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const FinancialOverview = ({ userData }) => {
  const { isDarkMode } = useDarkMode();
  const [financialMetrics, setFinancialMetrics] = useState({
    yearlyCommissions: 0,
    monthlyCommissions: 0,
    yearlyGoal: userData?.yearly_goal || 50000,
    potentialCommissions: 0,
    goalsProgress: 0
  });
  
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Get all commissions
        const allCommissions = await Api.getAllCommissions();
        const currentUserId = userData.id;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Filter commissions for current user
        const userCommissions = allCommissions.filter(commission => 
          commission.user_id === currentUserId
        );

        // Calculate YTD and monthly commissions
        const yearlyCommissions = userCommissions.reduce((sum, commission) => {
          const buildDate = new Date(commission.build_date);
          if (buildDate.getFullYear() === currentYear) {
            return sum + Number(commission.commission_amount);
          }
          return sum;
        }, 0);

        const monthlyCommissions = userCommissions.reduce((sum, commission) => {
          const buildDate = new Date(commission.build_date);
          if (buildDate.getFullYear() === currentYear && 
              buildDate.getMonth() === currentMonth) {
            return sum + Number(commission.commission_amount);
          }
          return sum;
        }, 0);

        // Get customer data for potential commissions
        const customers = await Api.getCustomers();
        
        // Filter for relevant customers
        const relevantCustomers = customers.filter(customer => 
          (customer.salesman_id === currentUserId ||
           customer.supplementer_id === currentUserId ||
           customer.manager_id === currentUserId ||
           customer.referrer_id === currentUserId ||
           customer.supplement_manager_id === currentUserId) &&
          !['Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable'].includes(customer.status)
        );

        // Calculate potential commissions
        let potentialCommissions = 0;
        if (relevantCustomers.length > 0) {
          try {
            const response = await Api.calculatePotentialCommissions(relevantCustomers.map(c => c.id));
            potentialCommissions = response.potentialCommissions.reduce((sum, pc) => {
              const amount = pc.amount || 0;
              return amount > 0 ? sum + amount : sum;
            }, 0);
          } catch (error) {
            // Keep error handling without console.log
          }
        }

        // Calculate goals progress
        const goalsProgress = (yearlyCommissions / (userData?.yearly_goal || 100000)) * 100;

        // Update financial metrics
        setFinancialMetrics({
          yearlyCommissions,
          monthlyCommissions,
          yearlyGoal: userData?.yearly_goal || 100000,
          potentialCommissions,
          goalsProgress: Math.min(goalsProgress, 100)
        });

      } catch (error) {
        // Keep error handling without console.log
      }
    };

    if (userData?.id) {
      fetchFinancialData();
    }
  }, [userData]);

  if (!userData?.metrics) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const formatValue = (value, format) => {
    if (value === undefined || value === null) return format === 'currency' ? '$0.00' : '0%';
    
    try {
      if (format === 'currency') {
        return `$${(value || 0).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`;
      }
      return `${(value || 0).toFixed(1)}%`;
    } catch (error) {
      console.error('Error formatting value:', error);
      return format === 'currency' ? '$0.00' : '0%';
    }
  };
  
  const cards = [
    {
      title: "YTD Commission",
      value: financialMetrics.yearlyCommissions,
      icon: "hand-holding-usd",
      color: "blue",
      tooltip: "Total commission earned this year",
      format: "currency"
    },
    {
      title: "Monthly Earnings",
      value: financialMetrics.monthlyCommissions,
      icon: "money-bill-wave",
      color: "green",
      tooltip: "Commission earned this month",
      format: "currency"
    },
    {
      title: "Goals Progress",
      value: financialMetrics.goalsProgress,
      icon: "trophy",
      color: "purple",
      tooltip: `Progress towards yearly goal of $${financialMetrics.yearlyGoal.toLocaleString()}`,
      format: "percentage"
    },
    {
      title: "Potential Commissions",
      value: financialMetrics.potentialCommissions,
      icon: "chart-line",
      color: "yellow",
      tooltip: "Potential commission from active customers",
      format: "currency"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-3 sm:p-6`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className={`fas fa-${card.icon} text-${card.color}-500 text-xl sm:text-2xl`}></i>
            </div>
            <div className="ml-3 sm:ml-5 flex-grow">
              <div className="flex items-center">
                <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {card.title}
                </p>
                <div className="relative ml-2 group">
                  <i className="fas fa-info-circle text-gray-400 hover:text-gray-500 cursor-help"></i>
                  <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-900 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-x-1/2 left-1/2">
                    {card.tooltip}
                  </div>
                </div>
              </div>
              <p className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatValue(card.value, card.format)}
              </p>
              <div className={`mt-1 w-full ${card.title === 'Goals Progress' ? 'block' : 'hidden'}`}>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${card.color}-500 rounded-full h-2`}
                    style={{ width: `${financialMetrics.goalsProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialOverview;