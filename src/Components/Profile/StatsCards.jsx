import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const StatsCards = () => {
  const { isDarkMode } = useDarkMode();
  // Add isSupplementRole to state
  const [isSupplementRole, setIsSupplementRole] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCommission: 0,
    activeCustomers: 0
  });
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user?.id) return;

        // Calculate role type early
        const userRole = userData.user.role;
        const isSupplementRole = userRole === 'Supplementer' || userRole === 'Supplement Manager';
        setIsSupplementRole(isSupplementRole); // Set the role state
        const isAffiliateRole = userRole === 'Affiliate';

        // Get all data needed
        const [commissions, customers, summary] = await Promise.all([
          Api.getAllCommissions(),
          Api.getCustomers(),
          Api.getUserCommissionSummary(userData.user.id)
        ]);

        // Filter commissions for current user
        const userCommissions = commissions.filter(comm => 
          comm.user_id === userData.user.id
        );

        // Calculate total commission (all time, no date filter)
        const totalCommission = userCommissions.reduce((sum, commission) => 
          sum + Number(commission.commission_amount), 0
        );

        // Calculate total sales or margin based on user role
        let totalAmount = 0;
        if (!isAffiliateRole) {
          // Get all customers associated with user
          const relevantCustomers = customers.filter(cust => 
            (cust.salesman_id === userData.user.id ||
             cust.supplementer_id === userData.user.id ||
             cust.manager_id === userData.user.id ||
             cust.supplement_manager_id === userData.user.id ||
             cust.referrer_id === userData.user.id) &&
            cust.status === 'Finalized' // Only include finalized customers
          );

          if (isSupplementRole) {
            // Calculate total margin for supplement roles
            totalAmount = relevantCustomers.reduce((sum, customer) => {
              const margin = Number(customer.total_job_price || 0) - 
                            Number(customer.initial_scope_price || 0);
              return sum + margin;
            }, 0);
          } else {
            // Calculate total sales for other roles
            totalAmount = relevantCustomers.reduce((sum, customer) => 
              sum + Number(customer.total_job_price || 0), 0
            );
          }
        }

        // Count active customers (same as Total Customers in CustomerDataBlocks)
        const excludedStatuses = ['Lost - Unreclaimable', 'Lost - Reclaimable'];
        const activeCustomers = customers.filter(customer => {
          const isUserCustomer = 
            customer.salesman_id === userData.user.id ||
            customer.supplementer_id === userData.user.id ||
            customer.referrer_id === userData.user.id;

          // Only exclude lost statuses, matching CustomerDataBlocks logic
          return isUserCustomer && !excludedStatuses.includes(customer.status);
        }).length;

        setStats({
          totalAmount,  // renamed from totalSales
          totalCommission,
          activeCustomers
        });

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [lastSync]);

  // Listen for sync events
  useEffect(() => {
    const handleSync = () => {
      setLastSync(Date.now());
    };

    window.addEventListener('customerSync', handleSync);
    return () => window.removeEventListener('customerSync', handleSync);
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-gray-50 bg-opacity-95'} p-6 rounded-lg backdrop-blur-sm`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-chart-line text-blue-500 text-2xl"></i>
          </div>
          <div className="ml-5">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {isSupplementRole ? 'Total Margin Added' : 'Total Sales'}
            </p>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(stats.totalAmount / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
      <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-gray-50 bg-opacity-95'} p-6 rounded-lg backdrop-blur-sm`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-dollar-sign text-green-500 text-2xl"></i>
          </div>
          <div className="ml-5">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Commission</p>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(stats.totalCommission / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
      </div>
      <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-gray-50 bg-opacity-95'} p-6 rounded-lg backdrop-blur-sm`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-users text-purple-500 text-2xl"></i>
          </div>
          <div className="ml-5">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Active Customers</p>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.activeCustomers}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;