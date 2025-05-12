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
  const [financialMetrics, setFinancialMetrics] = useState({
    totalEarned: 0,
    totalPaid: 0,
    currentBalance: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.user?.id;

        // Get initial data
        const [allCustomers, allCommissions, allPayments, userBalances] = await Promise.all([
          Api.getCustomers(),
          Api.getAllCommissions(),
          Api.getAllPayments(),
          Api.getAllUserBalances()
        ]);

        // Get the current user's balance data
        const userBalance = userBalances.find(balance => balance.user_id === userId) || {
          total_commissions_earned: 0,
          total_payments_received: 0,
          current_balance: 0
        };

        // Filter customers
        const usersCustomers = allCustomers.filter(customer =>
          customer.salesman_id === userId ||
          customer.supplementer_id === userId ||
          customer.referrer_id === userId
        );

        // Get potential commissions for user's customers
        const customerIds = usersCustomers
          .filter(customer => customer.status !== 'Finalized')
          .map(customer => customer.id);
        
        // Get potential commissions
        const potentialCommissionsResponse = await Api.calculatePotentialCommissions(customerIds);
        
        // Format active customers
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

        // Format finalized customers
        const userCommissions = allCommissions.filter(commission => commission.user_id === userId);
        const formattedFinalizedCustomers = userCommissions.map(commission => ({
          id: commission.customer_id,
          name: commission.customer_name,
          commission: parseFloat(commission.commission_amount)
        }));

        // Format payments
        const userPayments = allPayments.filter(payment => payment.user_id === userId);
        const formattedPayments = userPayments.map(payment => ({
          id: payment.id,
          date: payment.payment_date,
          type: payment.payment_type,
          notes: payment.notes || '',
          amount: payment.amount || 0
        }));

        // Update state
        setActiveCustomers(formattedActiveCustomers);
        setFinalizedCustomers(formattedFinalizedCustomers);
        setPaymentHistory(formattedPayments);
        
        // Set financial metrics from user balance
        setFinancialMetrics({
          totalEarned: Number(userBalance.total_commissions_earned),
          totalPaid: Number(userBalance.total_payments_received),
          currentBalance: Number(userBalance.current_balance)
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keep the potential commission calculation as is
  const potentialCommission = activeCustomers.reduce((sum, customer) => {
    return sum + (customer.potentialCommission > 0 ? customer.potentialCommission : 0);
  }, 0);

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
          totalEarned={financialMetrics.totalEarned}
          potentialCommission={potentialCommission}
          totalPaid={financialMetrics.totalPaid}
          currentBalance={financialMetrics.currentBalance}
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