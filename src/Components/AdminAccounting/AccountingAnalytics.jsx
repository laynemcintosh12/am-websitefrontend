import React, { useEffect, useState } from 'react';
import Api from '../../Api';

// Update the MetricCard component to receive isDarkMode prop
const MetricCard = ({ title, value, color, bgColor, isDarkMode }) => (
  <div className={`p-4 rounded-lg ${bgColor}`}>
    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {title}
    </h3>
    <p className={`text-3xl font-bold ${color}`}>
      ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
  </div>
);

const AccountingAnalytics = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    totalEarned: 0,
    potentialEarned: 0,
    totalPaid: 0,
    currentBalance: 0,
    projectedBalance: 0
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateTopPerformers = async (users, allCommissions, activeCustomers, payments) => {
      const topPerformersPromises = users.map(async user => {
        const earnedCommissions = allCommissions
          .filter(c => c.user_id === user.id)
          .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
    
        const userCustomers = activeCustomers.filter(c => 
          c.salesman_id === user.id ||
          c.supplementer_id === user.id ||
          c.manager_id === user.id ||
          c.supplement_manager_id === user.id ||
          c.referrer_id === user.id
        );
    
        let potentialCommission = 0;
        if (userCustomers.length > 0) {
          const customerIds = userCustomers.map(c => c.id);
          try {
            const response = await Api.calculatePotentialCommissions(customerIds, user.id);
            if (response.potentialCommissions) {
              potentialCommission = response.potentialCommissions.reduce((sum, pc) => {
                const amount = Number(pc.amount || 0);
                return sum + (amount > 0 ? amount : 0);
              }, 0);
            }
          } catch (error) {
            console.error(`Error calculating potential for top performer ${user.id}:`, error);
          }
        }
    
        return {
          userId: user.id,
          name: user.name,
          total_commissions_earned: earnedCommissions,
          current_balance: earnedCommissions - (payments
            .filter(p => p.user_id === user.id)
            .reduce((sum, p) => sum + Number(p.amount || 0), 0)),
          potential_commission: potentialCommission
        };
      });
    
      const resolvedTopPerformers = await Promise.all(topPerformersPromises);
      return resolvedTopPerformers
        .sort((a, b) => b.total_commissions_earned - a.total_commissions_earned)
        .slice(0, 5);
    };

    const fetchData = async () => {
      try {
        // Get all data in parallel
        const [users, payments, allCommissions, customers, userBalances] = await Promise.all([
          Api.getAllUsers(),
          Api.getAllPayments(),
          Api.getAllCommissions(),
          Api.getCustomers(),
          Api.getAllUserBalances()
        ]);

        // Calculate total earned from actual commissions
        const totalEarned = allCommissions.reduce((sum, commission) => 
          sum + Number(commission.commission_amount || 0), 0
        );

        // Calculate total paid from payments
        const totalPaid = payments.reduce((sum, payment) => 
          sum + Number(payment.amount || 0), 0
        );

        // Get active customers (non-finalized, non-lost)
        const activeCustomers = customers.filter(customer => 
          !['Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable'].includes(customer.status)
        );

        // Calculate potential commissions for each user
        let totalPotential = 0;
        for (const user of users) {
          const userCustomers = activeCustomers.filter(customer => 
            customer.salesman_id === user.id ||
            customer.supplementer_id === user.id ||
            customer.manager_id === user.id ||
            customer.supplement_manager_id === user.id ||
            customer.referrer_id === user.id
          );

          if (userCustomers.length > 0) {
            try {
              const customerIds = userCustomers.map(c => c.id);
              const response = await Api.calculatePotentialCommissions(customerIds, user.id);
              
              if (response.potentialCommissions) {
                const userPotential = response.potentialCommissions.reduce((sum, pc) => {
                  const amount = Number(pc.amount || 0);
                  return sum + (amount > 0 ? amount : 0);
                }, 0);
                totalPotential += userPotential;
              }
            } catch (error) {
              console.error(`Error calculating potential commissions for user ${user.id}:`, error);
            }
          }
        }

        // Calculate current and projected balances
        const currentBalance = totalEarned - totalPaid;
        const projectedBalance = currentBalance + totalPotential;

        setStats({
          totalEarned,
          potentialEarned: totalPotential,
          totalPaid,
          currentBalance,
          projectedBalance
        });

        // Get and set top performers with required parameters
        const topPerformersData = await calculateTopPerformers(
          users, 
          allCommissions, 
          activeCustomers, 
          payments
        );
        setTopPerformers(topPerformersData);

        // Update recent payments
        const recentPaymentsWithUsers = payments
          .map(payment => ({
            ...payment,
            userName: users.find(u => u.id === payment.user_id)?.name || 'Unknown User'
          }))
          .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
          .slice(0, 5);

        setRecentPayments(recentPaymentsWithUsers);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-6">Commission Analytics</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard
          title="Total Earned"
          value={stats.totalEarned}
          color={isDarkMode ? 'text-green-400' : 'text-green-600'}
          bgColor={isDarkMode ? 'bg-gray-700' : 'bg-green-100'}
          isDarkMode={isDarkMode}
        />
        <MetricCard
          title="Potential"
          value={stats.potentialEarned}
          color={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}
          bgColor={isDarkMode ? 'bg-gray-700' : 'bg-yellow-100'}
          isDarkMode={isDarkMode}
        />
        <MetricCard
          title="Total Paid"
          value={stats.totalPaid}
          color={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
          bgColor={isDarkMode ? 'bg-gray-700' : 'bg-blue-100'}
          isDarkMode={isDarkMode}
        />
        <MetricCard
          title="Current Balance"
          value={stats.currentBalance}
          color={isDarkMode ? 'text-purple-400' : 'text-purple-600'}
          bgColor={isDarkMode ? 'bg-gray-700' : 'bg-purple-100'}
          isDarkMode={isDarkMode}
        />
        <MetricCard
          title="Projected Balance"
          value={stats.projectedBalance}
          color={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}
          bgColor={isDarkMode ? 'bg-gray-700' : 'bg-indigo-100'}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers Table */}
        <div>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Top Performers
          </h3>
          <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    User
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    YTD Earned
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {topPerformers.map(user => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${(user.total_commissions_earned || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ${(user.current_balance || 0).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Recent Payments
          </h3>
          <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Date
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    User
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {payment.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${Number(payment.amount).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingAnalytics;