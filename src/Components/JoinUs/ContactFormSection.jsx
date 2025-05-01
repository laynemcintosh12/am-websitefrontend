// src/Components/JoinUs/ContactFormSection.jsx
import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const ContactFormSection = () => {
  const { isDarkMode } = useDarkMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }
    if (name && email && phone && city && state) {
      try {
        const emailData = {
          to: 'roofs@affordableroofing4me.com',
          subject: 'New Affiliate Marketer Interest in Joining',
          body: `
            Name: ${name}
            Phone: ${phone}
            Email: ${email}
            City: ${city}
            State: ${state}
            Additional Info: ${additionalInfo || 'None provided'}
          `
        };

        await Api.sendEmail(emailData);
        setShowModal(true);
        setIsEmailValid(true);
      } catch (error) {
        console.error('Failed to send email:', error);
        alert('There was an error submitting your information. Please try again.');
      }
    }
  };

  // Define class names based on dark mode state
  const sectionClasses = isDarkMode
    ? "py-20 bg-gray-800 text-white"
    : "py-20 bg-gray-100 text-gray-900";
  const inputClasses = isDarkMode
    ? "w-full px-6 py-4 rounded-lg bg-gray-700 text-white border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
    : "w-full px-6 py-4 rounded-lg bg-white text-gray-900 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500";
  const buttonClasses = "rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 font-bold w-full cursor-pointer whitespace-nowrap mt-6 sm:mt-8 text-base sm:text-lg";
  const modalButtonClasses = "!rounded-button bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 font-bold w-full cursor-pointer whitespace-nowrap";

  return (
    <div id="join-form" className={sectionClasses}>
      <div className="container mx-auto px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Get Started Today</h2>
          <p className="text-xl mb-12">
            Ready to transform your network into a powerful income stream? Reach out to us and learn how you can get started with our exclusive affiliate program.
          </p>
          <form className="space-y-6 text-left">
            <div className="grid grid-cols-1 gap-6">
              {/* Full Name - Full Width */}
              <div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={inputClasses}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Phone and Email - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className={inputClasses}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`${inputClasses} ${!isEmailValid && email ? 'border-2 border-red-500' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* City and State - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="Enter your city"
                    className={inputClasses}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your state"
                    className={inputClasses}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Info - Full Width */}
              <div>
                <textarea
                  placeholder="Additional information you'd like us to know (optional)"
                  className={`${inputClasses} min-h-[100px] resize-y`}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className={buttonClasses}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          {/* Backdrop with gradient */}
          <div className={`fixed inset-0 transition-opacity backdrop-blur-[2px] z-[60] ${
            isDarkMode 
              ? 'bg-gradient-to-b from-gray-900/30 via-gray-900/20 to-gray-900/30'
              : 'bg-gradient-to-b from-gray-50/30 via-gray-50/20 to-gray-50/30'
          }`} />
          
          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4 relative z-[70]">
            <div className={`relative w-full max-w-md rounded-lg shadow-2xl transform transition-all ${
              isDarkMode 
                ? 'bg-gray-800 ring-1 ring-gray-700'
                : 'bg-white ring-1 ring-gray-200'
            }`}>
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold mb-4">Thank You for Your Interest!</h3>
                <p className="mb-6">
                  We've received your information and our team will reach out to you shortly at {email} to discuss the opportunity in detail.
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setCity('');
                    setState('');
                    setAdditionalInfo('');
                  }}
                  className={`rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 font-bold w-full cursor-pointer transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFormSection;
