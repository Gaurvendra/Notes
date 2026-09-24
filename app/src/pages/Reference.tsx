import { ScrollText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, EmptyState, PageHeader, SectionLabel, SegmentedControl, Stat } from '../components/ui'
import { loadAudit, VERDICTS, type AuditItem, type Verdict } from '../lib/audit'
import { curriculum, writtenLessons } from '../lib/curriculum'
import { mdInline } from '../lib/markdown'

/* ------------------------------------------------------------ Cheat sheets */

export function Cheatsheets() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Cheat sheets"
        lead="Every lesson ends with a one-screen summary. This hub collects them; it grows as lessons are written."
      />
      <ul className="grid gap-2 sm:grid-cols-2">
        {writtenLessons.map((l) => (
          <li key={l.id}>
            <Link to={`${l.url}#cheat-sheet`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-cyan/40">
                <ScrollText size={18} className="shrink-0 text-cyan" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{l.label}</span>
                  <span className="block text-xs text-ink-dim">Tier {l.tier} · {l.level}</span>
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------- growing hubs */

/** A hub that aggregates content from lessons that aren't written yet. */
export function GrowingHub({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="max-w-3xl">
      <PageHeader title={title} lead={lead} />
      <EmptyState title="Being built">
        This hub is filled in as lessons are written. It aggregates content from every lesson ({writtenLessons.length} of{' '}
        {curriculum.lessons.length} written so far).
      </EmptyState>
    </div>
  )
}

/* ----------------------------------------------------------- Notes audit */

type VerdictFilter = 'all' | Verdict

export function NotesAudit() {
  const [items, setItems] = useState<Map<string, AuditItem>>()
  const [filter, setFilter] = useState<VerdictFilter>('all')
  useEffect(() => {
    loadAudit().then(setItems)
  }, [])

  const lessonsFor = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const l of curriculum.lessons) for (const a of l.audit) m.set(a, [...(m.get(a) ?? []), l.id])
    return m
  }, [])

  const all = items ? [...items.values()] : []
  const shown = all.filter((i) => filter === 'all' || i.verdicts.includes(filter))
  const byNote = new Map<string, AuditItem[]>()
  for (const i of shown) byNote.set(i.note, [...(byNote.get(i.note) ?? []), i])
  const count = (v: Verdict) => all.filter((i) => i.verdicts.includes(v)).length

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Notes audit"
        lead="Every claim from the source notes, verified: what was right, what needed precision, and what was corrected. Each item links to the lesson that teaches it."
        meta={<Badge tone="primary" mono>{all.length || 305} items</Badge>}
      />
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.keys(VERDICTS) as Verdict[]).map((v) => (
          <Stat key={v} label={VERDICTS[v]} value={`${v} ${items ? count(v) : '…'}`} />
        ))}
      </div>
      <div className="mb-6 overflow-x-auto">
        <SegmentedControl<VerdictFilter>
          label="Verdict"
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, ...(Object.keys(VERDICTS) as Verdict[]).map((v) => ({ value: v, label: `${v} ${VERDICTS[v].split(',')[0]}` }))]}
        />
      </div>
      {!items ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : (
        <div className="space-y-8">
          {[...byNote].map(([note, list]) => (
            <section key={note}>
              <SectionLabel>{note}</SectionLabel>
              <ul className="space-y-2">
                {list.map((item) => (
                  <li key={item.id} className="rounded-xl border border-cyber-border bg-surface p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge mono>{item.id}</Badge>
                      <span className="text-xs text-ink-dim">{item.verdictText.replace(/\*\*/g, '')}</span>
                      <span className="ml-auto flex flex-wrap gap-1">
                        {(lessonsFor.get(item.id) ?? []).map((id) => {
                          const l = curriculum.byId.get(id)!
                          return (
                            <Link key={id} to={l.url} className="rounded-full border border-cyber-border px-2 py-0.5 text-xs text-cyan hover:border-cyan/50">
                              {l.label}
                            </Link>
                          )
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-ink" dangerouslySetInnerHTML={{ __html: mdInline(item.claim) }} />
                    {item.precise.trim() && <p className="mt-1 leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: mdInline(item.precise) }} />}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
