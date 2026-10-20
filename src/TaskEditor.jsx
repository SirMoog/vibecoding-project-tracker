import { useEffect, useRef, useState } from 'react';

const inputStyle = 'mt-1 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';
const buttonStyle = 'rounded-md border border-border-subtle px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-action';

export default function TaskEditor({ task, isNew, stages, team, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...task, context: task.context ?? '' }));
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);

  function change(event) {
    const { name, value } = event.target;
    setDraft(current => ({ ...current, [name]: value }));
    setError('');
  }
  function save(event) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Enter a task title.');
      return;
    }
    const contextChanged = draft.context !== (task.context ?? '');
    if (!onSave({
      ...draft,
      title: draft.title.trim(),
      dueDate: draft.dueDate || null,
      contextUpdatedAt: contextChanged ? new Date().toISOString() : task.contextUpdatedAt ?? null,
    })) {
      setError('Could not save to browser storage. Your edits are still here. Enable storage or free up space, then try again.');
    }
  }
  return (
    <dialog ref={dialog} aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); onClose(); }} className="fixed inset-y-0 left-auto right-4 m-auto max-h-[94vh] w-[620px] max-w-[calc(100vw-2rem)] rounded-xl border border-border-subtle bg-white p-0 font-sans text-ink-primary shadow-2xl backdrop:bg-slate-900/30">
      <form onSubmit={save} className="flex max-h-[94vh] flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle bg-surface-panel p-5">
          <h2 id="editor-title" className="text-lg font-semibold">{isNew ? 'Add task' : 'Edit task'}</h2>
          <button type="button" aria-label="Close task editor" onClick={onClose} className={buttonStyle}>✕</button>
        </header>
        <div className="space-y-5 overflow-y-auto p-5">
          <div><label htmlFor="task-title" className="text-sm font-medium">Task title</label><input id="task-title" autoFocus required name="title" value={draft.title} onChange={change} className={inputStyle} placeholder="What needs to be done?" /></div>
          <div><label htmlFor="task-description" className="text-sm font-medium">Description</label><textarea id="task-description" name="description" value={draft.description} onChange={change} rows={4} className={inputStyle} placeholder="Describe the work and its outcome." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="task-type" className="text-sm font-medium">Type</label><select id="task-type" name="type" value={draft.type} onChange={change} className={inputStyle}><option value="feature">Feature</option><option value="bug">Bug</option></select></div>
            <div><label htmlFor="task-status" className="text-sm font-medium">Status</label><select id="task-status" name="status" value={draft.status} onChange={change} className={inputStyle}>{stages.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></div>
            <div><label htmlFor="task-assignee" className="text-sm font-medium">Assignee</label><select id="task-assignee" name="assignee" value={draft.assignee} onChange={change} className={inputStyle}>{[...new Set([...team, draft.assignee])].map(name => <option key={name}>{name}</option>)}</select></div>
            <div><label htmlFor="task-due-date" className="text-sm font-medium">Due date (optional)</label><input id="task-due-date" type="date" name="dueDate" value={draft.dueDate || ''} onChange={change} className={inputStyle} /></div>
          </div>
          <section className="rounded-lg border border-indigo-200 bg-surface-panel p-4" aria-labelledby="context-heading">
            <h3 id="context-heading" className="mb-2 font-semibold">AI briefing</h3>
            <label htmlFor="task-context" className="text-sm font-medium">Context</label>
            <p id="context-help" className="mt-1 text-xs leading-5 text-ink-muted">Keep a paste-ready briefing here: requirements, decisions, AI conversation summaries, debugging logs, errors and next steps.</p>
            <textarea
              id="task-context"
              name="context"
              value={draft.context}
              onChange={change}
              rows={9}
              aria-describedby="context-help"
              className={`${inputStyle} resize-y font-mono leading-6`}
              placeholder={'Goal:\nRequirements:\nDecisions so far:\nWhat I tried / errors:\nNext steps:'}
            />
            <p className="mt-2 text-xs text-ink-muted">Plain text and Markdown supported. Line breaks are preserved.</p>
          </section>
          <p className="text-xs text-ink-muted">Changes are saved in this browser when you select Save Changes.</p>
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {confirmDelete && <div className="rounded-md border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-900">Delete this task? This cannot be undone.</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => { if (!onDelete(task.id)) setError('Could not delete from browser storage. Please try again.'); }} className={`${buttonStyle} bg-red-700 text-white`}>Confirm delete</button><button type="button" onClick={() => setConfirmDelete(false)} className={buttonStyle}>Keep task</button></div></div>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-panel p-5">
          {!isNew ? <button type="button" onClick={() => setConfirmDelete(true)} className={`${buttonStyle} text-red-700`}>Delete task</button> : <span />}
          <div className="flex gap-2"><button type="button" onClick={onClose} className={buttonStyle}>Discard</button><button type="submit" className={`${buttonStyle} bg-brand-action font-medium text-white`}>Save Changes</button></div>
        </footer>
      </form>
    </dialog>
  );
}
