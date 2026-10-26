import { useRef, useState } from 'react';
import { useLanguage } from './Language';
import { allMembers } from './teams';

const control = 'rounded-md border border-border-subtle px-3 py-2 text-sm';
export default function TeamMembers({ teams, selectedId, onChange }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [mode, setMode] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef(null);
  const selector = useRef(null);
  const team = teams.find(item => item.id === selectedId);

  function reset() {
    setMode(null); setRemoving(null); setName(''); setError(''); setNotice('');
  }
  function save(next, id, message) {
    if (!onChange(next, id)) {
      setError('Could not save team changes. Please try again.');
      return false;
    }
    reset(); setNotice(message);
    requestAnimationFrame(() => (selector.current ?? document.getElementById('new-team'))?.focus());
    return true;
  }
  function add(event) {
    event.preventDefault();
    const member = name.trim();
    setNotice('');
    if (!member || team.members.some(existing => existing.toLowerCase() === member.toLowerCase())) {
      setError(member ? 'A team member with that name already exists.' : 'Enter a member name.');
      input.current?.focus(); return;
    }
    const canonical = allMembers(teams).find(existing => existing.toLowerCase() === member.toLowerCase()) ?? member;
    if (save(teams.map(item => item.id === team.id ? { ...item, members: [...item.members, canonical] } : item), team.id, t('{0} added to the team.', canonical))) {
      requestAnimationFrame(() => input.current?.focus());
    }
  }
  function saveTeam(event) {
    event.preventDefault();
    if (mode === 'create' && teams.length) { setError('Only one team is allowed.'); return; }
    const title = teamName.trim();
    if (!title) { setError('Enter a team name.'); return; }
    if (teams.some(item => (mode !== 'rename' || item.id !== team.id) && item.name.toLowerCase() === title.toLowerCase())) {
      setError('A team with that name already exists.'); return;
    }
    const id = mode === 'rename' ? team.id : crypto.randomUUID();
    const next = mode === 'rename' ? teams.map(item => item.id === id ? { ...item, name: title } : item) : [...teams, { id, name: title, members: [] }];
    save(next, id, t('Team saved.'));
  }
  function remove() {
    const next = removing.kind === 'team' ? teams.filter(item => item.id !== team.id) : teams.map(item => item.id === team.id ? { ...item, members: item.members.filter(member => member !== removing.name) } : item);
    save(next, removing.kind === 'team' ? next[0]?.id ?? null : team.id, t('Removed. Tickets and sprints have been kept.'));
  }
  return <section aria-labelledby="team-heading" className="rounded-xl border border-border-subtle bg-surface-card p-5 sm:p-8">
    <h1 id="team-heading" tabIndex={-1} className="text-2xl font-semibold">{t('Teams')}</h1>
    <p className="mt-2 text-sm text-ink-muted">{t('You can have one team. Delete your current team before creating another.')}</p>
    {team ? <h2 ref={selector} tabIndex={-1} className="mt-6 break-words text-xl font-semibold">{team.name}</h2> : <p className="mt-2 text-sm">{t('No teams yet. Create a team to add members.')}</p>}
    <div className="mt-2 flex flex-wrap gap-2">
      {!team && <button id="new-team" type="button" className={control} onClick={() => { reset(); setMode('create'); setTeamName(''); }}>{t('Create team')}</button>}
      {team && <><button type="button" className={control} onClick={() => { reset(); setMode('rename'); setTeamName(team.name); }}>{t('Rename team')}</button><button type="button" className={`${control} text-type-bug`} onClick={() => { reset(); setRemoving({ kind: 'team', name: team.name }); }}>{t('Delete team')}</button></>}
    </div>
    {mode && <form onSubmit={saveTeam} className="mt-3 space-y-2">
      <label htmlFor="team-name" className="text-sm">{t('Team name')}</label>
      <input autoFocus id="team-name" required maxLength={80} value={teamName} onChange={event => { setTeamName(event.target.value); setError(''); }} className={`${control} w-full bg-surface-card`} />
      <button className={`${control} bg-brand-action text-white`}>{t('Save team')}</button> <button type="button" className={control} onClick={() => { reset(); (selector.current ?? document.getElementById('new-team'))?.focus(); }}>{t('Cancel')}</button>
    </form>}
    {removing && <div className="mt-3 rounded-md border border-border-subtle p-3" role="group" aria-label={t('Confirm removal')}>
      <p className="text-sm">{t('Remove {0}? Affected tickets will become unassigned. Tickets and sprints will be kept.', removing.name)}</p>
      <div className="mt-2 flex flex-wrap gap-2"><button autoFocus type="button" className={control} onClick={() => { reset(); selector.current?.focus(); }}>{t('Cancel')}</button><button type="button" className={`${control} bg-red-700 text-white`} onClick={remove}>{t('Confirm removal')}</button></div>
    </div>}
    {team && <>
      <ul className="mt-2 space-y-1 text-sm">{team.members.map(member => <li key={member} className="flex items-center justify-between gap-2 py-1"><span className="min-w-0 break-words">{member}</span><button type="button" aria-label={t('Remove {0}', member)} className={`${control} shrink-0 text-type-bug`} onClick={() => { reset(); setRemoving({ kind: 'member', name: member }); }}>{t('Remove')}</button></li>)}</ul>
      {!team.members.length && <p className="mt-2 text-sm text-ink-muted">{t('No members yet.')}</p>}
      <form onSubmit={add} className="mt-3">
        <label htmlFor="member-name" className="text-sm font-medium">{t('Member name')}</label>
        <input ref={input} id="member-name" required maxLength={80} value={name} onChange={event => { setName(event.target.value); setError(''); setNotice(''); }} className={`${control} mt-1 w-full bg-surface-card`} />
        <button type="submit" className={`${control} mt-2 bg-brand-action text-white`}>{t('Add member')}</button>
      </form>
    </>}
    {error && <p role="alert" className="mt-2 text-sm text-type-bug">{t(error)}</p>}
    <p role="status" className={notice ? 'mt-2 text-xs text-brand-link' : 'sr-only'}>{notice}</p>
  </section>;
}
