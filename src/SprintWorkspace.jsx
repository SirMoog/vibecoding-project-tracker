import { LanguageSelect, useLanguage } from "./Language";
import { useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import TeamMembers from './TeamMembers';
import { allMembers, migrateTeams, replaceTeams } from './teams';
const STORAGE_KEY = 'vibetracker.sprints.v1';
const control = 'rounded-md border border-border-subtle px-3 py-2 text-sm';
function loadTeam(saved, initialTeam, tasks) {
  if (saved !== undefined && (!Array.isArray(saved) || !saved.every(name => typeof name === 'string' && name.trim()))) throw new Error('Invalid team data');
  const names = [...(saved ?? initialTeam), ...tasks.map(task => task.assignee).filter(name => typeof name === 'string' && name.trim())];
  const seen = new Set();
  return names.map(name => name.trim()).filter(name => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function loadWorkspace(initialTasks, initialAnchors, initialTeam) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const data = JSON.parse(saved);
      if (data.version !== 1 || !Array.isArray(data.sprints) || !data.sprints.every(sprint => typeof sprint.id === 'string' && typeof sprint.name === 'string' && Array.isArray(sprint.tasks) && Array.isArray(sprint.anchors))) throw new Error('Invalid sprint data');
      const teams = migrateTeams(data, data.teams === undefined ? loadTeam(data.team, initialTeam, data.sprints.flatMap(sprint => sprint.tasks)) : []);
      const { team: legacyTeam, ...rest } = data;
      return {
        data: {
          ...rest,
          teams,
          selectedTeamId: teams.some(team => team.id === data.selectedTeamId) ? data.selectedTeamId : teams[0]?.id ?? null,
          selectedId: data.sprints.some(sprint => sprint.id === data.selectedId) ? data.selectedId : data.sprints[0]?.id ?? null
        },
        error: ''
      };
    }
    const savedTasks = localStorage.getItem('vibetracker.tasks');
    const savedAnchors = localStorage.getItem('vibetracker.anchors');
    const fresh = savedTasks === null && savedAnchors === null;
    const tasks = JSON.parse(savedTasks ?? 'null') ?? initialTasks;
    const anchors = JSON.parse(savedAnchors ?? 'null') ?? initialAnchors;
    if (!Array.isArray(tasks) || !Array.isArray(anchors)) throw new Error('Invalid existing board');
    const data = {
      version: 1,
      teams: migrateTeams({}, loadTeam(undefined, initialTeam, tasks)),
      selectedTeamId: 'team-1',
      selectedId: 'sprint-1',
      sprints: [{ id: 'sprint-1', name: 'Sprint 1', tasks, anchors },
        ...(fresh ? [{ id: 'sprint-2', name: 'Sprint 2', tasks: [], anchors: initialAnchors.map(anchor => ({ ...anchor, url: null })) }] : [])]
    };
    // Save the initial demo once so relative dates do not move on every reload.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { data, error: '' };
  } catch {
    return {
      data: null,
      error: 'Could not read saved sprint data. Your stored data has not been changed. Check browser storage access and reload.'
    };
  }
}
export default function SprintWorkspace({
  initialTasks,
  initialAnchors,
  initialTeam,
  children
}) {
  const {
    t
  } = useLanguage();
  const [loaded] = useState(() => loadWorkspace(initialTasks, initialAnchors, initialTeam));
  const [workspace, setWorkspace] = useState(loaded.data);
  const [error, setError] = useState(loaded.error);
  const [view, setView] = useState('board');
  const teamsButton = useRef(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const editButton = useRef(null);
  const deleteButton = useRef(null);
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const selector = useRef(null);
  const newButton = useRef(null);
  const sprint = workspace?.sprints.find(item => item.id === workspace.selectedId);
  function commit(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setWorkspace(next);
      setError('');
      return true;
    } catch {
      setError('Could not save sprint changes to this browser. Nothing was changed. Enable storage or free up space and try again.');
      return false;
    }
  }
  function showTeams() {
    setView('teams');
    setCreating(false);
    setRenaming(false);
    setDeleting(false);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => document.getElementById('team-heading')?.focus());
  }
  function backToBoard() {
    setView('board');
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => teamsButton.current?.focus());
  }
  function select(id) {
    if (!workspace.sprints.some(item => item.id === id)) return;
    if (commit({
      ...workspace,
      selectedId: id
    })) {
      setView('board');
      setCreating(false);
      setDeleting(false);
      setRenaming(false);
      setNotice(`Selected ${workspace.sprints.find(item => item.id === id).name}.`);
      window.scrollTo({
        top: 0
      });
    }
  }
  function create(event) {
    event.preventDefault();
    const title = name.trim();
    if (!title) {
      setError('Enter a sprint name.');
      return;
    }
    if (workspace.sprints.some(item => item.name.toLowerCase() === title.toLowerCase())) {
      setError('A sprint with that name already exists. Choose another name.');
      return;
    }
    const next = {
      id: crypto.randomUUID(),
      name: title,
      tasks: [],
      anchors: initialAnchors.map(anchor => ({
        ...anchor,
        url: null
      }))
    };
    if (commit({
      ...workspace,
      selectedId: next.id,
      sprints: [...workspace.sprints, next]
    })) {
      setName('');
      setView('board');
      setCreating(false);
      setDeleting(false);
      setRenaming(false);
      setNotice(`${title} created. Your new board is empty.`);
      window.scrollTo({
        top: 0
      });
      requestAnimationFrame(() => selector.current?.focus({
        preventScroll: true
      }));
    }
  }
  function rename(event) {
    event.preventDefault();
    const title = name.trim();
    if (!title) {
      setError('Enter a sprint name.');
      return;
    }
    if (workspace.sprints.some(item => item.id !== sprint.id && item.name.toLowerCase() === title.toLowerCase())) {
      setError('A sprint with that name already exists. Choose another name.');
      return;
    }
    if (updateSprint({
      name: title
    })) {
      setRenaming(false);
      setNotice(`Sprint renamed to ${title}.`);
      requestAnimationFrame(() => editButton.current?.focus());
    }
  }
  function remove() {
    const remaining = workspace.sprints.filter(item => item.id !== sprint.id);
    if (commit({
      ...workspace,
      sprints: remaining,
      selectedId: remaining[0]?.id ?? null
    })) {
      setDeleting(false);
      setNotice(`${sprint.name} deleted.`);
      window.scrollTo({
        top: 0
      });
      requestAnimationFrame(() => (remaining.length ? selector.current : newButton.current)?.focus({
        preventScroll: true
      }));
    }
  }
  function transferTask(taskId, destinationId) {
    const source = sprint;
    const destination = workspace.sprints.find(item => item.id === destinationId);
    const task = source.tasks.find(item => item.id === taskId);
    if (!task || !destination || destination.id === source.id || destination.tasks.some(item => item.id === taskId)) return false;
    const sprints = workspace.sprints.map(item => item.id === source.id ? {
      ...item,
      tasks: item.tasks.filter(task => task.id !== taskId)
    } : item.id === destination.id ? {
      ...item,
      tasks: [...item.tasks, task]
    } : item);
    if (!commit({
      ...workspace,
      sprints
    })) return false;
    setNotice(`Moved ${task.title} to ${destination.name}.`);
    requestAnimationFrame(() => document.getElementById('add-task')?.focus());
    return true;
  }
  function updateSprint(patch) {
    return commit({
      ...workspace,
      sprints: workspace.sprints.map(item => item.id === sprint.id ? {
        ...item,
        ...patch
      } : item)
    });
  }
  if (!workspace) return <main className="p-6"><h1 className="text-xl font-semibold">{t("Sprint workspace")}</h1><p role="alert" className="mt-4 text-type-bug">{t(error)}</p></main>;
  const sprintForm = isRename => <form onSubmit={isRename ? rename : create} className="mt-3 rounded-lg border border-border-subtle bg-surface-card p-3" onKeyDown={event => {
    if (event.key === 'Escape') {
      setCreating(false);
      setRenaming(false);
      setError('');
      (isRename ? editButton : newButton).current?.focus();
    }
  }}>
    <label htmlFor="sprint-name" className="text-sm font-medium">{t("Sprint name")}</label>
    <input autoFocus id="sprint-name" required maxLength={80} value={name} onChange={event => {
      setName(event.target.value);
      setError('');
    }} placeholder={t("e.g. Sprint 2")} className={`${control} mt-2 w-full bg-surface-card`} />
    {!isRename && <p className="mt-2 text-xs text-ink-muted">{t("A fresh board for your next batch of work.")}</p>}
    <div className="mt-3 flex flex-wrap gap-2"><button type="submit" className={`${control} bg-brand-action text-white`}>{isRename ? t("Save sprint") : t("Create sprint")}</button><button type="button" onClick={() => {
        setCreating(false);
        setRenaming(false);
        setError('');
        (isRename ? editButton : newButton).current?.focus();
      }} className={control}>{t("Cancel")}</button></div>
  </form>;
  const sprintFooter = <footer aria-label={t("Sprint settings")} className="mt-8 border-t border-border-subtle pt-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-semibold">{t("Sprint settings")}</h2><p className="mt-1 text-sm text-ink-muted">{t("Rename this sprint or remove it from your workspace.")}</p></div>
      <div className="flex flex-wrap gap-2">
        <button ref={editButton} type="button" onClick={() => {
          setRenaming(true);
          setCreating(false);
          setDeleting(false);
          setName(sprint.name);
          setError('');
        }} className={`${control} bg-surface-card`}>{t("Edit sprint")}</button>
        <button ref={deleteButton} type="button" onClick={() => {
          setDeleting(true);
          setCreating(false);
          setRenaming(false);
          setError('');
        }} className={`${control} bg-surface-card text-type-bug`}>{t("Delete sprint")}</button>
      </div>
    </div>
    {renaming && <div className="max-w-lg">{sprintForm(true)}</div>}
    {deleting && <div role="group" aria-label={t("Confirm sprint deletion")} className="mt-3 max-w-xl rounded-lg border border-border-subtle bg-surface-card p-4">
      <p className="text-sm">{t("Delete {0}? This permanently removes its {1} tasks, saved context and deliverable links.", sprint?.name, sprint?.tasks.length)}</p>
      <div className="mt-3 flex flex-wrap gap-2"><button autoFocus type="button" onClick={() => {
          setDeleting(false);
          setError('');
          deleteButton.current?.focus();
        }} className={control}>{t("Keep sprint")}</button><button type="button" onClick={remove} className={`${control} bg-red-700 text-white`}>{t("Confirm delete sprint")}</button></div>
    </div>}
    {(renaming || deleting) && error && <p role="alert" className="mt-2 text-sm text-type-bug">{t(error)}</p>}
  </footer>;
  return <div className="min-h-screen bg-surface-page font-sans text-ink-primary lg:flex">
      {sprint && view === 'board' && <nav aria-label={t("Skip links")} className="skip-links">
        <a href="#kanban" onClick={() => requestAnimationFrame(() => document.getElementById('kanban')?.focus())}>{t("Skip to task board")}</a>
        <a href="#insights" onClick={() => requestAnimationFrame(() => document.getElementById('insights')?.focus())}>{t("Skip to board insights")}</a>
      </nav>}
      <aside aria-label={t("Workspace sidebar")} className="shrink-0 border-b border-border-subtle bg-surface-panel p-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="mb-8 flex items-center gap-3 px-2 py-2"><span aria-hidden="true" className="rounded-md bg-brand-action px-2 py-1 text-white">▥</span><span className="text-lg font-semibold">FlowTask</span></div>
        <nav aria-label={t("Sprints")}>
          <div className="mb-3 flex items-center justify-between px-2"><h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{t("Sprints")}</h2><span className="text-xs text-ink-muted">{workspace.sprints.length}</span></div>
          <ul className="space-y-1">{workspace.sprints.map(item => <li key={item.id}>
            <button ref={item.id === workspace.selectedId ? selector : null} type="button" aria-current={view === 'board' && item.id === workspace.selectedId ? 'page' : undefined} onClick={() => select(item.id)} className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm ${view === 'board' && item.id === workspace.selectedId ? 'bg-surface-selected font-semibold text-brand-link' : 'text-ink-body hover:bg-surface-card'}`}>
              <span className="min-w-0 break-words">{item.name}</span><span className="shrink-0 text-xs" aria-label={t("{0} tasks", item.tasks.length)}>{item.tasks.length}</span>
            </button>
          </li>)}</ul>
          <button ref={newButton} type="button" onClick={() => {
          setCreating(true);
          setRenaming(false);
          setDeleting(false);
          setName('');
          setError('');
        }} className="mt-3 w-full rounded-md border border-dashed border-brand-link px-3 py-2 text-left text-sm font-medium text-brand-link hover:bg-surface-card">{t("+ New sprint")}</button>
        </nav>
        {creating && sprintForm(false)}
        {!renaming && !deleting && error && <p role="alert" className="mt-2 text-sm text-type-bug">{t(error)}</p>}
        <p role="status" aria-live="polite" className={notice ? 'mt-4 text-xs text-brand-link' : 'sr-only'}>{t(notice)}</p>
        <nav aria-label={t('Workspace settings')} className="mt-6 border-t border-border-subtle pt-4">
          <button ref={teamsButton} id="teams-button" type="button" onClick={showTeams} aria-current={view === 'teams' ? 'page' : undefined} className={`w-full rounded-md px-3 py-2 text-left text-sm ${view === 'teams' ? 'bg-surface-selected font-semibold text-brand-link' : 'text-ink-body hover:bg-surface-card'}`}>{t('Teams')}</button>
        </nav>
        <ThemeToggle /><LanguageSelect />
        <p className="mt-4 text-xs text-ink-muted">{t("Your sprints, saved in this browser.")}</p>
      </aside>
      <div className="min-w-0 flex-1">
        {view === 'teams' ? <main className="mx-auto w-full max-w-4xl p-4 sm:p-8">
          <button type="button" onClick={backToBoard} className={`${control} mb-6 bg-surface-card text-brand-link`}>{t('Back to board')}</button>
          <TeamMembers teams={workspace.teams} selectedId={workspace.selectedTeamId}
            onChange={(teams, selectedId) => commit(replaceTeams(workspace, teams, selectedId))} />
        </main> : sprint ? children({
        sprint,
        sprintFooter,
        team: allMembers(workspace.teams),
        sprints: workspace.sprints,
        transferTask,
        saveTasks: tasks => updateSprint({
          tasks
        }),
        saveAnchors: anchors => updateSprint({
          anchors
        })
      }) : <main className="p-8 text-center"><h1 className="text-2xl font-semibold">{t("Create your next sprint")}</h1><p className="mt-3 text-ink-muted">{t("Choose New sprint in the sidebar to start a fresh board.")}</p></main>}
      </div>
    </div>;
}
