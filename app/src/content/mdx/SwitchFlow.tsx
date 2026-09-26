import { useState } from 'react'
import { NOTES_EXAMPLE, run, type Arm } from '../../lib/switchflow.mjs'

const code = (line: string) => (line === '{value}' ? 'System.out.println(a + b);' : `System.out.println("${line}");`)
const labelText = (arm: Arm, arrow: boolean) =>
  arm.labels.includes('default') ? `default${arrow ? ' ->' : ':'}` : `case ${arm.labels.join(', ')}${arrow ? ' ->' : ':'}`

/**
 * Switch fall-through flow: the notes' switch (with `default` in the middle). Pick the value of `a + b`, toggle each
 * `break` or switch to arrow labels, and see where control enters, which arms run and what is printed. The semantics
 * live in src/lib/switchflow.mjs and are checked on every build against the JVM-verified output of the notes' example.
 */
export function SwitchFlow({ initial = 10 }: { initial?: number }) {
  const [value, setValue] = useState(initial)
  const [arrow, setArrow] = useState(false)
  const [breaks, setBreaks] = useState(NOTES_EXAMPLE.map((a) => a.hasBreak))
  const arms: Arm[] = NOTES_EXAMPLE.map((a, i) => ({ ...a, hasBreak: breaks[i] }))
  const result = run(arms, value, arrow)
  const entered = result.start
  const matched = entered >= 0 && arms[entered].labels.includes(value)

  let story: string
  if (entered < 0) story = `No case matches ${value} and there's no default, so nothing runs.`
  else {
    const first = matched ? `${value} matches ${labelText(arms[entered], false).replace(':', '')}` : `No case matches ${value}, so control jumps to default, wherever it is written`
    const last = result.executed[result.executed.length - 1]
    const through = result.executed.length > 1 ? `, then falls through ${result.executed.length - 1} more arm${result.executed.length > 2 ? 's' : ''} because there's no break` : ''
    const end = arrow ? ' Arrow labels never fall through.' : arms[last].hasBreak ? ` It stops at the break in ${labelText(arms[last], false).replace(':', '')}.` : ' It stops at the end of the switch.'
    story = `${first}${through}.${end}`
  }

  return (
    <figure className="jx-switchflow my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-ink-dim">
          <span>
            Value of <span className="font-mono text-ink">a + b</span>
          </span>
          <span className="flex items-center gap-2">
            <button type="button" aria-label="Decrease" onClick={() => setValue((v) => v - 1)} className="h-9 w-9 rounded-md border border-cyber-border font-mono text-ink-muted hover:text-cyan">
              −
            </button>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number.parseInt(e.target.value || '0', 10))}
              className="h-9 w-20 rounded-md border border-cyber-border bg-void px-2 text-center font-mono text-sm text-ink outline-none focus:border-cyan"
            />
            <button type="button" aria-label="Increase" onClick={() => setValue((v) => v + 1)} className="h-9 w-9 rounded-md border border-cyber-border font-mono text-ink-muted hover:text-cyan">
              +
            </button>
          </span>
        </label>
        <div className="inline-flex rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Label style">
          {[false, true].map((a) => (
            <button
              key={String(a)}
              type="button"
              aria-pressed={arrow === a}
              onClick={() => setArrow(a)}
              className={`rounded-md px-2.5 py-1.5 font-mono text-xs ${arrow === a ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {a ? 'case 3 ->' : 'case 3:'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-cyber-border bg-void p-3 font-mono text-[13px] leading-6">
        <div className="text-ink-muted">switch (a + b) {'{'}</div>
        {arms.map((arm, i) => {
          const ran = result.executed.includes(i)
          const isEntry = i === entered
          return (
            <div
              key={i}
              className={`my-0.5 rounded border-l-2 pl-3 ${isEntry ? 'border-amber bg-amber/5' : ran ? 'border-cyan bg-cyan/5' : 'border-transparent opacity-60'}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={ran ? 'text-magenta' : 'text-ink-dim'}>{labelText(arm, arrow)}</span>
                {arrow && <span className="text-ink">{code(arm.prints[0])}</span>}
                {isEntry && <span className="rounded bg-amber/15 px-1.5 text-[10px] text-amber">enters here</span>}
                {ran && !isEntry && <span className="rounded bg-cyan/10 px-1.5 text-[10px] text-cyan">falls through</span>}
              </div>
              {!arrow && (
                <>
                  {arm.prints.map((p) => (
                    <div key={p} className="pl-4 text-ink">
                      {code(p)}
                    </div>
                  ))}
                  <label className="flex items-center gap-2 pl-4 text-xs">
                    <input
                      type="checkbox"
                      checked={breaks[i]}
                      onChange={(e) => setBreaks((bs) => bs.map((b, k) => (k === i ? e.target.checked : b)))}
                      className="accent-[var(--color-cyan)]"
                    />
                    <span className={breaks[i] ? 'text-ink' : 'text-ink-dim line-through'}>break;</span>
                  </label>
                </>
              )}
            </div>
          )
        })}
        <div className="text-ink-muted">{'}'}</div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-cyber-border bg-surface-2 p-3" aria-live="polite">
          <p className="text-[11px] uppercase tracking-wider text-ink-dim">Output</p>
          <pre className="!m-0 !bg-transparent !p-0 font-mono text-sm text-mint">{result.output.length ? result.output.join('\n') : '(nothing)'}</pre>
        </div>
        <p className="text-sm text-ink-muted">{story}</p>
      </div>
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Follows JLS §14.11.3; the notes&apos; example (a + b = 10) matches its output on a JVM
      </figcaption>
    </figure>
  )
}
