import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AccountingAnalytics from '../Components/AdminAccounting/AccountingAnalytics';
import AccountingUser from '../Components/AdminAccounting/AccountingUser';
import AccountingPayments from '../Components/AdminAccounting/AccountingPayments';
import AccountingHistory from '../Components/AdminAccounting/AccountingHistory';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';
import AccountingAdjustments from '../Components/AdminAccounting/AccountingAdjustments';

const AdminAccounting = () => {
  const { isDarkMode } = useDarkMode();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountingData, setAccountingData] = useState({
    users: [],
    payments: [],
    commissions: [],
    userBalances: [],
    userPotentialCommissions: {}
  });
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('accountingActiveTab');
    return savedTab || 'analytics';
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Extract the data fetching logic into a separate function
  const fetchAccountingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all data in parallel
      const [users, payments, allCommissions, customers, userBalances] = await Promise.all([
        Api.getAllUsers(),
        Api.getAllPayments(),
        Api.getAllCommissions(),
        Api.getCustomers(),
        Api.getAllUserBalances()
      ]);
      console.log("User Balances:", userBalances);
      
      // Calculate total earned (without debuggers)
      const totalEarnedByUser = {};
      allCommissions.forEach(commission => {
        const userId = commission.user_id;
        const amount = Number(commission.commission_amount || 0);
        if (!totalEarnedByUser[userId]) {
          totalEarnedByUser[userId] = 0;
        }
        totalEarnedByUser[userId] += amount;
      });

      // Get active customers (without debug)
      const activeCustomers = customers.filter(customer => 
        !['Finalized', 'Lost - Reclaimable', 'Lost - Unreclaimable'].includes(customer.status)
      );

      // Calculate potential commissions for each user from the users array
      const userPotentialCommissions = {};
      for (const user of users) {
        // Get active customers for this specific user
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
            // Pass the specific user.id as second parameter
            const response = await Api.calculatePotentialCommissions(customerIds, user.id);
            
            if (response.potentialCommissions) {
              userPotentialCommissions[user.id] = response.potentialCommissions.reduce((sum, pc) => {
                const amount = Number(pc.amount || 0);
                return sum + (amount > 0 ? amount : 0);
              }, 0);
            }
          } catch (error) {
            console.error(`Error calculating potential commissions for user ${user.id}:`, error);
            userPotentialCommissions[user.id] = 0;
          }
        } else {
          userPotentialCommissions[user.id] = 0;
        }
      }

      setAccountingData({
        users,
        payments,
        commissions: allCommissions,
        userBalances: userBalances,
        userPotentialCommissions
      });
      console.log("Accounting Data:", accountingData.userBalances);

    } catch (err) {
      console.error('Error loading accounting data:', err);
      setError(err.message || 'Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData();
  }, []);

  // Clear active tab when navigating away
  useEffect(() => {
    return () => {
      localStorage.removeItem('accountingActiveTab');
    };
  }, [location.pathname]);

  // Save active tab only while on this page
  useEffect(() => {
    localStorage.setItem('accountingActiveTab', activeTab);
  }, [activeTab]);

  const handleSubmitPayment = async (paymentData) => {
    try {
      const { selectedUser, paymentAmount, paymentDate, paymentType, paymentDescription } = paymentData;

      await Api.addPayment({
        user_id: selectedUser,
        amount: parseFloat(paymentAmount),
        payment_type: paymentType,
        notes: paymentDescription,
        payment_date: paymentDate
      });

      // Refresh all data after payment
      await fetchAccountingData();

      setSuccessMessage('Payment logged successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err.message || 'Failed to submit payment');
    }
  };

  // Function to handle payment deletion
  const handlePaymentDeleted = async (deletedPaymentId) => {
    // Optimistic update
    setAccountingData(prevData => ({
      ...prevData,
      payments: prevData.payments.filter(payment => payment.id !== deletedPaymentId)
    }));
    
    // Refresh all data to ensure consistency
    await fetchAccountingData();
  };

  // Function to handle payment updates
  const handlePaymentUpdated = async (updatedPayment) => {
    // Optimistic update
    setAccountingData(prevData => ({
      ...prevData,
      payments: prevData.payments.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      )
    }));
    
    // Refresh all data to ensure consistency
    await fetchAccountingData();
  };

  // Function to handle changes from AccountingAdjustments
  const handleAdjustmentChange = async () => {
    await fetchAccountingData();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
        </div>
        
        <div className="mb-8">
          <div className={`grid grid-cols-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Analytics Tab */}
            <button
              className={`flex flex-col items-center px-1 sm:px-3 py-2 font-medium cursor-pointer text-[10px] sm:text-sm ${
                activeTab === 'analytics' ?
                (isDarkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600') :
                (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-bar mb-1 sm:mb-0 sm:mr-2"></i>
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>

            <button
              className={`flex flex-col items-center px-1 sm:px-4 py-2 font-medium cursor-pointer text-[10px] sm:text-sm ${
                activeTab === 'users' ?
                (isDarkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600') :
                (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users mb-1 sm:mb-0 sm:mr-2"></i>
              <span className="hidden sm:inline">User Data</span>
              <span className="sm:hidden">Users</span>
            </button>
            
            <button
              className={`flex flex-col items-center px-1 sm:px-4 py-2 font-medium cursor-pointer text-[10px] sm:text-sm ${
                activeTab === 'log-payment' ?
                (isDarkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600') :
                (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
              onClick={() => setActiveTab('log-payment')}
            >
              <i className="fas fa-money-bill-wave mb-1 sm:mb-0 sm:mr-2"></i>
              <span className="hidden sm:inline">Log Payment</span>
              <span className="sm:hidden">Pay</span>
            </button>
            
            <button
              className={`flex flex-col items-center px-1 sm:px-4 py-2 font-medium cursor-pointer text-[10px] sm:text-sm ${
                activeTab === 'payment-history' ?
                (isDarkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600') :
                (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
              onClick={() => setActiveTab('payment-history')}
            >
              <i className="fas fa-history mb-1 sm:mb-0 sm:mr-2"></i>
              <span className="hidden sm:inline">Payment History</span>
              <span className="sm:hidden">History</span>
            </button>

            <button
              className={`flex flex-col items-center px-1 sm:px-3 py-2 font-medium cursor-pointer text-[10px] sm:text-sm ${
                activeTab === 'adjustments' ?
                (isDarkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600') :
                (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
              onClick={() => setActiveTab('adjustments')}
            >
              <i className="fas fa-sliders-h mb-1 sm:mb-0 sm:mr-2"></i>
              <span className="hidden sm:inline">Adjustments</span>
              <span className="sm:hidden">Adjust</span>
            </button>
          </div>
        </div>
        
        {activeTab === 'users' && (
          <AccountingUser 
            users={accountingData.users}
            userBalances={accountingData.userBalances}
            userPotentialCommissions={accountingData.userPotentialCommissions}
            payments={accountingData.payments}
            isDarkMode={isDarkMode}
          />
        )}
        
        {activeTab === 'log-payment' && (
          <AccountingPayments 
            users={accountingData.users}
            userBalances={accountingData.userBalances}
            isDarkMode={isDarkMode}
            handleSubmitPayment={handleSubmitPayment}
            successMessage={successMessage}
            onDataChange={fetchAccountingData} // Add this prop
          />
        )}
        
        {activeTab === 'payment-history' && (
          <AccountingHistory 
            payments={accountingData.payments}
            users={accountingData.users}
            isDarkMode={isDarkMode}
            onPaymentDeleted={handlePaymentDeleted}
            onPaymentUpdated={handlePaymentUpdated}
            onDataChange={fetchAccountingData} // Add this prop
          />
        )}
        
        {activeTab === 'analytics' && (
          <AccountingAnalytics 
            users={accountingData.users}
            payments={accountingData.payments}
            userBalances={accountingData.userBalances}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'adjustments' && (
          <AccountingAdjustments 
            users={accountingData.users}
            isDarkMode={isDarkMode}
            onDataChange={handleAdjustmentChange} // Add this prop
          />
        )}
      </div>
    </div>
  );
};

export default AdminAccounting;