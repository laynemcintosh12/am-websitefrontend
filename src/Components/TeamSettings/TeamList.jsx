import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api.jsx';

const TeamList = ({ teams, onSelect, onDelete, selectedTeamId, isDarkMode }) => {
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState({});
  const [membershipHistory, setMembershipHistory] = useState({});
  const [loadingTeamData, setLoadingTeamData] = useState({});

  // Helper to fetch user details for an array of user IDs
  const fetchUserDetails = async (userIds) => {
    console.log('Attempting to fetch details for user IDs:', userIds);
    if (!userIds || userIds.length === 0) {
      console.log('No user IDs to fetch details for');
      return [];
    }
    
    return await Promise.all(userIds.map(async id => {
      try {
        const userRes = await Api.getUserDetails(id);
        console.log('Fetched user details for user_id:', id, userRes);
        // Try to get name from userRes, fallback to id
        return {
          user_id: id,
          name: userRes.name || userRes.full_name || userRes.username || `User ${id}`,
          ...userRes
        };
      } catch (err) {
        console.error('Error fetching user details for user_id:', id, err);
        return { user_id: id, name: `User ${id}` };
      }
    }));
  };

  // Fetch team data when a team is expanded
  const handleExpand = async (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);

    // Only make the API call if we haven't already loaded this team's data
    if (!teamMembers[teamId]) {
      setLoadingTeamData(prev => ({ ...prev, [teamId]: true }));
      
      try {
        // Get membership history (which includes team data)
        const res = await Api.getTeamMembershipHistory(teamId);
        console.log('Fetched team data for team', teamId, res);
        
        // Handle membership history
        if (Array.isArray(res.membershipHistory)) {
          const historyUserIds = res.membershipHistory.map(m => m.user_id);
          if (historyUserIds.length > 0) {
            const userDetails = await fetchUserDetails(historyUserIds);
            const historyWithNames = res.membershipHistory.map(m => {
              const user = userDetails.find(u => u.user_id === m.user_id) || {};
              return {
                ...m,
                name: user.name || `User ${m.user_id}`
              };
            });
            setMembershipHistory(prev => ({ ...prev, [teamId]: historyWithNames }));
          } else {
            setMembershipHistory(prev => ({ ...prev, [teamId]: [] }));
          }
        }
        
        // Handle current members from team data
        if (res.team) {
          const salesmanIds = res.team.salesman_ids || [];
          const supplementerIds = res.team.supplementer_ids || [];
          const allUserIds = [...salesmanIds, ...supplementerIds];
          
          console.log('Found user IDs in team:', allUserIds);
          
          if (allUserIds.length > 0) {
            const userDetails = await fetchUserDetails(allUserIds);
            
            // Attach role info based on which array they came from
            const membersWithRoles = userDetails.map(user => ({
              ...user,
              membership_role: salesmanIds.includes(user.user_id)
                ? 'Salesman'
                : supplementerIds.includes(user.user_id)
                ? 'Supplementer'
                : 'Member'
            }));
            
            setTeamMembers(prev => ({ ...prev, [teamId]: membersWithRoles }));
          } else {
            setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
          }
        } else {
          setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
        setMembershipHistory(prev => ({ ...prev, [teamId]: [] }));
      } finally {
        setLoadingTeamData(prev => ({ ...prev, [teamId]: false }));
      }
    }
  };

  useEffect(() => {
    console.log('Teams loaded:', teams);
  }, [teams]);

  return (
    <div className={`p-4 border-r w-full md:w-1/3 overflow-y-auto rounded-lg shadow
      ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <h2 className="text-xl font-bold mb-4 text-center">Teams</h2>
      <ul className="space-y-2">
        {teams.map(team => (
          <li
            key={team.team_id || team.id}
            className={`p-3 rounded shadow cursor-pointer transition
              ${selectedTeamId === (team.team_id || team.id)
                ? isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                : isDarkMode ? 'bg-gray-900 hover:bg-blue-900' : 'bg-white hover:bg-blue-50'
              }`}
          >
            <div className="flex justify-between items-center" onClick={() => onSelect(team)}>
              <div>
                <p className="font-semibold">{team.team_name}</p>
                <p className="text-sm text-gray-400">{team.team_type}</p>
                <p className="text-xs text-gray-400">Manager: {team.manager_name}</p>
                <p className="text-xs text-gray-400">Created: {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this team?')) onDelete(team.team_id || team.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-lg"
                  title="Delete team"
                >
                  🗑️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(team.team_id || team.id);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-lg"
                  title="Show details"
                >
                  {expandedTeamId === (team.team_id || team.id) ? '▲' : '▼'}
                </button>
              </div>
            </div>
            {expandedTeamId === (team.team_id || team.id) && (
              <div className="mt-3">
                {loadingTeamData[team.team_id || team.id] ? (
                  <div className="text-sm text-gray-400">Loading team data...</div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1">Current Members</h4>
                      {teamMembers[team.team_id || team.id]?.length > 0 ? (
                        <ul className="text-sm">
                          {(teamMembers[team.team_id || team.id] || []).map(m => (
                            <li key={m.user_id} className="py-1">
                              {m.name} ({m.membership_role || m.role || 'No role'})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">No current members</p>
                      )}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-semibold mb-1">Membership History</h4>
                      {membershipHistory[team.team_id || team.id]?.length > 0 ? (
                        <ul className="text-xs">
                          {(membershipHistory[team.team_id || team.id] || []).map(m => (
                            <li key={m.user_id + '-' + m.joined_at} className="py-1">
                              {m.name} ({m.membership_role || m.role || 'No role'}) — Joined: {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'N/A'}
                              {m.left_at && <> — Left: {new Date(m.left_at).toLocaleDateString()}</>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">No membership history</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamList;
