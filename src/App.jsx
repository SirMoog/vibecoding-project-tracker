import { useState } from 'react';
import TaskEditor from './TaskEditor';

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 * @property {string} context
 * @property {string|null} contextTool
 * @property {string|null} contextUpdatedAt
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// This project is being built by one person.
export const TEAM = ['SirMoog'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist before changing state so a failed write cannot look like a saved edit.
  function saveValue(nextValue) {
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      setValue(nextValue);
      return true;
    } catch {
      return false;
    }
  }
  return [value, saveValue];
}

// Seed once on first use; existing saved tasks take precedence.
export const INITIAL_TASKS = [
  {
    id: 'TASK-104', title: 'Build the task editor',
    description: 'Create a focused editor for adding, updating and deleting tasks.',
    type: 'feature', status: 'todo', assignee: TEAM[0], dueDate: null,
    createdDate: '2026-10-20', context: '', contextTool: null, contextUpdatedAt: null,
  },
  {
    id: 'TASK-103', title: 'Create the Kanban board',
    description: 'Bring the four workflow stages together in one clear project workspace.',
    type: 'feature', status: 'in-progress', assignee: TEAM[0], dueDate: '2026-10-23',
    createdDate: '2026-10-20', context: '', contextTool: null, contextUpdatedAt: null,
  },
  {
    id: 'TASK-102', title: 'Check long task titles',
    description: 'Verify that longer titles wrap inside cards without pushing the columns apart.',
    type: 'bug', status: 'review', assignee: TEAM[0], dueDate: '2026-10-24',
    createdDate: '2026-10-20', context: '', contextTool: null, contextUpdatedAt: null,
  },
  {
    id: 'TASK-101', title: 'Define the visual direction',
    description: 'Document the blue and lavender palette, typography and component styles.',
    type: 'feature', status: 'done', assignee: TEAM[0], dueDate: '2026-10-20',
    createdDate: '2026-10-20', context: '', contextTool: null, contextUpdatedAt: null,
  },
];

const STAGE_STYLES = {
  todo: { dot: 'bg-slate-400', text: 'text-ink-primary' },
  'in-progress': { dot: 'bg-brand-primary', text: 'text-brand-action' },
  review: { dot: 'bg-brand-accent', text: 'text-indigo-700' },
  done: { dot: 'bg-brand-secondary', text: 'text-due-safe' },
};

function BoardIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 7v10M12 7v6M16 7v8" />
    </svg>
  );
}

function TaskCard({ task, onEdit }) {
  const isBug = task.type === 'bug';
  return (
    <article onClick={() => onEdit(task)} className={`min-w-0 cursor-pointer rounded-md border border-border-subtle border-l-4 bg-surface-card p-4 shadow-sm transition-shadow hover:shadow-md ${isBug ? 'border-l-type-bug' : 'border-l-type-feature'}`} aria-labelledby={`title-${task.id}`}>
      <div className="mb-3 flex items-center justify-between gap-2 font-mono text-xs text-ink-muted">
        <span className="min-w-0 break-all">{task.id}</span>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 font-semibold ${isBug ? 'bg-tint-bug text-type-bug' : 'bg-tint-feature text-type-feature'}`}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {isBug ? <>
              <rect x="7" y="7" width="10" height="14" rx="5" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2M12 8v12M3 12h4m10 0h4M4 5l4 4m12-4-4 4M3 20l5-3m13 3-5-3" />
            </> : <>
              <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
              <path d="M20 2v4m-2-2h4" />
            </>}
          </svg>
          {isBug ? 'Bug' : 'Feature'}
        </span>
      </div>
      <h3 id={`title-${task.id}`} className="break-words text-base font-semibold leading-6"><button type="button" onClick={event => { event.stopPropagation(); onEdit(task); }} aria-label={`Edit ${task.title}`} className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-action">{task.title}</button></h3>
      <p className="mt-2 break-words text-sm leading-6 text-ink-body">{task.description}</p>
      <div className="mt-4 text-xs text-ink-muted">
        {task.dueDate ? <>Due <time dateTime={task.dueDate}>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time></> : 'No due date'}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-3 text-xs text-ink-body">
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-selected font-semibold text-brand-action">{task.assignee.slice(0, 2).toUpperCase()}</span>
        <span><span className="sr-only">Assigned to </span>{task.assignee}</span>
      </div>
    </article>
  );
}

export default function App() {
  const [tasks, saveTasks] = useLocalStorage('vibetracker.tasks', INITIAL_TASKS);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  function addTask(status = 'todo') {
    const now = new Date();
    const createdDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setNotice('');
    setEditing({ isNew: true, task: { id: crypto.randomUUID(), title: '', description: '', type: 'feature', status, assignee: TEAM[0], dueDate: null, createdDate, context: '', contextTool: null, contextUpdatedAt: null } });
  }
  function editTask(task) {
    setNotice('');
    setEditing({ isNew: false, task });
  }
  function saveTask(task) {
    const next = editing.isNew ? [...tasks, task] : tasks.map(item => item.id === task.id ? task : item);
    if (!saveTasks(next)) return false;
    setEditing(null);
    setNotice('Task saved locally.');
    return true;
  }
  function deleteTask(id) {
    if (!saveTasks(tasks.filter(task => task.id !== id))) return false;
    setEditing(null);
    setNotice('Task deleted.');
    return true;
  }
  const completedCount = tasks.filter(task => task.status === 'done').length;

  // TODO M11: deliverable links above the board.
  return (
    <div className="min-h-screen bg-surface-page font-sans text-ink-primary md:flex">
      <aside className="flex shrink-0 flex-col border-b border-border-subtle bg-surface-panel md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="flex h-20 items-center gap-3 px-5">
          <span className="rounded-md bg-brand-action p-2 text-white"><BoardIcon /></span>
          <span className="text-lg font-semibold tracking-tight">FlowTask</span>
        </div>
        <nav aria-label="Project navigation" className="px-3 py-4">
          <p className="mb-3 px-3 font-mono text-[11px] uppercase tracking-widest text-ink-muted">Workspace</p>
          <a href="#board" aria-current="page" className="flex items-center gap-3 rounded-md bg-surface-selected px-3 py-3 text-sm font-medium text-brand-action focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-action">
            <BoardIcon /><span>Core Tasks (MVP)</span><span className="ml-auto text-xs">{tasks.length}</span>
          </a>
        </nav>
        <div className="mx-5 mb-6 mt-auto hidden border-t border-border-subtle pt-4 md:block">
          <p className="text-sm font-medium">SirMoog's workspace</p>
          <p className="mt-1 text-xs text-ink-muted">One project. A clearer workflow.</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium"><BoardIcon /><span>Vibecoding Project Tracker</span></div>
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <span className="rounded bg-surface-selected px-3 py-1.5 font-medium text-brand-action">Board</span>
            <span>Personal workspace</span>
          </div>
        </header>
        <main id="board" className="p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">Project overview</p>
              <h1 className="text-2xl font-semibold tracking-tight">Kanban Workflow & Delivery</h1>
              <p className="mt-2 text-sm text-ink-muted">From first idea to finished work.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => addTask()} className="rounded-md bg-brand-action px-4 py-2 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-action">+ Add Task</button>
              <span className="rounded-md border border-border-subtle bg-white px-3 py-2">{tasks.length} tasks</span>
              <span className="rounded-md border border-border-subtle bg-white px-3 py-2">{completedCount} completed</span>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
            Click a task to edit · Changes saved in this browser
          </div>
          <div role="region" aria-label="Kanban board" tabIndex={0} className="overflow-x-auto rounded-xl pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-action">
            <div className="grid min-w-[1040px] grid-cols-4 items-stretch gap-4">
              {STAGES.map(stage => {
                const stageTasks = tasks.filter(task => task.status === stage.id);
                const style = STAGE_STYLES[stage.id];
                return (
                  <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="min-h-[560px] min-w-0 rounded-xl border border-border-subtle bg-surface-panel p-3">
                    <div className="flex items-center gap-2 px-1 pb-4 pt-2">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <h2 id={`stage-${stage.id}`} className={`text-base font-semibold ${style.text}`}>{stage.label}</h2>
                      <span className="rounded-full bg-surface-selected px-2 py-0.5 text-xs text-ink-body" aria-label={`${stageTasks.length} tasks`}>{stageTasks.length}</span>
                      <button onClick={() => addTask(stage.id)} aria-label={`Add task to ${stage.label}`} className="ml-auto rounded px-2 py-1 text-xs text-brand-action hover:bg-surface-selected">+ Add</button>
                    </div>
                    <div className="space-y-3">
                      {stageTasks.map(task => <TaskCard key={task.id} task={task} onEdit={editTask} />)}
                      {stageTasks.length === 0 && <p className="rounded-md border border-dashed border-border-subtle p-6 text-center text-sm text-ink-muted">No tasks in {stage.label.toLowerCase()} yet.</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-brand-action">{notice}</p>
        </main>
      </div>
      {editing && <TaskEditor key={editing.task.id} {...editing} stages={STAGES} team={TEAM} onSave={saveTask} onDelete={deleteTask} onClose={() => setEditing(null)} />}
    </div>
  );
}
