import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const STATUS_OPTIONS = [
  'Lead',
  'Appt Scheduled',
  'Inspection Complete',
  'Claim Filed',
  'Adj Meeting Scheduled',
  'Waiting On Scope',
  'Scope Received - Repair',
  'Scope Received - Approved',
  'Supplements Sent',
  'In Appraisal',
  'Ready for Contract',
  'Contract Signed',
  'Supplements Finalized',
  'Job Prep',
  'Waiting on Build',
  'Being Built',
  'Final Walk Through',
  'Job Completed',
  'Pending Payments',
  'Lost - Reclaimable',
  'Lost - Unreclaimable',
  'Finalized'
];

const CustomerList = ({ userData, customerData }) => {
  const { isDarkMode } = useDarkMode();
  const [showFinalized, setShowFinalized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [commissions, setCommissions] = useState({
    earned: {},
    potential: {}
  });
  const [sortConfig, setSortConfig] = useState({ key: 'customer_name', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchCommissions = async () => {
      try {

        // Sort customers by status first
        const finalizedCustomers = customerData.allCustomers.filter(c => c.status === 'Finalized');
        const nonFinalizedCustomers = customerData.allCustomers.filter(c => c.status !== 'Finalized');

        // Get all earned commissions for finalized customers
        const earnedCommissionsMap = {};
        if (finalizedCustomers.length > 0) {
          const allCommissions = await Api.getAllCommissions();

          // Filter commissions for current user and displayed customers
          const relevantCommissions = allCommissions.filter(commission => 
            commission.user_id === userData.id && 
            finalizedCustomers.some(c => c.id === commission.customer_id)
          );
          
          // Map commissions to customer IDs with number conversion
          relevantCommissions.forEach(commission => {
            earnedCommissionsMap[commission.customer_id] = parseFloat(commission.commission_amount) || 0;
          });
        }

        // Get potential commissions for non-finalized customers
        const potentialCommissionsMap = {};
        if (nonFinalizedCustomers.length > 0) {
          
          const nonFinalizedIds = nonFinalizedCustomers.map(c => c.id);
          const potentialResponse = await Api.calculatePotentialCommissions(nonFinalizedIds);
          
          // Map potential commissions to customer IDs
          potentialResponse.potentialCommissions.forEach(pc => {
            if (pc.amount > 0) {
              potentialCommissionsMap[pc.customerId] = parseFloat(pc.amount) || 0;
            }
          });
        }

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

  const filteredCustomers = customerData.allCustomers.filter(customer => {
    const matchesFinalized = showFinalized 
      ? customer.status === 'Finalized'
      : customer.status !== 'Finalized';
      
    const matchesStatusFilter = !statusFilter || customer.status === statusFilter;
    
    return matchesFinalized && matchesStatusFilter;
  });

  const sortedFilteredCustomers = React.useMemo(() => {
    const filtered = filteredCustomers;
    
    return [...filtered].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.key) {
        case 'customer_name':
          return direction * (a.customer_name.localeCompare(b.customer_name));
        case 'phone':
          return direction * ((a.phone || '').localeCompare(b.phone || ''));
        case 'status':
          return direction * (a.status.localeCompare(b.status));
        case 'total_job_price':
          return direction * (Number(a.total_job_price || 0) - Number(b.total_job_price || 0));
        case 'margin':
          const marginA = (Number(a.total_job_price) || 0) - (Number(a.initial_scope_price) || 0);
          const marginB = (Number(b.total_job_price) || 0) - (Number(b.initial_scope_price) || 0);
          return direction * (marginA - marginB);
        case 'commission':
          const commissionA = a.status === 'Finalized' 
            ? (commissions.earned[a.id] || 0)
            : (commissions.potential[a.id] || 0);
          const commissionB = b.status === 'Finalized'
            ? (commissions.earned[b.id] || 0)
            : (commissions.potential[b.id] || 0);
          return direction * (commissionA - commissionB);
        default:
          return 0;
      }
    });
  }, [filteredCustomers, sortConfig, commissions]);

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

        let commissionAmount = 0;
        
        if (customer.status === 'Finalized') {
          commissionAmount = commissions.earned[customer.id];
        } else {
          commissionAmount = commissions.potential[customer.id];
        }

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
  const currentCustomers = sortedFilteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(sortedFilteredCustomers.length / customersPerPage);

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
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      <div className="p-3 sm:p-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Customer List
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              } border`}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.filter(status => 
                showFinalized ? status === 'Finalized' : status !== 'Finalized'
              ).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setShowFinalized(!showFinalized);
                setStatusFilter(''); // Clear status filter when toggling
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${
                showFinalized
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {showFinalized ? 'Show Active' : 'Show Finalized'}
            </button>
          </div>
        </div>

        {/* Table section */}
        <div className="w-full">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Headers - hidden on mobile */}
            <thead className={`hidden sm:table-header-group ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    onClick={() => handleSort(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {renderSortIcon(column.key)}
                    </div>
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