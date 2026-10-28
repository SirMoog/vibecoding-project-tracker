import { useState } from 'react';
import { useLanguage } from './Language';

export function MemberContactFields({ id, email, github, onEmail, onGithub }) {
  const { t } = useLanguage();
  const input = 'mt-1 w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm';
  return <div className="mt-3 grid gap-3 sm:grid-cols-2">
    <div><label htmlFor={`${id}-email`} className="text-sm font-medium">{t('Email (optional)')}</label><input id={`${id}-email`} type="email" maxLength={254} value={email} onChange={event => onEmail(event.target.value)} className={input} placeholder="name@example.com" /></div>
    <div><label htmlFor={`${id}-github`} className="text-sm font-medium">{t('GitHub username or URL (optional)')}</label><input id={`${id}-github`} type="text" maxLength={200} value={github} onChange={event => onGithub(event.target.value)} className={input} placeholder="https://github.com/username" /></div>
  </div>;
}

export default function MemberProfile({ member, profile, onSave }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState(profile?.email ?? '');
  const [github, setGithub] = useState(profile?.github ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  function save(event) {
    event.preventDefault();
    const success = onSave({ name: member, email: email.trim(), github: github.trim() });
    setError(!success);
    setMessage(success ? 'Contact details saved.' : 'Could not save team changes. Please try again.');
  }
  return <details className="mt-2">
    <summary className="cursor-pointer py-2 text-sm text-brand-link">{t('Contact details for {0}', member)}</summary>
    {profile?.isSample && <p className="text-xs text-ink-muted">{t('Fictional sample contact details. Replace with your own.')}</p>}
    <form onSubmit={save}>
      <MemberContactFields id={`contact-${encodeURIComponent(member)}`} email={email} github={github} onEmail={value => { setEmail(value); setMessage(''); }} onGithub={value => { setGithub(value); setMessage(''); }} />
      <button type="submit" className="mt-3 rounded-md border border-border-subtle bg-brand-action px-3 py-2 text-sm text-white">{t('Save contact details')}</button>
      <p role={error ? 'alert' : 'status'} className={`mt-2 text-sm ${error ? 'text-type-bug' : 'text-brand-link'}`}>{t(message)}</p>
    </form>
  </details>;
}
