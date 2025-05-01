import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // To extract the token from the URL and navigate
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';

const ResetPassword = () => {
  const { isDarkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token'); // Extract the reset token from the URL
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== verifyPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await Api.resetPassword({ resetToken, newPassword }); // Use Api.resetPassword
      localStorage.setItem('user', JSON.stringify(response)); // Store user data in localStorage
      navigate('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      console.error('Reset password failed:', error);
      alert('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await Api.loginUser({ token: resetToken }); // Automatically log in using the reset token
      localStorage.setItem('user', JSON.stringify(response)); // Store user data in localStorage
      navigate('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to log in. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 pt-20 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}
    style={{
      backgroundImage: `url(${isDarkMode 
        ? 'https://public.readdy.ai/ai/img_res/3da67e7f02c8d4770085060249372c3c.jpg' 
        : 'https://public.readdy.ai/ai/img_res/babd1712c666b8071f1723782229a201.jpg'})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className={`w-full max-w-md p-8 rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/90 text-gray-100' 
          : 'bg-white/90 text-gray-800'
      }`}>
        <div className="mb-8 text-center">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Reset Password</h1>
          {!isSubmitted && (
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Enter your new password below</p>
          )}
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Your password has been reset successfully. You can now log in.
            </p>
            <button
              onClick={handleLogin}
              className={`w-full py-2 px-4 rounded-lg !rounded-button font-medium text-white transition-all duration-300 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Log In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                New Password
              </label>
              <div className="relative">
                <i className={`fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 rounded-lg outline-none transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                      : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
                  } border-2`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}></i>
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Verify New Password
              </label>
              <div className="relative">
                <i className={`fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 rounded-lg outline-none transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                      : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
                  } border-2`}
                  placeholder="Verify your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg !rounded-button font-medium text-white transition-all duration-300 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;