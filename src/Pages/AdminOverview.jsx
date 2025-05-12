import React, { useState, useEffect } from 'react';
import Header from '../Components/AdminOverview/Header';
import StatsCards from '../Components/AdminOverview/StatsCards';
import RevenueChart from '../Components/AdminOverview/RevenueChart';
import LeadChart from '../Components/AdminOverview/LeadChart';
import TeamPerformanceChart from '../Components/AdminOverview/TeamPerformanceChart';
import SalesTeamPerformance from '../Components/AdminOverview/SalesTeamPerformance';
import TeamMembersTable from '../Components/AdminOverview/TeamMembersTable';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';

// Common status groupings to use across components
const STATUS_GROUPS = {
  PROSPECTIVE: ['Lead', 'Appt Scheduled', 'Inspection Complete'],
  FINALIZED: ['Finalized'],
  LOST: ['Lost - Reclaimable', 'Lost - Unreclaimable'],
};

const AdminOverview = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all data
  const [adminData, setAdminData] = useState({
    customers: [],
    users: [],
    teams: [],
    commissions: [],
    commissionsPaid: [],
    stats: {
      totalRevenue: 0,
      totalCommissionsPaid: 0,
      averageJobPrice: 0,
      averageMarginIncrease: 0,
      totalYearlyCustomers: 0,
      totalCurrentCustomers: 0,
      totalFinalizedCustomers: 0,
      conversionRate: 0
    }
  });

  const processTeamData = (teams, customers) => {
    return teams.map(team => {
      // Get all team member IDs based on team type
      const teamMemberIds = [
        team.manager_id,
        ...(team.salesman_ids || []),
        ...(team.supplementer_ids || [])
      ].filter(Boolean);

      // Filter customers based on team type and member IDs
      const teamCustomers = customers.filter(customer => {
        if (team.team_type === 'Sales') {
          return teamMemberIds.includes(customer.salesman_id);
        } else if (team.team_type === 'Supplement') {
          return teamMemberIds.includes(customer.supplementer_id);
        } else if (team.team_type === 'Affiliate') {
          return teamMemberIds.includes(customer.referrer_id);
        }
        return false;
      });

      // Filter finalized customers and calculate revenue
      const finalizedCustomers = teamCustomers.filter(c => c.status === 'Finalized');
      const totalRevenue = finalizedCustomers.reduce((sum, customer) => 
        sum + Number(customer.total_job_price || 0), 0
      );

      // Get active customers (not finalized or lost)
      const activeCustomers = teamCustomers.filter(customer => 
        !['Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable'].includes(customer.status)
      );

      // Get lost customers
      const lostCustomers = teamCustomers.filter(customer => 
        ['Lost - Reclaimable', 'Lost - Unreclaimable'].includes(customer.status)
      );

      // Calculate conversion rate
      const conversionRate = finalizedCustomers.length > 0
        ? (finalizedCustomers.length / (finalizedCustomers.length + lostCustomers.length)) * 100
        : 0;

      return {
        id: team.team_id,
        name: team.team_name,
        type: team.team_type,
        revenue: totalRevenue,
        customerCount: activeCustomers.length,
        lostCount: lostCustomers.length,
        conversionRate: conversionRate
      };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting admin data fetch...');
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [
          customers, 
          users, 
          teams, 
          allCommissions,
          allPayments,
          commissionSummary
        ] = await Promise.all([
          Api.getCustomers(),
          Api.getAllUsers(),
          Api.getTeams(),
          Api.getAllCommissions(),
          Api.getAllPayments(),
          Api.getAllCommissionSummary()
        ]);

        // Filter customers by status
        const prospectiveCustomers = customers.filter(c => 
          STATUS_GROUPS.PROSPECTIVE.includes(c.status)
        );

        const currentCustomers = customers.filter(c => 
          ![
            ...STATUS_GROUPS.PROSPECTIVE,
            ...STATUS_GROUPS.FINALIZED,
            ...STATUS_GROUPS.LOST
          ].includes(c.status)
        );

        const finalizedCustomers = customers.filter(c => 
          STATUS_GROUPS.FINALIZED.includes(c.status)
        );

        const lostCustomers = customers.filter(c => 
          STATUS_GROUPS.LOST.includes(c.status)
        );

        // Calculate statistics using the filtered customers
        const currentYear = new Date().getFullYear();
        const yearlyCustomers = customers.filter(c => 
          new Date(c.created_at).getFullYear() === currentYear
        );

        // Calculate total revenue from finalized customers
        const totalRevenue = finalizedCustomers.reduce((sum, c) => 
          sum + Number(c.total_job_price || 0), 0
        );

        // Calculate total commissions
        const totalCommissions = allCommissions.reduce((sum, commission) => 
          sum + Number(commission.commission_amount || 0), 0
        );

        // Calculate conversion rate
        const conversionRate = finalizedCustomers.length > 0 
          ? (finalizedCustomers.length / (finalizedCustomers.length + lostCustomers.length)) * 100
          : 0;

        // Calculate average margin for supplemented customers
        const supplementedCustomers = finalizedCustomers.filter(c => 
          c.supplementer_id || c.supplement_manager_id
        );
        
        const averageMarginIncrease = supplementedCustomers.length > 0
          ? supplementedCustomers.reduce((sum, c) => 
              sum + (Number(c.total_job_price || 0) - Number(c.initial_scope_price || 0)), 0
            ) / supplementedCustomers.length
          : 0;

        // Update stats calculation
        const stats = {
          totalProspectiveCustomers: prospectiveCustomers.length,
          totalCurrentCustomers: currentCustomers.length,
          totalFinalizedCustomers: finalizedCustomers.length,
          totalRevenue,
          totalCommissionsPaid: totalCommissions,
          averageJobPrice: finalizedCustomers.length > 0
            ? totalRevenue / finalizedCustomers.length
            : 0,
          averageMarginIncrease,
          totalYearlyCustomers: yearlyCustomers.length,
          conversionRate
        };

        // Process team data
        const processedTeams = processTeamData(teams, customers);

        setAdminData({
          customers,
          users,
          teams,
          commissions: allCommissions,
          commissionsPaid: allPayments,
          stats,
          processedTeams
        });

      } catch (err) {
        console.error('Error loading admin data:', err);
        setError(err.message || 'Failed to load admin overview');
      } finally {

        
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-300 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <StatsCards 
          companyStats={adminData.stats} 
          isDarkMode={isDarkMode} 
        />
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <RevenueChart 
              isDarkMode={isDarkMode}
              customers={adminData.customers}
              commissionsPaid={adminData.commissions} // Change this from commissionsPaid to commissions
            />
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Lead Sources
            </h2>
            <LeadChart 
              isDarkMode={isDarkMode}
              customers={adminData.customers}
            />
          </div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow mb-8`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Sales Teams Performance
              </h2>
            </div>
            <SalesTeamPerformance 
              isDarkMode={isDarkMode}
              processedTeams={adminData.processedTeams}
            />
            <TeamPerformanceChart 
              isDarkMode={isDarkMode}
              processedTeams={adminData.processedTeams}
            />
          </div>
        </div>
        <TeamMembersTable 
          isDarkMode={isDarkMode}
          users={adminData.users}
          customers={adminData.customers}
          commissionsPaid={adminData.commissions}  // Make sure this is from getAllCommissions()
        />
      </div>
    </div>
  );
};

export default AdminOverview;
