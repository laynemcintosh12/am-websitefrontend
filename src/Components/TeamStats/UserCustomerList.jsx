import React, { useState, useEffect } from 'react';
import Api from '../../Api';

// Status options for filtering - matching CustomerList.jsx
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

const UserCustomerList = ({ isDarkMode }) => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25); // Show 25 customers per page
  const [totalItems, setTotalItems] = useState(0);
  
  // Commission loading state
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [processedCustomers, setProcessedCustomers] = useState(new Set());

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user) {
          throw new Error('No user data found');
        }
        setCurrentUser(userData.user);

        // Fetch required data
        const [usersResponse, teamsResponse, customersResponse] = await Promise.all([
          Api.getAllUsers(),
          Api.getTeams(),
          Api.getCustomers()
        ]);

        console.log('Raw API responses:', { 
          usersResponse: usersResponse, 
          teamsResponse: teamsResponse, 
          customersResponse: customersResponse 
        });

        const users = usersResponse.users || [];
        const teams = teamsResponse.teams || [];
        const customers = Array.isArray(customersResponse) ? customersResponse : (customersResponse.customers || []);

        console.log('Processed data:', {
          users: users.length,
          teams: teams.length,
          customers: customers.length,
          sampleCustomer: customers[0]
        });

        setAllUsers(users);
        setAllTeams(teams);
        setAllCustomers(customers);
        setFilteredCustomers(customers); // Initialize filtered customers
        setTotalItems(customers.length);
        
        console.log(`Fetched ${customers.length} customers`);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter customers based on search term and status filter
  useEffect(() => {
    console.log('Filter effect triggered:', { 
      searchTerm, 
      statusFilter,
      allCustomersLength: allCustomers.length, 
      allUsersLength: allUsers.length 
    });

    let filtered = allCustomers;

    // Apply status filter first
    if (statusFilter.length > 0) {
      filtered = filtered.filter(customer => 
        statusFilter.includes(customer.status)
      );
    }

    // Then apply search filter
    if (searchTerm.trim()) {
      if (allUsers.length === 0) {
        console.log('Users not loaded yet, filtering without user names...');
        // Filter by non-user fields only
        filtered = filtered.filter(customer => {
          const searchLower = searchTerm.toLowerCase();
          
          // Search in customer name
          const customerName = (customer.customer_name || '').toLowerCase();
          if (customerName.includes(searchLower)) return true;
          
          // Search in status
          const status = (customer.status || '').toLowerCase();
          if (status.includes(searchLower)) return true;
          
          // Search in jnid
          const jnid = (customer.jnid || '').toLowerCase();
          if (jnid.includes(searchLower)) return true;
          
          // Search in phone
          const phone = (customer.phone || '').toLowerCase();
          if (phone.includes(searchLower)) return true;
          
          // Search in address
          const address = (customer.address || '').toLowerCase();
          if (address.includes(searchLower)) return true;
          
          return false;
        });
      } else {
        // Full filtering including user names
        filtered = filtered.filter(customer => {
          const searchLower = searchTerm.toLowerCase();
          
          // Search in customer name
          const customerName = (customer.customer_name || '').toLowerCase();
          if (customerName.includes(searchLower)) return true;
          
          // Search in status
          const status = (customer.status || '').toLowerCase();
          if (status.includes(searchLower)) return true;
          
          // Search in jnid
          const jnid = (customer.jnid || '').toLowerCase();
          if (jnid.includes(searchLower)) return true;
          
          // Search in phone
          const phone = (customer.phone || '').toLowerCase();
          if (phone.includes(searchLower)) return true;
          
          // Search in address
          const address = (customer.address || '').toLowerCase();
          if (address.includes(searchLower)) return true;
          
          // Search in user names
          const salesman = allUsers.find(user => user.id === customer.salesman_id);
          if (salesman && salesman.name && salesman.name.toLowerCase().includes(searchLower)) return true;
          
          const supplementer = allUsers.find(user => user.id === customer.supplementer_id);
          if (supplementer && supplementer.name && supplementer.name.toLowerCase().includes(searchLower)) return true;
          
          const manager = allUsers.find(user => user.id === customer.manager_id);
          if (manager && manager.name && manager.name.toLowerCase().includes(searchLower)) return true;
          
          const supplementManager = allUsers.find(user => user.id === customer.supplement_manager_id);
          if (supplementManager && supplementManager.name && supplementManager.name.toLowerCase().includes(searchLower)) return true;
          
          return false;
        });
      }
    }
    
    console.log(`Filtered ${filtered.length} customers from ${allCustomers.length} total`);
    
    setFilteredCustomers(filtered);
    setTotalItems(filtered.length);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, statusFilter, allCustomers, allUsers]);

  // Update processCustomerDataForPage to use filtered customers
  useEffect(() => {
    console.log('Processing filtered customers effect:', {
      filteredCustomersLength: filteredCustomers.length,
      allUsersLength: allUsers.length,
      allTeamsLength: allTeams.length,
      currentPage,
      searchTerm,
      loading
    });

    // Process if we have filtered customers and not loading
    const processData = async () => {
      if (filteredCustomers.length > 0 && !loading) {
        console.log('✅ Processing customer data for page:', currentPage);
        await processCustomerDataForPage(filteredCustomers, allUsers, allTeams, currentPage);
      } else if (filteredCustomers.length === 0 && (searchTerm.trim() !== '' || statusFilter.length > 0) && !loading) {
        // Handle case where filters return no results
        console.log('❌ No results found with current filters, clearing customer data');
        setCustomerData([]);
        setCommissionsLoading(false);
      } else if (filteredCustomers.length === 0 && searchTerm.trim() === '' && statusFilter.length === 0 && allCustomers.length === 0 && !loading) {
        // Handle case where there are no customers at all
        console.log('❌ No customers available');
        setCustomerData([]);
        setCommissionsLoading(false);
      } else {
        console.log('⏸️ Waiting - conditions not met:', {
          hasFilteredCustomers: filteredCustomers.length > 0,
          notLoading: !loading,
          searchTerm: searchTerm,
          statusFilterCount: statusFilter.length
        });
      }
    };

    // Small timeout to avoid race conditions
    const timeout = setTimeout(processData, 10);
    return () => clearTimeout(timeout);
  }, [filteredCustomers, currentPage, allUsers, allTeams, loading, searchTerm, statusFilter, allCustomers.length]);

  // Helper function to get user details by ID
  const getUserById = async (userId) => {
    if (!userId) return null;
    try {
      const response = await Api.getUserDetails(userId);
      return response.user || response;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  // Process customer data for specific page
  const processCustomerDataForPage = async (customers, users, teams, page) => {
    try {
      console.log('processCustomerDataForPage called with:', {
        customersLength: customers.length,
        usersLength: users.length,
        teamsLength: teams.length,
        page
      });

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageCustomers = customers.slice(startIndex, endIndex);

      console.log(`Processing page ${page}: customers ${startIndex + 1}-${Math.min(endIndex, customers.length)} of ${customers.length}`);
      console.log('Page customers:', pageCustomers.length);
      
      // Debug: Log the first customer to see its structure
      if (pageCustomers.length > 0) {
        console.log('Sample customer data:', pageCustomers[0]);
      }

      // If no customers on this page, clear the display
      if (pageCustomers.length === 0) {
        setCustomerData([]);
        setCommissionsLoading(false);
        return;
      }

      // First, create basic customer data without user details or commissions
      const basicData = pageCustomers.map((customer) => {
        // Calculate margin with correct field names from schema
        const finalPrice = parseFloat(customer.total_job_price || 0);
        const initialPrice = parseFloat(customer.initial_scope_price || 0);
        const marginAdded = finalPrice - initialPrice;

        // Use customer_name from schema
        const customerName = customer.customer_name || `Customer #${customer.id}`;

        return {
          id: customer.id,
          status: customer.status || 'Unknown',
          customerName,
          salesmanName: 'Loading...',
          salesmanCommission: 0,
          salesManagerName: 'Loading...',
          salesManagerCommission: 0,
          supplementerName: 'Loading...',
          supplementerCommission: 0,
          supplementManagerName: 'Loading...',
          supplementManagerCommission: 0,
          finalJobPrice: finalPrice,
          initialScopePrice: initialPrice,
          marginAdded,
          customer: customer,
          loadingCommissions: true,
          // Store the IDs for processing
          salesmanId: customer.salesman_id,
          supplementerId: customer.supplementer_id,
          managerId: customer.manager_id,
          supplementManagerId: customer.supplement_manager_id
        };
      });

      console.log('Setting basic data:', basicData.length, 'customers');

      // Set basic data immediately for fast UI rendering
      setCustomerData(basicData);
      setCurrentPage(page);

      // Now fetch user details and calculate commissions
      await processUserDetailsAndCommissions(basicData);

    } catch (error) {
      console.error('Error processing customer data:', error);
      setError('Failed to process customer data');
    }
  };

  // Process user details and commissions for each customer - OPTIMIZED VERSION
  const processUserDetailsAndCommissions = async (customerData) => {
    try {
      setCommissionsLoading(true);

      // Step 1: Fetch all user details in parallel for efficiency
      const uniqueUserIds = new Set();
      customerData.forEach(customer => {
        if (customer.salesmanId) uniqueUserIds.add(customer.salesmanId);
        if (customer.supplementerId) uniqueUserIds.add(customer.supplementerId);
        if (customer.managerId) uniqueUserIds.add(customer.managerId);
        if (customer.supplementManagerId) uniqueUserIds.add(customer.supplementManagerId);
      });

      // Fetch all unique users in parallel
      const userPromises = Array.from(uniqueUserIds).map(userId => 
        getUserById(userId).then(user => ({ userId, user }))
      );
      
      const userResults = await Promise.all(userPromises);
      const userMap = new Map();
      userResults.forEach(({ userId, user }) => {
        userMap.set(userId, user);
      });

      // Step 2: Separate customers by status for efficient commission calculation
      const finalizedCustomers = customerData.filter(customer => 
        customer.customer?.status === 'Finalized'
      );
      const nonFinalizedCustomers = customerData.filter(customer => 
        customer.customer?.status !== 'Finalized'
      );

      // Step 3: Handle finalized customers (earned commissions)
      const earnedCommissionsMap = {};
      if (finalizedCustomers.length > 0) {
        try {
          const allCommissions = await Api.getAllCommissions();
          
          // Create a map of customer_id -> user_id -> commission_amount
          const commissionsByCustomer = new Map();
          allCommissions.forEach(commission => {
            if (!commissionsByCustomer.has(commission.customer_id)) {
              commissionsByCustomer.set(commission.customer_id, new Map());
            }
            commissionsByCustomer.get(commission.customer_id).set(
              commission.user_id, 
              parseFloat(commission.commission_amount) || 0
            );
          });

          // Map earned commissions for each finalized customer
          finalizedCustomers.forEach(customer => {
            const customerCommissions = commissionsByCustomer.get(customer.id) || new Map();
            earnedCommissionsMap[customer.id] = {
              salesman: customerCommissions.get(customer.salesmanId) || 0,
              supplementer: customerCommissions.get(customer.supplementerId) || 0,
              manager: customerCommissions.get(customer.managerId) || 0,
              supplementManager: customerCommissions.get(customer.supplementManagerId) || 0
            };
          });
        } catch (error) {
          console.error('Error fetching earned commissions:', error);
        }
      }

      // Step 4: Handle non-finalized customers (potential commissions) - BATCH PROCESSING
      const potentialCommissionsMap = {};
      if (nonFinalizedCustomers.length > 0) {
        // Get all unique user IDs that need potential commission calculations
        const usersNeedingCalculation = new Set();
        nonFinalizedCustomers.forEach(customer => {
          if (customer.salesmanId) usersNeedingCalculation.add(customer.salesmanId);
          if (customer.supplementerId) usersNeedingCalculation.add(customer.supplementerId);
          if (customer.managerId) usersNeedingCalculation.add(customer.managerId);
          if (customer.supplementManagerId) usersNeedingCalculation.add(customer.supplementManagerId);
        });

        const nonFinalizedCustomerIds = nonFinalizedCustomers.map(c => c.id);

        // Calculate potential commissions for each user in parallel
        const potentialCommissionPromises = Array.from(usersNeedingCalculation).map(async (userId) => {
          try {
            const response = await Api.calculatePotentialCommissions(nonFinalizedCustomerIds, userId);
            return { userId, response };
          } catch (error) {
            console.error(`Error calculating potential commissions for user ${userId}:`, error);
            return { userId, response: { potentialCommissions: [] } };
          }
        });

        const potentialResults = await Promise.all(potentialCommissionPromises);

        // Create a map: customer_id -> user_id -> commission_amount
        const potentialByCustomer = new Map();
        potentialResults.forEach(({ userId, response }) => {
          if (response.potentialCommissions) {
            response.potentialCommissions.forEach(pc => {
              if (!potentialByCustomer.has(pc.customerId)) {
                potentialByCustomer.set(pc.customerId, new Map());
              }
              potentialByCustomer.get(pc.customerId).set(userId, parseFloat(pc.amount) || 0);
            });
          }
        });

        // Map potential commissions for each non-finalized customer
        nonFinalizedCustomers.forEach(customer => {
          const customerPotentials = potentialByCustomer.get(customer.id) || new Map();
          potentialCommissionsMap[customer.id] = {
            salesman: customerPotentials.get(customer.salesmanId) || 0,
            supplementer: customerPotentials.get(customer.supplementerId) || 0,
            manager: customerPotentials.get(customer.managerId) || 0,
            supplementManager: customerPotentials.get(customer.supplementManagerId) || 0
          };
        });
      }

      // Helper function to format user name
      const formatUserName = (user) => {
        if (!user) return '';
        
        // Handle different possible user object structures
        if (user.first_name && user.last_name) {
          return `${user.first_name} ${user.last_name}`;
        } else if (user.name) {
          return user.name;
        } else {
          return `User #${user.id}`;
        }
      };

      // Step 5: Update all customer data at once
      setCustomerData(prevData => 
        prevData.map(item => {
          const salesman = userMap.get(item.salesmanId);
          const supplementer = userMap.get(item.supplementerId);
          const manager = userMap.get(item.managerId);
          const supplementManager = userMap.get(item.supplementManagerId);

          // Get commission amounts based on status
          const isFinalized = item.customer?.status === 'Finalized';
          const commissions = isFinalized 
            ? (earnedCommissionsMap[item.id] || { salesman: 0, supplementer: 0, manager: 0, supplementManager: 0 })
            : (potentialCommissionsMap[item.id] || { salesman: 0, supplementer: 0, manager: 0, supplementManager: 0 });

          return {
            ...item,
            salesmanName: formatUserName(salesman),
            salesmanCommission: commissions.salesman,
            salesManagerName: formatUserName(manager),
            salesManagerCommission: commissions.manager,
            supplementerName: formatUserName(supplementer),
            supplementerCommission: commissions.supplementer,
            supplementManagerName: formatUserName(supplementManager),
            supplementManagerCommission: commissions.supplementManager,
            loadingCommissions: false
          };
        })
      );

      console.log('Commission processing completed:', {
        finalizedCustomers: finalizedCustomers.length,
        nonFinalizedCustomers: nonFinalizedCustomers.length,
        earnedCommissions: Object.keys(earnedCommissionsMap).length,
        potentialCommissions: Object.keys(potentialCommissionsMap).length
      });

    } catch (error) {
      console.error('Error processing user details and commissions:', error);
      setError('Failed to load user details or calculate commissions');
    } finally {
      setCommissionsLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setCurrentPage(newPage);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper function to determine user permissions
  const getUserPermissions = () => {
    if (!currentUser) return { isAdmin: false, isManager: false };
    
    return {
      isAdmin: currentUser.permissions === 'Admin',
      isManager: currentUser.permissions === 'Sales Manager' || currentUser.permissions === 'Supplement Manager'
    };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...customerData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (sortConfig.direction === 'asc') {
      return aString < bString ? -1 : aString > bString ? 1 : 0;
    } else {
      return aString > bString ? -1 : aString < bString ? 1 : 0;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'finalized':
        return isDarkMode 
          ? 'bg-green-900 text-green-100' 
          : 'bg-green-100 text-green-800';
      case 'in progress':
      case 'active':
      case 'being built':
      case 'job prep':
        return isDarkMode 
          ? 'bg-blue-900 text-blue-100' 
          : 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'waiting on scope':
      case 'waiting on build':
        return isDarkMode 
          ? 'bg-yellow-900 text-yellow-100' 
          : 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'lost - reclaimable':
      case 'lost - unreclaimable':
        return isDarkMode 
          ? 'bg-red-900 text-red-100' 
          : 'bg-red-100 text-red-800';
      case 'lead':
      case 'appt scheduled':
        return isDarkMode 
          ? 'bg-purple-900 text-purple-100' 
          : 'bg-purple-100 text-purple-800';
      default:
        return isDarkMode 
          ? 'bg-gray-700 text-gray-200' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Clear status filter
  const clearStatusFilter = () => {
    setStatusFilter([]);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Toggle all status filters
  const handleSelectAllStatuses = () => {
    if (statusFilter.length === STATUS_OPTIONS.length) {
      setStatusFilter([]);
    } else {
      setStatusFilter([...STATUS_OPTIONS]);
    }
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
        <div className="text-center py-8">
          <div className={`text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            Loading customer data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">Error: {error}</div>
        </div>
      </div>
    );
  }

  const permissions = getUserPermissions();

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              All Customers
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} customers
              {searchTerm && (
                <span className="ml-2 text-blue-600">
                  (filtered by "{searchTerm}")
                </span>
              )}
              {statusFilter.length > 0 && (
                <span className="ml-2 text-purple-600">
                  ({statusFilter.length} status{statusFilter.length !== 1 ? 'es' : ''} selected)
                </span>
              )}
              {commissionsLoading && (
                <span className="ml-2 text-blue-600">
                  (Loading commissions...)
                </span>
              )}
            </p>
          </div>
          
          {/* Current User Role Indicator */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Logged in as: <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {currentUser?.name || `${currentUser?.first_name} ${currentUser?.last_name}`}
                </span>
              </p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                {permissions.isAdmin && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
                {permissions.isManager && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Manager
                  </span>
                )}
                {!permissions.isAdmin && !permissions.isManager && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Team Member
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Search customers by name, status, user, JNID, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={clearSearch}
                    className={`${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} focus:outline-none`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Search Results Info */}
            {searchTerm && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {totalItems} result{totalItems !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Status ({statusFilter.length})
                <svg className={`ml-2 h-4 w-4 transform transition-transform ${showStatusFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showStatusFilter && (
                <div className={`absolute top-full left-0 mt-1 w-80 rounded-md shadow-lg z-50 ${
                  isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                }`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        Filter by Status
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSelectAllStatuses}
                          className={`text-xs px-2 py-1 rounded ${
                            isDarkMode
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {statusFilter.length === STATUS_OPTIONS.length ? 'Clear All' : 'Select All'}
                        </button>
                        <button
                          onClick={() => setShowStatusFilter(false)}
                          className={`text-xs px-2 py-1 rounded ${
                            isDarkMode
                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map((status) => (
                          <label
                            key={status}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                              isDarkMode
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={statusFilter.includes(status)}
                              onChange={() => handleStatusFilterChange(status)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {statusFilter.length > 0 && (
              <button
                onClick={clearStatusFilter}
                className={`text-sm px-3 py-1 rounded-full ${
                  isDarkMode
                    ? 'bg-purple-900 text-purple-200 hover:bg-purple-800'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Clear Status Filter ({statusFilter.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {/* Customer Info Group */}
              <th
                colSpan="2"
                className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r ${
                  isDarkMode
                    ? 'text-gray-300 border-gray-600 bg-gray-600'
                    : 'text-gray-500 border-gray-300 bg-gray-100'
                }`}
              >
                Customer Information
              </th>
              {/* Sales Team Group */}
              <th
                colSpan="4"
                className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r ${
                  isDarkMode
                    ? 'text-gray-300 border-gray-600 bg-gray-600'
                    : 'text-gray-500 border-gray-300 bg-gray-100'
                }`}
              >
                Sales Team & Commissions
              </th>
              {/* Supplement Team Group */}
              <th
                colSpan="4"
                className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r ${
                  isDarkMode
                    ? 'text-gray-300 border-gray-600 bg-gray-600'
                    : 'text-gray-500 border-gray-300 bg-gray-100'
                }`}
              >
                Supplement Team & Commissions
              </th>
              {/* Financial Info Group */}
              <th
                colSpan="3"
                className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider ${
                  isDarkMode
                    ? 'text-gray-300 bg-gray-600'
                    : 'text-gray-500 bg-gray-100'
                }`}
              >
                Financial Information
              </th>
            </tr>
            <tr>
              {/* Customer Info */}
              <th
                onClick={() => handleSort('customerName')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer border-r ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'text-gray-500 hover:bg-gray-100 border-gray-200'
                }`}
              >
                Customer Name
                {sortConfig.key === 'customerName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('status')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer border-r ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'text-gray-500 hover:bg-gray-100 border-gray-300'
                }`}
              >
                Status
                {sortConfig.key === 'status' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              {/* Sales Team */}
              <th
                onClick={() => handleSort('salesmanName')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Salesman
                {sortConfig.key === 'salesmanName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('salesmanCommission')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Commission
                {sortConfig.key === 'salesmanCommission' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('salesManagerName')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Sales Manager
                {sortConfig.key === 'salesManagerName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('salesManagerCommission')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer border-r ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'text-gray-500 hover:bg-gray-100 border-gray-300'
                }`}
              >
                Commission
                {sortConfig.key === 'salesManagerCommission' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              {/* Supplement Team */}
              <th
                onClick={() => handleSort('supplementerName')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Supplementer
                {sortConfig.key === 'supplementerName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('supplementerCommission')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Commission
                {sortConfig.key === 'supplementerCommission' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('supplementManagerName')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Supplement Manager
                {sortConfig.key === 'supplementManagerName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('supplementManagerCommission')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer border-r ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'text-gray-500 hover:bg-gray-100 border-gray-300'
                }`}
              >
                Commission
                {sortConfig.key === 'supplementManagerCommission' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              {/* Financial Info */}
              <th
                onClick={() => handleSort('finalJobPrice')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Final Job Price
                {sortConfig.key === 'finalJobPrice' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('initialScopePrice')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Initial Scope Price
                {sortConfig.key === 'initialScopePrice' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('marginAdded')}
                className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Margin Added
                {sortConfig.key === 'marginAdded' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
            {sortedData.map((row) => (
              <tr key={row.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                {/* Customer Info */}
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium border-r ${
                  isDarkMode
                    ? 'text-gray-100 border-gray-600'
                    : 'text-gray-900 border-gray-200'
                }`}>
                  {row.customerName}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap border-r ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                {/* Sales Team */}
                <td className={`px-3 py-4 whitespace-nowrap text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.salesmanName}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.loadingCommissions ? (
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Loading...</span>
                  ) : row.salesmanCommission > 0 ? (
                    formatCurrency(row.salesmanCommission)
                  ) : (
                    ''
                  )}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.salesManagerName}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium border-r ${
                  isDarkMode
                    ? 'text-gray-200 border-gray-600'
                    : 'text-gray-900 border-gray-300'
                }`}>
                  {row.loadingCommissions ? (
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Loading...</span>
                  ) : row.salesManagerCommission > 0 ? (
                    formatCurrency(row.salesManagerCommission)
                  ) : (
                    ''
                  )}
                </td>
                {/* Supplement Team */}
                <td className={`px-3 py-4 whitespace-nowrap text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.supplementerName}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.loadingCommissions ? (
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Loading...</span>
                  ) : row.supplementerCommission > 0 ? (
                    formatCurrency(row.supplementerCommission)
                  ) : (
                    ''
                  )}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {row.supplementManagerName}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium border-r ${
                  isDarkMode
                    ? 'text-gray-200 border-gray-600'
                    : 'text-gray-900 border-gray-300'
                }`}>
                  {row.loadingCommissions ? (
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Loading...</span>
                  ) : row.supplementManagerCommission > 0 ? (
                    formatCurrency(row.supplementManagerCommission)
                  ) : (
                    ''
                  )}
                </td>
                {/* Financial Info */}
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-bold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {formatCurrency(row.finalJobPrice)}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {formatCurrency(row.initialScopePrice)}
                </td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium ${
                  row.marginAdded >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(row.marginAdded)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customerData.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm || statusFilter.length > 0 ? 
                'No customers found with current filters' : 
                'No customer data available'
              }
            </div>
            {(searchTerm || statusFilter.length > 0) && (
              <div className="mt-2 space-x-2">
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    Clear search
                  </button>
                )}
                {statusFilter.length > 0 && (
                  <button
                    onClick={clearStatusFilter}
                    className="text-purple-600 hover:text-purple-500 text-sm"
                  >
                    Clear status filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      pageNum === currentPage
                        ? isDarkMode
                          ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                          : 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCustomerList;
