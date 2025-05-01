import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import FinancialOverview from '../Components/Dashboard/FinancialOverview';
import EarningsChart from '../Components/Dashboard/EarningsChart';
import HelpfulResources from '../Components/Dashboard/HelpfulResources';
import CustomerList from '../Components/Dashboard/CustomerList';
import CustomerDataBlocks from '../Components/Dashboard/CustomerDataBlocks';
import Api from '../Api';

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

  // Handle sync events
  useEffect(() => {
    const handleSync = () => setLastSync(Date.now());
    window.addEventListener('customerSync', handleSync);
    return () => window.removeEventListener('customerSync', handleSync);
  }, []);

  // Update the parseArrayString function
  const parseArrayString = (str) => {
    // Return empty array for null/undefined values
    if (!str) return [];
    
    // If it's already an array, return it after ensuring numbers
    if (Array.isArray(str)) {
      return str.map(Number);
    }
    
    // Convert to string if it's not already
    const stringValue = String(str);
    
    // Remove curly braces and split by comma
    return stringValue
      .replace(/{|}/g, '')
      .split(',')
      .filter(Boolean)
      .map(Number);
  };

  // Update the fetchDashboardData function
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const localUserData = JSON.parse(localStorage.getItem('user'));
      if (!localUserData?.user?.id) throw new Error('No user data found');
      const userId = localUserData.user.id;

      // Get user details and all teams
      const [userDetails, allTeams, customers] = await Promise.all([
        Api.getUserDetails({ id: userId }),
        Api.getTeams(),
        Api.getCustomers()
      ]);

      // Find user's team(s)
      const userTeams = allTeams.filter(team => {
        const salesmanIds = parseArrayString(team.salesman_ids);
        const supplementerIds = parseArrayString(team.supplementer_ids);
        return team.manager_id === userId || 
               salesmanIds.includes(userId) || 
               supplementerIds.includes(userId);
      });

      // Get personal customers (directly assigned)
      const personalCustomers = customers.filter(c => 
        c.salesman_id === userId ||
        c.supplementer_id === userId ||
        c.referrer_id === userId
      );

      // Get team customers (all customers from team members)
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

      // Define status filters
      const nonFinalizedStatuses = [
        'Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable',
        'Lead', 'Appt Scheduled', 'Inspection Complete'
      ];

      // Calculate personal metrics
      const personalMetrics = {
        currentCustomers: personalCustomers.filter(c => !nonFinalizedStatuses.includes(c.status)).length,
        totalCustomers: personalCustomers.filter(c => !c.status.includes('Lost')).length,
        finalizedCustomers: personalCustomers.filter(c => c.status === 'Finalized').length
      };

      // Calculate team metrics
      const teamMetrics = userTeams.length > 0 ? {
        currentCustomers: teamCustomers.filter(c => !nonFinalizedStatuses.includes(c.status)).length,
        totalCustomers: teamCustomers.filter(c => !c.status.includes('Lost')).length,
        finalizedCustomers: teamCustomers.filter(c => c.status === 'Finalized').length
      } : null;

      // Calculate conversion rate or margin
      const performanceMetric = userDetails.role.includes('Supplement') 
        ? calculateAverageMargin(personalCustomers)  // You'll need to implement this
        : calculateConversionRate(personalCustomers); // And this

      // Inside fetchDashboardData, before setting userData
      const financialMetrics = {
        yearlyCommissions: 0, // Replace with actual API call or calculation
        monthlyCommissions: 0, // Replace with actual API call or calculation
        yearlyGoal: 100000, // Replace with actual goal from user settings
        potentialCommissions: 0, // Replace with actual calculation
        goalsProgress: 0 // Will be calculated in the component
      };

      // Update userData with complete metrics structure
      setUserData({
        ...userDetails,
        teams: userTeams,
        metrics: {
          currentCustomers: personalMetrics.currentCustomers,
          totalCustomers: personalMetrics.totalCustomers,
          finalizedCustomers: personalMetrics.finalizedCustomers,
          teamMetrics: teamMetrics,
          isSupplementRole: userDetails.role.includes('Supplement'),
          performanceMetric: performanceMetric || 0,
          ...financialMetrics // Add financial metrics
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

  // Update the calculateConversionRate function
  const calculateConversionRate = (customers) => {
    if (!customers.length) return 0;
    
    // Count finalized and lost customers
    const finalizedCount = customers.filter(c => c.status === 'Finalized').length;
    const lostCount = customers.filter(c => 
      c.status === 'Lost - Reclaimable' || 
      c.status === 'Lost - Unreclaimable'
    ).length;
    
    // Calculate total relevant customers
    const totalRelevantCustomers = finalizedCount + lostCount;
    
    // Avoid division by zero
    if (totalRelevantCustomers === 0) return 0;
    
    // Calculate conversion rate: finalized / (finalized + lost)
    return (finalizedCount / totalRelevantCustomers) * 100;
  };

  const calculateAverageMargin = (customers) => {
    const finalizedCustomers = customers.filter(c => c.status === 'Finalized');
    if (!finalizedCustomers.length) return 0;
    
    const totalMargin = finalizedCustomers.reduce((sum, customer) => {
      // Use total_job_price and initial_scope_price instead of final_amount and initial_amount
      const jobPrice = Number(customer.total_job_price || 0);
      const initialPrice = Number(customer.initial_scope_price || 0);
      return sum + (jobPrice - initialPrice);
    }, 0);
    
    return totalMargin / finalizedCustomers.length;
  };

  // Add this useEffect after the existing state declarations
  useEffect(() => {
    fetchDashboardData();
  }, [lastSync]); // This will refetch when lastSync changes

  // Handle loading state
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

  // Handle error state
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

  // Update the main layout
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6">
        <div className="space-y-3 sm:space-y-6">
          <CustomerDataBlocks userData={userData} />
          
          {/* Stack components vertically on mobile */}
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