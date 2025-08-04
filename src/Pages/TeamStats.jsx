import React, { useState, useEffect } from 'react';
import TeamTop from '../Components/TeamStats/TeamTop';
import UserCustomerList from '../Components/TeamStats/UserCustomerList';
import Api from '../Api';
import { useDarkMode } from '../contexts/DarkModeContext';

const TeamStats = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [userTeam, setUserTeam] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user) {
          throw new Error('No user data found');
        }
        setCurrentUser(userData.user);

        // Fetch minimal data for TeamTop component
        const [usersResponse, teamsResponse] = await Promise.all([
          Api.getAllUsers(),
          Api.getTeams()
        ]);

        setAllUsers(usersResponse.users || []);
        setAllTeams(teamsResponse.teams || []);

        // Find user's team if they're a manager or team member
        const userTeamData = teamsResponse.teams?.find(team => 
          team.manager_id === userData.user.id ||
          team.salesman_ids?.includes(userData.user.id) ||
          team.supplementer_ids?.includes(userData.user.id)
        );
        setUserTeam(userTeamData);

      } catch (err) {
        console.error('Error fetching team stats data:', err);
        setError(err.message || 'Failed to load team statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to determine user permissions
  const getUserPermissions = () => {
    if (!currentUser) return { isAdmin: false, isManager: false };
    
    return {
      isAdmin: currentUser.permissions === 'Admin',
      isManager: currentUser.permissions === 'Sales Manager' || currentUser.permissions === 'Supplement Manager'
    };
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-xl">Loading team statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const permissions = getUserPermissions();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">

          {/* User Customer List Component */}
          <UserCustomerList isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default TeamStats;