import { Award, Download, Flame, Pencil, Snowflake, Sparkles, Timer, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityCalendar } from '../components/profile/ActivityCalendar'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { ShareCardModal } from '../components/profile/ShareCardModal'
import { CircularProgress } from '../components/CircularProgress'
import { ContributionHeatmap } from '../components/ContributionHeatmap'
import { Button, Card, PageHeader, SectionLabel, SegmentedControl, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { FREEZES_PER_MONTH } from '../engines/streak'
import { LEVEL_STYLE, curriculum } from '../lib/curriculum'
import { LEVEL_TONE_COLOR, type ShareCardData } from '../lib/exportCard'
import { displayName, earnedBadgeList, initials, levelSkills, masteredTiers, prettyUrl } from '../lib/identity'
import { indexed } from '../lib/lessonIndex'
import { BADGES, reviewsDone, today, XP_RULES } from '../lib/progress'
import { duration, lastDays } from '../lib/studytime.mjs'
import { useIdentity } from '../lib/useIdentity'

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
  const identityStore = useIdentity()
  const { identity } = identityStore
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

  const [editing, setEditing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [message, setMessage] = useState<string>()
  const importRef = useRef<HTMLInputElement>(null)

  const metaLine = [
    identity.location.trim(),
    identity.links.linkedin && prettyUrl(identity.links.linkedin),
    identity.links.github && prettyUrl(identity.links.github),
    identity.links.website && prettyUrl(identity.links.website),
  ].filter((s): s is string => Boolean(s))
  const links = [
    identity.links.linkedin && { label: 'LinkedIn', href: identity.links.linkedin },
    identity.links.github && { label: 'GitHub', href: identity.links.github },
    identity.links.website && { label: 'Website', href: identity.links.website },
  ].filter((l): l is { label: string; href: string } => Boolean(l))
  const isBlank = !identity.name && !identity.headline && !identity.avatar

  const shareData: ShareCardData = useMemo(() => {
    const skills = levelSkills(progress).map((s) => ({ ...s, color: LEVEL_TONE_COLOR[LEVEL_STYLE[s.name].tone] }))
    const studySeconds = Object.values(progress.timeByDay).reduce((n, s) => n + s, 0)
    return {
      identity,
      level: level.level,
      levelTitle: level.title,
      xp: level.xp,
      xpIntoLevel: level.xpIntoLevel,
      xpForNext: level.xpForNext,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lessonsDone: completedSet.size,
      lessonsTotal: curriculum.lessons.length,
      exercisesDone: Object.keys(progress.exercises).length,
      quizCorrect: Object.values(progress.quiz).reduce((s, q) => s + q.best, 0),
      studyTimeLabel: duration(studySeconds),
      skills,
      masteredTiers: masteredTiers(progress),
      badges: earnedBadgeList(BADGES, badges).map((b) => ({ icon: b.icon, name: b.name })),
      generatedOn: today(),
    }
  }, [identity, progress, level, streak, completedSet, badges])

  function downloadProfile() {
    const blob = new Blob([identityStore.exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `java-mastery-track-profile-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Profile exported.')
  }

  async function uploadProfile(file: File | undefined) {
    if (!file) return
    try {
      identityStore.importJSON(await file.text())
      setMessage('Profile imported.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Profile & badges"
        lead="Everything here is computed from your progress in this browser. Nothing is uploaded — export a backup to keep or move it."
      />

      <div className="rounded-2xl border border-cyber-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 basis-72 items-start gap-4">
            {identity.avatar ? (
              <img src={identity.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full border border-cyber-border object-cover" />
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cyber-border bg-gradient-to-br from-cyan/60 to-magenta/60 font-display text-base font-bold text-void"
                aria-hidden="true"
              >
                {initials(identity.name)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-xl font-semibold text-ink">{displayName(identity)}</h2>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-cyber-border px-2 py-0.5 text-xs text-ink-muted hover:border-cyan/40 hover:text-cyan"
                >
                  <Pencil size={11} aria-hidden="true" />
                  Edit profile
                </button>
              </div>
              {identity.headline && <p className="mt-0.5 truncate text-sm text-cyan">{identity.headline}</p>}
              {metaLine.length > 0 && <p className="mt-0.5 truncate text-xs text-ink-muted">{metaLine.join(' · ')}</p>}
              {identity.bio && <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">{identity.bio}</p>}
              {links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {links.map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener" className="text-xs text-ink-dim hover:text-cyan">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {isBlank && (
                <p className="mt-2 text-xs text-ink-dim">
                  Add your name, headline and photo —{' '}
                  <button type="button" onClick={() => setEditing(true)} className="text-cyan underline-offset-2 hover:underline">
                    edit your profile
                  </button>
                  .
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <CircularProgress done={level.xpIntoLevel} total={level.xpForNext} size={100} strokeWidth={9} />
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold text-ink">Level {level.level}</p>
              <p className="font-display text-base text-cyan">{level.title}</p>
              <p className="mt-1 font-mono text-xs text-ink-dim">
                {level.xp.toLocaleString()} XP · {level.xpForNext - level.xpIntoLevel} to level {level.level + 1}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cyber-border pt-4">
          <Button variant="primary" size="sm" icon={<Sparkles size={14} aria-hidden="true" />} onClick={() => setSharing(true)}>
            Share achievements
          </Button>
          <Button variant="secondary" size="sm" icon={<Download size={14} aria-hidden="true" />} onClick={downloadProfile}>
            Export profile
          </Button>
          <Button variant="secondary" size="sm" icon={<Upload size={14} aria-hidden="true" />} onClick={() => importRef.current?.click()}>
            Import profile
          </Button>
          <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => uploadProfile(e.target.files?.[0])} />
          {message && (
            <span className="text-xs text-cyan" role="status">
              {message}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="current streak" value={<span className="inline-flex items-center gap-1"><Flame size={18} aria-hidden="true" />{streak.currentStreak}</span>} tone="text-amber" />
        <Stat label="longest streak" value={streak.longestStreak} />
        <Stat label="free streak freezes left this month" value={<span className="inline-flex items-center gap-1"><Snowflake size={16} aria-hidden="true" />{freezesLeft}</span>} tone="text-cyan" />
        <Stat label="lessons complete" value={`${completedSet.size}/${curriculum.lessons.length}`} tone="text-mint" />
      </div>

      <StudyTime />

      <ActivitySection />

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

      {editing && (
        <EditProfileModal
          identity={identity}
          onSave={(next) => {
            identityStore.replace(next)
            setMessage('Profile saved.')
          }}
          onClose={() => setEditing(false)}
        />
      )}
      {sharing && <ShareCardModal data={shareData} onClose={() => setSharing(false)} />}
    </div>
  )
}

function ActivitySection() {
  const { progress, completedSet } = useProgress()
  const [view, setView] = useState<'calendar' | 'heatmap'>('calendar')
  const completedDates = useMemo(() => new Set(Object.values(progress.completed)), [progress.completed])

  return (
    <section className="mt-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Activity</SectionLabel>
        <SegmentedControl<'calendar' | 'heatmap'>
          label="Activity view"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'calendar', label: 'Calendar' },
            { value: 'heatmap', label: 'Last 26 weeks' },
          ]}
        />
      </div>
      <Card className="p-4">
        {view === 'calendar' ? (
          <ActivityCalendar activity={progress.activity} timeByDay={progress.timeByDay} completedDates={completedDates} />
        ) : (
          <ContributionHeatmap activity={progress.activity} />
        )}
        <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-dim">
          <Award size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
          Any study action counts for the day. A missed day uses one of {FREEZES_PER_MONTH} free freezes per month before the
          streak resets. {completedSet.size > 0 && 'Days with a mint dot had a lesson or checkpoint completed.'}
        </p>
      </Card>
    </section>
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
