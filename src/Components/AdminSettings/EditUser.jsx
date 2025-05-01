import React, { useState, useEffect } from 'react';

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
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as user types
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

// Replace the existing formatCurrency function
const formatCurrency = (amount) => {
  if (!amount) return '';
  
  // Handle decimal point and numbers
  const parts = amount.split('.');
  const wholeNum = parts[0].replace(/\D/g, '');
  const decimal = parts[1] ? '.' + parts[1].slice(0, 2) : '';
  
  // Format whole number with commas
  const formatted = Number(wholeNum).toLocaleString('en-US');
  
  return `${formatted}${decimal}`;
};

const EditUser = ({ user, onComplete, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone ? formatPhoneNumber(user.phone) : '',
    email: user?.email || '',
    password: '', // Only required for new users
    role: user?.role || USER_ROLES.AFFILIATE,
    permissions: user?.permissions || USER_PERMISSIONS.BASIC,
    hire_date: user?.hire_date ? new Date(user.hire_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    yearly_goal: user?.yearly_goal ? formatCurrency(user.yearly_goal) : formatCurrency(50000)
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) validationErrors.name = 'Name is required';
    if (!formData.email.trim()) validationErrors.email = 'Email is required';
    if (!user && !formData.password.trim()) validationErrors.password = 'Password is required for new users';
    if (!formData.role) validationErrors.role = 'Role is required';
    if (!formData.permissions) validationErrors.permissions = 'Permissions are required';
    if (!formData.hire_date) validationErrors.hire_date = 'Hire date is required';
    if (!formData.yearly_goal) validationErrors.yearly_goal = 'Yearly goal is required';

    return validationErrors;
  };

  // Handle automatic permission setting based on role
  const handleRoleChange = (role) => {
    let newPermissions = USER_PERMISSIONS.BASIC;
    if (role === USER_ROLES.ADMIN) {
      newPermissions = USER_PERMISSIONS.ADMIN;
    } else if (role.includes('MANAGER')) {
      newPermissions = USER_PERMISSIONS.MANAGER;
    }

    setFormData(prev => ({
      ...prev,
      role,
      permissions: newPermissions
    }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Allow backspace/delete to work properly
    if (value.length < formData.phone.length) {
      value = value.replace(/\D/g, '');
    }
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // Replace the existing handleYearlyGoalChange function
  const handleYearlyGoalChange = (e) => {
    let value = e.target.value;
    
    // Remove any existing commas
    value = value.replace(/,/g, '');
    
    // Allow only numbers and one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
      return;
    }
    
    // Prevent multiple decimal points
    const decimalPoints = value.match(/\./g) || [];
    if (decimalPoints.length > 1) {
      return;
    }
    
    // Format the value
    const formatted = formatCurrency(value);
    setFormData(prev => ({ ...prev, yearly_goal: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Format the data before submission
      const userData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Strip formatting from phone
        yearly_goal: Number(formData.yearly_goal.replace(/[^0-9.]/g, '')) // Convert to number
      };
      
      if (user) {
        delete userData.password;
      }

      await onComplete(userData);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  // Update the input styles based on dark mode
  const getInputStyles = (hasError) => `
    mt-1 block w-full rounded-lg border transition-colors
    ${isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }
    ${hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : isDarkMode
        ? 'focus:border-blue-500 focus:ring-blue-500'
        : 'focus:border-blue-600 focus:ring-blue-600'
    }
    px-3 py-2
  `;

  const handleCancel = () => {
    // Simply call onComplete without any arguments
    onComplete();
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`text-xl font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {user ? 'Edit User' : 'Add New User'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={getInputStyles(errors.name)}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={getInputStyles(errors.email)}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input - Only for new users */}
            {!user && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={getInputStyles(errors.password)}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(XXX) XXX-XXXX"
                className={getInputStyles(errors.phone)}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Role Select */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={getInputStyles(errors.role)}
                required
              >
                {Object.entries(USER_ROLES).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role}</p>
              )}
            </div>

            {/* Yearly Goal Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Yearly Goal *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  $
                </span>
                <input
                  type="text"
                  name="yearly_goal"
                  value={formData.yearly_goal}
                  onChange={handleYearlyGoalChange}
                  className={`${getInputStyles(errors.yearly_goal)} pl-7`}
                  required
                />
              </div>
              {errors.yearly_goal && (
                <p className="mt-1 text-sm text-red-500">{errors.yearly_goal}</p>
              )}
            </div>

            {/* Hire Date Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Hire Date *
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                className={getInputStyles(errors.hire_date)}
                required
              />
              {errors.hire_date && (
                <p className="mt-1 text-sm text-red-500">{errors.hire_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-4 text-sm text-red-500">{errors.submit}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {user ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;