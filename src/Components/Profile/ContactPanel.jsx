import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const ContactPanel = () => {
  const { isDarkMode } = useDarkMode();
  const [showReportForm, setShowReportForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [managerInfo, setManagerInfo] = useState({
    name: 'Loading...',
    phone: 'Loading...',
    email: 'Loading...'
  });

  // Fetch manager information when component mounts
  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        // Get current user's ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user?.id) {
          throw new Error('No user data found');
        }

        const currentUserId = userData.user.id;

        // Get all teams
        const allTeams = await Api.getTeams();
        
        // Find user's team and manager
        let managerId = null;
        
        // Look through all teams to find user
        const userTeam = allTeams.find(team => 
          team.salesman_ids?.includes(currentUserId) || 
          team.supplementer_ids?.includes(currentUserId)
        );

        // If team found and has manager, get manager ID
        if (userTeam?.manager_id) {
          managerId = userTeam.manager_id;
        }

        // If manager ID found, get manager details
        if (managerId) {
          const managerDetails = await Api.getUserDetails(managerId);
          if (managerDetails) {
            setManagerInfo({
              name: managerDetails.name || 'Not Available',
              phone: managerDetails.phone || 'Not Available',
              email: managerDetails.email || 'Not Available',
              type: 'text'
            });
            return;
          }
        }

        // If no manager found or user is a manager, set default values
        setManagerInfo({
          name: 'Not Available',
          phone: 'Not Available',
          email: 'Not Available'
        });

      } catch (err) {
        console.error('Failed to fetch manager info:', err);
        setManagerInfo({
          name: 'Not Available',
          phone: 'Not Available',
          email: 'Not Available'
        });
      }
    };

    fetchManagerInfo();
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await Api.reportIssue({
        from: userData.user.email,
        description: issueDescription,
        subject: 'NEW ISSUE ON DASHBOARD'
      });
      
      setSuccess('Issue reported successfully');
      setIssueDescription('');
      setShowReportForm(false);
    } catch (err) {
      setError('Failed to send report. Please try again.');
    }
  };

  const ContactSection = ({ title, items, icon }) => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-6 rounded-xl shadow-sm`}>
      <div className="flex items-center justify-center mb-4">
        <i className={`${icon} text-blue-500 text-xl mr-3`}></i>
        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </h4>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.label}
            </span>
            <span className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:text-blue-500 transition-colors`}>
              {item.type === 'email' ? (
                <a href={`mailto:${item.value}`}>{item.value}</a>
              ) : item.type === 'phone' ? (
                <a href={`tel:${item.value}`}>{item.value}</a>
              ) : (
                item.value
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Update contactSections with dynamic manager info
  const contactSections = {
    manager: [
      { label: 'Manager Name', value: managerInfo.name, type: 'text' },
      { label: 'Manager Phone', value: managerInfo.phone, type: 'phone' },
      { label: 'Manager Email', value: managerInfo.email, type: 'email' }
    ],
    company: [
      { label: 'Company Email', value: 'roofs@affordableroofing4me.com', type: 'email' },
      { label: 'Company Phone', value: '502-539-8056', type: 'phone' }
    ],
    admin: [
      { label: 'Dashboard Admin', value: 'Layne McIntosh', type: 'text' },
      { label: 'Admin Email', value: 'laynemcintosh12@gmail.com', type: 'email' }
    ]
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-white bg-opacity-95'} p-4 sm:p-6 rounded-lg shadow backdrop-blur-sm`}>
      <div className="space-y-6">
        {/* Grid container for all sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactSection 
            title="Management Contact" 
            items={contactSections.manager}
            icon="fas fa-user-tie"
          />
          <ContactSection 
            title="Company Contact" 
            items={contactSections.company}
            icon="fas fa-building"
          />
        </div>

        {/* Admin section */}
        <div className="max-w-lg mx-auto">
          <ContactSection 
            title="Dashboard Support" 
            items={contactSections.admin}
            icon="fas fa-headset"
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowReportForm(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm group"
            >
              <i className="fas fa-bug mr-2 group-hover:-translate-y-1 transition-transform"></i>
              Report a Problem
            </button>
          </div>
        </div>

        {/* Report form modal with gradient background */}
        {showReportForm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-[2px] rounded-lg" />
            <div className={`${
              isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
            } rounded-2xl shadow-xl max-w-2xl w-full p-6 m-4 backdrop-blur-sm relative`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Report an Issue
                </h3>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</div>}
                {success && <div className="text-green-500 text-sm bg-green-100 p-3 rounded-lg">{success}</div>}
                
                <div>
                  <label className={`block text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Describe the Issue
                  </label>
                  <textarea
                    key={isDarkMode ? 'dark' : 'light'} // Force re-render on theme change
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={4}
                    className={`block w-full rounded-lg shadow-sm pl-4 pt-3 ${
                      isDarkMode ? 'bg-gray-700 text-white placeholder:text-gray-400' : 'bg-white text-gray-900 placeholder:text-gray-500'
                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                    required
                    placeholder="Please provide details about the issue you're experiencing..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
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

export default ContactPanel;