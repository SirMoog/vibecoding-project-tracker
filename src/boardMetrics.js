import { getDeadline } from './deadlines.js';

export function moveTask(tasks, id, status, beforeId = null) {
  const task = tasks.find(item => item.id === id);
  if (!task || beforeId === id) return tasks;
  const remaining = tasks.filter(item => item.id !== id);
  const targetIndex = beforeId ? remaining.findIndex(item => item.id === beforeId && item.status === status) : -1;
  const moved = { ...task, status };
  if (targetIndex < 0) return [...remaining, moved];
  return [...remaining.slice(0, targetIndex), moved, ...remaining.slice(targetIndex)];
}

export function getMetrics(tasks, stages, now = new Date()) {
  const open = tasks.filter(task => task.status !== 'done');
  const done = tasks.length - open.length;
  const deadlines = { overdue: 0, warning: 0, safe: 0, neutral: 0 };
  const assignees = new Map();
  for (const task of open) {
    deadlines[getDeadline(task, now).state] += 1;
    const name = task.assignee?.trim() || 'Unassigned';
    assignees.set(name, (assignees.get(name) || 0) + 1);
  }
  return {
    total: tasks.length, done, open: open.length,
    completion: tasks.length ? Math.round(done / tasks.length * 100) : 0,
    wip: tasks.filter(task => ['in-progress', 'review'].includes(task.status)).length,
    stages: stages.map(stage => ({ label: stage.label, value: tasks.filter(task => task.status === stage.id).length })),
    types: ['feature', 'bug'].map(type => ({ label: type === 'feature' ? 'Features' : 'Bugs', value: tasks.filter(task => task.type === type).length })),
    deadlines,
    assignees: [...assignees].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([label, value]) => ({ label, value })),
  };
}
