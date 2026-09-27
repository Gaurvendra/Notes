import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { QuizQuestion } from '../../lib/lessonData'
import { Md } from '../Md'
import { Button } from '../ui'

/**
 * Multiple-choice quiz with an explanation for every option. Several correct options → checkboxes, and the
 * question says so. `onScore` receives the running score each time an answer is checked.
 */
export function Quiz({
  questions,
  quizId,
  onScore,
}: {
  questions: QuizQuestion[]
  quizId: string
  onScore?: (correct: number, total: number) => void
}) {
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const isMulti = (q: QuizQuestion) => q.options.filter((o) => o.correct).length > 1
  const isRight = (qi: number, ans = answers) => {
    const chosen = new Set(ans[qi] ?? [])
    return questions[qi].options.every((o, oi) => Boolean(o.correct) === chosen.has(oi))
  }
  const score = Object.keys(checked).filter((k) => checked[Number(k)] && isRight(Number(k))).length
  const answered = Object.values(checked).filter(Boolean).length

  function toggle(qi: number, oi: number, multi: boolean) {
    setChecked((c) => ({ ...c, [qi]: false }))
    setAnswers((a) => {
      const prev = a[qi] ?? []
      const next = multi ? (prev.includes(oi) ? prev.filter((x) => x !== oi) : [...prev, oi]) : [oi]
      return { ...a, [qi]: next }
    })
  }

  function check(qi: number) {
    const next = { ...checked, [qi]: true }
    setChecked(next)
    const s = Object.keys(next).filter((k) => next[Number(k)] && isRight(Number(k))).length
    onScore?.(s, questions.length)
  }

  function reset() {
    setAnswers({})
    setChecked({})
  }

  return (
    <div className="jx-quiz my-5 space-y-4">
      {questions.map((q, qi) => {
        const multi = isMulti(q)
        const chosen = answers[qi] ?? []
        const done = checked[qi]
        const right = done && isRight(qi)
        return (
          <fieldset
            key={qi}
            className={[
              'min-w-0 rounded-xl border bg-surface p-4',
              done ? (right ? 'border-mint/50' : 'border-rose/50') : 'border-cyber-border',
            ].join(' ')}
          >
            <legend className="sr-only">Question {qi + 1}</legend>
            <div className="flex gap-2 font-medium text-ink">
              <span className="shrink-0 font-mono text-cyan">Q{qi + 1}.</span>
              <span className="min-w-0">
                <Md text={q.q} inline />
                {multi && <span className="ml-1 text-xs font-normal text-ink-dim">(choose all that apply)</span>}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {q.options.map((o, oi) => {
                const selected = chosen.includes(oi)
                const state = done ? (o.correct ? 'correct' : selected ? 'wrong' : '') : ''
                return (
                  <div
                    key={oi}
                    className={[
                      'rounded-lg border px-3 py-2 transition-colors',
                      state === 'correct'
                        ? 'border-mint/50 bg-mint/5'
                        : state === 'wrong'
                          ? 'border-rose/50 bg-rose/5'
                          : selected
                            ? 'border-cyan/50 bg-cyan/5'
                            : 'border-cyber-border hover:border-cyber-border-strong',
                    ].join(' ')}
                  >
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
                      <input
                        type={multi ? 'checkbox' : 'radio'}
                        name={`${quizId}-q${qi}`}
                        checked={selected}
                        onChange={() => toggle(qi, oi, multi)}
                        className="mt-1 shrink-0 accent-[var(--color-cyan)]"
                      />
                      <span className="min-w-0 flex-1">
                        <Md text={o.text} inline />
                      </span>
                      {state === 'correct' && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-mint" aria-label="correct option" />}
                      {state === 'wrong' && <XCircle size={16} className="mt-0.5 shrink-0 text-rose" aria-label="wrong choice" />}
                    </label>
                    {done && (selected || o.correct) && <Md text={o.why} className="mt-2 border-t border-cyber-border pt-2 text-sm text-ink-muted" />}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary" disabled={chosen.length === 0 || done} onClick={() => check(qi)}>
                Check answer
              </Button>
              <span aria-live="polite" className={`text-sm ${right ? 'text-mint' : 'text-rose'}`}>
                {done ? (right ? 'Correct' : 'Not quite: read the explanations') : ''}
              </span>
            </div>
          </fieldset>
        )
      })}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cyber-border bg-surface-2 px-4 py-3" aria-live="polite">
        <span className="font-mono text-sm text-ink">
          Score: <span className="text-cyan">{score}</span> / {questions.length}
        </span>
        {answered === questions.length && (
          <span className="text-sm text-ink-muted">{score === questions.length ? '🎉 Perfect!' : 'Review the explanations and retry.'}</span>
        )}
        <Button size="sm" variant="ghost" icon={<RotateCcw size={13} aria-hidden="true" />} onClick={reset} className="ml-auto">
          Reset
        </Button>
      </div>
    </div>
  )
}
