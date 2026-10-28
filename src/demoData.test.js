import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoTasks, DEMO_TEAM, DEMO_CONTEXT, DEMO_URL } from './demoData.js';
import { getDeadline } from './deadlines.js';

test('first-load examples cover deadline states and all four assignees', () => {
  const now = new Date(2026, 9, 28, 12);
  const tasks = createDemoTasks(now);
  assert.deepEqual(new Set(tasks.map(task => getDeadline(task, now).label)), new Set(['Needs attention · Due tomorrow', '1 day overdue', '7 days remaining', 'Completed', 'No due date']));
  assert.deepEqual(new Set(tasks.filter(task => task.status !== 'done' && task.assignee).map(task => task.assignee)), new Set(DEMO_TEAM));
  assert.ok(tasks.some(task => task.assignee === ''));
  assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length);
});
test('calendar-relative dates cross year and month boundaries', () => {
  const tasks = createDemoTasks(new Date(2026, 11, 31, 12));
  assert.equal(tasks[0].dueDate, '2027-01-01');
  assert.equal(tasks[1].dueDate, '2026-12-30');
  assert.equal(tasks[2].dueDate, '2027-01-07');
});
test('copyable sample contains the full handover and a real prototype link', () => {
  for (const heading of ['Requirements', 'AI conversation summary', 'Example error log', 'Next steps']) assert.ok(DEMO_CONTEXT.includes(heading));
  assert.equal(createDemoTasks()[0].context, DEMO_CONTEXT);
  assert.equal(new URL(DEMO_URL).hostname, 'vibecoding-project-tracker-topaz.vercel.app');
});
