import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const CustomerList = ({ userData, customerData }) => {
  const { isDarkMode } = useDarkMode();
  const [showFinalized, setShowFinalized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [commissions, setCommissions] = useState({
    earned: {},
    potential: {}
  });

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        console.log('Starting fetchCommissions with:', {
          customersCount: customerData.allCustomers.length,
          userId: userData.id
        });

        // Sort customers by status first
        const finalizedCustomers = customerData.allCustomers.filter(c => c.status === 'Finalized');
        const nonFinalizedCustomers = customerData.allCustomers.filter(c => c.status !== 'Finalized');

        console.log('Sorted customers:', {
          finalizedCount: finalizedCustomers.length,
          nonFinalizedCount: nonFinalizedCustomers.length
        });

        // Get all earned commissions for finalized customers
        const earnedCommissionsMap = {};
        if (finalizedCustomers.length > 0) {
          const allCommissions = await Api.getAllCommissions();
          console.log('All commissions received:', allCommissions);

          // Filter commissions for current user and displayed customers
          const relevantCommissions = allCommissions.filter(commission => 
            commission.user_id === userData.id && 
            finalizedCustomers.some(c => c.id === commission.customer_id)
          );

          console.log('Filtered commissions:', {
            total: allCommissions.length,
            relevant: relevantCommissions.length,
            userId: userData.id
          });
          
          // Map commissions to customer IDs with number conversion
          relevantCommissions.forEach(commission => {
            earnedCommissionsMap[commission.customer_id] = parseFloat(commission.commission_amount) || 0;
          });

          console.log('Earned commissions map:', earnedCommissionsMap);
        }

        // Get potential commissions for non-finalized customers
        const potentialCommissionsMap = {};
        if (nonFinalizedCustomers.length > 0) {
          console.log('Calculating potential commissions for:', nonFinalizedCustomers.length, 'customers');
          
          const nonFinalizedIds = nonFinalizedCustomers.map(c => c.id);
          const potentialResponse = await Api.calculatePotentialCommissions(nonFinalizedIds);
          
          console.log('Potential commissions response:', potentialResponse);
          
          // Map potential commissions to customer IDs
          potentialResponse.potentialCommissions.forEach(pc => {
            if (pc.amount > 0) {
              potentialCommissionsMap[pc.customerId] = parseFloat(pc.amount) || 0;
            }
          });

          console.log('Potential commissions map:', potentialCommissionsMap);
        }

        console.log('Setting final commission state:', {
          earned: earnedCommissionsMap,
          potential: potentialCommissionsMap
        });

        setCommissions({
          earned: earnedCommissionsMap,
          potential: potentialCommissionsMap
        });
      } catch (error) {
        console.error('Error in fetchCommissions:', error);
      }
    };

    if (customerData.allCustomers.length > 0 && userData?.id) {
      fetchCommissions();
    }
  }, [customerData.allCustomers, userData?.id]);

  const filteredCustomers = customerData.allCustomers.filter(customer => 
    showFinalized 
      ? customer.status === 'Finalized'
      : customer.status !== 'Finalized'
  );

  const userRole = userData?.role || '';
  const isSupplementRole = userRole === 'Supplementer' || userRole === 'Supplement Manager';

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  // Simplified column definitions without icons
  const columns = [
    {
      header: "Customer Name",
      key: "customer_name"
    },
    {
      header: "Phone",
      key: "phone"
    },
    {
      header: "Status",
      key: "status"
    },
    {
      header: isSupplementRole ? "Margin" : "Total Job Price",
      key: isSupplementRole ? "margin" : "total_job_price"
    },
    {
      header: "Commission",
      key: "commission",
      render: (customer) => {
        // First debug log
        console.log('Starting commission render for customer:', customer.id);

        let commissionAmount = 0;
        
        // Check commission maps
        console.log('Commission maps state:', {
          earned: commissions.earned,
          potential: commissions.potential
        });
        
        if (customer.status === 'Finalized') {
          commissionAmount = commissions.earned[customer.id];
          console.log('Finalized customer commission:', {
            customerId: customer.id,
            amount: commissionAmount
          });
        } else {
          commissionAmount = commissions.potential[customer.id];
          console.log('Potential customer commission:', {
            customerId: customer.id,
            amount: commissionAmount
          });
        }

        // Final debug log
        console.log('Final commission amount:', {
          customerId: customer.id,
          status: customer.status,
          amount: commissionAmount
        });

        return (
          <span className={`${
            customer.status !== 'Finalized' ? 'text-gray-500 italic' : ''
          }`}>
            ${(commissionAmount || 0).toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </span>
        );
      }
    }
  ];

  // Calculate pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Navigation functions
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    localStorage.setItem('customerListPage', pageNumber.toString());
  };

  // Update the table row rendering for responsive design
  const renderTableRow = (customer, index) => (
    <tr 
      key={customer.id}
      className={`${
        isDarkMode 
          ? index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
          : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      {/* Customer Name - always visible */}
      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
        {customer.customer_name}
      </td>
      
      {/* Phone - hidden on mobile */}
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm">
        {formatPhoneNumber(customer.phone)}
      </td>
      
      {/* Status - always visible */}
      <td className="px-2 sm:px-6 py-3 sm:py-4">
        <span className={getStatusClasses(customer.status)}>
          {customer.status}
        </span>
      </td>
      
      {/* Price/Margin - hidden on mobile */}
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm">
        {isSupplementRole
          ? `$${((Number(customer.total_job_price) || 0) - (Number(customer.initial_scope_price) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          : `$${Number(customer.total_job_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
      </td>
      
      {/* Commission - always visible */}
      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
        {columns.find(col => col.key === 'commission').render(customer)}
      </td>
    </tr>
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      <div className="p-3 sm:p-6">
        {/* Header section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Customer List
          </h2>
          <button
            onClick={() => setShowFinalized(!showFinalized)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${
              showFinalized
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {showFinalized ? 'Show Active' : 'Show Finalized'}
          </button>
        </div>

        {/* Table section */}
        <div className="w-full">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Headers - hidden on mobile */}
            <thead className={`hidden sm:table-header-group ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCustomers.map((customer, index) => renderTableRow(customer, index))}
            </tbody>
          </table>
        </div>

        {/* Pagination - stack on mobile */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Previous
          </button>
          <span className={isDarkMode ? 'text-white' : 'text-gray-600'}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const getStatusClasses = (status) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  switch (status) {
    case 'Lead':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'Appt Scheduled':
      return `${baseClasses} bg-indigo-100 text-indigo-800`;
    case 'Inspection Complete':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'Claim Filed':
      return `${baseClasses} bg-teal-100 text-teal-800`;
    case 'Adj Meeting Scheduled':
      return `${baseClasses} bg-cyan-100 text-cyan-800`;
    case 'Waiting On Scope':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'Scope Received - Repair':
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case 'Scope Received - Approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Supplements Sent':
      return `${baseClasses} bg-pink-100 text-pink-800`;
    case 'Contract Signed':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'Supplements Finalized':
      return `${baseClasses} bg-lime-100 text-lime-800`;
    case 'Job Prep':
      return `${baseClasses} bg-amber-100 text-amber-800`;
    case 'Being Built':
      return `${baseClasses} bg-emerald-100 text-emerald-800`;
    case 'Final Walk Through':
      return `${baseClasses} bg-fuchsia-100 text-fuchsia-800`;
    case 'Job Complete':
      return `${baseClasses} bg-violet-100 text-violet-800`;
    case 'Pending Payment':
      return `${baseClasses} bg-rose-100 text-rose-800`;
    case 'Lost':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'Finalized':
      return `${baseClasses} bg-slate-100 text-slate-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export default CustomerList;