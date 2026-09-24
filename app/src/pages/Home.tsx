import { ArrowRight, BookOpen, Brain, CheckCircle2, Flame, MessagesSquare, Route, ShieldCheck, Swords } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircularProgress } from '../components/CircularProgress'
import { Badge, Card, SectionLabel, Stat } from '../components/ui'
import { buttonStyles } from '../components/ui/Button'
import { useProgress } from '../context/ProgressContext'
import { curriculum, getLesson, LEVEL_STYLE, nextLesson, writtenLessons } from '../lib/curriculum'
import { cardKey, loadAllLessonData } from '../lib/lessonData'
import { isDue } from '../lib/progress'

function useDueCount() {
  const { progress, completedSet } = useProgress()
  const [due, setDue] = useState<number | undefined>()
  useEffect(() => {
    let alive = true
    loadAllLessonData().then((all) => {
      if (!alive) return
      let n = 0
      for (const [id, data] of all) {
        if (!completedSet.has(id)) continue
        data.flashcards.forEach((_, i) => {
          if (isDue(progress.cards[cardKey(id, i)])) n++
        })
      }
      setDue(n)
    })
    return () => {
      alive = false
    }
  }, [progress.cards, completedSet])
  return due
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Every claim verified',
    text: 'The course grew out of 21 sets of study notes. All 305 of their claims were checked; every correction appears as a clear Myth vs Fact.',
  },
  {
    icon: BookOpen,
    title: 'Deep, not shallow',
    text: 'Each lesson goes from a mental model and diagrams to what the JVM really does, with scenarios, pitfalls and a senior lens.',
  },
  {
    icon: Route,
    title: 'A real level-up path',
    text: '98 lessons in 20 tiers, connected as a prerequisite graph. Each tier ends with a checkpoint you can use to test out of it.',
  },
  {
    icon: MessagesSquare,
    title: 'Interview-ready',
    text: 'Every lesson has interview questions from fresher to staff/manager level, with model answers, likely follow-ups and red-flag answers.',
  },
]

export function Home() {
  const { progress, level, streak, completedSet } = useProgress()
  const due = useDueCount()
  const last = getLesson(progress.lastLesson)
  const next = nextLesson(completedSet)
  const resume = last && !completedSet.has(last.id) ? last : next
  const done = completedSet.size

  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl border border-cyber-border bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="min-w-0 flex-1 basis-80">
            <Badge tone="primary" mono>
              Java 25 LTS · updated for JDK 27
            </Badge>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-wide text-ink md:text-4xl">
              Master Java,{' '}
              <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">one verified step at a time.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
              From your first program to JVM internals. Built for engineers who want deep understanding and interview-ready
              answers: diagrams, tested examples, practice, spaced revision and a level-up path.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {resume && (
                <Link to={resume.url} className={buttonStyles('primary', 'lg')}>
                  {done === 0 && !last ? 'Start learning' : 'Continue'}: {resume.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
              <Link to="/path" className={buttonStyles('secondary', 'lg')}>
                See the path
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CircularProgress done={level.xpIntoLevel} total={level.xpForNext} size={132} strokeWidth={10} />
            <p className="text-center font-display text-sm font-semibold text-ink">
              Level {level.level} · {level.title}
            </p>
            <p className="font-mono text-xs text-ink-dim">
              {level.xp.toLocaleString()} XP · {level.xpForNext - level.xpIntoLevel} to next
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="lessons complete" value={`${done}/${curriculum.lessons.length}`} tone="text-cyan" />
        <Stat
          label="day streak"
          value={
            <span className="inline-flex items-center gap-1">
              <Flame size={18} className={streak.activeToday ? 'text-amber' : 'text-ink-dim'} aria-hidden="true" />
              {streak.currentStreak}
            </span>
          }
          tone="text-amber"
        />
        <Stat label="cards due for review" value={due ?? '…'} tone="text-magenta" />
        <Stat label="lessons written so far" value={`${writtenLessons.length}/${curriculum.lessons.length}`} tone="text-ink-muted" />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Link to="/revision" className="group rounded-xl border border-cyber-border bg-surface p-4 transition-colors hover:border-magenta/40">
          <Brain size={20} className="text-magenta" aria-hidden="true" />
          <p className="mt-2 font-display font-semibold text-ink">Daily revision</p>
          <p className="mt-1 text-sm text-ink-muted">
            {due ? `${due} flashcard${due === 1 ? '' : 's'} due from the lessons you've completed.` : 'Flashcards come back at growing intervals: 1, 4, 10, 21, 45 days.'}
          </p>
        </Link>
        <Link to="/practice" className="group rounded-xl border border-cyber-border bg-surface p-4 transition-colors hover:border-cyan/40">
          <Swords size={20} className="text-cyan" aria-hidden="true" />
          <p className="mt-2 font-display font-semibold text-ink">Practice</p>
          <p className="mt-1 text-sm text-ink-muted">Predict-the-output puzzles and graded exercises, each with tests and a reference solution.</p>
        </Link>
        <Link to="/interview" className="group rounded-xl border border-cyber-border bg-surface p-4 transition-colors hover:border-amber/40">
          <MessagesSquare size={20} className="text-amber" aria-hidden="true" />
          <p className="mt-2 font-display font-semibold text-ink">Interview prep</p>
          <p className="mt-1 text-sm text-ink-muted">Questions from fresher to staff level, with model answers, follow-ups and red flags.</p>
        </Link>
      </div>

      <section className="mt-10">
        <SectionLabel>Four levels</SectionLabel>
        <div className="grid gap-3 md:grid-cols-2">
          {curriculum.levels.map((lv) => {
            const lessons = lv.tiers.flatMap((t) => t.lessons)
            const complete = lessons.filter((l) => completedSet.has(l.id)).length
            return (
              <Link
                key={lv.name}
                to={`/path#level-${lv.name.toLowerCase()}`}
                className="flex items-center gap-4 rounded-xl border border-cyber-border bg-surface p-4 transition-colors hover:border-cyan/40"
              >
                <CircularProgress done={complete} total={lessons.length} size={56} strokeWidth={6} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold text-ink">
                    {LEVEL_STYLE[lv.name].emoji} {lv.name}
                  </span>
                  <span className="block text-sm text-ink-muted">{LEVEL_STYLE[lv.name].blurb}</span>
                  <span className="mt-1 block font-mono text-xs text-ink-dim">
                    tiers {lv.tiers[0].n}–{lv.tiers[lv.tiers.length - 1].n} · {lessons.length} lessons
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>What makes this track different</SectionLabel>
        <div className="grid gap-3 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-4">
              <Icon size={18} className="text-cyan" aria-hidden="true" />
              <p className="mt-2 font-display font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>Two ways to learn</SectionLabel>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="p-4">
            <p className="flex items-center gap-2 font-display font-semibold text-ink">
              <CheckCircle2 size={16} className="text-mint" aria-hidden="true" /> Full path
            </p>
            <p className="mt-1 text-sm text-ink-muted">Read every lesson in order, from scratch. Each one unlocks the next.</p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-2 font-display font-semibold text-ink">
              <CheckCircle2 size={16} className="text-amber" aria-hidden="true" /> Fast-track (experienced developers)
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              In each lesson read the TL;DR, Myths vs Facts, Senior lens and Interview corner, take the tier checkpoint, and go deep
              only where it shows gaps.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
