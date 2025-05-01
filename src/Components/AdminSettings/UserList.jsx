import React, { useState } from 'react';
import EditUser from './EditUser';
import AddUserForm from './AddUserForm';

const USER_ROLES = {
  AFFILIATE: 'Affiliate',
  SALESMAN: 'Salesman',
  SALES_MANAGER: 'Sales Manager',
  SUPPLEMENTER: 'Supplementer',
  SUPPLEMENT_MANAGER: 'Supplement Manager',
  ADMIN: 'Admin'
};

const USER_PERMISSIONS = {
  AFFILIATE: 'Affiliate',
  SALESMAN: 'Salesman',
  SALES_MANAGER: 'Sales Manager',
  SUPPLEMENTER: 'Supplementer',
  SUPPLEMENT_MANAGER: 'Supplement Manager',
  ADMIN: 'Admin'
};

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if we have the correct number of digits
  if (cleaned.length !== 10) return phoneNumber; // Return original if not 10 digits
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

const getRoleStyle = (role, isDarkMode) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
    case USER_ROLES.SALES_MANAGER:
    case USER_ROLES.SUPPLEMENT_MANAGER:
      return isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
    case USER_ROLES.SALESMAN:
      return isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
    case USER_ROLES.SUPPLEMENTER:
      return isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800';
    default:
      return isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
  }
};

const UserList = ({ users, onAddUser, onUpdateUser, onDeleteUser, isDarkMode }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleEditComplete = async (userData) => {
    try {
      // If userData is null or undefined, it means cancel was clicked
      if (!userData) {
        setIsEditing(false);
        setSelectedUser(null);
        return;
      }

      // Otherwise, proceed with update/add
      if (selectedUser) {
        await onUpdateUser(selectedUser.id, userData);
      } else {
        await onAddUser(userData);
      }
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await onDeleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleAddNewUser = async (userData) => {
    if (!userData) {
      setShowAddUserForm(false);
      return;
    }

    try {
      await onAddUser(userData);
      setShowAddUserForm(false);
      // Optionally refresh the users list
      window.location.reload(); // Or implement a better refresh mechanism
    } catch (error) {
      console.error('Error adding new user:', error);
      // Handle error (show error message to user)
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {isEditing ? (
        <EditUser 
          user={selectedUser}
          onComplete={handleEditComplete}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div className="space-y-6">
          {/* Search and Add Controls */}
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
            </div>
            <button
              onClick={() => setShowAddUserForm(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <i className="fas fa-plus mr-2"></i>
              Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className={`overflow-x-auto rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <table className={`min-w-full divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['User Info', 'Role & Team', 'Contact', 'Goals & Dates', 'Actions'].map((header) => (
                    <th key={header} className={`px-6 py-3 text-left text-xs font-medium tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}>
                    {/* User Info Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <i className={`fas fa-user ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}></i>
                        </div>
                        <div className="ml-4">
                          <div className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>{user.name}</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{user.permissions}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Team Cell */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                        getRoleStyle(user.role, isDarkMode)
                      }`}>
                        {user.role}
                      </span>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user.team ? (
                          <span className="flex items-center">
                            <i className="fas fa-users mr-1"></i>
                            {user.team.name}
                          </span>
                        ) : 'No Team'}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{user.email}</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{formatPhoneNumber(user.phone)}</div>
                    </td>

                    {/* Goals & Dates */}
                    <td className="px-6 py-4">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Goal: {formatCurrency(user.yearly_goal || 0)}
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Hired: {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'Not set'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditClick(user)}
                          className={`transition-colors ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className={`transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-800'
                          }`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {showAddUserForm && (
            <div className="fixed inset-x-0 top-16 bottom-0 z-[60] overflow-y-auto"> {/* Changed z-50 to z-[60] */}
              {/* Backdrop */}
              <div className={`fixed inset-x-0 top-16 bottom-0 transition-opacity backdrop-blur-[2px] z-[60] ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-gray-900/30 via-gray-900/20 to-gray-900/30'
                  : 'bg-gradient-to-b from-gray-50/30 via-gray-50/20 to-gray-50/30'
              }`} />
              
              {/* Modal Container */}
              <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative z-[70]"> {/* Added z-[70] */}
                <div className={`relative w-full max-w-3xl rounded-lg shadow-2xl transform transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 ring-1 ring-gray-700'
                    : 'bg-white ring-1 ring-gray-200'
                }`}>
                  {/* Modal Header */}
                  <div className={`px-6 py-4 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Add New User
                      </h3>
                      <button
                        onClick={() => setShowAddUserForm(false)}
                        className={`p-2 rounded-full hover:bg-opacity-80 ${
                          isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <AddUserForm
                      onComplete={handleAddNewUser}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;