import React, { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const { isDarkMode } = useDarkMode();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [role, setRole] = useState('Affiliate Marketer');
  const [permissions, setPermissions] = useState('Affiliate');
  const [hireDate, setHireDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
    return re.test(password);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long, contain at least one uppercase letter, one special character, and no spaces';
    }

    if (password !== verifyPassword) {
      newErrors.verifyPassword = 'Passwords do not match';
    }

    if (!hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const name = capitalizeWords(`${firstName.trim()} ${lastName.trim()}`); // Combine first and last name
    const data = {
      email: email,
      name: name,
      password: password,
      role: role,
      permissions: permissions,
      hire_date: hireDate,
    };

    try {
      console.log('Sending signup request:', data);
      await Api.registerUser(data); // Call API to register user
      console.log('Signup successful');
      const response = await Api.loginUser({ email, password }); // Automatically log in after signup
      console.log('Login successful');
      localStorage.setItem('user', JSON.stringify(response));
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
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
          }`}>Create Account</h1>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Verify Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
                } border-2`}
                placeholder="Verify your password"
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
            {errors.verifyPassword && <p className="text-red-500 text-sm mt-1">{errors.verifyPassword}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              required
            >
              <option value="Affiliate Marketer">Affiliate</option>
              <option value="Salesman">Salesman</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Supplementer">Supplementer</option>
              <option value="Supplement Manager">Supplement Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Permissions
            </label>
            <select
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              required
            >
              <option value="Affiliate">Affiliate</option>
              <option value="Salesman">Salesman</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Hire Date
            </label>
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg outline-none transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600'
              } border-2`}
              required
            />
            {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
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
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;