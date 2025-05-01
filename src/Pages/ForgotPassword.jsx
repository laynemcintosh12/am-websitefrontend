import React, { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';

const ForgotPassword = () => {
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.forgotPassword({ email }); // Use Api.forgotPassword
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
      alert('Failed to send reset password email. Please try again.');
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
          }`}>Forgot Password</h1>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Enter your email to reset your password</p>
        </div>

        {isSubmitted ? (
          <p className={`text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            If this email exists in our database then you will receive a link to reset your password in the next 10 min.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <i className={`fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                      : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
                  } border-2`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg !rounded-button font-medium text-white transition-all duration-300 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;