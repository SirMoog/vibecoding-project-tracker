import { useRef, useState } from 'react';
import { useLanguage } from './Language';

export default function TeamMembers({ team, onAdd }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');
  const input = useRef(null);

  function add(event) {
    event.preventDefault();
    const member = name.trim();
    setAdded('');
    if (!member || team.some(existing => existing.toLowerCase() === member.toLowerCase())) {
      setError(member ? 'A team member with that name already exists.' : 'Enter a member name.');
      input.current?.focus();
      return;
    }
    if (!onAdd(member)) {
      setError('Could not save the member. Your name is still here. Please try again.');
      return;
    }
    setName('');
    setError('');
    setAdded(member);
    input.current?.focus();
  }

  return <section aria-labelledby="team-heading" className="mt-6 border-t border-border-subtle pt-4">
    <h2 id="team-heading" className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{t('Team')}</h2>
    <ul className="mt-2 space-y-1 text-sm">{team.map(member => <li key={member} className="break-words px-2 py-1">{member}</li>)}</ul>
    <form onSubmit={add} className="mt-3">
      <label htmlFor="member-name" className="text-sm font-medium">{t('Member name')}</label>
      <input ref={input} id="member-name" required maxLength={80} value={name} onChange={event => {
        setName(event.target.value);
        setError('');
        setAdded('');
      }} aria-invalid={Boolean(error)} aria-describedby={error ? 'member-error' : undefined} className="mt-1 w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm" />
      <button type="submit" className="mt-2 rounded-md border border-border-subtle bg-brand-action px-3 py-2 text-sm text-white">{t('Add member')}</button>
      {error && <p id="member-error" role="alert" className="mt-2 text-sm text-type-bug">{t(error)}</p>}
      <p role="status" className={added ? 'mt-2 text-xs text-brand-link' : 'sr-only'}>{added ? t('{0} added to the team.', added) : ''}</p>
    </form>
  </section>;
}
