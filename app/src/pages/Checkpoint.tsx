import { Check, Flag } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Quiz } from '../components/study/Quiz'
import { Badge, Card, PageHeader, SectionLabel } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { useAllLessonData } from '../hooks'
import { curriculum, LEVEL_STYLE } from '../lib/curriculum'
import { NotFound } from './NotFound'

/**
 * A tier checkpoint. Until its own challenge and mock-interview round are written, it gathers the quiz questions of
 * the tier's written lessons into one mixed quiz, so you can already test yourself or test out of the tier.
 */
export function Checkpoint() {
  const { tier: tierParam = '' } = useParams()
  const tier = curriculum.tiers.find((t) => String(t.n) === tierParam)
  const all = useAllLessonData()
  const { completedSet, progress, recordQuiz } = useProgress()

  const questions = useMemo(
    () => (tier && all ? tier.lessons.flatMap((l) => all.get(l.id)?.quiz ?? []) : []),
    [tier, all],
  )
  if (!tier) return <NotFound />
  const key = `checkpoint-${tier.n}`
  const best = progress.quiz[key]
  const next = curriculum.tiers.find((t) => t.n === tier.n + 1)

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Checkpoint ${tier.n}: ${tier.name}`}
        lead="Level-up checkpoint for this tier: a mixed quiz over every written lesson in the tier. Score well and move on; miss questions and the explanations point you back to the lesson."
        meta={
          <>
            <Badge tone={LEVEL_STYLE[tier.level].tone}>
              {LEVEL_STYLE[tier.level].emoji} {tier.level}
            </Badge>
            <Badge mono>
              <Flag size={11} aria-hidden="true" /> tier {tier.n}
            </Badge>
            {best && (
              <Badge tone="primary" mono>
                best {best.best}/{best.total}
              </Badge>
            )}
          </>
        }
      />

      <SectionLabel>Lessons in this tier</SectionLabel>
      <ul className="mb-8 grid gap-2 sm:grid-cols-2">
        {tier.lessons.map((l) => (
          <li key={l.id}>
            <Link to={l.url} className="flex items-center gap-2 rounded-lg border border-cyber-border bg-surface px-3 py-2 text-sm text-ink-muted hover:border-cyan/40 hover:text-ink">
              {completedSet.has(l.id) ? <Check size={14} className="text-mint" aria-label="complete" /> : <span className="w-3.5" />}
              <span className="min-w-0 flex-1 truncate">{l.label}</span>
              <Badge tone={l.status === 'done' ? 'success' : 'neutral'} mono>
                {l.status === 'done' ? 'guide' : 'outline'}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>

      <SectionLabel>Checkpoint quiz</SectionLabel>
      {!all ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : questions.length === 0 ? (
        <Card className="p-5 text-sm text-ink-muted">
          🚧 No lesson in this tier has been written yet, so there is nothing to quiz on. The checkpoint fills in as its lessons
          are written; it will also get a coding challenge and a mock-interview round.
        </Card>
      ) : (
        <Quiz questions={questions} quizId={key} onScore={(c, t) => recordQuiz(key, c, t)} />
      )}

      {next && (
        <p className="mt-8 text-sm text-ink-muted">
          Next:{' '}
          <Link to={`/path#tier-${next.n}`} className="text-cyan hover:underline">
            Tier {next.n} · {next.name}
          </Link>
        </p>
      )}
    </div>
  )
}
