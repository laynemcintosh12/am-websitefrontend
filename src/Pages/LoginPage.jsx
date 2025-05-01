import React, { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';

const LoginPage = () => {
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await Api.loginUser({ email, password }); // Use Api.loginUser
      localStorage.setItem('user', JSON.stringify(response)); // Store user data in localStorage
      window.location.href = '/dashboard'; // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
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
          }`}>Welcome Back</h1>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Sign in to your account</p>
        </div>

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

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <i className={`fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-2 rounded-lg outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
                } border-2`}
                placeholder="Enter your password"
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

          <div className="flex items-center justify-between text-sm">
            <a
              href="/forgot-password"
              className={`hover:underline transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Forgot password?
            </a>
            <a
              href="/signup"
              className={`hover:underline transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Sign up
            </a>
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
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;