import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TEAM_TYPES = ['Sales', 'Supplement', 'Affiliate'];

const TeamEditor = ({
  selectedTeam,
  onSave,
  onClear,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  members = [],
  users = [],
  isDarkMode,
  membershipHistory = []
}) => {
  const [form, setForm] = useState({
    team_name: '',
    team_type: 'Sales',
    manager_id: '',
  });

  // Track editing dates for each member
  const [editDates, setEditDates] = useState({});

  useEffect(() => {
    if (selectedTeam) {
      setForm({
        team_name: selectedTeam.team_name || '',
        team_type: selectedTeam.team_type || 'Sales',
        manager_id: selectedTeam.manager_id || '',
      });
      // Initialize editDates from members
      const initialDates = {};
      members.forEach(m => {
        initialDates[m.user_id] = {
          joined_at: m.joined_at ? m.joined_at.slice(0, 10) : '',
          left_at: m.left_at ? m.left_at.slice(0, 10) : ''
        };
      });
      setEditDates(initialDates);
    } else {
      setForm({ team_name: '', team_type: 'Sales', manager_id: '' });
      setEditDates({});
    }
  }, [selectedTeam, members]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (userId, field, value) => {
    setEditDates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Save join/leave dates for a member
  const handleSetDates = async (userId) => {
    const dates = editDates[userId];
    await onUpdateMemberRole(
      userId,
      selectedTeam.team_id || selectedTeam.id,
      undefined,
      dates.joined_at,
      dates.left_at
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.team_name || !form.team_type || !form.manager_id) {
      alert('All fields required');
      return;
    }
    onSave({ ...form });
  };

  // Separate current and former members
  const currentMemberIds = members.map(m => m.user_id);
  const formerMembers = React.useMemo(() => {
    if (!membershipHistory || membershipHistory.length === 0) return [];

    // Get all memberships with left_at dates
    const formerMemberships = membershipHistory.filter(m => m.left_at);
    
    // Group by user_id and take the most recent left_at for each user
    const userExitMap = new Map();
    
    formerMemberships.forEach(member => {
      const key = member.user_id;
      const existing = userExitMap.get(key);
      
      if (!existing || new Date(member.left_at) > new Date(existing.left_at)) {
        userExitMap.set(key, member);
      }
    });
    
    // If a user's most recent record has no left_at, they're a current member
    // Filter to only keep users who aren't active on the team
    return Array.from(userExitMap.values())
      .filter(member => {
        // Get the most recent record for this user
        const userRecords = membershipHistory.filter(m => m.user_id === member.user_id);
        const mostRecent = userRecords.reduce((latest, record) => {
          return !latest || new Date(record.joined_at) > new Date(latest.joined_at) ? record : latest;
        }, null);
        
        // If their most recent record has a left_at, they're a former member
        return mostRecent && mostRecent.left_at;
      });
  }, [membershipHistory, currentMemberIds]);

  return (
    <div className={`relative p-6 pb-32 w-full md:w-2/3 rounded-2xl shadow-lg
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight drop-shadow-lg">
        {selectedTeam ? 'Edit Team' : 'Create New Team'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 mb-10" id="team-editor-form">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-lg">Team Name</label>
            <input
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg text-lg focus:outline-none focus:ring-2
                ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-lg">Team Type</label>
            <select
              name="team_type"
              value={form.team_type}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg text-lg focus:outline-none focus:ring-2
                ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
            >
              {TEAM_TYPES.map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-lg">Manager</label>
            <select
              name="manager_id"
              value={form.manager_id}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg text-lg focus:outline-none focus:ring-2
                ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
            >
              <option value="">Select manager...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {selectedTeam && (
        <>
          <h3 className="text-2xl font-bold mb-6 text-center">Team Members</h3>
          {members.length === 0 ? (
            <div className="text-gray-400 mb-8 text-center">No team members yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full rounded-xl overflow-hidden shadow ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Role</th>
                    <th className="px-4 py-2 text-left font-semibold">Joined</th>
                    <th className="px-4 py-2 text-left font-semibold">Left</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.user_id} className="border-t">
                      <td className="px-4 py-2 font-medium">{member.name || `User ${member.user_id}`}</td>
                      <td className="px-4 py-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {member.role || member.membership_role || 'Member'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editDates[member.user_id]?.joined_at || ''}
                          onChange={e => handleDateChange(member.user_id, 'joined_at', e.target.value)}
                          className={`border rounded p-1 text-xs focus:outline-none focus:ring-2
                            ${isDarkMode ? 'bg-gray-900 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editDates[member.user_id]?.left_at || ''}
                          onChange={e => handleDateChange(member.user_id, 'left_at', e.target.value)}
                          className={`border rounded p-1 text-xs focus:outline-none focus:ring-2
                            ${isDarkMode ? 'bg-gray-900 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
                        />
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => handleSetDates(member.user_id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-600 transition"
                          title="Set Dates"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => onRemoveMember(member.user_id, selectedTeam.team_id || selectedTeam.id)}
                          className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-xs font-semibold transition"
                          title="Remove member"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8 justify-center mt-8">
            <select
              onChange={(e) => {
                const userId = e.target.value;
                if (userId) onAddMember(userId, selectedTeam.team_id || selectedTeam.id);
              }}
              className={`border p-2 rounded-lg text-lg focus:outline-none focus:ring-2
                ${isDarkMode ? 'bg-gray-900 border-gray-700 focus:ring-blue-700 text-white' : 'bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-900'}`}
            >
              <option value="">Add member...</option>
              {users
                .filter(u => !members.some(m => m.user_id === u.id))
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
            </select>
            <span className="text-sm text-gray-400">Select a user to add to this team</span>
          </div>

          {/* Former Team Members Section */}
          <h3 className="text-xl font-bold mb-4 mt-12 text-center text-gray-500 dark:text-gray-300">Former Team Members</h3>
          {formerMembers.length === 0 ? (
            <div className="text-gray-400 mb-8 text-center">No former team members.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full rounded-xl overflow-hidden shadow ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Role</th>
                    <th className="px-4 py-2 text-left font-semibold">Joined</th>
                    <th className="px-4 py-2 text-left font-semibold">Left</th>
                  </tr>
                </thead>
                <tbody>
                  {formerMembers.map(member => (
                    <tr key={member.user_id + '-' + member.left_at} className="border-t">
                      <td className="px-4 py-2 font-medium">{member.name || `User ${member.user_id}`}</td>
                      <td className="px-4 py-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {member.role || member.membership_role || 'Member'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        {member.left_at ? new Date(member.left_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedTeam && selectedTeam.created_at && (
        <div className="mt-6 text-xs text-gray-400 text-center">
          <div>Team Created: {new Date(selectedTeam.created_at).toLocaleDateString()}</div>
          {selectedTeam.updated_at && (
            <div>Last Updated: {new Date(selectedTeam.updated_at).toLocaleDateString()}</div>
          )}
        </div>
      )}

      {/* Fixed bottom action bar */}
      <div className="absolute left-0 right-0 bottom-0 px-6 py-4 bg-gradient-to-t from-gray-100/80 dark:from-gray-900/80 to-transparent flex justify-center gap-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          form="team-editor-form"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 text-lg font-semibold transition"
        >
          {selectedTeam ? 'Update Team' : 'Create Team'}
        </button>
        {selectedTeam && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 underline hover:text-gray-600 text-lg"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamEditor;
