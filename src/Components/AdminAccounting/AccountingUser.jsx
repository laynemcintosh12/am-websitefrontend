import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const AccountingUser = ({ users, userBalances, userPotentialCommissions, payments, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    const balance1 = userBalances.find(b => b.user_id === a.id) || {};
    const balance2 = userBalances.find(b => b.user_id === b.id) || {};

    switch (sortConfig.key) {
      case 'name':
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'role':
        return sortConfig.direction === 'asc'
          ? a.role.localeCompare(b.role)
          : b.role.localeCompare(a.role);
      case 'earned':
        return sortConfig.direction === 'asc'
          ? (balance1.total_commissions_earned || 0) - (balance2.total_commissions_earned || 0)
          : (balance2.total_commissions_earned || 0) - (balance1.total_commissions_earned || 0);
      case 'paid':
        return sortConfig.direction === 'asc'
          ? (balance1.total_payments_received || 0) - (balance2.total_payments_received || 0)
          : (balance2.total_payments_received || 0) - (balance1.total_payments_received || 0);
      case 'balance':
        return sortConfig.direction === 'asc'
          ? (balance1.current_balance || 0) - (balance2.current_balance || 0)
          : (balance2.current_balance || 0) - (balance1.current_balance || 0);
      case 'potential':
        return sortConfig.direction === 'asc'
          ? (userPotentialCommissions[a.id] || 0) - (userPotentialCommissions[b.id] || 0)
          : (userPotentialCommissions[b.id] || 0) - (userPotentialCommissions[a.id] || 0);
      case 'projectedBalance':
        const balanceA = (balance1.current_balance || 0) + (userPotentialCommissions[a.id] || 0);
        const balanceB = (balance2.current_balance || 0) + (userPotentialCommissions[b.id] || 0);
        return sortConfig.direction === 'asc'
          ? balanceA - balanceB
          : balanceB - balanceA;
      default:
        return 0;
    }
  }).filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const renderMobileCard = (user) => {
    const userBalance = userBalances.find(b => b.user_id === user.id) || {};
    const totalEarned = Number(userBalance.total_commissions_earned || 0);
    const potentialCommission = Number(userPotentialCommissions[user.id] || 0);
    const totalPaid = payments
      .filter(payment => payment.user_id === user.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const currentBalance = totalEarned - totalPaid;
    const projectedBalance = currentBalance + potentialCommission;

    return (
      <div 
        key={user.id} 
        className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow`}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between border-b pb-2">
            <div>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {user.role}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Earned
              </div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Potential
              </div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                ${potentialCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Paid
              </div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Current Balance
              </div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="col-span-2">
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Projected Balance
              </div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                ${projectedBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex flex-col items-center mb-6">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          User List
        </h2>
        <input
          type="text"
          placeholder="Search users..."
          className={`w-full sm:w-1/2 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-white placeholder-gray-400' 
              : 'bg-gray-100 text-gray-900 placeholder-gray-500'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {sortedUsers.map(renderMobileCard)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'role', label: 'Role' },
                  { key: 'earned', label: 'Total Earned' },
                  { key: 'potential', label: 'Potential' },
                  { key: 'paid', label: 'Total Paid' },
                  { key: 'balance', label: 'Current Balance' },
                  { key: 'projectedBalance', label: 'Projected Balance' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {renderSortIcon(key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {sortedUsers.map(user => {
                const userBalance = userBalances.find(b => b.user_id === user.id) || {};
                const totalEarned = Number(userBalance.total_commissions_earned || 0);
                const potentialCommission = Number(userPotentialCommissions[user.id] || 0);
                
                // Calculate total paid from all payments
                const totalPaid = payments
                  .filter(payment => payment.user_id === user.id)
                  .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

                const currentBalance = totalEarned - totalPaid;
                const projectedBalance = currentBalance + potentialCommission;

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ${potentialCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        ${Number(currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        ${Number(projectedBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountingUser;