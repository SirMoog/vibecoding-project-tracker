import { getMetrics } from './boardMetrics';

const colours = ['bg-brand-primary', 'bg-brand-accent', 'bg-brand-secondary', 'bg-slate-400'];
function BarChart({ title, subtitle, rows, total, palette = colours }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-5" aria-label={title}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-5 mt-1 text-xs text-ink-muted">{subtitle}</p>
      {rows.length ? <ul className="space-y-4">{rows.map((row, index) => (
        <li key={row.label}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="min-w-0 break-words">{row.label}</span><span className="font-mono text-ink-muted">{row.value}</span></div>
          <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-surface-panel"><div className={`h-full rounded-full transition-all duration-200 ${palette[index % palette.length]}`} style={{ width: `${total ? row.value / total * 100 : 0}%` }} /></div>
        </li>
      ))}</ul> : <p className="py-6 text-sm text-ink-muted">No open tasks to show.</p>}
    </section>
  );
}

export default function BoardInsights({ tasks, stages, now }) {
  const metrics = getMetrics(tasks, stages, now);
  return (
    <section id="insights" tabIndex={-1} className="mt-8 border-t border-border-subtle pt-6" aria-labelledby="insights-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">Board insights</p><h2 id="insights-heading" className="text-xl font-semibold">Your workflow at a glance</h2></div>
        <p className="text-xs text-ink-muted">Live snapshot · Updates as your board changes</p>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['Total tasks', metrics.total], ['Open tasks', metrics.open], ['Work in progress', metrics.wip], ['Overdue tasks', metrics.deadlines.overdue]].map(([label, value]) => <div key={label} className="rounded-lg border border-border-subtle bg-surface-card p-4"><p className="text-xs text-ink-muted">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>{label === 'Work in progress' && <p className="mt-1 text-xs text-ink-muted">In Progress + Review</p>}</div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <BarChart title="Tasks by stage" subtitle="Distribution across the whole board" rows={metrics.stages} total={metrics.total} palette={['bg-slate-400', 'bg-brand-primary', 'bg-brand-accent', 'bg-brand-secondary']} />
        <section className="rounded-xl border border-border-subtle bg-surface-card p-5" aria-label="Completion rate">
          <h3 className="font-semibold">Completion rate</h3><p className="mt-1 text-xs text-ink-muted">Completed tasks out of all tasks</p>
          <div className="mx-auto my-5 flex h-36 w-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--brand-secondary) ${metrics.completion}%, var(--surface-panel) 0)` }}>
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface-card"><span className="text-3xl font-semibold">{metrics.completion}%</span><span className="mt-1 text-xs text-ink-muted">complete</span></div>
          </div>
          <p className="text-center text-sm text-ink-muted">{metrics.total ? `${metrics.done} of ${metrics.total} tasks done` : 'No tasks yet'}</p>
        </section>
        <BarChart title="Features vs bugs" subtitle="Task types across the whole board" rows={metrics.types} total={metrics.total} palette={['bg-type-feature', 'bg-type-bug']} />
        <BarChart title="Deadline health" subtitle="Open tasks only · Due soon = today or tomorrow" rows={[
          { label: 'Overdue', value: metrics.deadlines.overdue },
          { label: 'Due soon', value: metrics.deadlines.warning },
          { label: 'Upcoming', value: metrics.deadlines.safe },
          { label: 'No valid due date', value: metrics.deadlines.neutral },
        ]} total={metrics.open} palette={['bg-type-bug', 'bg-amber-500', 'bg-brand-secondary', 'bg-slate-400']} />
        <BarChart title="Workload by assignee" subtitle="Open tasks assigned to each person" rows={metrics.assignees} total={metrics.open} />
      </div>
    </section>
  );
}
