import { useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [message, setMessage] = useState('');
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem('vibetracker.theme', next);
      setMessage('');
    } catch {
      setMessage('Theme changed for this visit. Browser storage is unavailable.');
    }
  }
  return <div className="mt-6 border-t border-border-subtle pt-4">
    <button type="button" role="switch" aria-checked={theme === 'dark'} aria-label="Dark mode" onClick={toggle} className="flex w-full items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm text-ink-primary">
      <span className="flex items-center gap-2"><span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
      <span aria-hidden="true" className={`flex h-6 w-10 items-center rounded-full p-1 ${theme === 'dark' ? 'justify-end bg-brand-action' : 'justify-start bg-slate-500'}`}><span className="h-4 w-4 rounded-full bg-white" /></span>
    </button>
    <p role="status" className={message ? 'mt-2 text-xs text-ink-muted' : 'sr-only'}>{message}</p>
  </div>;
}
