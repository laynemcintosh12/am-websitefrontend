import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import FinancialOverview from '../Components/Dashboard/FinancialOverview';
import EarningsChart from '../Components/Dashboard/EarningsChart';
import HelpfulResources from '../Components/Dashboard/HelpfulResources';
import CustomerList from '../Components/Dashboard/CustomerList';
import CustomerDataBlocks from '../Components/Dashboard/CustomerDataBlocks';
import Api from '../Api';

// Common status groupings to use across components
const STATUS_GROUPS = {
  PROSPECTIVE: ['Lead', 'Appt Scheduled', 'Inspection Complete'],
  FINALIZED: ['Finalized'],
  LOST: ['Lost - Reclaimable', 'Lost - Unreclaimable'],
};

const Dashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [customerData, setCustomerData] = useState({
    allCustomers: [],
    teamCustomers: []
  });
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    const handleSync = () => setLastSync(Date.now());
    window.addEventListener('customerSync', handleSync);
    return () => window.removeEventListener('customerSync', handleSync);
  }, []);

  const parseArrayString = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) {
      return str.map(Number);
    }
    const stringValue = String(str);
    return stringValue
      .replace(/{|}/g, '')
      .split(',')
      .filter(Boolean)
      .map(Number);
  };

  const calculateConversionRate = (customers) => {
    if (!customers.length) return 0;
    const finalizedCount = customers.filter(c => c.status === 'Finalized').length;
    const lostCount = customers.filter(c => 
      c.status === 'Lost - Reclaimable' || 
      c.status === 'Lost - Unreclaimable'
    ).length;
    const totalRelevantCustomers = finalizedCount + lostCount;
    if (totalRelevantCustomers === 0) return 0;
    return (finalizedCount / totalRelevantCustomers) * 100;
  };

  const calculateAverageMargin = (customers) => {
    const finalizedCustomers = customers.filter(c => c.status === 'Finalized');
    if (!finalizedCustomers.length) return 0;
    const totalMargin = finalizedCustomers.reduce((sum, customer) => {
      const jobPrice = Number(customer.total_job_price || 0);
      const initialPrice = Number(customer.initial_scope_price || 0);
      return sum + (jobPrice - initialPrice);
    }, 0);
    return totalMargin / finalizedCustomers.length;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const localUserData = JSON.parse(localStorage.getItem('user'));
      if (!localUserData?.user?.id) throw new Error('No user data found');
      const userId = localUserData.user.id;

      const [userDetails, allTeams, customers] = await Promise.all([
        Api.getUserDetails({ id: userId }),
        Api.getTeams(),
        Api.getCustomers()
      ]);

      const userTeams = allTeams.filter(team => {
        const salesmanIds = parseArrayString(team.salesman_ids);
        const supplementerIds = parseArrayString(team.supplementer_ids);
        return team.manager_id === userId || 
               salesmanIds.includes(userId) || 
               supplementerIds.includes(userId);
      });

      const personalCustomers = customers.filter(c => 
        c.salesman_id === userId ||
        c.supplementer_id === userId ||
        c.referrer_id === userId
      );

      const teamCustomers = userTeams.length > 0 ? customers.filter(customer => {
        return userTeams.some(team => {
          const teamMemberIds = [
            team.manager_id,
            ...parseArrayString(team.salesman_ids),
            ...parseArrayString(team.supplementer_ids)
          ];
          return teamMemberIds.some(memberId =>
            customer.salesman_id === memberId ||
            customer.supplementer_id === memberId ||
            customer.referrer_id === memberId
          );
        });
      }) : [];

      const prospectiveCustomers = personalCustomers.filter(c => 
        STATUS_GROUPS.PROSPECTIVE.includes(c.status)
      );

      const currentCustomers = personalCustomers.filter(c => {
        const isNotProspective = !STATUS_GROUPS.PROSPECTIVE.includes(c.status);
        const isNotFinalized = !STATUS_GROUPS.FINALIZED.includes(c.status);
        const isNotLost = !STATUS_GROUPS.LOST.includes(c.status);
        return isNotProspective && isNotFinalized && isNotLost;
      });

      const personalMetrics = {
        prospectiveCustomers: prospectiveCustomers.length,
        currentCustomers: currentCustomers.length,
        totalCustomers: personalCustomers.filter(c => !STATUS_GROUPS.LOST.includes(c.status)).length,
        finalizedCustomers: personalCustomers.filter(c => c.status === 'Finalized').length
      };

      const teamMetrics = userTeams.length > 0 ? {
        prospectiveCustomers: teamCustomers.filter(c => 
          STATUS_GROUPS.PROSPECTIVE.includes(c.status)
        ).length,
        currentCustomers: teamCustomers.filter(c => {
          const isNotProspective = !STATUS_GROUPS.PROSPECTIVE.includes(c.status);
          const isNotFinalized = !STATUS_GROUPS.FINALIZED.includes(c.status);
          const isNotLost = !STATUS_GROUPS.LOST.includes(c.status);
          return isNotProspective && isNotFinalized && isNotLost;
        }).length,
        totalCustomers: teamCustomers.filter(c => !STATUS_GROUPS.LOST.includes(c.status)).length,
        finalizedCustomers: teamCustomers.filter(c => c.status === 'Finalized').length
      } : null;

      const performanceMetric = userDetails.role.includes('Supplement') 
        ? calculateAverageMargin(personalCustomers)
        : calculateConversionRate(personalCustomers);

      const financialMetrics = {
        yearlyCommissions: 0,
        monthlyCommissions: 0,
        yearlyGoal: 100000,
        potentialCommissions: 0,
        goalsProgress: 0
      };

      setUserData({
        ...userDetails,
        teams: userTeams,
        metrics: {
          prospectiveCustomers: personalMetrics.prospectiveCustomers,
          currentCustomers: personalMetrics.currentCustomers,
          totalCustomers: personalMetrics.totalCustomers,
          finalizedCustomers: personalMetrics.finalizedCustomers,
          teamMetrics: teamMetrics,
          isSupplementRole: userDetails.role.includes('Supplement'),
          performanceMetric: performanceMetric || 0,
          ...financialMetrics
        }
      });

      setCustomerData({
        allCustomers: personalCustomers,
        teamCustomers: teamCustomers
      });

    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [lastSync]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-300 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-64 bg-gray-300 rounded-lg"></div>
              <div className="lg:col-span-4 h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6">
        <div className="space-y-3 sm:space-y-6">
          <CustomerDataBlocks userData={userData} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
            <div className="lg:col-span-8">
              <EarningsChart userData={userData} />
            </div>
            <div className="lg:col-span-4">
              <HelpfulResources userData={userData} />
            </div>
          </div>
          <FinancialOverview userData={userData} />
          <CustomerList userData={userData} customerData={customerData} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;