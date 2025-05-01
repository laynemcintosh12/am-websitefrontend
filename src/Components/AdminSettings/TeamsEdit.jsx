import React, { useState } from 'react';
import SearchableSelect from '../Everwhere/SearchableSelect';

const TEAM_TYPES = [
  { id: 'Sales', name: 'Sales Team' },
  { id: 'Supplement', name: 'Supplement Team' },
  { id: 'Affiliate', name: 'Affiliate Team' }
];

const TeamsEdit = ({ team, onComplete, users = [], isDarkMode }) => {
  const [formData, setFormData] = useState({
    manager_id: team?.manager_id ? parseInt(team.manager_id) : '',  // Ensure it's a number
    team_name: team?.team_name || '',
    team_type: team?.team_type || 'Sales',
    salesman_ids: team?.salesman_ids || [],
    supplementer_ids: team?.supplementer_ids || []
  });

  const [errors, setErrors] = useState({});

  // Add validation function
  const validateForm = () => {
    const validationErrors = {};
    if (!formData.team_name.trim()) {
      validationErrors.team_name = 'Team name is required';
    }
    if (!formData.team_type) {
      validationErrors.team_type = 'Team type is required';
    }
    if (!formData.manager_id) {
      validationErrors.manager_id = 'Manager is required';
    }
    return validationErrors;
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const teamData = {
        team_id: team?.id, // Match the backend expectation
        manager_id: parseInt(formData.manager_id),
        team_name: formData.team_name.trim(),
        team_type: formData.team_type,
        salesman_ids: formData.salesman_ids.map(id => parseInt(id)),
        supplementer_ids: formData.supplementer_ids.map(id => parseInt(id))
      };

      console.log('TeamsEdit submitting:', teamData);
      await onComplete(teamData);
    } catch (error) {
      console.error('Error saving team:', error);
      setErrors({ submit: error.message });
    }
  };

  // Update the getFilteredUsers function to properly format manager options
  const getFilteredUsers = (roles) => {
    if (!users || !Array.isArray(users)) return [];
    
    return users.filter(user => roles.includes(user.role)).map(user => ({
      id: user.id,
      value: user.id, // Add this for SearchableSelect
      label: `${user.name} (${user.role})`, // Add this for SearchableSelect
      name: user.name,
      role: user.role,
      searchableText: `${user.name} ${user.role}`.toLowerCase()
    }));
  };

  const managers = users
    .filter(user => ['Sales Manager', 'Supplement Manager'].includes(user.role))
    .map(manager => ({
      id: manager.id,
      name: `${manager.name} (${manager.role})`
    }));

  const associates = getFilteredUsers(['Affiliate', 'Salesman', 'Supplementer']);

  const handleAssociateChange = (selectedIds) => {
    const selectedUsers = associates.filter(user => selectedIds.includes(user.id));
    
    const salesmanIds = selectedUsers
      .filter(user => user.role === 'Salesman')
      .map(user => user.id);
      
    const supplementerIds = selectedUsers
      .filter(user => user.role === 'Supplementer')
      .map(user => user.id);

    setFormData(prev => ({
      ...prev,
      salesman_ids: salesmanIds,
      supplementer_ids: supplementerIds
    }));
  };

  // Update the handleManagerChange function
  const handleManagerChange = (selectedOption) => {
    console.log('Selected manager:', selectedOption);
    
    setFormData(prev => ({ 
      ...prev, 
      manager_id: selectedOption ? parseInt(selectedOption.id) : ''
    }));
    setErrors(prev => ({ ...prev, manager_id: '' }));
  };

  // Update the return section with better dark/light mode styling
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`rounded-lg shadow-lg p-6 ${
        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {team ? 'Edit Team' : 'Create New Team'}
        </h3>
        
        <div className="space-y-4 mb-6">
          {/* Team Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Team Name *
            </label>
            <input
              type="text"
              value={formData.team_name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, team_name: e.target.value }));
                setErrors(prev => ({ ...prev, team_name: '' }));
              }}
              className={`w-full p-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400'
              } ${errors.team_name ? 'border-red-500' : ''}`}
              required
            />
            {errors.team_name && (
              <p className="mt-1 text-sm text-red-500">{errors.team_name}</p>
            )}
          </div>
          
          {/* Team Type */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Team Type
            </label>
            <SearchableSelect
              options={TEAM_TYPES}
              value={formData.team_type}
              onChange={(value) => setFormData(prev => ({ ...prev, team_type: value }))}
              placeholder="Select team type"
              className={`${isDarkMode ? 'dark-select' : ''}`}
            />
          </div>

          {/* Manager Selection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Team Manager *
            </label>
            <SearchableSelect
              options={managers}
              value={formData.manager_id}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, manager_id: value }));
                setErrors(prev => ({ ...prev, manager_id: '' }));
              }}
              placeholder="Select a manager"
              className={`${isDarkMode ? 'dark-select' : ''} ${
                errors.manager_id ? 'border-red-500' : ''
              }`}
            />
            {errors.manager_id && (
              <p className="mt-1 text-sm text-red-500">{errors.manager_id}</p>
            )}
          </div>

          {/* Associates Selection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Team Associates
            </label>
            <SearchableSelect
              options={associates}
              value={[...formData.salesman_ids, ...formData.supplementer_ids]}
              onChange={handleAssociateChange}
              isMulti={true}
              placeholder="Select associates"
              className={`${isDarkMode ? 'dark-select' : ''}`}
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              getOptionValue={(option) => option.id}
              filterOption={(option, searchText) => 
                option.searchableText.includes(searchText.toLowerCase())
              }
              formatSelectedOption={(option) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode
                    ? option.role === 'Salesman'
                      ? 'bg-blue-900 text-blue-200'
                      : option.role === 'Supplementer'
                      ? 'bg-green-900 text-green-200'
                      : 'bg-purple-900 text-purple-200'
                    : option.role === 'Salesman'
                      ? 'bg-blue-100 text-blue-800'
                      : option.role === 'Supplementer'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                }`}>
                  {option.name} ({option.role})
                </span>
              )}
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-2 text-sm text-red-500">{errors.submit}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => onComplete(null)} // Change from onClick={onComplete}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {team ? 'Update Team' : 'Create Team'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TeamsEdit;