import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import ProfileHeader from '../Components/Profile/ProfileHeader';
import StatsCards from '../Components/Profile/StatsCards';
import ProfileTabs from '../Components/Profile/ProfileTabs';
import OverviewTab from '../Components/Profile/OverviewTab';
import ContactPanel from '../Components/Profile/ContactPanel';
import PerformanceChart from '../Components/Profile/PerformanceChart';
import Api from '../Api';

const Profile = () => {
  const { isDarkMode } = useDarkMode();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Effect to handle tab persistence
  useEffect(() => {
    const savedTab = localStorage.getItem('profileActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    // Cleanup function to remove saved tab when navigating away
    return () => {
      localStorage.removeItem('profileActiveTab');
    };
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user?.id) {
          throw new Error('No user ID found');
        }
        
        // Check for admin permissions
        setIsAdmin(userData.user.permissions?.includes('Admin'));
        
        const userDetails = await Api.getUserDetails(userData.user);
        setProfile({
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          role: userDetails.role,
          permissions: userDetails.permissions,
          hire_date: userDetails.hire_date
        });
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Modified setIsEditing to handle tab reset
  const handleEditToggle = (editing) => {
    setIsEditing(editing);
    if (editing) {
      setActiveTab('overview');
    }
  };

  const handleSave = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.user?.id) {
        throw new Error('No user ID found');
      }

      // Include hire_date in updates if user is admin
      const updates = {
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        ...(isAdmin && { hire_date: profile.hire_date })
      };

      await Api.updateUserDetails(userData.user.id, updates);
      setIsEditing(false);

      // Optionally refresh the profile data
      const updatedUser = await Api.getUserDetails({ id: userData.user.id });
      setProfile({
        ...profile,
        ...updatedUser
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="relative">
          <div className={`${isDarkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-95'} rounded-lg shadow-lg backdrop-blur-sm p-8`}>
            <ProfileHeader 
              profile={profile} 
              isEditing={isEditing} 
              setIsEditing={handleEditToggle} // Updated to use new handler
              handleSave={handleSave} 
            />
            
            {/* Add StatsCards component */}
            <StatsCards />

            <div className="mt-8">
              <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="mt-8">
                {activeTab === 'overview' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Chart on the left */}
                    <div className="lg:col-span-1">
                      <PerformanceChart />
                    </div>
                    {/* Overview Tab on the right */}
                    <div className="lg:col-span-1">
                      <OverviewTab 
                        profile={profile} 
                        isEditing={isEditing} 
                        setProfile={setProfile} 
                        isAdmin={isAdmin}  // Pass isAdmin to OverviewTab
                      />
                    </div>
                  </div>
                ) : (
                  <ContactPanel />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;