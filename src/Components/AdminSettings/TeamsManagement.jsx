import React, { useState } from 'react';
import TeamsEdit from './TeamsEdit';
import Api from '../../Api';

const parseArrayString = (str) => {
  // Return empty array for null, undefined, or empty values
  if (!str) return [];
  
  // If it's already an array, return it after ensuring numbers
  if (Array.isArray(str)) {
    return str.map(Number);
  }
  
  // Convert to string if it's not already
  const stringValue = String(str);
  
  // Remove curly braces and split by comma
  return stringValue
    .replace(/{|}/g, '')
    .split(',')
    .filter(Boolean)
    .map(Number);
};

const TeamsManagement = ({ teams, users, onCreateTeam, onUpdateTeam, onDeleteTeam, isDarkMode }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEditClick = (team) => {
    // Format the team data to match the expected structure
    const formattedTeam = {
      id: team.team_id,
      team_name: team.team_name,
      team_type: team.team_type,
      manager_id: team.manager_id, // This should match the ID from your manager object
      salesman_ids: parseArrayString(team.salesman_ids),
      supplementer_ids: parseArrayString(team.supplementer_ids)
    };

    setSelectedTeam(formattedTeam);
    setIsEditing(true);
  };

  const handleEditComplete = async (teamData) => {
    try {
      if (!teamData) {
        setIsEditing(false);
        setSelectedTeam(null);
        return;
      }

      console.log('TeamsManagement processing:', teamData);

      // Validate required fields
      if (!teamData.manager_id) {
        throw new Error('Manager ID is required');
      }

      if (!teamData.team_name) {
        throw new Error('Team name is required');
      }

      // Keep the data structure consistent
      const processedData = {
        team_id: teamData.team_id,
        manager_id: parseInt(teamData.manager_id),
        team_name: teamData.team_name,
        team_type: teamData.team_type,
        salesman_ids: teamData.salesman_ids,
        supplementer_ids: teamData.supplementer_ids
      };

      if (selectedTeam) {
        await onUpdateTeam(processedData);
      } else {
        await onCreateTeam(processedData);
      }
      
      setIsEditing(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error saving team:', error.message);
      throw error;
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await Api.deleteTeam(teamId);
        // Optionally refresh the page or update the teams list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Failed to delete team. Please try again.');
      }
    }
  };

  const handleCreateNewTeam = () => {
    setSelectedTeam(null);
    setIsEditing(true);
  };

  const getTeamTypeStyle = (type, isDarkMode) => {
    switch (type) {
      case 'Sales': 
        return isDarkMode 
          ? 'bg-blue-900 text-blue-200' 
          : 'bg-blue-100 text-blue-800';
      case 'Supplement': 
        return isDarkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800';
      case 'Affiliate': 
        return isDarkMode 
          ? 'bg-purple-900 text-purple-200' 
          : 'bg-purple-100 text-purple-800';
      default: 
        return isDarkMode 
          ? 'bg-gray-700 text-gray-200' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTeams = teams.filter(team =>
    team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.team_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {isEditing ? (
        <TeamsEdit 
          team={selectedTeam} 
          onComplete={handleEditComplete} 
          users={users}  
          isDarkMode={isDarkMode}  
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
            </div>
            <button
              onClick={handleCreateNewTeam}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Team
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <div
                key={team.team_id}
                className={`rounded-lg shadow-lg overflow-hidden transition-colors ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      getTeamTypeStyle(team.team_type, isDarkMode)
                    }`}>
                      {team.team_type} Team
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditClick(team)}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.team_id)}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {team.team_name}
                  </h3>
                  <div className={`flex items-center text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <i className="fas fa-user-tie mr-2"></i>
                    {team.manager_name}
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Associates
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {parseArrayString(team.salesman_ids).map((id) => {
                          const user = users.find(u => u.id === id);
                          return user && (
                            <span
                              key={`${team.team_id}-salesman-${id}`}
                              className={`px-2 py-1 text-xs rounded-full ${
                                isDarkMode 
                                  ? 'bg-blue-900 text-blue-200' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              <i className="fas fa-user-circle mr-1"></i>
                              {user.name}
                            </span>
                          );
                        })}
                        {parseArrayString(team.supplementer_ids).map((id) => {
                          const user = users.find(u => u.id === id);
                          return user && (
                            <span
                              key={`${team.team_id}-supplementer-${id}`}
                              className={`px-2 py-1 text-xs rounded-full ${
                                isDarkMode 
                                  ? 'bg-green-900 text-green-200' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              <i className="fas fa-calculator mr-1"></i>
                              {user.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsManagement;