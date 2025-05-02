import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import BalanceMetrics from '../Components/UserFinancials/BalanceMetrics';
import CommissionCustomerList from '../Components/UserFinancials/CommissionCustomerList';
import UserPaymentHistory from '../Components/UserFinancials/UserPaymentHistory';
import Api from '../Api';

const Financials = () => {
  const { isDarkMode } = useDarkMode();
  const [finalizedCustomers, setFinalizedCustomers] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.user?.id;

        // Fetch all customers
        const allCustomers = await Api.getCustomers();
        
        // Filter customers into team and user lists
        const teamCustomers = allCustomers.filter(customer => 
          customer.salesman_id === userId ||
          customer.supplementer_id === userId ||
          customer.manager_id === userId ||
          customer.supplement_manager_id === userId ||
          customer.referrer_id === userId
        );

        const usersCustomers = allCustomers.filter(customer =>
          customer.salesman_id === userId ||
          customer.supplementer_id === userId ||
          customer.referrer_id === userId
        );

        // Get potential commissions for user's customers
        const customerIds = usersCustomers
          .filter(customer => customer.status !== 'Finalized')
          .map(customer => customer.id);
        const potentialCommissionsResponse = await Api.calculatePotentialCommissions(customerIds);
        
        // Format active customers directly from the potential commissions response
        const formattedActiveCustomers = potentialCommissionsResponse.potentialCommissions
          .filter(commission => {
            const customer = usersCustomers.find(c => c.id === commission.customerId);
            return customer && customer.status !== 'Finalized';
          })
          .map(commission => ({
            id: commission.customerId,
            name: commission.customerName,
            potentialCommission: commission.amount || 0
          }));

        // Get all commissions and filter for finalized customers
        const allCommissions = await Api.getAllCommissions();
        const userCommissions = allCommissions.filter(commission => commission.user_id === userId);
        
        // Format finalized customers using data directly from the API
        const formattedFinalizedCustomers = userCommissions.map(commission => ({
          id: commission.customer_id,
          name: commission.customer_name,
          commission: parseFloat(commission.commission_amount)
        }));

        // Get payment history
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          if (!userData?.user?.id) {
            throw new Error('User not authenticated');
          }

          const allPayments = await Api.getAllPayments();
          if (!Array.isArray(allPayments)) {
            throw new Error('Invalid payment data received');
          }

          // Filter payments for current user
          const userPayments = allPayments.filter(payment => payment.user_id === userId);

          const formattedPayments = userPayments.map(payment => ({
            id: payment.id,
            date: payment.payment_date,
            type: payment.payment_type,
            notes: payment.notes || '',
            amount: payment.amount || 0
          }));
          setPaymentHistory(formattedPayments);
        } catch (error) {
          console.error('Error fetching payment history:', error.message);
          setPaymentHistory([]);
        }

        setActiveCustomers(formattedActiveCustomers);
        setFinalizedCustomers(formattedFinalizedCustomers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Metrics calculations
  const totalEarned = finalizedCustomers.reduce((sum, customer) => sum + customer.commission, 0);
  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const currentBalance = totalEarned - totalPaid;
  const potentialCommission = activeCustomers.reduce((sum, customer) => sum + customer.potentialCommission, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} p-6 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Financial Dashboard</h1>
        
        <BalanceMetrics 
          totalEarned={totalEarned}
          potentialCommission={potentialCommission}
          totalPaid={totalPaid}
          currentBalance={currentBalance}
          formatCurrency={formatCurrency}
          isDarkMode={isDarkMode}
        />
        
        <div className="flex flex-col md:flex-row gap-6">
          <CommissionCustomerList 
            finalizedCustomers={finalizedCustomers}
            activeCustomers={activeCustomers}
            formatCurrency={formatCurrency}
            isDarkMode={isDarkMode}
          />
          
          <UserPaymentHistory 
            paymentHistory={paymentHistory}
            formatCurrency={formatCurrency}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Financials;