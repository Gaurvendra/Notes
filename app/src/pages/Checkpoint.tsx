import 'katex/dist/katex.min.css'
import { MDXProvider } from '@mdx-js/react'
import { Check, Flag } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Quiz } from '../components/study/Quiz'
import { Badge, Card, PageHeader, SectionLabel } from '../components/ui'
import { mdxComponents } from '../content/mdx'
import { checkpointLoader } from '../content/registry'
import { LessonContext } from '../context/LessonContext'
import { useProgress } from '../context/ProgressContext'
import { useAllLessonData } from '../hooks'
import { curriculum, LEVEL_STYLE } from '../lib/curriculum'
import { loadCheckpointData, type LessonData } from '../lib/lessonData'
import { NotFound } from './NotFound'

const pages = new Map<number, ComponentType>()
function checkpointComponent(tier: number): ComponentType | undefined {
  const loader = checkpointLoader(tier)
  if (!loader) return undefined
  if (!pages.has(tier)) pages.set(tier, lazy(loader))
  return pages.get(tier)
}

/**
 * A tier checkpoint: a mixed quiz (the checkpoint's own integrative questions plus every quiz question of the tier's
 * written lessons), and, once written, a coding challenge and a mock-interview round (checkpoints/tier-N.mdx and
 * checkpoint-data/tier-N.yaml).
 */
export function Checkpoint() {
  const { tier: tierParam = '' } = useParams()
  const tier = curriculum.tiers.find((t) => String(t.n) === tierParam)
  const all = useAllLessonData()
  const [own, setOwn] = useState<LessonData | undefined | null>(null)
  const { completedSet, progress, recordQuiz } = useProgress()
  const { hash } = useLocation()

  useEffect(() => {
    if (!tier) return
    let alive = true
    loadCheckpointData(tier.n).then((d) => alive && setOwn(d))
    return () => {
      alive = false
    }
  }, [tier])

  const questions = useMemo(
    () => (tier && all ? [...(own?.quiz ?? []), ...tier.lessons.flatMap((l) => all.get(l.id)?.quiz ?? [])] : []),
    [tier, all, own],
  )
  const key = `checkpoint-${tier?.n}`
  const ctx = useMemo(() => ({ lessonId: key, data: own ?? undefined, checkpointQuiz: questions }), [key, own, questions])

  useEffect(() => {
    if (!hash) return
    const timer = setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(), 300)
    return () => clearTimeout(timer)
  }, [hash, all, own])

  if (!tier) return <NotFound />
  const best = progress.quiz[key]
  const next = curriculum.tiers.find((t) => t.n === tier.n + 1)
  const Content = checkpointComponent(tier.n)
  const loading = !all || own === null

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Checkpoint ${tier.n}: ${tier.name}`}
        lead="Level-up checkpoint for this tier. Use it to check what you've learned, or to test out of the tier if you already know it."
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
                quiz best {best.best}/{best.total}
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

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : Content ? (
        <MDXProvider components={mdxComponents}>
          <LessonContext.Provider value={ctx}>
            <Suspense fallback={<p className="text-sm text-ink-muted">Loading the checkpoint…</p>}>
              <article className="prose-jmt min-w-0">
                <Content />
              </article>
            </Suspense>
          </LessonContext.Provider>
        </MDXProvider>
      ) : (
        <>
          <SectionLabel>Checkpoint quiz</SectionLabel>
          {questions.length === 0 ? (
            <Card className="p-5 text-sm text-ink-muted">
              🚧 No lesson in this tier has been written yet, so there is nothing to quiz on. The checkpoint fills in as its
              lessons are written; it will also get a coding challenge and a mock-interview round.
            </Card>
          ) : (
            <Quiz questions={questions} quizId={key} onScore={(c, t) => recordQuiz(key, c, t)} />
          )}
        </>
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
