export function allMembers(teams) {
  const names = new Map();
  teams.forEach(team => team.members.forEach(name => {
    if (!names.has(name.toLowerCase())) names.set(name.toLowerCase(), name);
  }));
  return [...names.values()];
}

export function migrateTeams(data, legacyMembers) {
  if (data.teams === undefined) return [{ id: 'team-1', name: 'Team 1', members: legacyMembers }];
  if (!Array.isArray(data.teams) || !data.teams.every(team => typeof team.id === 'string' && typeof team.name === 'string' && team.name.trim() && Array.isArray(team.members) && team.members.every(name => typeof name === 'string' && name.trim())) || new Set(data.teams.map(team => team.id)).size !== data.teams.length) throw new Error('Invalid teams');
  return data.teams;
}

// Keep ticket content intact when its last team membership is removed.
export function replaceTeams(workspace, teams, selectedTeamId) {
  const members = new Set(allMembers(teams).map(name => name.toLowerCase()));
  return {
    ...workspace,
    teams,
    selectedTeamId,
    sprints: workspace.sprints.map(sprint => ({
      ...sprint,
      tasks: sprint.tasks.map(task => task.assignee && !members.has(task.assignee.toLowerCase()) ? { ...task, assignee: '' } : task)
    }))
  };
}
