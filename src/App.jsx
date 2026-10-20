import { useState, useEffect, useRef } from 'react';
import { getDeadline } from './deadlines';
import { moveTask } from './boardMetrics';
import BoardInsights from './BoardInsights';
import TaskEditor from './TaskEditor';
import SprintWorkspace from './SprintWorkspace';
import AnchorBoard, { INITIAL_ANCHORS } from './AnchorBoard';

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

// Sample teammates for trying task assignment.
export const TEAM = ['SirMoog', 'Elena Rostova', 'Marcus Chen', 'Devon Vance'];

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
  'in-progress': { dot: 'bg-brand-primary', text: 'text-brand-link' },
  review: { dot: 'bg-brand-accent', text: 'text-brand-review' },
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

const DEADLINE_STYLES = {
  neutral: 'bg-surface-card',
  safe: 'bg-tint-safe',
  warning: 'bg-tint-warning',
  overdue: 'bg-tint-bug',
};
const DEADLINE_TEXT = {
  neutral: 'text-due-neutral',
  safe: 'text-due-safe',
  warning: 'text-due-warning',
  overdue: 'text-due-overdue',
};

function TaskCard({ task, onEdit, now, onReorder, position, columnCount, onDragStart, onDragEnd, onDropTask, onMove, isDragging, dropTarget, onDragOverTask }) {
  const isBug = task.type === 'bug';
  const deadline = getDeadline(task, now);
  const assignee = task.assignee?.trim() || '';
  const nameParts = assignee.split(/\s+/);
  const initials = assignee
    ? (nameParts.length > 1
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
      : assignee.slice(0, 2)).toUpperCase()
    : '?';
  return (
    <article draggable onDragStart={event => onDragStart(event, task.id)} onDragEnd={onDragEnd}
      onDragOver={event => onDragOverTask(event, task)} onDrop={event => onDropTask(event, task.status, task.id)}
      onClick={() => onEdit(task)} className={`${isDragging ? 'opacity-40' : ''} ${dropTarget ? 'ring-2 ring-brand-primary ring-offset-2' : ''} min-w-0 cursor-pointer rounded-md border border-border-subtle border-l-4 p-3 shadow-sm transition-shadow hover:shadow-md ${DEADLINE_STYLES[deadline.state]} ${isBug ? 'border-l-type-bug' : 'border-l-type-feature'}`} aria-labelledby={`title-${task.id}`}>
      <div className="mb-1 flex items-center justify-between gap-2 font-mono text-xs text-ink-muted">
        <span className="min-w-0 break-all"><span aria-hidden="true" className="mr-2 cursor-grab text-base" title="Drag to move">⠿</span>{task.id}</span>
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
      <h3 id={`title-${task.id}`} className="break-words text-sm font-semibold leading-5"><button id={`edit-${task.id}`} type="button" onClick={event => { event.stopPropagation(); onEdit(task); }} aria-label={`Edit ${task.title}`} className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-link">{task.title}</button></h3>
      <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-ink-body">{task.description}</p>
      <div className="mt-2 text-xs text-ink-muted">
        <p className={`mb-1 font-semibold ${DEADLINE_TEXT[deadline.state]}`}>
          <span aria-hidden="true" className="mr-1">{deadline.state === 'overdue' ? '⚠' : deadline.state === 'warning' ? '◷' : task.status === 'done' ? '✓' : '·'}</span>
          {deadline.label}
        </p>
        {task.dueDate && deadline.label !== 'Invalid due date' && <>Due <time dateTime={task.dueDate}>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time></>}
      </div>
      <div className="mt-2 border-t border-border-subtle pt-2">
        <p className="sr-only">Assignee</p>
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border-subtle bg-surface-panel py-1 pl-1 pr-3 text-xs font-medium text-ink-body">
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-selected font-semibold text-brand-link">{initials}</span>
          <span className="min-w-0 break-words"><span className="sr-only">{assignee ? 'Assigned to ' : ''}</span>{assignee || 'Unassigned'}</span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-border-subtle pt-2" onClick={event => event.stopPropagation()} onDragStart={event => { event.preventDefault(); event.stopPropagation(); }}>
        <label htmlFor={`move-${task.id}`} className="sr-only">Move {task.title} to</label>
        <select id={`move-${task.id}`} value={task.status} onChange={event => onMove(task.id, event.target.value)} className="min-w-0 flex-1 rounded-md border border-border-subtle bg-surface-card px-2 py-1.5 text-xs focus:ring-2 focus:ring-brand-primary">
          {STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
        </select>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" disabled={position === 0} onClick={() => onReorder(task, -1)} aria-label={`Move ${task.title} up`} className="rounded-md border border-border-subtle bg-surface-card px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">↑</span></button>
          <button type="button" disabled={position === columnCount - 1} onClick={() => onReorder(task, 1)} aria-label={`Move ${task.title} down`} className="rounded-md border border-border-subtle bg-surface-card px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">↓</span></button>
          <span className="sr-only">Position {position + 1} of {columnCount}</span>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  return <SprintWorkspace initialTasks={INITIAL_TASKS} initialAnchors={INITIAL_ANCHORS}>
    {({ sprint, sprintFooter, saveTasks, saveAnchors }) => <SprintBoard key={sprint.id} sprint={sprint} sprintFooter={sprintFooter} saveTasks={saveTasks} saveAnchors={saveAnchors} />}
  </SprintWorkspace>;
}

function SprintBoard({ sprint, sprintFooter, saveTasks, saveAnchors }) {
  const { tasks, anchors } = sprint;
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const dragId = useRef(null);
  const lastDragEnd = useRef(0);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refreshDate = () => setNow(new Date());
    const timer = setInterval(refreshDate, 30000);
    window.addEventListener('focus', refreshDate);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshDate);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, []);
  function addTask(status = 'todo') {
    const now = new Date();
    const createdDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setNotice('');
    setEditing({ isNew: true, task: { id: crypto.randomUUID(), title: '', description: '', type: 'feature', status, assignee: TEAM[0], dueDate: null, createdDate, context: '', contextTool: null, contextUpdatedAt: null } });
  }
  function editTask(task) {
    if (dragId.current || Date.now() - lastDragEnd.current < 200) return;
    setNotice('');
    setEditing({ isNew: false, task });
  }
  function focusElement(id) {
    requestAnimationFrame(() => (document.getElementById(id) || document.getElementById('add-task'))?.focus());
  }
  function saveTask(task) {
    const next = editing.isNew ? [...tasks, task] : tasks.map(item => item.id === task.id ? task : item);
    if (!saveTasks(next)) return false;
    setEditing(null);
    setNotice('Task saved locally.');
    focusElement(`edit-${task.id}`);
    return true;
  }
  function deleteTask(id) {
    if (!saveTasks(tasks.filter(task => task.id !== id))) return false;
    setEditing(null);
    setNotice('Task deleted.');
    focusElement('add-task');
    return true;
  }
  function reorder(task, direction) {
    const column = tasks.filter(item => item.status === task.status);
    const index = column.findIndex(item => item.id === task.id);
    const target = index + direction;
    if (target < 0 || target >= column.length) return;
    const beforeId = direction < 0 ? column[target].id : column[target + 1]?.id || null;
    const next = moveTask(tasks, task.id, task.status, beforeId);
    if (!saveTasks(next)) {
      setNotice('Could not save the new order. Your task has not moved.');
      return;
    }
    setNotice(`${task.title} moved to position ${target + 1} of ${column.length}. Saved locally.`);
    focusElement(`edit-${task.id}`);
  }
  function move(id, status, beforeId = null) {
    const focusId = document.activeElement?.id;
    if (!STAGES.some(stage => stage.id === status)) return;
    const next = moveTask(tasks, id, status, beforeId);
    if (next === tasks) return;
    if (!saveTasks(next)) {
      setNotice('Could not save the move. The task remains in its previous position.');
      return;
    }
    if (focusId === `move-${id}`) focusElement(focusId);
    const task = tasks.find(item => item.id === id);
    setNotice(`${task.title} moved to ${STAGES.find(stage => stage.id === status).label}. Saved locally.`);
  }
  function startDrag(event, id) {
    dragId.current = id;
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
    setDragging(id);
    setNotice('Drop on a card to place before it, or in a column to move to its end.');
  }
  function endDrag() {
    dragId.current = null;
    lastDragEnd.current = Date.now();
    setDragging(null);
    setDropTarget(null);
  }
  function dropTask(event, status, beforeId = null) {
    if (!dragId.current) return;
    event.preventDefault();
    event.stopPropagation();
    move(dragId.current, status, beforeId);
    endDrag();
  }
  function overTask(event, task) {
    if (!dragId.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(task.id);
  }
  const completedCount = tasks.filter(task => task.status === 'done').length;

  return (
    <div className="min-w-0 bg-surface-page font-sans text-ink-primary">
      <div className="min-w-0 flex-1">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium"><BoardIcon /><span>Vibecoding Project Tracker</span></div>
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <span className="rounded bg-surface-selected px-3 py-1.5 font-medium text-brand-link">Board</span>
            <span>Personal workspace</span>
          </div>
        </header>
        <main id="board" className="min-w-0 p-3 sm:p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">Sprint overview</p>
              <h1 className="break-words text-2xl font-semibold tracking-tight">{sprint.name}</h1>
              <p className="mt-2 text-sm text-ink-muted">From first idea to finished work.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button id="add-task" onClick={() => addTask()} className="rounded-md bg-brand-action px-4 py-2 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-link">+ Add Task</button>
              <span className="rounded-md border border-border-subtle bg-surface-card px-3 py-2">{tasks.length} tasks</span>
              <span className="rounded-md border border-border-subtle bg-surface-card px-3 py-2">{completedCount} completed</span>
            </div>
          </div>
          <AnchorBoard anchors={anchors} onSave={saveAnchors} />
          <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
            Drag tasks to move or reorder · Use the status dropdown for keyboard moves · Click to edit
          </div>
          <div id="kanban" role="region" aria-label="Kanban board" tabIndex={0} className="overflow-x-auto rounded-xl pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-link">
            <div className="grid min-w-[1040px] grid-cols-4 items-stretch gap-4">
              {STAGES.map(stage => {
                const stageTasks = tasks.filter(task => task.status === stage.id);
                const style = STAGE_STYLES[stage.id];
                return (
                  <section key={stage.id}
                    onDragOver={event => { if (dragId.current) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(stage.id); } }}
                    onDrop={event => dropTask(event, stage.id)}
                    aria-labelledby={`stage-${stage.id}`} className={`min-h-[180px] 2xl:min-h-[560px] min-w-0 rounded-xl border border-border-subtle bg-surface-panel p-3 ${dropTarget === stage.id ? 'ring-2 ring-brand-primary' : ''}`}>
                    <div className="flex items-center gap-2 px-1 pb-4 pt-2">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <h2 id={`stage-${stage.id}`} className={`text-base font-semibold ${style.text}`}>{stage.label}</h2>
                      <span className="rounded-full bg-surface-selected px-2 py-0.5 text-xs text-ink-body" aria-label={`${stageTasks.length} tasks`}>{stageTasks.length}</span>
                      <button onClick={() => addTask(stage.id)} aria-label={`Add task to ${stage.label}`} className="ml-auto rounded px-2 py-1 text-xs text-brand-link hover:bg-surface-selected">+ Add</button>
                    </div>
                    <div className="space-y-3">
                      {stageTasks.map((task, index) => <TaskCard key={task.id} task={task} onEdit={editTask} now={now} onReorder={reorder} position={index} columnCount={stageTasks.length} onDragStart={startDrag} onDragEnd={endDrag} onDropTask={dropTask} onDragOverTask={overTask} onMove={move} isDragging={dragging === task.id} dropTarget={dropTarget === task.id} />)}
                      {stageTasks.length === 0 && <p className="rounded-md border border-dashed border-border-subtle p-6 text-center text-sm text-ink-muted">No tasks in {stage.label.toLowerCase()} yet.</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-brand-link">{notice}</p>
          <BoardInsights tasks={tasks} stages={STAGES} now={now} />
          {sprintFooter}
        </main>
      </div>
      {editing && <TaskEditor key={editing.task.id} {...editing} stages={STAGES} team={TEAM} onSave={saveTask} onDelete={deleteTask} onClose={() => setEditing(null)} />}
    </div>
  );
}
