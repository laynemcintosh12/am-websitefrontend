import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

import HomePage from './Pages/HomePage';
import JoinUsPage from './Pages/JoinUsPage';
import LoginPage from './Pages/LoginPage';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Signup from './Pages/Signup';
import Navbar from './Components/Everwhere/Navbar';
import Footer from './Components/Everwhere/Footer';
import Header from './Components/Everwhere/Header';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import AdminOverview from './Pages/AdminOverview';
import AdminSettings from './Pages/AdminSettings';
import AdminAccounting from './Pages/AdminAccounting';
import Financials from './Pages/Financials';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ScrollToTop from './Components/Everwhere/ScrollToTop';
import ProtectedRoute from './Components/Common/ProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserPermissions(user.permissions);
    }
  }, []);

  return (
    <DarkModeProvider>
      <Router>
        <ScrollToTop />
        <div className="relative max-w-full overflow-x-hidden">
          {isLoggedIn ? (
            <>
              <Header />
              <Routes>
                {/* Regular authenticated routes */}
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="/financials" element={<ProtectedRoute element={<Financials />} />} />

                {/* Admin routes */}
                <Route 
                  path="/admin-overview" 
                  element={<ProtectedRoute 
                    element={<AdminOverview />} 
                    requiredPermission="Admin" 
                  />} 
                />
                <Route 
                  path="/admin-settings" 
                  element={<ProtectedRoute 
                    element={<AdminSettings />} 
                    requiredPermission="Admin" 
                  />} 
                />
                <Route 
                  path="/admin-accounting" 
                  element={<ProtectedRoute 
                    element={<AdminAccounting />} 
                    requiredPermission="Admin" 
                  />} 
                />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </>
          ) : (
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/join-us" element={<JoinUsPage />} />
                <Route path="/log-in" element={<LoginPage />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/dashboard' element={<Navigate to="/log-in" />} />
              </Routes>
              <Footer />
            </>
          )}
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
