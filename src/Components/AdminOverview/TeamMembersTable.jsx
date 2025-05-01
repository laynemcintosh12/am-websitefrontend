import React, { useState, useEffect } from 'react';

const TeamMembersTable = ({ isDarkMode, users, customers, commissionsPaid }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const processUserMetrics = (user, customers, commissions) => {
    // Get user's assigned customers
    const assignedCustomers = customers.filter(c => {
      if (['Salesman', 'Sales Manager'].includes(user.role)) {
        return c.salesman_id === user.id;
      } else if (['Supplementer', 'Supplement Manager'].includes(user.role)) {
        return c.supplementer_id === user.id;
      } else if (user.role === 'Affiliate') {
        return c.referrer_id === user.id;
      }
      return false;
    });
  
    // Get finalized customers
    const finalizedCustomers = assignedCustomers.filter(c => c.status === 'Finalized');
    
    // Get lost customers
    const lostCustomers = assignedCustomers.filter(c => 
      ['Lost - Reclaimable', 'Lost - Unreclaimable'].includes(c.status)
    );
  
    // Calculate current customers (excluding finalized and lost)
    const currentCustomers = assignedCustomers.filter(c => 
      !['Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable'].includes(c.status)
    );
  
    // Update commission calculation
    const userCommissions = commissions
      .filter(comm => comm.user_id === user.id)
      .reduce((sum, comm) => sum + Number(comm.commission_amount || 0), 0);
  
    // Calculate metrics based on role
    if (['Supplementer', 'Supplement Manager'].includes(user.role)) {
      // Calculate margin metrics for supplementers
      const totalMarginAdded = finalizedCustomers.reduce((sum, c) => 
        sum + (Number(c.total_job_price || 0) - Number(c.initial_scope_price || 0)), 0
      );
      
      const averageMarginAdded = finalizedCustomers.length > 0
        ? totalMarginAdded / finalizedCustomers.length
        : 0;
  
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        marginAdded: totalMarginAdded,
        averageMarginAdded,
        commissionsEarned: userCommissions,  // Using updated commission calculation
        currentCustomers: currentCustomers.length
      };
    } else {
      // Calculate metrics for sales and affiliate roles
      const revenue = finalizedCustomers.reduce((sum, c) => 
        sum + Number(c.total_job_price || 0), 0
      );
  
      const conversionRate = (finalizedCustomers.length + lostCustomers.length) > 0
        ? (finalizedCustomers.length / (finalizedCustomers.length + lostCustomers.length)) * 100
        : 0;
  
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        revenue,
        conversionRate,
        commissionsEarned: userCommissions,  // Using updated commission calculation
        currentCustomers: currentCustomers.length
      };
    }
  };

  useEffect(() => {
    if (!users?.length || !customers?.length || !commissionsPaid?.length) return;

    // Filter users by role
    let filteredUsers = [];
    switch (activeTab) {
      case 'sales':
        filteredUsers = users.filter(u => 
          ['Salesman', 'Sales Manager'].includes(u.role)
        );
        break;
      case 'supplementers':
        filteredUsers = users.filter(u => 
          ['Supplementer', 'Supplement Manager'].includes(u.role)
        );
        break;
      case 'affiliates':
        filteredUsers = users.filter(u => u.role === 'Affiliate');
        break;
    }

    // Process metrics for each user
    const processedMembers = filteredUsers.map(user => 
      processUserMetrics(user, customers, commissionsPaid)
    );

    // Apply search filter if needed
    const searchedMembers = searchTerm 
      ? processedMembers.filter(member =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : processedMembers;

    setTeamMembers(searchedMembers);
  }, [activeTab, users, customers, commissionsPaid, searchTerm]);

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'sales':
        return [
          { label: 'Team Member', tooltip: 'Sales team member name and role' },
          { label: 'Revenue Generated', tooltip: 'Total revenue from finalized customers' },
          { label: 'Conversion Rate', tooltip: 'Finalized customers / (Finalized + Lost) customers' },
          { label: 'Commission Earned', tooltip: 'Total commissions earned' },
          { label: 'Current Customers', tooltip: 'Active customers (excluding finalized and lost)' }
        ];
      case 'supplementers':
        return [
          { label: 'Team Member', tooltip: 'Supplement team member name and role' },
          { label: 'Margin Added', tooltip: 'Total increase in job value' },
          { label: 'Average Margin', tooltip: 'Average margin increase per customer' },
          { label: 'Commission Earned', tooltip: 'Total commissions earned' },
          { label: 'Current Customers', tooltip: 'Active customers (excluding finalized and lost)' }
        ];
      case 'affiliates':
        return [
          { label: 'Team Member', tooltip: 'Affiliate name and role' },
          { label: 'Revenue Generated', tooltip: 'Total revenue from finalized customers' },
          { label: 'Conversion Rate', tooltip: 'Finalized customers / (Finalized + Lost) customers' },
          { label: 'Commission Earned', tooltip: 'Total commissions earned' },
          { label: 'Current Customers', tooltip: 'Active customers (excluding finalized and lost)' }
        ];
      default:
        return [];
    }
  };

  const renderTableCell = (member, column) => {
    const textColorClass = isDarkMode ? 'text-white' : 'text-gray-900';

    switch (column) {
      case 'Team Member':
        return (
          <div className="flex flex-col">
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {member.name}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {member.role}
            </div>
          </div>
        );
      case 'Revenue Generated':
      case 'Margin Added':
        const value = column === 'Revenue Generated' ? member.revenue : member.marginAdded;
        return <div className={textColorClass}>{formatCurrency(value || 0)}</div>;
      case 'Conversion Rate':
        return (
          <div className={textColorClass}>
            {`${(member.conversionRate || 0).toFixed(1)}%`}
          </div>
        );
      case 'Average Margin':
        return (
          <div className={textColorClass}>
            {formatCurrency(member.averageMarginAdded || 0)}
          </div>
        );
      case 'Commission Earned':
        return (
          <div className={textColorClass}>
            {formatCurrency(member.commissionsEarned || 0)}
          </div>
        );
      case 'Current Customers':
        return (
          <div className={textColorClass}>
            {member.currentCustomers || 0}
          </div>
        );
      default:
        return null;
    }
  };

  const getDefaultCellContent = (member, column) => {
    switch (column) {
      case 'Team Member':
        return (
          <div className="flex flex-col">
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {member.name}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {member.role}
            </div>
          </div>
        );
      case 'Revenue Generated':
        return (
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(member.performance.revenue)}
          </div>
        );
      case 'Commission Earned':
        return (
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(member.performance.commission)}
          </div>
        );
      case 'Current Customers':
        return (
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {member.performance.currentCustomers}
          </div>
        );
      case 'Conversion Rate':
        return (
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {member.performance.conversion}%
          </div>
        );
      case 'Outstanding Commission':
        return (
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(member.performance.outstandingCommission)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow mt-8`}>
      <div className="p-6">
        <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Team Members
        </h2>
        <div className="flex space-x-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <div className="flex space-x-4 mb-4">
          {['sales', 'supplementers', 'affiliates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                activeTab === tab
                  ? isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Team
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-hidden"> {/* Changed from overflow-x-auto */}
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {getTableHeaders().map(header => (
                    <th 
                      key={header.label} 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <span>{header.label}</span>
                        <div className="relative ml-2 group">
                          <i className={`fas fa-info-circle ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                          } cursor-help`}></i>
                          <div className="absolute z-10 w-64 p-2 -mt-1 text-sm bg-gray-900 text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-pre-wrap">
                            {header.tooltip}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {teamMembers.map((member) => (
                  <tr 
                    key={member.id}
                    className={isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
                  >
                    {getTableHeaders().map((header, index) => (
                      <td 
                        key={`${member.id}-${index}`} 
                        className={`px-6 py-4 ${
                          header.label === 'Team Member' ? '' : 'whitespace-nowrap'
                        }`}
                      >
                        {renderTableCell(member, header.label)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add empty state for no results */}
      {teamMembers.length === 0 && (
        <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {searchTerm ? 'No team members found matching your search.' : 'No team members available.'}
        </div>
      )}
    </div>
  );
};

export default TeamMembersTable;
