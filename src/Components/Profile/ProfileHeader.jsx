import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ProfileHeader = ({ profile, isEditing, setIsEditing, handleSave }) => {
  const { isDarkMode } = useDarkMode();

  if (!profile) return null;

  return (
    <div className="sm:flex sm:items-center sm:justify-between p-6">
      <div className="sm:flex sm:space-x-5">
        <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back,</p>
          <p className="text-xl font-bold sm:text-2xl">{profile.name}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {profile.role}
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-center sm:mt-0">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center justify-center px-4 py-2 border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          } rounded-md shadow-sm text-sm font-medium ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          } cursor-pointer`}
        >
          <i className="fas fa-edit mr-2"></i>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <i className="fas fa-save mr-2"></i>
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;