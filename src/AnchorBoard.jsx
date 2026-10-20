import { useRef, useState } from 'react';

export const INITIAL_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

function webUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function AnchorBoard({ anchors, onSave }) {
  const [editing, setEditing] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const trigger = useRef(null);
  const button = 'rounded-md px-3 py-2 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-action';
  function edit(anchor, event) {
    trigger.current = event.currentTarget;
    setEditing(anchor.id);
    setUrl(anchor.url || '');
    setError('');
    setMessage('');
  }
  function cancel() {
    setEditing(null);
    setError('');
    trigger.current?.focus();
  }
  function save(event) {
    event.preventDefault();
    const trimmed = url.trim();
    const destination = trimmed ? webUrl(trimmed) : null;
    if (trimmed && !destination) {
      setError('Enter a complete http:// or https:// URL.');
      return;
    }
    if (!onSave(anchors.map(anchor => anchor.id === editing ? { ...anchor, url: destination } : anchor))) {
      setError('Could not save the link to browser storage. Please try again.');
      return;
    }
    const label = anchors.find(anchor => anchor.id === editing).label;
    setMessage(destination ? `${label} link saved.` : `${label} link removed.`);
    cancel();
  }
  return (
    <section aria-labelledby="deliverables-heading" className="sticky top-0 z-10 mb-5 rounded-xl border border-border-subtle bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="deliverables-heading" className="flex items-center gap-2 text-base font-semibold text-brand-action">
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6l-1 6 4 4v2H6v-2l4-4-1-6Zm3 12v6" /></svg>
          Project deliverables
        </h2>
        <span className="text-xs text-ink-muted">{anchors.filter(anchor => webUrl(anchor.url)).length} / 4 linked</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {anchors.map(anchor => {
          const destination = webUrl(anchor.url);
          return (
            <div key={anchor.id} className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-border-subtle bg-surface-panel p-1">
              {destination ? <a href={destination} target="_blank" rel="noopener noreferrer" className={`${button} min-w-0 break-words text-brand-action hover:underline`} aria-label={`Open ${anchor.label} (new tab)`}>{anchor.label} <span aria-hidden="true">↗</span></a> : <span className="px-3 text-sm text-ink-body">{anchor.label}</span>}
              <button type="button" onClick={event => edit(anchor, event)} className={`${button} shrink-0 text-brand-action hover:bg-surface-selected`} aria-label={`${destination ? 'Edit' : 'Add'} ${anchor.label} link`}>{destination ? 'Edit' : '+ Link'}</button>
            </div>
          );
        })}
      </div>
      {editing && <form onSubmit={save} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); cancel(); } }} className="mt-4 border-t border-border-subtle pt-4">
        <label htmlFor="deliverable-url" className="text-sm font-medium">{anchors.find(anchor => anchor.id === editing).label} URL</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input id="deliverable-url" autoFocus type="text" inputMode="url" value={url} onChange={event => { setUrl(event.target.value); setError(''); }} aria-describedby="deliverable-help" aria-invalid={!!error} placeholder="https://…" className="min-w-0 flex-1 rounded-md border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          <button type="submit" className={`${button} bg-brand-action text-white`}>Save link</button>
          <button type="button" onClick={cancel} className={`${button} bg-surface-panel`}>Cancel</button>
        </div>
        <p id="deliverable-help" className="mt-2 text-xs text-ink-muted">Use a web link. Clear the field and save to remove it.</p>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      </form>}
      <p role="status" aria-live="polite" className={message ? 'mt-2 text-xs text-due-safe' : 'sr-only'}>{message}</p>
    </section>
  );
}
