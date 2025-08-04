import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import Api from '../Api.jsx';
import TeamList from '../Components/TeamSettings/TeamList.jsx';
import TeamEditor from '../Components/TeamSettings/TeamEditor.jsx';

const TeamSettings = () => {
  const { isDarkMode } = useDarkMode();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [membershipHistory, setMembershipHistory] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await Api.getTeams();
      setTeams(res.data || res);
      setError(null);
    } catch (err) {
      setError('Failed to load teams.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await Api.getAllUsers();
      setUsers(res.data || res);
    } catch (err) {
      setError('Failed to load users.');
      console.error(err);
    }
  };

  const fetchMembers = async (teamId) => {
    if (!teamId) return setMembers([]);
    try {
      const res = await Api.getTeamMembershipHistory(teamId);
      setMembershipHistory(res.membershipHistory || []);
      
      // The membershipHistory array contains all the data we need
      if (res.membershipHistory && res.membershipHistory.length > 0) {
        // Get only active memberships (no left_at date)
        const activeMemberships = res.membershipHistory.filter(m => !m.left_at);
        
        // Group by user_id and take the most recent entry for each user
        const userMap = new Map();
        
        activeMemberships.forEach(member => {
          const existingMember = userMap.get(member.user_id);
          
          // If we haven't seen this user yet, or this record is newer, store it
          if (!existingMember || new Date(member.joined_at) > new Date(existingMember.joined_at)) {
            userMap.set(member.user_id, member);
          }
        });
        
        // Convert the map back to an array
        const currentMembers = Array.from(userMap.values()).map(member => ({
          user_id: member.user_id,
          name: member.name || `User ${member.user_id}`,
          email: member.email,
          role: member.user_role,
          membership_role: member.membership_role,
          joined_at: member.joined_at,
          left_at: member.left_at
        }));
          
        setMembers(currentMembers);
        
        // For the "former members" section, also handle those with left_at dates
        // Similarly, take only the most recent record for each former member
        const formerMap = new Map();
        const formerMemberships = res.membershipHistory.filter(m => m.left_at);
        
        formerMemberships.forEach(member => {
          const key = `${member.user_id}`;
          const existing = formerMap.get(key);
          
          if (!existing || new Date(member.left_at) > new Date(existing.left_at)) {
            formerMap.set(key, member);
          }
        });
        
        // You can handle former members here if needed
        // const formerMembers = Array.from(formerMap.values());
      } else {
        // Fallback to your existing logic if no membership history
        const salesmanIds = res.team?.salesman_ids || [];
        const supplementerIds = res.team?.supplementer_ids || [];
        const allUserIds = [...salesmanIds, ...supplementerIds];

        const userDetails = await Promise.all(allUserIds.map(async id => {
          try {
            const userRes = await Api.getUserDetails(id);
            return {
              user_id: id,
              name: userRes.name || userRes.full_name || userRes.username || `User ${id}`,
              ...userRes,
              membership_role: salesmanIds.includes(id)
                ? 'Salesman'
                : supplementerIds.includes(id)
                ? 'Supplementer'
                : 'Member'
            };
          } catch (err) {
            return { user_id: id, name: `User ${id}` };
          }
        }));

        setMembers(userDetails);
      }
    } catch (err) {
      setError('Failed to load team members.');
      console.error(err);
      setMembers([]);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      // Use team_id instead of id
      fetchMembers(selectedTeam.team_id || selectedTeam.id);
      
      // Add debugging to see what's happening
      console.log('Selected team:', selectedTeam);
    } else {
      setMembers([]);
    }
  }, [selectedTeam]);

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
  };

  const handleUpdateTeam = async (updatedTeam) => {
    try {
      await Api.updateTeam({
        team_id: updatedTeam.id || updatedTeam.team_id,
        team_name: updatedTeam.team_name,
        team_type: updatedTeam.team_type,
        manager_id: updatedTeam.manager_id,
        salesman_ids: updatedTeam.salesman_ids || [],
        supplementer_ids: updatedTeam.supplementer_ids || []
      });
      await fetchTeams();
      setSelectedTeam(null);
    } catch (err) {
      setError('Failed to update team.');
      console.error(err);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await Api.deleteTeam(teamId);
      await fetchTeams();
      setSelectedTeam(null);
    } catch (err) {
      setError('Failed to delete team.');
      console.error(err);
    }
  };

  const handleCreateTeam = async (newTeam) => {
    try {
      await Api.createTeam({
        team_name: newTeam.team_name,
        team_type: newTeam.team_type,
        manager_id: newTeam.manager_id,
        salesman_ids: newTeam.salesman_ids || [],
        supplementer_ids: newTeam.supplementer_ids || []
      });
      await fetchTeams();
    } catch (err) {
      setError('Failed to create team.');
      console.error(err);
    }
  };

  const handleAddMember = async (userId, teamId) => {
    try {
      // Find the team object
      const team = teams.find(t => t.team_id === teamId);
      if (!team) throw new Error('Team not found');

      // Find the user to determine their role
      const user = users.find(u => u.id == userId); // Note: using == for type coercion
      if (!user) {
        console.error('User not found:', userId, 'Available users:', users);
        throw new Error('User not found');
      }

      // Determine which array to add the user to based on role
      let updatedSalesmanIds = team.salesman_ids ? [...team.salesman_ids] : [];
      let updatedSupplementerIds = team.supplementer_ids ? [...team.supplementer_ids] : [];

      if (user.role === 'supplementer') {
        // Add to supplementer_ids if not already there
        if (!updatedSupplementerIds.includes(userId)) {
          updatedSupplementerIds.push(userId);
        }
      } else {
        // Default to salesman for all other roles
        if (!updatedSalesmanIds.includes(userId)) {
          updatedSalesmanIds.push(userId);
        }
      }

      // Build updated team object
      const updatedTeam = {
        ...team,
        salesman_ids: updatedSalesmanIds,
        supplementer_ids: updatedSupplementerIds,
      };

      await Api.updateTeam(updatedTeam);
      await fetchTeams();
      await fetchMembers(teamId);
    } catch (err) {
      setError('Failed to add member.');
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId, teamId) => {
    try {
      const team = teams.find(t => t.team_id === teamId);
      if (!team) throw new Error('Team not found');

      // Remove user from both arrays
      const updatedSalesmanIds = (team.salesman_ids || []).filter(id => id !== userId);
      const updatedSupplementerIds = (team.supplementer_ids || []).filter(id => id !== userId);

      const updatedTeam = {
        ...team,
        salesman_ids: updatedSalesmanIds,
        supplementer_ids: updatedSupplementerIds,
      };

      await Api.updateTeam(updatedTeam);
      await fetchTeams();
      await fetchMembers(teamId);
    } catch (err) {
      setError('Failed to remove member.');
      console.error(err);
    }
  };

  // Updated handler to support joined_at and left_at
  const handleUpdateMemberRole = async (userId, teamId, role, joined_at, left_at) => {
    try {
      // Update role if provided
      if (role) {
        await Api.updateUserRoleInTeam(userId, teamId, { role });
      }
      // Update joined_at if provided
      if (joined_at) {
        await Api.addUserToTeamWithDate({
          userId,
          teamId,
          role: role || 'salesman', // fallback to salesman if not provided
          joinedAt: joined_at
        });
      }
      // Update left_at if provided
      if (left_at) {
        await Api.setUserTeamDepartureDate(userId, teamId, { departureDate: left_at });
      }
      await fetchMembers(teamId);
    } catch (err) {
      setError('Failed to update member role or dates.');
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900'}`}>
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-8">
        <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight drop-shadow-lg">Team Settings</h1>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
            <span className="ml-4 text-xl font-semibold">Loading teams...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6 shadow" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          <TeamList
            teams={teams}
            onSelect={handleSelectTeam}
            onDelete={handleDeleteTeam}
            selectedTeamId={selectedTeam?.team_id || selectedTeam?.id}
            isDarkMode={isDarkMode}
          />
          <TeamEditor
            selectedTeam={selectedTeam}
            onSave={selectedTeam ? handleUpdateTeam : handleCreateTeam}
            onClear={() => setSelectedTeam(null)}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onUpdateMemberRole={handleUpdateMemberRole}
            members={members}
            users={users}
            isDarkMode={isDarkMode}
            membershipHistory={membershipHistory}
          />
        </div>
      </main>
    </div>
  );
};

export default TeamSettings;