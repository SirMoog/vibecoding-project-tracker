import { useState, useEffect } from 'react';

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

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable; the read-only board still renders. */
    }
  }, [key, value]);
  return [value, setValue];
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

function TaskCard({ task }) {
  return (
    <article className="min-w-0 rounded-md border border-border-subtle bg-surface-card p-4 shadow-sm" aria-labelledby={`title-${task.id}`}>
      <div className="mb-3 flex items-center justify-between gap-2 font-mono text-xs text-ink-muted">
        <span>{task.id}</span>
        <span className="rounded bg-surface-panel px-2 py-1 capitalize text-ink-body">{task.type}</span>
      </div>
      <h3 id={`title-${task.id}`} className="break-words text-base font-semibold leading-6">{task.title}</h3>
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
  const [tasks] = useLocalStorage('vibetracker.tasks', INITIAL_TASKS);
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
              <span className="rounded-md border border-border-subtle bg-white px-3 py-2">{tasks.length} tasks</span>
              <span className="rounded-md border border-border-subtle bg-white px-3 py-2">{completedCount} completed</span>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
            Starter board · Sample tasks to preview your workflow
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
                    </div>
                    <div className="space-y-3">
                      {stageTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      {stageTasks.length === 0 && <p className="rounded-md border border-dashed border-border-subtle p-6 text-center text-sm text-ink-muted">No tasks in {stage.label.toLowerCase()} yet.</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
