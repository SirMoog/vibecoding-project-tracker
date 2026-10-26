import test from 'node:test';
import assert from 'node:assert/strict';
import { allMembers, migrateTeams, replaceTeams } from './teams.js';
const teams = [{ id: 'a', name: 'A', members: ['Carys', 'Noah'] }, { id: 'b', name: 'B', members: ['Carys'] }];
const workspace = { teams, sprints: [{ id: 's1', tasks: [{ id: '1', assignee: 'Carys', context: 'Keep this' }, { id: '2', assignee: 'Noah' }] }, { id: 's2', tasks: [{ id: '3', assignee: 'Noah' }] }] };
test('migration preserves legacy members and intentionally empty teams', () => {
  assert.deepEqual(migrateTeams({}, ['Carys'])[0].members, ['Carys']);
  assert.deepEqual(migrateTeams({ teams: [] }, ['Carys']), []);
  assert.throws(() => migrateTeams({ teams: null }, []));
});
test('deletion retains shared members and clears last membership across sprints', () => {
  const next = replaceTeams(workspace, [teams[1]], 'b');
  assert.equal(next.sprints[0].tasks[0].assignee, 'Carys');
  assert.equal(next.sprints[0].tasks[1].assignee, '');
  assert.equal(next.sprints[1].tasks[0].assignee, '');
  assert.equal(workspace.sprints[0].tasks[1].assignee, 'Noah');
});
test('deleting final team retains all ticket content', () => {
  const next = replaceTeams(workspace, [], null);
  assert.equal(next.sprints[0].tasks[0].context, 'Keep this');
  assert.ok(next.sprints.flatMap(s => s.tasks).every(task => task.assignee === ''));
  assert.equal(next.sprints.flatMap(s => s.tasks).length, 3);
});
test('member removal and combined assignment list', () => {
  const next = replaceTeams(workspace, teams.map(team => ({ ...team, members: team.members.filter(name => name !== 'Noah') })), 'a');
  assert.equal(next.sprints[1].tasks[0].assignee, '');
  assert.deepEqual(allMembers([...teams, { members: ['carys'] }]), ['Carys', 'Noah']);
});
