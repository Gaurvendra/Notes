import { Flame, Snowflake, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CircularProgress } from '../components/CircularProgress'
import { ContributionHeatmap } from '../components/ContributionHeatmap'
import { Card, PageHeader, SectionLabel, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { FREEZES_PER_MONTH } from '../engines/streak'
import { curriculum } from '../lib/curriculum'
import { indexed } from '../lib/lessonIndex'
import { BADGES, reviewsDone, today, XP_RULES } from '../lib/progress'
import { duration, lastDays } from '../lib/studytime.mjs'

/** Every lesson and checkpoint with at least a minute on the timer, in path order. */
function timedRows(time: Record<string, number>) {
  const rows: { key: string; label: string; to: string; seconds: number; estimate?: number; tier: number }[] = []
  for (const tier of curriculum.tiers) {
    for (const l of tier.lessons) {
      if ((time[l.id] ?? 0) >= 60) {
        rows.push({ key: l.id, label: l.label, to: l.url, seconds: time[l.id], estimate: indexed(l.id)?.frontmatter.estimatedMinutes, tier: tier.n })
      }
    }
    const cp = `checkpoint-${tier.n}`
    if ((time[cp] ?? 0) >= 60) rows.push({ key: cp, label: `Checkpoint ${tier.n}`, to: `/checkpoints/${tier.n}`, seconds: time[cp], tier: tier.n })
  }
  return rows
}

export function Profile() {
  const { progress, xp, level, streak, badges, completedSet } = useProgress()
  const month = today().slice(0, 7)
  const freezesLeft = FREEZES_PER_MONTH - (streak.freezesUsedByMonth[month] ?? 0)
  const rows = [
    { label: 'Lessons completed', n: completedSet.size, rule: `${XP_RULES.lesson} each`, xp: xp.lessons },
    { label: 'Quiz answers (best scores)', n: Object.values(progress.quiz).reduce((s, q) => s + q.best, 0), rule: `${XP_RULES.quizCorrect} each`, xp: xp.quizzes },
    { label: 'Exercises solved', n: Object.keys(progress.exercises).length, rule: `${XP_RULES.exercise} each`, xp: xp.exercises },
    { label: 'Outputs predicted', n: Object.keys(progress.puzzles).length, rule: `${XP_RULES.puzzle} each`, xp: xp.puzzles },
    { label: 'Flashcard reviews', n: reviewsDone(progress), rule: `${XP_RULES.review} each`, xp: xp.reviews },
    { label: 'Interview answers rated', n: Object.keys(progress.interview).length, rule: `${XP_RULES.interview} each`, xp: xp.interview },
  ]
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Profile & badges"
        lead="Everything here is computed from your progress in this browser. Export it from Settings to keep a backup or move devices."
      />
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-cyber-border bg-surface p-5">
        <CircularProgress done={level.xpIntoLevel} total={level.xpForNext} size={120} strokeWidth={10} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-semibold text-ink">Level {level.level}</p>
          <p className="font-display text-lg text-cyan">{level.title}</p>
          <p className="mt-1 font-mono text-sm text-ink-dim">
            {level.xp.toLocaleString()} XP · {level.xpForNext - level.xpIntoLevel} XP to level {level.level + 1}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="current streak" value={<span className="inline-flex items-center gap-1"><Flame size={18} aria-hidden="true" />{streak.currentStreak}</span>} tone="text-amber" />
        <Stat label="longest streak" value={streak.longestStreak} />
        <Stat label="free streak freezes left this month" value={<span className="inline-flex items-center gap-1"><Snowflake size={16} aria-hidden="true" />{freezesLeft}</span>} tone="text-cyan" />
        <Stat label="lessons complete" value={`${completedSet.size}/${curriculum.lessons.length}`} tone="text-mint" />
      </div>

      <StudyTime />

      <section className="mt-8">
        <SectionLabel>Activity, last 26 weeks</SectionLabel>
        <Card className="p-4">
          <ContributionHeatmap activity={progress.activity} />
          <p className="mt-2 text-xs text-ink-dim">
            Any study action counts for the day. A missed day uses one of {FREEZES_PER_MONTH} free freezes per month before the streak resets.
          </p>
        </Card>
      </section>

      <section className="mt-8">
        <SectionLabel>Where your XP comes from</SectionLabel>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-cyber-border last:border-0">
                  <td className="px-4 py-2 text-ink">{r.label}</td>
                  <td className="px-4 py-2 font-mono text-ink-muted">{r.n}</td>
                  <td className="px-4 py-2 text-xs text-ink-dim">{r.rule}</td>
                  <td className="px-4 py-2 text-right font-mono text-cyan">{r.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-8">
        <SectionLabel>
          Badges · {badges.size}/{BADGES.length}
        </SectionLabel>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const earned = badges.has(b.id)
            return (
              <li
                key={b.id}
                className={`rounded-xl border p-4 text-center ${earned ? 'border-amber/40 bg-amber/5' : 'border-cyber-border bg-surface opacity-60'}`}
              >
                <span className={`block text-3xl ${earned ? '' : 'grayscale'}`} aria-hidden="true">
                  {b.icon}
                </span>
                <span className="mt-1 block font-display text-sm font-semibold text-ink">{b.name}</span>
                <span className="block text-xs text-ink-muted">{b.description}</span>
                {!earned && <span className="mt-1 block font-mono text-[10px] text-ink-dim">locked</span>}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function StudyTime() {
  const { progress, completedSet } = useProgress()
  const rows = timedRows(progress.time)
  const day = today()
  const total = Object.values(progress.timeByDay).reduce((n, s) => n + s, 0)
  return (
    <section className="mt-8">
      <SectionLabel>Study time</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="today" value={duration(progress.timeByDay[day] ?? 0)} tone="text-cyan" />
        <Stat label="last 7 days" value={duration(lastDays(progress.timeByDay, day, 7))} />
        <Stat label="in total" value={duration(total)} />
        <Stat label="lessons and checkpoints timed" value={rows.length} tone="text-mint" />
      </div>
      <Card className="mt-2 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="flex items-center gap-2 p-4 text-sm text-ink-muted">
            <Timer size={15} aria-hidden="true" className="shrink-0" />
            No timed study yet. Open a lesson and its timer starts by itself; five minutes of timed study also counts as a study
            day for your streak.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-border text-left text-xs text-ink-dim">
                <th className="px-4 py-2 font-medium">Lesson</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Estimate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-cyber-border last:border-0">
                  <td className="px-4 py-2">
                    <Link to={r.to} className="text-ink hover:text-cyan">
                      {completedSet.has(r.key) ? '✓ ' : ''}
                      {r.label}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-ink-muted">{duration(r.seconds)}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink-dim">{r.estimate ? `~${r.estimate} min` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <p className="mt-2 text-xs text-ink-dim">
        Measured by the lesson timer, which pauses when you switch tabs or stop for a while (see Settings). Estimates are for a
        first careful pass; taking longer is normal.
      </p>
    </section>
  )
}
