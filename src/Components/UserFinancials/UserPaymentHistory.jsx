import React, { useState, useEffect } from 'react';

const UserPaymentHistory = ({ paymentHistory, formatCurrency, isDarkMode }) => {
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Add responsive items per page
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setItemsPerPage(mobile ? 5 : 10);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination logic
  const totalPaymentPages = Math.ceil(paymentHistory.length / itemsPerPage);
  const paymentIndexOfLastItem = paymentCurrentPage * itemsPerPage;
  const paymentIndexOfFirstItem = paymentIndexOfLastItem - itemsPerPage;
  const currentPayments = paymentHistory.slice(paymentIndexOfFirstItem, paymentIndexOfLastItem);

  // Get page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPaymentPages <= 5) {
      for (let i = 1; i <= totalPaymentPages; i++) {
        pages.push(i);
      }
    } else {
      if (paymentCurrentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPaymentPages);
      } else if (paymentCurrentPage >= totalPaymentPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPaymentPages - 2; i <= totalPaymentPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(paymentCurrentPage - 1);
        pages.push(paymentCurrentPage);
        pages.push(paymentCurrentPage + 1);
        pages.push('...');
        pages.push(totalPaymentPages);
      }
    }
    
    return pages;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className={`md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 flex flex-col transition-colors duration-300`}>
      <h2 className="text-xl font-semibold mb-6">Payment History</h2>
      
      <div className="overflow-hidden flex-grow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                Date
              </th>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                Type
              </th>
              {/* Only show Notes column on desktop */}
              {!isMobile && (
                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Notes
                </th>
              )}
              <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {currentPayments.map((payment) => (
              <tr key={payment.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(payment.date)}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {payment.type}
                </td>
                {/* Only show Notes column on desktop */}
                {!isMobile && (
                  <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} max-w-xs truncate`}>
                    {payment.notes}
                  </td>
                )}
                <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Payment History Pagination */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-5 mt-auto`}>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => paginatePayments(Math.max(1, paymentCurrentPage - 1))}
            disabled={paymentCurrentPage === 1}
            className={`inline-flex items-center px-3 py-2 !rounded-button ${
              isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap`}
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          
          <div className="flex items-center justify-center space-x-2">
            {getPageNumbers().map((page, i) => (
              <button
                key={i}
                onClick={() => typeof page === 'number' && paginatePayments(page)}
                className={`inline-flex items-center justify-center w-8 h-8 !rounded-button text-sm font-medium transition-all duration-200 ${
                  paymentCurrentPage === page
                    ? 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-blue-400' 
                      : 'text-gray-600 hover:text-blue-600'
                }`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => paginatePayments(Math.min(totalPaymentPages, paymentCurrentPage + 1))}
            disabled={paymentCurrentPage === totalPaymentPages}
            className={`inline-flex items-center px-3 py-2 !rounded-button ${
              isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap`}
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPaymentHistory;