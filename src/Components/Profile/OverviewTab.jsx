import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const OverviewTab = ({ profile, isEditing, setProfile, isAdmin }) => {
  const { isDarkMode } = useDarkMode();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.user?.id) throw new Error('User not found');

      // Update password
      await Api.updatePassword(userData.user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };

  const handlePasswordReset = async () => {
    try {
      await Api.forgotPassword({ email: profile.email });
      setSuccess('Password reset request sent to admin');
    } catch (err) {
      setError('Failed to request password reset');
    }
  };

  if (!profile) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-white bg-opacity-95'} p-6 rounded-lg shadow backdrop-blur-sm`}>
      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
              } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
          ) : (
            <p className="mt-1 text-sm">{profile.name}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email
          </label>
          <p className="mt-1 text-sm">{profile.email}</p>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profile.phone || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
              } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
          ) : (
            <p className="mt-1 text-sm">{profile.phone || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Role
          </label>
          <p className="mt-1 text-sm">{profile.role}</p>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Hire Date
          </label>
          {isEditing && isAdmin ? (
            <input
              type="date"
              name="hire_date"
              value={profile.hire_date ? profile.hire_date.split('T')[0] : ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
              } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
          ) : (
            <p className="mt-1 text-sm">
              {new Date(profile.hire_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Password Change Section */}
        <div className="pt-6 flex flex-col items-center space-y-3">
          <button
            onClick={() => setShowPasswordForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <i className="fas fa-key mr-2"></i>
            Change Password
          </button>
          <button
            onClick={handlePasswordReset}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Request Password Reset Token From Admin
          </button>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-[2px] rounded-lg" />
            <div className={`${
              isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
            } rounded-2xl shadow-xl max-w-md w-full p-6 m-4 backdrop-blur-sm relative`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</div>}
                {success && <div className="text-green-500 text-sm bg-green-100 p-3 rounded-lg">{success}</div>}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full rounded-lg shadow-sm ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-100'
                    } transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;