// Compare calendar dates rather than elapsed hours, so DST does not shift urgency.
export function getDeadline(task, now = new Date()) {
  if (task.status === 'done') return { state: 'neutral', label: 'Completed' };
  if (!task.dueDate) return { state: 'neutral', label: 'No due date' };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(task.dueDate);
  if (!match) return { state: 'neutral', label: 'Invalid due date' };
  const [, year, month, day] = match.map(Number);
  const due = new Date(Date.UTC(year, month - 1, day));
  if (due.getUTCFullYear() !== year || due.getUTCMonth() !== month - 1 || due.getUTCDate() !== day) {
    return { state: 'neutral', label: 'Invalid due date' };
  }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((due.getTime() - today) / 86400000);
  if (days < 0) return { state: 'overdue', label: `${-days} ${days === -1 ? 'day' : 'days'} overdue` };
  if (days === 0) return { state: 'warning', label: 'Needs attention · Due today' };
  if (days === 1) return { state: 'warning', label: 'Needs attention · Due tomorrow' };
  return { state: 'safe', label: `${days} days remaining` };
}
