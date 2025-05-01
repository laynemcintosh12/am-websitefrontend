import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { FaFilter, FaTimes } from 'react-icons/fa';

const AccountingHistory = ({ payments, users, isDarkMode }) => {
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    paymentType: '',
    minAmount: '',
    maxAmount: '',
    userRole: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const PAYMENT_TYPES = ['Check', 'Cash', 'Direct Deposit', 'Other'];
  const USER_ROLES = ['Supplementer', 'Supplement Manager', 'Sales Manager', 'Affiliate', 'Salesman', 'Admin'];

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const user = users.find(u => u.id === payment.user_id);
      const userName = user?.name.toLowerCase() || '';
      const userRole = user?.role || '';
      const searchTerm = filters.search.toLowerCase();
      const paymentDate = new Date(payment.payment_date);
      const amount = Number(payment.amount);

      // Date validation
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999); // Include the entire "to" date

      return (
        // Search filter
        (userName.includes(searchTerm) || 
         payment.payment_type.toLowerCase().includes(searchTerm) ||
         payment.notes?.toLowerCase().includes(searchTerm)) &&
        
        // Date range filter
        (!fromDate || paymentDate >= fromDate) &&
        (!toDate || paymentDate <= toDate) &&
        
        // Payment type filter
        (!filters.paymentType || payment.payment_type === filters.paymentType) &&
        
        // Amount range filter
        (!filters.minAmount || amount >= Number(filters.minAmount)) &&
        (!filters.maxAmount || amount <= Number(filters.maxAmount)) &&

        // User role filter
        (!filters.userRole || userRole === filters.userRole)
      );
    }).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [payments, users, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      paymentType: '',
      minAmount: '',
      maxAmount: '',
      userRole: ''
    });
  };

  const isFiltersActive = Object.values(filters).some(value => value !== '');

  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Payment History
      </h2>

      <div className="flex items-center gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name, type, or notes..."
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className={`flex-1 p-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded border flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } ${isFiltersActive ? 'border-blue-500' : ''}`}
          >
            <FaFilter />
            <span>Filters</span>
          </button>

          {/* Filter dropdown */}
          {showFilters && (
            <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg z-10 p-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="space-y-4">
                {/* Payment type filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Payment Type
                  </label>
                  <select
                    value={filters.paymentType}
                    onChange={e => setFilters(prev => ({ ...prev, paymentType: e.target.value }))}
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All Payment Types</option>
                    {PAYMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* User role filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    User Role
                  </label>
                  <select
                    value={filters.userRole}
                    onChange={e => setFilters(prev => ({ ...prev, userRole: e.target.value }))}
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All Roles</option>
                    {USER_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Date range filters */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Amount range filters */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Amount Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount}
                      onChange={e => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount}
                      onChange={e => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                      className={`w-full p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear filters button */}
        <button
          onClick={clearFilters}
          className={`p-2 rounded border flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
          } ${!isFiltersActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isFiltersActive}
        >
          <FaTimes />
          <span>Clear Filters</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Date</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>User</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Amount</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Type</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>Notes</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
            {filteredPayments.map(payment => {
              const user = users.find(u => u.id === payment.user_id);
              return (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {format(new Date(payment.payment_date), 'MM/dd/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${Number(payment.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {payment.payment_type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {payment.notes}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountingHistory;