import React, { useState } from 'react';
import { format } from 'date-fns';

const AccountingPayments = ({ users, userBalances, isDarkMode, handleSubmitPayment, successMessage }) => {
  const [formData, setFormData] = useState({
    selectedUser: '',
    paymentAmount: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentType: 'Check',  // Updated to match the case in database
    paymentDescription: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.selectedUser || !formData.paymentAmount || !formData.paymentDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await handleSubmitPayment(formData);
      setFormData({
        selectedUser: '',
        paymentAmount: '',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentType: 'Check',  // Updated to match the case in database
        paymentDescription: ''
      });
    } catch (err) {
      setError(err.message || 'Error submitting payment');
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Add New Payment
      </h2>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            User *
          </label>
          <select
            value={formData.selectedUser}
            onChange={(e) => setFormData(prev => ({ ...prev, selectedUser: e.target.value }))}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - Balance: ${userBalances.find(b => b.user_id === user.id)?.current_balance || 0}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.paymentAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment Date *
          </label>
          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment Type *
          </label>
          <select
            value={formData.paymentType}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          >
            <option value="Check">Check</option>
            <option value="Cash">Cash</option>
            <option value="Direct Deposit">Direct Deposit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Notes
          </label>
          <textarea
            value={formData.paymentDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentDescription: e.target.value }))}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            rows="3"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          Submit Payment
        </button>
      </form>
    </div>
  );
};

export default AccountingPayments;