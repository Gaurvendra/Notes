import { Check, Puzzle, Swords, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader, SectionLabel, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { curriculum, writtenLessons } from '../lib/curriculum'
import { lessonIndex } from '../lib/lessonIndex'

const LEVELS = { warmup: '🟢 Warm-up', core: '🟡 Core', challenge: '🔴 Challenge' } as const

/** Every puzzle, exercise and quiz of the written lessons, with your progress on each. */
export function Practice() {
  const { progress } = useProgress()
  const lessons = curriculum.lessons.filter((l) => lessonIndex[l.id])
  const exercises = lessons.flatMap((l) => lessonIndex[l.id].exercises.map((e) => ({ ...e, lesson: l })))
  const puzzles = lessons.flatMap((l) => lessonIndex[l.id].puzzles.map((p) => ({ ...p, lesson: l })))

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Practice"
        lead="Predict-the-output puzzles, graded exercises (each with the tests it must pass and a reference solution) and lesson quizzes, gathered from every written lesson."
        meta={<Badge tone="primary" mono>{writtenLessons.length} lessons with practice</Badge>}
      />
      <div className="mb-8 grid grid-cols-3 gap-2">
        <Stat label="exercises solved" value={`${exercises.filter((e) => progress.exercises[e.key]).length}/${exercises.length}`} tone="text-cyan" />
        <Stat label="outputs predicted" value={`${puzzles.filter((p) => progress.puzzles[p.key]).length}/${puzzles.length}`} tone="text-magenta" />
        <Stat label="quizzes taken" value={`${lessons.filter((l) => progress.quiz[l.id]).length}/${lessons.length}`} tone="text-amber" />
      </div>

      <section className="mb-10">
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <Swords size={12} aria-hidden="true" /> Exercises
          </span>
        </SectionLabel>
        <ul className="grid gap-2 md:grid-cols-2">
          {exercises.map((e) => (
            <li key={e.key}>
              <Link
                to={`${e.lesson.url}#${e.anchor}`}
                className={`flex h-full flex-col rounded-xl border p-4 transition-colors hover:border-cyan/40 ${progress.exercises[e.key] ? 'border-mint/40 bg-mint/5' : 'border-cyber-border bg-surface'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">{LEVELS[e.difficulty]}</span>
                  {progress.exercises[e.key] && <Check size={14} className="text-mint" aria-label="solved" />}
                </span>
                <span className="mt-1 font-medium text-ink">{e.title}</span>
                <span className="mt-1 text-xs text-ink-dim">{e.lesson.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <Puzzle size={12} aria-hidden="true" /> Predict the output
          </span>
        </SectionLabel>
        <ul className="grid gap-2 md:grid-cols-3">
          {puzzles.map((p) => (
            <li key={p.key}>
              <Link
                to={`${p.lesson.url}#${p.anchor}`}
                className={`flex h-full flex-col rounded-xl border p-4 transition-colors hover:border-magenta/40 ${progress.puzzles[p.key] ? 'border-mint/40 bg-mint/5' : 'border-cyber-border bg-surface'}`}
              >
                <span className="font-medium text-ink">
                  🧩 {p.title} {progress.puzzles[p.key] && <Check size={14} className="inline text-mint" aria-label="predicted" />}
                </span>
                <span className="mt-1 text-xs text-ink-dim">{p.lesson.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <Target size={12} aria-hidden="true" /> Quizzes
          </span>
        </SectionLabel>
        <div className="grid gap-2 md:grid-cols-2">
          {lessons.map((l) => {
            const q = progress.quiz[l.id]
            return (
              <Link key={l.id} to={`${l.url}#quiz`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:border-amber/40">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{l.label}</span>
                    <span className="text-xs text-ink-dim">{lessonIndex[l.id].counts.quiz} questions</span>
                  </span>
                  <span className="font-mono text-sm text-amber">{q ? `${q.best}/${q.total}` : '–'}</span>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
