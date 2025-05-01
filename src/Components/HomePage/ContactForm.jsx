import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const ContactForm = () => {
  const { isDarkMode } = useDarkMode();
  const [affiliates, setAffiliates] = useState([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState([]);
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    source: '',
    referralPerson: '',
    otherSource: '',
  });

  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const loadAffiliates = async () => {
      try {
        const users = await Api.getAllUsers();
        const affiliateUsers = users.filter(user => user.role === "Affiliate Marketer");
        console.log("Affiliates:", affiliateUsers);
        setAffiliates(affiliateUsers);
        setFilteredAffiliates(affiliateUsers.slice(0, 5));
      } catch (err) {
        console.error("Failed to load affiliates:", err);
      }
    };
    loadAffiliates();
  }, []);

  const handleAffiliateSearch = (searchTerm) => {
    setAffiliateSearch(searchTerm);
    const filtered = affiliates
      .filter(affiliate => 
        `${affiliate.name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
    setFilteredAffiliates(filtered);
  };

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.toLowerCase().replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
  };

  // Helper function to format state
  const formatState = (state) => {
    const stateAbbreviations = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };
    const formattedState = state.toLowerCase();
    return stateAbbreviations[formattedState] || state.toUpperCase();
  };

  // Add this function near your other helper functions
  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if exactly 10 digits
    return cleanPhone.length === 10;
  };

  // Update handleSubmit to include validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (!validatePhoneNumber(formData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const customerData = {
        firstName: capitalizeWords(formData.firstName),
        lastName: capitalizeWords(formData.lastName),
        phone: formData.phone.replace(/\D/g, ''), // Remove non-digit characters
        email: formData.email.toLowerCase(),
        address: capitalizeWords(formData.streetAddress),
        city: capitalizeWords(formData.city),
        state: formatState(formData.state),
        zip: formData.zip.slice(0, 5), // Take first 5 digits only
        leadSource: formData.source,
        referrer: formData.referralPerson,
        description: formData.source === 'Other' ? formData.otherSource : undefined
      };

      await Api.addCustomerToJobNimbus(customerData);
      setShowSuccess(true);
      setShowError(false); // Clear any previous errors
      setTimeout(() => setShowSuccess(false), 3000);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        streetAddress: '',
        city: '',
        state: '',
        zip: '',
        source: '',
        referralPerson: '',
        otherSource: '',
      });
    } catch (err) {
      console.error("Failed to submit form:", err);
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => setShowError(false), 10000); // Hide error after 10 seconds
    }
  };

  // Update the handleInputChange to format phone number as user types
  const handleInputChange = (e) => {
    if (e.target.name === 'phone') {
      // Remove all non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Format the phone number as user types
      if (value.length <= 10) {
        if (value.length > 6) {
          value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else if (value.length > 3) {
          value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        } else if (value.length > 0) {
          value = `(${value}`;
        }
      } else {
        // Limit to 10 digits
        value = value.slice(0, 10);
        value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [e.target.name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const renderReferralDropdown = () => (
    <div className="relative">
      <input
        type="text"
        value={affiliateSearch}
        onChange={(e) => handleAffiliateSearch(e.target.value)}
        placeholder="Search affiliate name"
        className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
        onClick={() => setIsReferralOpen(true)}
      />
      {isReferralOpen && (
        <div className={`absolute z-10 w-full mt-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'} rounded-lg shadow-lg`}>
          {filteredAffiliates.map((affiliate) => (
            <div
              key={affiliate.id}
              className={`px-4 py-2 hover:bg-orange-50 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              onClick={() => {
                setFormData({
                  ...formData,
                  referralPerson: `${affiliate.name}`
                });
                setAffiliateSearch(`${affiliate.name}`);
                setIsReferralOpen(false);
              }}
            >
              {`${affiliate.name}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section id="contact-form" className={`py-20 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Schedule Your Free Inspection</h2>
          <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Our expert team will assess your roof and provide detailed recommendations.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
            </div>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="Street Address"
              className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              required
            />
            <div className="grid md:grid-cols-3 gap-6">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSourceOpen(!isSourceOpen)}
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex justify-between items-center`}
              >
                <span>{formData.source || "How did you hear about us?"}</span>
                <i className={`fas fa-chevron-${isSourceOpen ? 'up' : 'down'}`}></i>
              </button>
              {isSourceOpen && (
                <div className={`absolute z-10 w-full mt-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'} rounded-lg shadow-lg`}>
                  {['Google', 'Referral', 'BBB', 'Yelp', 'Ad', 'Other'].map((source) => (
                    <div
                      key={source}
                      className={`px-4 py-2 hover:bg-orange-50 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          source,
                          referralPerson: '',
                          otherSource: ''
                        });
                        setIsSourceOpen(false);
                      }}
                    >
                      {source}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formData.source === 'Referral' && renderReferralDropdown()}
            {formData.source === 'Other' && (
              <input
                type="text"
                value={formData.otherSource}
                onChange={(e) => setFormData({
                  ...formData,
                  otherSource: e.target.value
                })}
                placeholder="Please specify"
                className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-orange-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
            )}
            <button 
              type="submit" 
              className="w-full bg-orange-600 text-white py-4 font-semibold rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
            >
              Submit Request
            </button>
          </form>
          {showSuccess && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
              Thank you! We'll contact you shortly to schedule your free inspection.
            </div>
          )}
          {showError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="font-semibold mb-2">Something went wrong with your submission.</p>
              <p>Please contact us directly:</p>
              <p className="mt-1">
                <span className="font-medium">Phone:</span> <a href="tel:503-539-8056" className="text-red-700 hover:underline">503-539-8056</a>
              </p>
              <p>
                <span className="font-medium">Email:</span> <a href="mailto:roofs@affordableroofing4me.com" className="text-red-700 hover:underline">roofs@affordableroofing4me.com</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;