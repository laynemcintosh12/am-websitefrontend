import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';
import TooltipIcon from '../Common/TooltipIcon';

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
        const currentUserId = userData.id;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Get all necessary data in parallel
        const [allCommissions, customers, userBalances] = await Promise.all([
          Api.getAllCommissions(),
          Api.getCustomers(),
          Api.getAllUserBalances()
        ]);

        // Get current user's balance
        const userBalance = userBalances.find(balance => balance.user_id === currentUserId) || {
          total_commissions_earned: 0
        };

        // Filter commissions for current user
        const userCommissions = allCommissions.filter(commission => 
          commission.user_id === currentUserId
        );

        // Calculate monthly commissions (keep this calculation)
        const monthlyCommissions = userCommissions.reduce((sum, commission) => {
          const buildDate = new Date(commission.build_date);
          if (buildDate.getFullYear() === currentYear && 
              buildDate.getMonth() === currentMonth) {
            return sum + Number(commission.commission_amount);
          }
          return sum;
        }, 0);

        // Use total_commissions_earned from userBalance instead of calculating yearly
        const yearlyCommissions = Number(userBalance.total_commissions_earned);
        const yearlyGoal = userData?.yearly_goal || 100000;
        const goalsProgress = (yearlyCommissions / yearlyGoal) * 100;

        // Get customer data for potential commissions
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

        // Update financial metrics
        setFinancialMetrics({
          yearlyCommissions,  // Now using the value from userBalance
          monthlyCommissions,
          yearlyGoal,
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
                {card.tooltip && <TooltipIcon content={card.tooltip} />}
              </div>
              <p className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatValue(card.value, card.format)}
              </p>
              <div className={`mt-1 w-full ${card.title === 'Goals Progress' ? 'block' : 'hidden'}`}>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-purple-500 rounded-full h-2 transition-all duration-500 ease-in-out`}
                    style={{ width: `${Math.min(card.value, 100)}%` }}
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