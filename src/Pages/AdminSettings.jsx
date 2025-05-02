import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import UserList from '../Components/AdminSettings/UserList';
import TeamsManagement from '../Components/AdminSettings/TeamsManagement';
import Api from '../Api';

const AdminSettings = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        Api.getAllUsers(),
        Api.getTeams()
      ]);

      // Process users to include their team information
      const usersWithTeams = usersData.map(user => {
        let userTeam = null;
        
        // Check each team to find where the user belongs
        teamsData.forEach(team => {
          if (team.manager_id === user.id) {
            userTeam = { name: team.team_name, role: 'Manager' };
          } else if (team.salesman_ids && team.salesman_ids.includes(user.id)) {
            userTeam = { name: team.team_name, role: 'Salesman' };
          } else if (team.supplementer_ids && team.supplementer_ids.includes(user.id)) {
            userTeam = { name: team.team_name, role: 'Supplementer' };
          }
        });

        return {
          ...user,
          team: userTeam
        };
      });

      setUsers(usersWithTeams);
      setTeams(teamsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const handleAddUser = async (userData) => {
    try {
      await Api.registerUser(userData);
      await loadData();
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      console.log('Updating user:', userId, userData); // Debug log
      await Api.updateUserDetails(userId, userData);
      await loadData(); // Refresh the users list
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await Api.deleteUserById(userId);
      await loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  // Team management functions
  const handleCreateTeam = async (teamData) => {
    try {
      await Api.createTeam(teamData);
      await loadData();
    } catch (err) {
      console.error('Error creating team:', err);
      throw err;
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      console.log('AdminSettings updating team:', teamData);
      // Keep the same field names throughout
      await Api.updateTeam({
        team_id: teamData.team_id,
        manager_id: parseInt(teamData.manager_id),
        team_name: teamData.team_name,
        team_type: teamData.team_type,
        salesman_ids: teamData.salesman_ids,
        supplementer_ids: teamData.supplementer_ids
      });
      await loadData();
    } catch (err) {
      console.error('Error updating team:', err);
      throw err;
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await Api.deleteTeam(teamId);
      await loadData();
    } catch (err) {
      console.error('Error deleting team:', err);
      throw err;
    }
  };

  // Loading state component
  const LoadingState = () => (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" 
          style={{ 
            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
            borderTopColor: isDarkMode ? '#60A5FA' : '#3B82F6'
          }} 
        />
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }) => (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center mb-4">
          <i className="fas fa-exclamation-circle text-red-500 text-xl mr-2" />
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>Error Loading Data</h2>
        </div>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{message}</p>
        <button
          onClick={loadData}
          className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <i className="fas fa-sync-alt mr-2" />
          Retry
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* User Management Section */}
          <section>
            <div className={`rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  User Management
                </h2>
                <p className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <div className="p-6">
                <UserList 
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </section>

          {/* Team Management Section */}
          <section>
            <div className={`rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Team Management
                </h2>
                <p className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Organize users into teams and assign managers
                </p>
              </div>
              <div className="p-6">
                <TeamsManagement 
                  teams={teams}
                  users={users}
                  onCreateTeam={handleCreateTeam}
                  onUpdateTeam={handleUpdateTeam}
                  onDeleteTeam={handleDeleteTeam}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;