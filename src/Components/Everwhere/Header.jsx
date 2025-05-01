import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api'; // Import API utility
import ProfileMenu from '../Dashboard/ProfileMenu'; // Import ProfileMenu component
import { Link } from 'react-router-dom';

const Header = () => {
  const { isDarkMode } = useDarkMode();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userId, setUserId] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchRef = useRef(null);

  // Fetch the logged-in user's ID
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUserId(userData?.user?.id);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search with debounced value
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim() || !userId) {
        setSearchResults([]);
        return;
      }

      try {
        // Pass both search term and userId to the API
        const results = await Api.searchCustomers(debouncedSearchTerm, userId);
        
        // No need to filter results since backend will handle it
        const resultsWithCommissions = await Promise.all(
          results.map(async customer => {
            try {
              const commissionData = await Api.calculatePotentialCommissions(
                customer.id, 
                userId
              );
              return {
                ...customer,
                commission: commissionData.potentialCommissions?.[0]?.amount || 0
              };
            } catch (error) {
              console.error(`Error calculating commission for customer ${customer.id}:`, error);
              return { ...customer, commission: 0 };
            }
          })
        );

        setSearchResults(resultsWithCommissions);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, userId]); // Add userId to dependencies

  // Add useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the input handler to only update search term
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      setSearchResults([]);
    }
  };

  const handleOutsideClick = (e) => {
    const target = e.target;
    if (!target.closest('.relative')) {
      setIsProfileMenuOpen(false);
    }
  };

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-sm`} onClick={handleOutsideClick}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Home Icon */}
        <Link 
          to="/" 
          className={`flex-shrink-0 flex items-center p-2 rounded-lg transition-colors duration-200 mr-2
            ${isDarkMode 
              ? 'text-gray-200 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 10.182V18c0 1.097.903 2 2 2h14c1.097 0 2-.903 2-2v-7.818l-9-8.182-9 8.182z M9 22v-8h6v8"
            />
          </svg>
          <span className="hidden md:block ml-2 font-medium">Dashboard</span>
        </Link>

        {/* Search Bar Container - Centered */}
        <div className="flex-1 max-w-2xl px-2">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search customers..."
              className={`w-full pl-10 pr-4 py-2 border ${
                isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-200 bg-white text-black'
              } rounded-lg text-sm focus:outline-none focus:border-blue-500`}
            />
            <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}></i>

            {/* Search Results - Mobile Optimized */}
            {searchResults.length > 0 && (
              <div className={`absolute top-full left-0 w-full shadow-lg rounded-lg mt-2 z-10 
                ${isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-black border border-gray-300'}`}
              >
                {/* Header row - Mobile optimized */}
                <div className={`grid grid-cols-3 md:grid-cols-4 gap-2 px-2 py-2 border-b font-medium text-xs md:text-sm rounded-t-lg
                  ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="text-center">Status</div>
                  <div className="text-center">Customer</div>
                  <div className="text-center">Commission</div>
                  <div className="hidden md:block text-center">Phone</div>
                </div>

                {/* Results list - Mobile optimized */}
                <ul className="space-y-1">
                  {searchResults.map((customer) => (
                    <li
                      key={customer.id}
                      className={`grid grid-cols-3 md:grid-cols-4 gap-2 px-2 py-2 cursor-pointer hover:bg-opacity-75 ${
                        customer.manager_id === userId
                          ? isDarkMode
                            ? 'bg-blue-700 hover:bg-blue-600'
                            : 'bg-blue-100 hover:bg-blue-200'
                          : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => window.location.href = `/customers/${customer.id}`}
                    >
                      <span className="text-xs md:text-sm font-medium text-center truncate">
                        {customer.status}
                      </span>
                      <span className="text-xs md:text-sm text-center truncate">
                        {customer.customer_name}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-center text-green-500">
                        ${customer.commission ? customer.commission.toFixed(2) : '0.00'}
                      </span>
                      <span className="hidden md:block text-xs md:text-sm text-center">
                        {customer.phone || 'N/A'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Profile Menu */}
        <div className="flex-shrink-0">
          <ProfileMenu isOpen={isProfileMenuOpen} setIsOpen={setIsProfileMenuOpen} />
        </div>
      </div>
    </header>
  );
};

export default Header;