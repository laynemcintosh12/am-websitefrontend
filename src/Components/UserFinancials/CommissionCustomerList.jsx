import React, { useState, useEffect } from 'react';

const CommissionCustomerList = ({ finalizedCustomers, activeCustomers, formatCurrency, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('finalized');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add responsive items per page
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 640 ? 5 : 10);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine which customers to show based on activeTab
  const customers = activeTab === 'finalized' ? finalizedCustomers : activeCustomers;
  
  // Pagination logic
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Update pagination when itemsPerPage changes
  useEffect(() => {
    // Recalculate current page to prevent empty pages
    const maxPages = Math.ceil(customers.length / itemsPerPage);
    if (currentPage > maxPages) {
      setCurrentPage(Math.max(1, maxPages));
    }
  }, [itemsPerPage]);

  // Add new function to get page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate the range to show
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 flex flex-col transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Customers</h2>
        <button
          onClick={() => {
            setActiveTab(activeTab === 'finalized' ? 'active' : 'finalized');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg !rounded-button cursor-pointer whitespace-nowrap transition-colors duration-200`}
        >
          {activeTab === 'finalized' ? 'Show Active' : 'Show Finalized'}
        </button>
      </div>
      
      <div className="overflow-hidden flex-grow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                Customer
              </th>
              <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                {activeTab === 'finalized' ? 'Commission Earned' : 'Potential Commission'}
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {customer.name}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                  {formatCurrency(activeTab === 'finalized' ? customer.commission : customer.potentialCommission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-5 mt-auto`}>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-2 !rounded-button ${
              isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap`}
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          
          <div className="flex items-center justify-center space-x-2">
            {getPageNumbers().map((page, i) => (
              page === '...' ? (
                <span key={`ellipsis-${i}`} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`inline-flex items-center justify-center w-8 h-8 !rounded-button text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
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

export default CommissionCustomerList;