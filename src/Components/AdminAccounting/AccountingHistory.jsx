import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { FaFilter, FaTimes, FaEdit, FaSort, FaSortUp, FaSortDown, FaTrash } from 'react-icons/fa';
import Api from '../../Api';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    console.log('payments:', payments);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const PAYMENT_TYPES = ['Check', 'Cash', 'Direct Deposit', 'Other'];
  const USER_ROLES = ['Supplementer', 'Supplement Manager', 'Sales Manager', 'Affiliate', 'Salesman', 'Admin'];

  const filteredPayments = useMemo(() => {
    const filtered = payments.filter(payment => {
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
    });

    // Add sorting logic
    return filtered.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const userA = users.find(u => u.id === a.user_id);
      const userB = users.find(u => u.id === b.user_id);

      switch (sortConfig.key) {
        case 'date':
          return direction * (new Date(a.payment_date) - new Date(b.payment_date));
        case 'user':
          return direction * ((userA?.name || '').localeCompare(userB?.name || ''));
        case 'amount':
          return direction * (Number(a.amount) - Number(b.amount));
        case 'type':
          return direction * (a.payment_type.localeCompare(b.payment_type));
        case 'notes':
          return direction * ((a.notes || '').localeCompare(b.notes || ''));
        default:
          return 0;
      }
    });
  }, [payments, users, filters, sortConfig]);

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

  const handleDeleteClick = async (payment) => {
    if (window.confirm(`Are you sure you want to delete this payment of $${Number(payment.amount).toLocaleString()}?`)) {
      try {
        await Api.deletePayment(payment.id);
        // Refresh the page to show updated data
        window.location.reload();
      } catch (err) {
        console.error('Error deleting payment:', err);
        alert('Failed to delete payment. Please try again.');
      }
    }
  };

  const renderMobileCard = (payment) => {
    const user = users.find(u => u.id === payment.user_id);
    return (
      <div 
        key={payment.id}
        className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow`}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'Unknown User'}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {format(new Date(payment.payment_date), 'MM/dd/yyyy')}
                </div>
              </div>
              <div className={`text-base font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${Number(payment.amount).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {payment.payment_type}
              </div>
              {payment.notes && (
                <div className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {payment.notes}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => handleEditClick(payment)}
              className={`text-blue-500 hover:text-blue-700 ${isDarkMode ? 'hover:text-blue-400' : ''}`}
            >
              <FaEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteClick(payment)}
              className={`text-red-500 hover:text-red-700 ${isDarkMode ? 'hover:text-red-400' : ''}`}
            >
              <FaTrash className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleEditClick = (payment) => {
    setEditingPayment(payment);
    setShowEditForm(true);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    try {
      await Api.updatePayment(editingPayment.id, {
        amount: editingPayment.amount,
        payment_type: editingPayment.payment_type,
        check_number: editingPayment.check_number || '',
        notes: editingPayment.notes || ''
      });
      
      setEditSuccess('Payment updated successfully!');
      
      // Wait 1.5 seconds, then close modal and refresh
      setTimeout(() => {
        setShowEditForm(false);
        setEditSuccess('');
        // Refresh the page
        window.location.reload();
      }, 1500);
    } catch (err) {
      setEditError('Failed to update payment. Please try again.');
      // Error message will stay visible until user closes modal or tries again
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Payment History
      </h2>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className={`flex-1 p-3 sm:p-2 rounded-lg border text-base sm:text-sm ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <div className="flex gap-2">
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 sm:p-2 rounded-lg border flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } ${isFiltersActive ? 'border-blue-500' : ''}`}
          >
            <FaFilter />
            <span className="text-sm">Filters</span>
          </button>

          {/* Clear filters button */}
          {isFiltersActive && (
            <button
              onClick={clearFilters}
              className={`p-3 sm:p-2 rounded-lg border flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaTimes />
              <span className="text-sm">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date range filters */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Amount range filters */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Min Amount
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={e => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Max Amount
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={e => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Payment type and user role filters */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Payment Type
              </label>
              <select
                value={filters.paymentType}
                onChange={e => setFilters(prev => ({ ...prev, paymentType: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Types</option>
                {PAYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                User Role
              </label>
              <select
                value={filters.userRole}
                onChange={e => setFilters(prev => ({ ...prev, userRole: e.target.value }))}
                className={`w-full p-2 rounded-lg border ${
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
          </div>
        </div>
      )}

      {/* Mobile or desktop view */}
      {isMobile ? (
        <div className="space-y-4">
          {filteredPayments.map(renderMobileCard)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'user', label: 'User' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'type', label: 'Type' },
                  { key: 'notes', label: 'Notes' },
                  { key: 'actions', label: 'Actions' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    scope="col"
                    className={`px-6 py-3 ${key === 'actions' ? 'text-center' : 'text-left'} text-xs font-medium uppercase tracking-wider ${
                      key !== 'actions' ? 'cursor-pointer' : ''
                    } ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                    onClick={() => key !== 'actions' && handleSort(key)}
                  >
                    <div className={`flex items-center space-x-1 ${key === 'actions' ? 'justify-center' : ''}`}>
                      <span>{label}</span>
                      {key !== 'actions' && renderSortIcon(key)}
                    </div>
                  </th>
                ))}
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(payment)}
                          className={`text-blue-500 hover:text-blue-700 ${isDarkMode ? 'hover:text-blue-400' : ''}`}
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(payment)}
                          className={`text-red-500 hover:text-red-700 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-[2px] rounded-lg" />
          <div className={`${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          } rounded-2xl shadow-xl max-w-2xl w-full p-6 m-4 backdrop-blur-sm relative`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Payment
              </h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{editError}</div>}
              {editSuccess && <div className="text-green-500 text-sm bg-green-100 p-3 rounded-lg">{editSuccess}</div>}
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPayment?.amount || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})}
                    className={`block w-full p-3 text-base rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Type
                  </label>
                  <select
                    value={editingPayment?.payment_type || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, payment_type: e.target.value})}
                    className={`block w-full p-3 text-base rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                  >
                    {PAYMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Check Number
                  </label>
                  <input
                    type="text"
                    value={editingPayment?.check_number || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, check_number: e.target.value})}
                    className={`block w-full p-3 text-base rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={editingPayment?.notes || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, notes: e.target.value})}
                    rows={3}
                    className={`block w-full p-3 text-base rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-100'
                  } transition-colors duration-200`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingHistory;