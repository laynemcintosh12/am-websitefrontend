import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ContactInfo = ({ profile, isEditing, setProfile }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-white bg-opacity-95'} p-6 rounded-lg shadow backdrop-blur-sm`}>
      <h3 className="text-lg font-medium">Contact Information</h3>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</dt>
          {isEditing ? (
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`mt-1 w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}
            />
          ) : (
            <dd className="mt-1">{profile.email}</dd>
          )}
        </div>
        <div>
          <dt className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</dt>
          {isEditing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={`mt-1 w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}
            />
          ) : (
            <dd className="mt-1">{profile.phone}</dd>
          )}
        </div>
        <div>
          <dt className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined</dt>
          <dd className="mt-1">{profile.joinDate}</dd>
        </div>
      </dl>
    </div>
  );
};

export default ContactInfo;