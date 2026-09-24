import GithubSlugger from 'github-slugger'
import { Check, Eye } from 'lucide-react'
import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react'
import { InterviewCard } from '../../components/study/InterviewCard'
import { FlashcardDeck } from '../../components/study/FlashcardDeck'
import { Quiz as QuizView } from '../../components/study/Quiz'
import { Button } from '../../components/ui'
import { useLesson } from '../../context/LessonContext'
import { useProgress } from '../../context/ProgressContext'
import { cardKey, INTERVIEW_ORDER } from '../../lib/lessonData'
import { mdInline } from '../../lib/markdown'

/* ------------------------------------------------------------ PredictOutput */

/** The hidden part of a puzzle: the real output (a fenced block) and why. */
export function Reveal({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/** Predict-the-output puzzle: code first; the output and explanation stay hidden until you have a guess. */
export function PredictOutput({ title, children }: { title: string; children: ReactNode }) {
  const { lessonId } = useLesson()
  const { progress, markPuzzle } = useProgress()
  const [open, setOpen] = useState(false)
  const anchor = `puzzle-${new GithubSlugger().slug(title)}`
  const key = `${lessonId}/${anchor}`
  const solved = Boolean(progress.puzzles[key])
  const parts = Children.toArray(children)
  const hidden = parts.filter((c) => isValidElement(c) && c.type === Reveal)
  const shown = parts.filter((c) => !(isValidElement(c) && c.type === Reveal))
  return (
    <section id={anchor} className="jx-predict my-6 scroll-mt-20 rounded-xl border border-magenta/30 bg-surface p-4">
      <p className="!mt-0 flex items-center gap-2 font-display text-sm font-semibold text-magenta">
        🧩 {title}
        {solved && <Check size={15} className="text-mint" aria-label="predicted correctly" />}
      </p>
      <p className="!mt-1 text-sm text-ink-dim">What does it print? Decide before you reveal.</p>
      {shown}
      {open ? (
        <div className="jx-flow">
          {hidden}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-cyber-border pt-3">
            <span className="text-xs text-ink-dim">Was your prediction right?</span>
            <Button size="sm" variant={solved ? 'success' : 'secondary'} onClick={() => markPuzzle(key, true)}>
              Yes, exactly
            </Button>
            <Button size="sm" variant="ghost" onClick={() => markPuzzle(key, false)}>
              No
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" icon={<Eye size={13} aria-hidden="true" />} onClick={() => setOpen(true)}>
          Reveal the output and explanation
        </Button>
      )}
    </section>
  )
}

/* ----------------------------------------------------------------- Exercise */

export function Starter({ children }: { children: ReactNode }) {
  return <>{children}</>
}
export function Tests({ children }: { children: ReactNode }) {
  return <>{children}</>
}
export function Solution({ children }: { children: ReactNode }) {
  return <>{children}</>
}

const LEVELS = { warmup: '🟢 Warm-up', core: '🟡 Core', challenge: '🔴 Challenge' } as const

function Fold({ summary, children, tone = 'text-ink' }: { summary: ReactNode; children: ReactNode; tone?: string }) {
  return (
    <details className="group mt-2 rounded-lg border border-cyber-border bg-surface-2/50">
      <summary className={`cursor-pointer list-none px-3 py-2 text-sm font-medium marker:hidden ${tone}`}>
        <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
          ›
        </span>
        {summary}
      </summary>
      <div className="jx-flow px-3 pb-3">{children}</div>
    </details>
  )
}

/**
 * A practice exercise: statement, starter code, the tests it must pass, hints and a reference solution.
 * `id` is "<package>/<ClassName>"; `needs` names features a beginner may not have met yet (inline Markdown).
 */
export function Exercise({
  id,
  difficulty,
  title,
  needs,
  hints = [],
  children,
}: {
  id: string
  difficulty: keyof typeof LEVELS
  title: string
  needs?: string
  hints?: string[]
  children: ReactNode
}) {
  const { lessonId } = useLesson()
  const { progress, toggleExercise } = useProgress()
  const cls = id.split('/').pop()!
  const key = `${lessonId}/${cls}`
  const solved = Boolean(progress.exercises[key])
  const parts = Children.toArray(children)
  const pick = (type: unknown) => parts.filter((c) => isValidElement(c) && c.type === type) as ReactElement[]
  const statement = parts.filter((c) => !(isValidElement(c) && [Starter, Tests, Solution].includes(c.type as never)))
  return (
    <section id={`exercise-${cls.toLowerCase()}`} className={`jx-exercise my-6 scroll-mt-20 rounded-xl border p-4 [&>*+*]:mt-3 ${solved ? 'border-mint/40 bg-mint/5' : 'border-cyber-border bg-surface'}`}>
      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyber-border bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">{LEVELS[difficulty]}</span>
        <h4 className="!m-0 font-display text-base font-semibold text-ink">{title}</h4>
        <span className="ml-auto font-mono text-xs text-ink-dim">{cls}.java</span>
      </header>
      <div className="jx-flow">{statement}</div>
      {needs && (
        <p className="text-sm text-ink-muted">
          <strong className="text-ink">Uses:</strong> <span dangerouslySetInnerHTML={{ __html: mdInline(needs) }} />
        </p>
      )}
      <p className="text-sm text-ink-dim">
        Copy the starter and the tests into any Java 25 project with JUnit 5 and AssertJ (an IDE, Maven or Gradle), then make{' '}
        <code>{cls}Test</code> pass.
      </p>
      {pick(Starter).length > 0 && <Fold summary="Starter code">{pick(Starter)}</Fold>}
      {pick(Tests).length > 0 && <Fold summary="Tests your solution must pass">{pick(Tests)}</Fold>}
      {hints.map((h, i) => (
        <Fold key={i} summary={`Hint ${i + 1}`} tone="text-amber">
          <p dangerouslySetInnerHTML={{ __html: mdInline(h) }} />
        </Fold>
      ))}
      {pick(Solution).length > 0 && (
        <Fold summary="Reference solution" tone="text-magenta">
          {pick(Solution)}
        </Fold>
      )}
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant={solved ? 'success' : 'secondary'} icon={solved ? <Check size={13} aria-hidden="true" /> : undefined} onClick={() => toggleExercise(key)}>
          {solved ? 'Solved' : 'Mark as solved'}
        </Button>
      </div>
    </section>
  )
}

/* ------------------------------------------------- lesson-data components */

export function Quiz() {
  const { lessonId, data } = useLesson()
  const { recordQuiz } = useProgress()
  if (!data?.quiz.length) return <p className="text-ink-dim">No quiz for this lesson yet.</p>
  return <QuizView questions={data.quiz} quizId={`quiz-${lessonId}`} onScore={(c, t) => recordQuiz(lessonId, c, t)} />
}

/** The mixed quiz of a checkpoint page (only valid inside checkpoints/tier-N.mdx). */
export function CheckpointQuiz() {
  const { lessonId, checkpointQuiz } = useLesson()
  const { recordQuiz } = useProgress()
  if (!checkpointQuiz) throw new Error('CheckpointQuiz can only be used on a checkpoint page')
  if (checkpointQuiz.length === 0) return <p className="text-ink-dim">No questions yet.</p>
  return (
    <QuizView questions={checkpointQuiz} quizId={`quiz-${lessonId}`} onScore={(c, t) => recordQuiz(lessonId, c, t)} />
  )
}

export function InterviewSet() {
  const { lessonId, data } = useLesson()
  if (!data?.interview.length) return <p className="text-ink-dim">No interview questions for this lesson yet.</p>
  const ordered = data.interview
    .map((q, i) => ({ q, i }))
    .sort((a, b) => INTERVIEW_ORDER.indexOf(a.q.level) - INTERVIEW_ORDER.indexOf(b.q.level))
  return (
    <div className="my-5 space-y-2">
      <p className="text-sm text-ink-dim">Answer out loud first, then open the model answer and rate yourself.</p>
      {ordered.map(({ q, i }) => (
        <InterviewCard key={i} q={q} qKey={`${lessonId}#${i}`} />
      ))}
    </div>
  )
}

export function Flashcards() {
  const { lessonId, data } = useLesson()
  if (!data?.flashcards.length) return <p className="text-ink-dim">No flashcards for this lesson yet.</p>
  const cards = data.flashcards.map((c, i) => ({ key: cardKey(lessonId, i), front: c.front, back: c.back }))
  return <FlashcardDeck cards={cards} emptyText="You went through the whole deck." />
}
