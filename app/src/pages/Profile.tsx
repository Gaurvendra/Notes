import { Flame, Snowflake } from 'lucide-react'
import { CircularProgress } from '../components/CircularProgress'
import { ContributionHeatmap } from '../components/ContributionHeatmap'
import { Card, PageHeader, SectionLabel, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { FREEZES_PER_MONTH } from '../engines/streak'
import { curriculum } from '../lib/curriculum'
import { BADGES, reviewsDone, today, XP_RULES } from '../lib/progress'

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
