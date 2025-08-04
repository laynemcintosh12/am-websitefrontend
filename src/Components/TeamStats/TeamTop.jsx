import React, { useState } from 'react';

const TeamTop = ({ 
  currentUser, 
  isAdmin, 
  isManager, 
  allUsers, 
  allTeams, 
  userTeam, 
  teamMembers 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    // Filter users based on search term
    const filtered = allUsers.filter(user => 
      user.first_name?.toLowerCase().includes(value.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(value.toLowerCase()) ||
      user.email?.toLowerCase().includes(value.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredUsers(filtered);
    setShowDropdown(filtered.length > 0);
  };

  // Handle user selection from dropdown
  const handleUserSelect = (user) => {
    setSearchTerm(`${user.first_name} ${user.last_name}`);
    setShowDropdown(false);
    // You can add additional logic here to handle user selection
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredUsers([]);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Statistics</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin 
                ? 'Admin Dashboard - View all teams and users' 
                : isManager 
                  ? `Manager Dashboard - ${userTeam?.team_name || 'Your Team'}`
                  : 'Team Member View'
              }
            </p>
          </div>

          {/* User Info */}
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentUser?.first_name} {currentUser?.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {currentUser?.permissions || 'Team Member'}
            </p>
          </div>
        </div>

        {/* Admin Search Bar */}
        {isAdmin && (
          <div className="relative mb-4">
            <div className="flex items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 capitalize">
                          {user.role || 'User'}
                        </p>
                        {user.team_name && (
                          <p className="text-xs text-gray-400">{user.team_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {isAdmin && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{allUsers.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-900">Total Teams</h3>
                <p className="text-2xl font-bold text-green-600">{allTeams.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-900">Active Managers</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {allTeams.filter(team => team.manager_id).length}
                </p>
              </div>
            </>
          )}

          {isManager && userTeam && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900">Team Members</h3>
                <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-900">Salesmen</h3>
                <p className="text-2xl font-bold text-green-600">
                  {userTeam.salesman_ids?.length || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-900">Supplementers</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {userTeam.supplementer_ids?.length || 0}
                </p>
              </div>
            </>
          )}

          {!isAdmin && !isManager && (
            <div className="bg-gray-50 p-4 rounded-lg col-span-3">
              <h3 className="text-sm font-medium text-gray-900">Your Team</h3>
              <p className="text-lg font-semibold text-gray-600 mt-1">
                {userTeam?.team_name || 'No team assigned'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamTop;