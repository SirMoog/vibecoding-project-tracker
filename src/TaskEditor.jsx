import { useLanguage } from "./Language";
import { useEffect, useRef, useState } from 'react';
const inputStyle = 'mt-1 w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';
const buttonStyle = 'rounded-md border border-border-subtle px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-link';
export default function TaskEditor({
  task,
  isNew,
  stages,
  team,
  onSave,
  onDelete,
  onClose
}) {
  const {
    t
  } = useLanguage();
  const [draft, setDraft] = useState(() => ({
    ...task,
    context: task.context ?? ''
  }));
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [copying, setCopying] = useState(false);
  const contextInput = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef(null);
  const returnFocus = useRef(document.activeElement);
  const keepTaskButton = useRef(null);
  const deleteButton = useRef(null);
  useEffect(() => {
    const previousFocus = returnFocus.current;
    const element = dialog.current;
    element.showModal();
    element.querySelector('#task-title')?.focus();
    return () => {
      element.close();
      if (previousFocus?.isConnected) previousFocus.focus();else document.getElementById('add-task')?.focus();
    };
  }, []);
  useEffect(() => {
    if (confirmDelete) keepTaskButton.current?.focus();
  }, [confirmDelete]);
  function change(event) {
    const {
      name,
      value
    } = event.target;
    setDraft(current => ({
      ...current,
      [name]: value
    }));
    setError('');
    if (name === 'context') setCopyStatus('');
  }
  function keepFocusInside(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  async function copyContext() {
    setCopying(true);
    setCopyStatus('');
    try {
      await navigator.clipboard.writeText(draft.context);
      setCopyStatus('Context copied. Ready to paste into your AI tool.');
    } catch {
      contextInput.current?.focus();
      contextInput.current?.select();
      setCopyStatus('Could not access the clipboard. Context selected—press Ctrl+C or ⌘C to copy.');
    } finally {
      setCopying(false);
    }
  }
  function save(event) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Enter a task title.');
      document.getElementById('task-title')?.focus();
      return;
    }
    const contextChanged = draft.context !== (task.context ?? '');
    if (!onSave({
      ...draft,
      title: draft.title.trim(),
      dueDate: draft.dueDate || null,
      contextUpdatedAt: contextChanged ? new Date().toISOString() : task.contextUpdatedAt ?? null
    })) {
      setError('Could not save to browser storage. Your edits are still here. Enable storage or free up space, then try again.');
    }
  }
  return <dialog ref={dialog} aria-labelledby="editor-title" onKeyDown={keepFocusInside} onCancel={event => {
    event.preventDefault();
    onClose();
  }} className="fixed inset-y-0 left-auto right-4 m-auto max-h-[94vh] w-[620px] max-w-[calc(100vw-2rem)] rounded-xl border border-border-subtle bg-surface-card p-0 font-sans text-ink-primary shadow-2xl backdrop:bg-slate-900/30">
      <form onSubmit={save} className="flex max-h-[94vh] flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface-panel p-5">
          <h2 id="editor-title" className="text-lg font-semibold">{isNew ? t("Add task") : t("Edit task")}</h2>
          <button type="button" aria-label={t("Close task editor")} onClick={onClose} className={buttonStyle}>✕</button>
        </header>
        <div className="space-y-5 overflow-y-auto p-5">
          <div><label htmlFor="task-title" className="text-sm font-medium">{t("Task title")}</label><input id="task-title" autoFocus required name="title" value={draft.title} onChange={change} className={inputStyle} placeholder={t("What needs to be done?")} /></div>
          <div><label htmlFor="task-description" className="text-sm font-medium">{t("Description")}</label><textarea id="task-description" name="description" value={draft.description} onChange={change} rows={4} className={inputStyle} placeholder={t("Describe the work and its outcome.")} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label htmlFor="task-type" className="text-sm font-medium">{t("Type")}</label><select id="task-type" name="type" value={draft.type} onChange={change} className={inputStyle}><option value="feature">{t("Feature")}</option><option value="bug">{t("Bug")}</option></select></div>
            <div><label htmlFor="task-status" className="text-sm font-medium">{t("Status")}</label><select id="task-status" name="status" value={draft.status} onChange={change} className={inputStyle}>{stages.map(stage => <option key={stage.id} value={stage.id}>{t(stage.label)}</option>)}</select></div>
            <div><label htmlFor="task-assignee" className="text-sm font-medium">{t("Assignee")}</label><select id="task-assignee" name="assignee" value={draft.assignee} onChange={change} className={inputStyle}><option value="">{t('Unassigned')}</option>{[...new Set([...team, draft.assignee].filter(Boolean))].map(name => <option key={name}>{name}</option>)}</select></div>
            <div><label htmlFor="task-due-date" className="text-sm font-medium">{t("Due date (optional)")}</label><input id="task-due-date" type="date" name="dueDate" value={draft.dueDate || ''} onChange={change} className={inputStyle} /></div>
          </div>
          <section className="rounded-lg border border-border-subtle bg-surface-panel p-4" aria-labelledby="context-heading">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 id="context-heading" className="font-semibold">{t("AI briefing")}</h3>
              <button type="button" onClick={copyContext} disabled={copying || !draft.context.trim()} className={`${buttonStyle} bg-surface-card text-brand-link disabled:cursor-not-allowed disabled:opacity-50`}>
                {copying ? t("Copying\u2026") : t("Copy Context")}
              </button>
            </div>
            <label htmlFor="task-context" className="text-sm font-medium">{t("Context")}</label>
            <p id="context-help" className="mt-1 text-xs leading-5 text-ink-muted">{t("Keep a paste-ready briefing here: requirements, decisions, AI conversation summaries, debugging logs, errors and next steps.")}</p>
            <textarea id="task-context" ref={contextInput} name="context" value={draft.context} onChange={change} rows={9} aria-describedby="context-help" className={`${inputStyle} resize-y font-mono leading-6`} placeholder={t('Goal:\nRequirements:\nDecisions so far:\nWhat I tried / errors:\nNext steps:')} />

            <p className="mt-2 text-xs text-ink-muted">{t("Plain text and Markdown supported. Line breaks are preserved.")}</p>
            <p className="mt-1 text-xs text-ink-muted">{t("Copy includes your current edits. Save Changes to keep them.")}</p>
            <p role="status" aria-live="polite" className="mt-2 text-sm text-brand-link">{t(copyStatus)}</p>
          </section>
          <p className="text-xs text-ink-muted">{t("Changes are saved in this browser when you select Save Changes.")}</p>
          {error && <p role="alert" className="rounded-md bg-tint-bug p-3 text-sm text-type-bug">{t(error)}</p>}
          {confirmDelete && <div className="rounded-md border border-border-subtle bg-tint-bug p-4"><p className="text-sm text-type-bug">{t("Delete this task? This cannot be undone.")}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => {
              if (!onDelete(task.id)) setError('Could not delete from browser storage. Please try again.');
            }} className={`${buttonStyle} bg-red-700 text-white`}>{t("Confirm delete")}</button><button ref={keepTaskButton} type="button" onClick={() => {
              setConfirmDelete(false);
              deleteButton.current?.focus();
            }} className={buttonStyle}>{t("Keep task")}</button></div></div>}
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-panel p-5">
          {!isNew ? <button ref={deleteButton} type="button" onClick={() => setConfirmDelete(true)} className={`${buttonStyle} text-type-bug`}>{t("Delete task")}</button> : <span />}
          <div className="flex gap-2"><button type="button" onClick={onClose} className={buttonStyle}>{t("Discard")}</button><button type="submit" className={`${buttonStyle} bg-brand-action font-medium text-white`}>{t("Save Changes")}</button></div>
        </footer>
      </form>
    </dialog>;
}
