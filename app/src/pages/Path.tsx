import { Check, ChevronRight, Flag, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CircularProgress } from '../components/CircularProgress'
import { PrereqGraph } from '../components/PrereqGraph'
import { Badge, PageHeader, SectionLabel, SegmentedControl, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { curriculum, isUnlocked, LEVEL_STYLE, writtenLessons } from '../lib/curriculum'

type Filter = 'all' | 'guides' | 'graph'

export function Path() {
  const { completedSet } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  const total = curriculum.lessons.length
  const done = curriculum.lessons.filter((l) => completedSet.has(l.id)).length
  const tiersCleared = curriculum.tiers.filter((t) => t.lessons.every((l) => completedSet.has(l.id))).length

  return (
    <div>
      <PageHeader
        title="Learning path"
        lead="98 lessons in 20 tiers and four levels, connected as a prerequisite graph. A lesson unlocks when its prerequisites are complete; locks are advice, so you can still open anything. Lessons marked outline are planned and show what they will cover."
        meta={
          <>
            <Badge tone="primary" mono>
              {curriculum.tiers.length} tiers
            </Badge>
            <Badge tone="neutral" mono>
              {total} lessons
            </Badge>
            <Badge tone="success" mono>
              {writtenLessons.length} guides written
            </Badge>
          </>
        }
        actions={<CircularProgress done={done} total={total} size={96} strokeWidth={8} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="lessons done" value={done} tone="text-cyan" />
        <Stat label="tiers cleared" value={`${tiersCleared}/${curriculum.tiers.length}`} />
        <Stat label="guides written" value={`${writtenLessons.length}/${total}`} tone="text-mint" />
        <Stat label="audited claims" value={305} tone="text-ink-muted" />
      </div>

      <div className="mb-8">
        <SegmentedControl<Filter>
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All lessons' },
            { value: 'guides', label: 'Written guides only' },
            { value: 'graph', label: 'Prerequisite graph' },
          ]}
        />
      </div>

      {filter === 'graph' ? (
        <PrereqGraph />
      ) : (
      <div className="space-y-12">
        {curriculum.levels.map((lv) => (
          <section key={lv.name} id={`level-${lv.name.toLowerCase()}`} className="scroll-mt-20">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-cyber-border pb-2">
              <h2 className="font-display text-xl font-semibold tracking-wide text-ink">
                {LEVEL_STYLE[lv.name].emoji} {lv.name}
              </h2>
              <span className="text-sm text-ink-muted">{LEVEL_STYLE[lv.name].blurb}</span>
            </div>
            <div className="space-y-8">
              {lv.tiers.map((tier) => {
                const lessons = tier.lessons.filter((l) => filter === 'all' || l.status === 'done')
                const tierDone = tier.lessons.filter((l) => completedSet.has(l.id)).length
                if (lessons.length === 0) return null
                return (
                  <div key={tier.n} id={`tier-${tier.n}`} className="scroll-mt-20">
                    <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <SectionLabel>Tier {tier.n}</SectionLabel>
                      <h3 className="font-display text-lg font-semibold tracking-wide text-ink">{tier.name}</h3>
                      <span className="font-mono text-xs text-ink-dim">
                        {tierDone}/{tier.lessons.length} done
                      </span>
                    </div>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {lessons.map((lesson) => {
                        const unlocked = isUnlocked(lesson, completedSet)
                        const complete = completedSet.has(lesson.id)
                        const written = lesson.status === 'done'
                        return (
                          <li key={lesson.id}>
                            <Link
                              to={lesson.url}
                              className={[
                                'group flex h-full flex-col rounded-xl border p-4 transition-colors',
                                complete
                                  ? 'border-cyan/40 bg-cyan/5'
                                  : unlocked
                                    ? 'border-cyber-border bg-surface hover:border-cyan/40'
                                    : 'border-cyber-border bg-surface/50 hover:border-cyber-border-strong',
                              ].join(' ')}
                            >
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 shrink-0">
                                  {complete ? (
                                    <Check size={15} className="text-cyan" aria-label="complete" />
                                  ) : unlocked ? (
                                    <ChevronRight size={15} className="text-ink-dim group-hover:text-cyan" aria-hidden="true" />
                                  ) : (
                                    <Lock size={14} className="text-ink-dim" aria-label="locked" />
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className={`block font-medium ${unlocked || complete ? 'text-ink' : 'text-ink-muted'}`}>{lesson.label}</span>
                                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{lesson.title}</span>
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                {written ? (
                                  <Badge tone="success" mono>
                                    guide
                                  </Badge>
                                ) : (
                                  <Badge tone="neutral" mono>
                                    outline
                                  </Badge>
                                )}
                                {lesson.audit.length > 0 && (
                                  <span className="font-mono text-[11px] text-ink-dim">{lesson.audit.length} audit items</span>
                                )}
                              </div>
                              {!unlocked && lesson.prereqs.length > 0 && (
                                <p className="mt-2 text-xs text-ink-dim">
                                  needs:{' '}
                                  {lesson.prereqs
                                    .filter((p) => !completedSet.has(p))
                                    .map((p) => curriculum.byId.get(p)?.label ?? p)
                                    .join(' · ')}
                                </p>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                      {filter === 'all' && (
                        <li>
                          <Link
                            to={`/checkpoints/${tier.n}`}
                            className="flex h-full items-center gap-3 rounded-xl border border-dashed border-amber/40 bg-amber/5 p-4 transition-colors hover:border-amber"
                          >
                            <Flag size={16} className="shrink-0 text-amber" aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block font-medium text-ink">Checkpoint {tier.n}</span>
                              <span className="block text-sm text-ink-muted">Test yourself on {tier.name}, or test out of it.</span>
                            </span>
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      )}
    </div>
  )
}
