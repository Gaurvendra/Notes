import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useProgress } from '../../context/ProgressContext'
import { INTERVIEW_LEVELS, type InterviewQuestion } from '../../lib/lessonData'
import { Md } from '../Md'
import { Badge, type BadgeTone } from '../ui'

const LEVEL_TONE: Record<InterviewQuestion['level'], BadgeTone> = {
  fresher: 'success',
  mid: 'primary',
  senior: 'secondary',
  staff: 'warning',
}

/** One interview question: answer out loud first, then open the model answer, follow-ups and red flags. */
export function InterviewCard({ q, qKey, source }: { q: InterviewQuestion; qKey: string; source?: { label: string; to: string } }) {
  const { progress, rateInterview } = useProgress()
  const rating = progress.interview[qKey]
  return (
    <details className="jx-iq group rounded-xl border border-cyber-border bg-surface open:border-cyan/40">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-3 marker:hidden">
        <Badge tone={LEVEL_TONE[q.level]}>{INTERVIEW_LEVELS[q.level]}</Badge>
        <span className="font-mono text-[11px] text-ink-dim">{q.type ?? 'concept'}</span>
        {rating && (
          <span className={`font-mono text-[11px] ${rating === 'confident' ? 'text-mint' : 'text-amber'}`}>
            {rating === 'confident' ? '● confident' : '● needs work'}
          </span>
        )}
        <span className="basis-full font-medium text-ink">
          <Md text={q.q} inline />
        </span>
      </summary>
      <div className="border-t border-cyber-border px-4 py-3 text-sm">
        <p className="font-display text-[11px] font-semibold uppercase tracking-widest text-cyan">Model answer</p>
        <Md text={q.answer} className="mt-1 text-ink-muted" />
        {q.followUps && q.followUps.length > 0 && (
          <>
            <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-widest text-magenta">Likely follow-ups</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-muted">
              {q.followUps.map((f, i) => (
                <li key={i}>
                  <Md text={f} inline />
                </li>
              ))}
            </ul>
          </>
        )}
        {q.redFlags && q.redFlags.length > 0 && (
          <>
            <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-widest text-rose">🚩 Red-flag answers</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-muted">
              {q.redFlags.map((f, i) => (
                <li key={i}>
                  <Md text={f} inline />
                </li>
              ))}
            </ul>
          </>
        )}
        {q.tests && (
          <p className="mt-3 text-ink-muted">
            <strong className="text-ink">What's really being tested:</strong> <Md text={q.tests} inline />
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cyber-border pt-3">
          <span className="text-xs text-ink-dim">How did your answer compare?</span>
          <button
            type="button"
            aria-pressed={rating === 'confident'}
            onClick={() => rateInterview(qKey, rating === 'confident' ? undefined : 'confident')}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${rating === 'confident' ? 'border-mint/50 bg-mint/10 text-mint' : 'border-cyber-border text-ink-muted hover:text-ink'}`}
          >
            <ThumbsUp size={12} aria-hidden="true" /> Nailed it
          </button>
          <button
            type="button"
            aria-pressed={rating === 'shaky'}
            onClick={() => rateInterview(qKey, rating === 'shaky' ? undefined : 'shaky')}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${rating === 'shaky' ? 'border-amber/50 bg-amber/10 text-amber' : 'border-cyber-border text-ink-muted hover:text-ink'}`}
          >
            <ThumbsDown size={12} aria-hidden="true" /> Needs work
          </button>
          {source && (
            <a href={source.to} className="ml-auto text-xs text-cyan hover:underline">
              {source.label} →
            </a>
          )}
        </div>
      </div>
    </details>
  )
}
