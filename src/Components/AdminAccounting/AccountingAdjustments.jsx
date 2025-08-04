import React, { useState, useEffect } from 'react';
import Api from '../../Api';

const AccountingAdjustments = ({ users, isDarkMode, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [userCustomers, setUserCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showAddCommission, setShowAddCommission] = useState(false);
  const [generalCommission, setGeneralCommission] = useState({
    amount: '',
    payment_type: 'Check', // Changed from 'check' to 'Check'
    check_number: '',
    notes: ''
  });
  const [editingCommission, setEditingCommission] = useState(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch user's customers when a user is selected
  useEffect(() => {
    const fetchUserCustomers = async () => {
      if (!selectedUser) {
        setUserCustomers([]);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching commissions for user:', selectedUser); // Debug log

        // Get commissions for the selected user
        const userCommissions = await Api.getUserCommissions(selectedUser);
        console.log('Retrieved commissions:', userCommissions); // Debug log

        // Then fetch full customer details for each commission
        const customersWithDetails = await Promise.all(
          userCommissions.map(async (commission) => {
            const customerDetails = await Api.getCustomer(commission.customer_id);
            return {
              ...customerDetails,
              commissions: [{
                id: commission.id,
                commission_amount: commission.commission_amount,
                user_id: parseInt(selectedUser),
                customer_id: commission.customer_id,
                is_paid: commission.is_paid,
                admin_modified: commission.admin_modified
              }],
              userRole: determineUserRole(customerDetails, parseInt(selectedUser))
            };
          })
        );

        console.log('Processed customers for user:', selectedUser, customersWithDetails); // Debug log
        setUserCustomers(customersWithDetails);
      } catch (err) {
        setError(`Failed to fetch customer data: ${err.message}`);
        console.error('Error fetching customer data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to determine user's role for the customer
    const determineUserRole = (customer, userId) => {
      if (customer.salesman_id === userId) return 'Salesman';
      if (customer.supplementer_id === userId) return 'Supplementer';
      if (customer.manager_id === userId) return 'Sales Manager';
      if (customer.supplement_manager_id === userId) return 'Supplement Manager';
      if (customer.referrer_id === userId) return 'Affiliate Marketer';
      return 'Unknown';
    };

    fetchUserCustomers();
  }, [selectedUser]);

  const handleCommissionAdjustment = async (customer, newAmount) => {
    try {
      setLoading(true);
      console.log('Customer being adjusted:', customer);
      console.log('Customer commissions:', customer.commissions);
      
      const commission = customer.commissions[0];
      console.log('Commission being updated:', commission);
      
      // Check if commission exists and has an ID
      if (!commission?.id) {
        console.error('Commission object:', commission);
        throw new Error('No commission ID found');
      }

      // First parameter should be the commission ID (a number), second parameter is the update data
      await Api.updateCommission(commission.id, {
        commission_amount: parseFloat(newAmount),
        user_id: parseInt(selectedUser),
        customer_id: customer.id,
        admin_modified: true
      });
      
      // Update local state
      const updatedCustomers = [...userCustomers];
      const customerIndex = updatedCustomers.findIndex(c => c.id === customer.id);
      if (customerIndex !== -1) {
        updatedCustomers[customerIndex].commissions[0].commission_amount = newAmount;
      }
      setUserCustomers(updatedCustomers);
      
      setSuccess('Commission updated successfully');
      setEditingCommission(null);
      
      // Call parent refresh function
      if (onDataChange) {
        await onDataChange();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update commission');
      console.error('Error updating commission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralCommission = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUser) {
        setError('Please select a user first');
        return;
      }

      setLoading(true);

      // Create the payment record
      const paymentData = {
        amount: parseFloat(generalCommission.amount),
        user_id: parseInt(selectedUser),
        payment_type: generalCommission.payment_type,
        check_number: generalCommission.payment_type === 'Check' ? generalCommission.check_number : null,
        notes: generalCommission.notes
      };

      await Api.addPayment(paymentData);

      // Create the commission record with both is_paid and admin_modified set to true
      const commissionData = {
        commission_amount: parseFloat(generalCommission.amount),
        user_id: parseInt(selectedUser),
        is_paid: true,
        admin_modified: true
      };

      await Api.addCommission(commissionData);
      
      setSuccess('Commission payment added successfully');
      setGeneralCommission({
        amount: '',
        payment_type: 'Check',
        check_number: '',
        notes: ''
      });
      
      // Call parent refresh function
      if (onDataChange) {
        await onDataChange();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to add commission payment: ${err.message}`);
      console.error('Error adding commission payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (customerId) => {
    const confirmed = window.confirm("An edit can not be reverted, if changes are made after the edit, they will have to be calculated manually.");
    if (confirmed) {
      setEditingCommission(customerId);
    }
  };

  const handleSaveCommission = (customer, newAmount) => {
    const confirmed = window.confirm("Are you sure you want to save?");
    if (confirmed) {
      handleCommissionAdjustment(customer, newAmount);
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex flex-col space-y-6">
        {/* Header and Search Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h2 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Commission Adjustments
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-base rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Search users by name or role..."
          />
        </div>

        {/* Users List */}
        {searchTerm && (
          <div className={`mt-2 rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-gray-50 text-gray-700'
                } ${
                  selectedUser === user.id 
                    ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') 
                    : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{user.name}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Rest of the component */}
        {selectedUser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* General Commission Form */}
            <div className={`p-6 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add Commission Payment
              </h3>
              <form onSubmit={handleGeneralCommission} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount
                    </label>
                    <input
                      type="number"
                      value={generalCommission.amount}
                      onChange={(e) => setGeneralCommission(prev => ({ ...prev, amount: e.target.value }))}
                      className={`w-full p-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Type
                    </label>
                    <select
                      value={generalCommission.payment_type}
                      onChange={(e) => setGeneralCommission(prev => ({ ...prev, payment_type: e.target.value }))}
                      className={`w-full p-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="Check">Check</option>
                      <option value="Cash">Cash</option>
                      <option value="Direct Deposit">Direct Deposit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                {generalCommission.payment_type === 'Check' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Check Number
                    </label>
                    <input
                      type="text"
                      value={generalCommission.check_number}
                      onChange={(e) => setGeneralCommission(prev => ({ ...prev, check_number: e.target.value }))}
                      className={`w-full p-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter check number..."
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={generalCommission.notes}
                    onChange={(e) => setGeneralCommission(prev => ({ ...prev, notes: e.target.value }))}
                    className={`w-full p-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter payment details..."
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedUser || !generalCommission.amount}
                  className={`w-full p-2 rounded-lg font-medium transition-colors duration-150 ${
                    !selectedUser || !generalCommission.amount
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  } text-white`}
                >
                  Add Commission Payment
                </button>
              </form>
            </div>

            {/* Customer Commissions */}
            <div className={`p-6 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Customer Commissions
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : userCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                      {userCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {customer.customer_name}
                          </td>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {customer.userRole}
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-2">
                            {editingCommission === customer.id ? (
                              <>
                                <input
                                  type="number"
                                  className={`w-32 p-2 rounded-lg border ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                  defaultValue={customer.commissions[0]?.commission_amount || ''}
                                  id={`commission-input-${customer.id}`}
                                />
                                <button
                                  onClick={() => {
                                    const newAmount = document.getElementById(`commission-input-${customer.id}`).value;
                                    handleSaveCommission(customer, newAmount);
                                  }}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-150"
                                >
                                  <i className="fas fa-save"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                  ${customer.commissions[0]?.commission_amount || '0'}
                                </span>
                                <button
                                  onClick={() => handleEditClick(customer.id)}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-150"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No customers found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {(success || error) && (
          <div className="fixed bottom-4 right-4 z-50">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountingAdjustments;