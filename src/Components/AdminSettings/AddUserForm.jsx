import React, { useState } from 'react';

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

// Update the formatCurrency function
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

const AddUserForm = ({ onComplete, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: '', // Now separate from role
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    yearlyGoal: '50000'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (!formData.role) errors.role = 'Role is required';
    if (!formData.permissions) errors.permissions = 'Permissions are required';
    if (!formData.hireDate) errors.hireDate = 'Hire date is required';
    if (!formData.yearlyGoal) errors.yearlyGoal = 'Yearly goal is required';
    return errors;
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

  // Update the handleYearlyGoalChange function
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
    setFormData(prev => ({ ...prev, yearlyGoal: formatted }));
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions, // Now using the selected permissions
        phone: formData.phone.replace(/\D/g, ''),
        hire_date: formData.hireDate,
        yearly_goal: Number(formData.yearlyGoal.replace(/[^0-9.]/g, ''))
      };
      
      await onComplete(userData);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleCancel = () => {
    // Call onComplete with null to indicate cancellation
    onComplete(null);
  };

  // Create a reusable input style function
  const getInputStyles = (hasError) => `
    w-full p-3 rounded-lg border transition-colors
    ${isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }
    ${hasError
      ? 'border-red-500 focus:ring-red-500'
      : isDarkMode
        ? 'focus:border-blue-500 focus:ring-blue-500'
        : 'focus:border-blue-600 focus:ring-blue-600'
    }
  `;

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${
      isDarkMode ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={getInputStyles(errors.name)}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={getInputStyles(errors.email)}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={getInputStyles(errors.password)}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={getInputStyles(errors.phone)}
              placeholder="(XXX) XXX-XXXX"
            />
          </div>
        </div>

        {/* Right Column - Role & Settings */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Role *
            </label>
            <select
              value={formData.role}
              onChange={handleRoleChange}
              className={getInputStyles(errors.role)}
            >
              <option value="">Select a role</option>
              {Object.entries(USER_ROLES).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Add Permissions Select */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Permissions *
            </label>
            <select
              value={formData.permissions}
              onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
              className={getInputStyles(errors.permissions)}
            >
              <option value="">Select permissions level</option>
              {Object.entries(USER_PERMISSIONS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
            {errors.permissions && (
              <p className="mt-1 text-sm text-red-500">{errors.permissions}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Hire Date *
            </label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
              className={getInputStyles(errors.hireDate)}
            />
            {errors.hireDate && (
              <p className="mt-1 text-sm text-red-500">{errors.hireDate}</p>
            )}
          </div>

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
                value={formData.yearlyGoal}
                onChange={handleYearlyGoalChange}
                className={`${getInputStyles(errors.yearlyGoal)} pl-7`}
                placeholder="50,000.00"
              />
            </div>
            {errors.yearlyGoal && (
              <p className="mt-1 text-sm text-red-500">{errors.yearlyGoal}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
          Add User
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;