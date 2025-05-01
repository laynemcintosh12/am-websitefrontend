import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';   

const Footer = () => {
    const { isDarkMode, setIsDarkMode } = useDarkMode();
    
  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-black text-orange-50'} py-16`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          <div className="w-full max-w-xs text-center md:text-left">
            <h3 className="text-xl font-semibold mb-6 underline">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/" className="hover:text-orange-400 transition-colors duration-300">Home</a></li>
              <li><a href="/join-us" className="hover:text-orange-400 transition-colors duration-300">Join Us</a></li>
              <li><a href="/log-in" className="hover:text-orange-400 transition-colors duration-300">Log In</a></li>
              <li>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hover:text-orange-400 transition-colors duration-300 flex items-center justify-center md:justify-start w-full"
                >
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} mr-2`}></i>
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="w-full max-w-xs text-center">
            <h3 className="text-xl font-semibold mb-6 underline">Contact Us</h3>
            <div className="space-y-3">
              <p className="flex items-center justify-center">
                <span>502-859-5086</span>
              </p>
              <p className="flex items-center justify-center">
                <span>roofs@affordableroofing4me.com</span>
              </p>
              <p className="flex items-center justify-center">
                <span>9850 Von Allmen Ct, Ste 201, Louisville, KY 40241</span>
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs text-center md:text-right">
            <h3 className="text-xl font-semibold mb-6 underline">Follow Us</h3>
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="https://www.facebook.com/profile.php?id=61557984091143" className="hover:text-orange-400 transition-colors duration-300">
                <i className="fab fa-facebook-f text-2xl"></i>
              </a>
              <a href="https://www.instagram.com/affordableroofingandsolar?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-orange-400 transition-colors duration-300">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors duration-300">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className={`mt-16 pt-8 border-t ${isDarkMode ? 'border-orange-900/30' : 'border-gray-700'} text-center`}>
          <p className={`${isDarkMode ? 'text-orange-200/80' : 'text-gray-400'}`}>&copy; 2025 Affordable Roofing + Solar Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;