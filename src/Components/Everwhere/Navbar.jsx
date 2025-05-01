import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Navbar = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      const handleScroll = () => {
        setIsMenuOpen(false);
      };
      
      const handleEsc = (event) => {
        if (event.key === 'Escape') {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('keydown', handleEsc);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isMenuOpen]);

  return (
    <nav className={`fixed w-full ${
      isDarkMode 
        ? 'bg-black shadow-[0_4px_6px_-1px_rgba(255,255,255,0.05)]' 
        : 'bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]'
    } z-50`}>
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img
              src="https://static.readdy.ai/image/d5a1ebf59e735d1b49988d93d2be143d/b6ad81ca61e8c447d9939b1762c8623b.png"
              alt="Affordable Roofing Solutions"
              className={`h-20 lg:h-40 lg:mt-2 ${isDarkMode ? 'bg-black' : 'bg-white'} border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} shadow-md rounded-lg p-1 lg:p-2`}
            />
          </Link>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center space-x-2 px-4 py-2 !rounded-button hover:bg-gray-100 transition-colors whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-black'}`}
          >
            <span>Menu</span>
            <i className={`fas fa-chevron-${isMenuOpen ? 'up' : 'down'}`}></i>
          </button>
          <div 
            className={`absolute right-0 mt-2 w-48 
              ${isDarkMode ? 'bg-black border-orange-900' : 'bg-white border-orange-100'} 
              rounded-lg shadow-lg py-2 border
              transition-all duration-200 ease-in-out
              ${isMenuOpen 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
          >
            <Link to="/" className={`flex items-center px-4 py-2 ${isDarkMode ? 'text-orange-100 hover:bg-orange-950' : 'text-orange-950 hover:bg-orange-50'} transition-colors`}>
              <i className="fas fa-home w-6"></i>
              <span>Home</span>
            </Link>
            <Link to="/join-us" className={`flex items-center px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}>
              <i className="fas fa-users w-6"></i>
              <span>Join Us</span>
            </Link>
            <Link to="/log-in" className={`flex items-center px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}>
              <i className="fas fa-sign-in-alt w-6"></i>
              <span>Log In</span>
            </Link>
            <hr className="my-2" />
            <button
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} w-6`}></i>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;