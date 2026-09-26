import { useMemo, useState } from 'react'
import { PROGRAMS, trace, type CallStep, type ProgramId } from '../../lib/callstack.mjs'
import { CodeView } from './CodeView'
import { StepControls, stepKeys } from './StepControls'

const KIND: Record<CallStep['kind'], { label: string; tone: string }> = {
  call: { label: 'call: frame pushed', tone: 'border-cyan/40 bg-cyan/10 text-cyan' },
  line: { label: 'running', tone: 'border-cyber-border bg-surface-2 text-ink-muted' },
  print: { label: 'output', tone: 'border-amber/40 bg-amber/10 text-amber' },
  return: { label: 'return: frame popped', tone: 'border-mint/40 bg-mint/10 text-mint' },
  overflow: { label: 'StackOverflowError', tone: 'border-rose/40 bg-rose/10 text-rose' },
  end: { label: 'program ends', tone: 'border-cyber-border bg-surface-2 text-ink-muted' },
}

const argList = (args: Record<string, unknown>) =>
  Object.entries(args)
    .map(([k, v]) => (k === 'args' ? 'args' : `${k} = ${String(v)}`))
    .join(', ')

/**
 * Call-stack lab: pick a small recursive program and its argument, then step through it. Every call pushes a frame
 * with its own parameters, every return pops one, and a program without a base case fills the stack until
 * StackOverflowError. The traces come from src/lib/callstack.mjs, which is checked on every build.
 */
export function CallStackLab({ program: initialProgram = 'factorial', arg: initialArg }: { program?: ProgramId; arg?: number }) {
  const [program, setProgram] = useState<ProgramId>(initialProgram)
  const [arg, setArg] = useState(initialArg ?? PROGRAMS[initialProgram].initial)
  const [index, setIndex] = useState(0)
  const p = PROGRAMS[program]
  const run = useMemo(() => trace(program, arg), [program, arg])
  const step = run.steps[Math.min(index, run.steps.length - 1)]
  const cap = program === 'overflow' ? run.arg : undefined

  const choose = (id: ProgramId) => {
    setProgram(id)
    setArg(PROGRAMS[id].initial)
    setIndex(0)
  }
  const changeArg = (v: number) => {
    setArg(Math.max(p.min, Math.min(p.max, v)))
    setIndex(0)
  }

  return (
    <figure
      className="jx-callstack my-5 rounded-xl border border-cyan/30 bg-surface p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
      tabIndex={0}
      aria-label="Call-stack lab. Use the left and right arrow keys to step."
      onKeyDown={stepKeys(index, run.steps.length, setIndex)}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Program">
          {(Object.keys(PROGRAMS) as ProgramId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={program === id}
              onClick={() => choose(id)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${program === id ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {PROGRAMS[id].label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-dim">
          <span>{p.argLabel}</span>
          <button type="button" aria-label="Decrease" disabled={arg <= p.min} onClick={() => changeArg(arg - 1)} className="h-8 w-8 rounded-md border border-cyber-border font-mono text-ink-muted hover:text-cyan disabled:opacity-40">
            −
          </button>
          <span className="w-7 text-center font-mono text-sm text-ink" aria-live="polite">
            {arg}
          </span>
          <button type="button" aria-label="Increase" disabled={arg >= p.max} onClick={() => changeArg(arg + 1)} className="h-8 w-8 rounded-md border border-cyber-border font-mono text-ink-muted hover:text-cyan disabled:opacity-40">
            +
          </button>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <CodeView lines={run.source} current={step.line} paused={step.frames.slice(1).map((f) => f.line ?? 0)} title="Java" maxHeight={330} />
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-dim" title="The top frame is the method running now">
              Stack
            </span>
            <span className="font-mono text-[11px] text-ink-dim">
              {cap ? `${step.depth}/${cap} frames` : `depth ${step.depth}`} · calls {step.calls} · max {step.maxDepth}
            </span>
          </div>
          {cap && (
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
              <div className={`h-full transition-[width] ${step.kind === 'overflow' ? 'bg-rose' : 'bg-cyan'}`} style={{ width: `${(step.depth / cap) * 100}%` }} />
            </div>
          )}
          <div role="list" className="space-y-1.5" aria-label="Stack frames, top first">
            {step.frames.length === 0 && (
              <div role="listitem" className="rounded-lg border border-dashed border-cyber-border px-3 py-3 text-center text-xs text-ink-dim">empty stack</div>
            )}
            {step.frames.map((f, i) => {
              const top = i === 0
              const tone = top ? (step.kind === 'overflow' ? 'border-rose/60 bg-rose/5' : 'border-cyan/50 bg-cyan/5') : 'border-cyber-border bg-surface-2'
              return (
                <div role="listitem" key={step.frames.length - i} className={`rounded-lg border px-3 py-1.5 ${tone}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`min-w-0 truncate font-mono text-[13px] ${top ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                      {f.method}({argList(f.args)})
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-dim">line {f.line}</span>
                  </div>
                  {f.waiting && <div className="truncate font-mono text-[11px] text-amber">waiting: {f.waiting}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-cyber-border bg-surface-2 p-3">
        <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${KIND[step.kind].tone}`}>{KIND[step.kind].label}</span>
        <p className="!mt-1.5 text-sm leading-relaxed text-ink" aria-live="polite">
          {step.note}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-cyber-border bg-void px-3 py-2">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-dim">Output</div>
        <pre className="!m-0 min-h-[1.5em] !border-0 !bg-transparent !p-0 font-mono text-[12.5px] leading-relaxed">
          {step.out.length === 0 ? (
            <span className="text-ink-dim">(nothing yet)</span>
          ) : (
            step.out.map((line, i) => (
              <div key={i} className={/^(Exception|\tat )/.test(line) ? 'text-rose' : 'text-ink'}>
                {line}
              </div>
            ))
          )}
        </pre>
      </div>

      <div className="mt-3">
        <StepControls index={index} count={run.steps.length} onChange={setIndex} />
      </div>
      {program === 'overflow' && (
        <figcaption className="mt-2 text-xs text-ink-dim">
          A real thread stack (set with <code>-Xss</code>) holds thousands of small frames; this lab uses a tiny stack so you can
          watch it fill up.
        </figcaption>
      )}
    </figure>
  )
}
