import { useMemo, useState, type ReactNode } from 'react'
import { INIT_PROGRAMS, initTrace, type InitProgramId, type InitStep } from '../../lib/initorder.mjs'
import { CodeView } from './CodeView'
import { StepControls, stepKeys } from './StepControls'

type BaseProgram = 'blocks' | 'override' | 'chaining'

const KIND: Record<InitStep['kind'], { label: string; tone: string }> = {
  start: { label: 'program starts', tone: 'border-cyber-border bg-surface-2 text-ink-muted' },
  print: { label: 'main runs', tone: 'border-cyber-border bg-surface-2 text-ink-muted' },
  clinit: { label: 'class initialisation', tone: 'border-magenta/40 bg-magenta/10 text-magenta' },
  static: { label: 'static initialiser', tone: 'border-magenta/40 bg-magenta/10 text-magenta' },
  alloc: { label: 'allocation: default values', tone: 'border-amber/40 bg-amber/10 text-amber' },
  ctor: { label: 'constructor call', tone: 'border-cyan/40 bg-cyan/10 text-cyan' },
  prologue: { label: 'prologue (Java 25)', tone: 'border-cyan/40 bg-cyan/10 text-cyan' },
  init: { label: 'instance initialiser', tone: 'border-mint/40 bg-mint/10 text-mint' },
  body: { label: 'constructor body', tone: 'border-cyan/40 bg-cyan/10 text-cyan' },
  call: { label: 'method call: dynamic dispatch', tone: 'border-amber/40 bg-amber/10 text-amber' },
  method: { label: 'method runs', tone: 'border-amber/40 bg-amber/10 text-amber' },
  done: { label: 'object ready', tone: 'border-mint/40 bg-mint/10 text-mint' },
  end: { label: 'program ends', tone: 'border-cyber-border bg-surface-2 text-ink-muted' },
}

const CLASS_STATE = {
  uninitialised: { label: 'not initialised', tone: 'border-cyber-border text-ink-dim' },
  initialising: { label: 'initialising…', tone: 'border-amber/50 bg-amber/5 text-amber' },
  initialised: { label: 'initialised', tone: 'border-mint/50 bg-mint/5 text-mint' },
} as const

const FRAME_KIND = { main: 'method', clinit: 'class initialisation', ctor: 'constructor', method: 'method' } as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-display text-[11px] font-semibold uppercase tracking-widest text-ink-dim">{title}</div>
      {children}
    </div>
  )
}

/**
 * Object-initialisation-order stepper: pick a program (static and instance blocks across a hierarchy, an override
 * called from a superclass constructor with or without a Java 25 prologue, or constructors chained with this(...))
 * and step through it. Shows the line running, which classes are initialised, every object's fields (default values
 * first, then initialisers and assignments), the constructor frames and the output. The semantics live in
 * src/lib/initorder.mjs (JLS §12.4.2 and §12.5) and are checked on every build.
 */
export function InitOrderLab({ program: initialProgram = 'blocks', java25: initialJava25 = false }: { program?: BaseProgram; java25?: boolean }) {
  const [base, setBase] = useState<BaseProgram>(initialProgram)
  const [java25, setJava25] = useState(initialJava25)
  const [index, setIndex] = useState(0)
  const id: InitProgramId = base === 'override' && java25 ? 'override25' : base
  const run = useMemo(() => initTrace(id), [id])
  const step = run.steps[Math.min(index, run.steps.length - 1)]

  const choose = (p: BaseProgram) => {
    setBase(p)
    setIndex(0)
  }

  return (
    <figure
      className="jx-initorder my-5 rounded-xl border border-cyan/30 bg-surface p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
      tabIndex={0}
      aria-label="Object initialisation order stepper. Use the left and right arrow keys to step."
      onKeyDown={stepKeys(index, run.steps.length, setIndex)}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Program">
          {(['blocks', 'override', 'chaining'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={base === p}
              onClick={() => choose(p)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${base === p ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {INIT_PROGRAMS[p].label}
            </button>
          ))}
        </div>
        {base === 'override' && (
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={java25}
              onChange={(e) => {
                setJava25(e.target.checked)
                setIndex(0)
              }}
              className="accent-[var(--color-cyan)]"
            />
            Java 25: assign <code className="font-mono text-ink">stock</code> before <code className="font-mono text-ink">super()</code>
          </label>
        )}
      </div>
      <p className="!mt-2 text-xs text-ink-dim">{INIT_PROGRAMS[id].summary}</p>

      <div className="mt-3">
        <CodeView lines={run.source} current={step.line} paused={step.frames.slice(1).map((f) => f.line)} title="Main.java" maxHeight={300} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <Section title="Classes">
            <div className="flex flex-wrap gap-1.5">
              {step.classes.map((c) => {
                const st = CLASS_STATE[c.state]
                return (
                  <div key={c.name} className={`rounded-lg border px-2.5 py-1 ${st.tone}`}>
                    <span className="font-mono text-[12.5px] font-semibold text-ink">{c.name}</span>
                    <span className="ml-1.5 text-[11px]">{st.label}</span>
                    {c.statics.map((f) => (
                      <div key={f.name} className={`font-mono text-[11px] ${f.changed ? 'text-cyan' : 'text-ink-muted'}`}>
                        static {f.name} = {f.value}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Objects">
            {step.objects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-cyber-border px-3 py-2 text-center text-xs text-ink-dim">no objects yet</div>
            ) : (
              <div className="space-y-1.5">
                {step.objects.map((o) => (
                  <div key={o.id} className={`rounded-lg border px-3 py-1.5 ${o.active ? 'border-amber/50 bg-amber/5' : 'border-cyber-border bg-surface-2'}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[12.5px] font-semibold text-ink">
                        {o.cls} #{o.id}
                      </span>
                      <span className={`text-[11px] ${o.done ? 'text-mint' : 'text-amber'}`}>{o.done ? 'ready' : 'being built'}</span>
                    </div>
                    {o.fields.length === 0 && <div className="text-[11px] text-ink-dim">no fields</div>}
                    {o.fields.map((f) => (
                      <div
                        key={`${f.owner}.${f.name}`}
                        className={`flex items-baseline justify-between gap-2 rounded px-1 font-mono text-[12px] ${f.changed ? 'bg-cyan/15' : ''}`}
                      >
                        <span className="min-w-0 truncate text-ink-muted">
                          {f.owner !== o.cls && <span className="text-ink-dim">{f.owner}.</span>}
                          {f.final && <span className="text-ink-dim">final </span>}
                          {f.type} {f.name}
                        </span>
                        <span className={`shrink-0 ${f.assigned ? 'text-mint' : 'text-ink-dim'}`}>
                          {f.value}
                          {!f.assigned && <span className="ml-1 text-[10px]">(default)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="min-w-0">
          <Section title="Stack (top first)">
            <div role="list" className="space-y-1" aria-label="Stack frames, top first">
              {step.frames.length === 0 && (
                <div role="listitem" className="rounded-lg border border-dashed border-cyber-border px-3 py-2 text-center text-xs text-ink-dim">
                  empty stack
                </div>
              )}
              {step.frames.map((f, i) => (
                <div role="listitem" key={step.frames.length - i} className={`rounded-lg border px-3 py-1 ${i === 0 ? 'border-cyan/50 bg-cyan/5' : 'border-cyber-border bg-surface-2'}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`min-w-0 truncate font-mono text-[12.5px] ${i === 0 ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{f.label}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-dim">{FRAME_KIND[f.kind]}</span>
                  </div>
                  {f.detail && <div className="truncate font-mono text-[11px] text-ink-dim">{f.detail}</div>}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-cyber-border bg-surface-2 p-3">
        <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${KIND[step.kind].tone}`}>{KIND[step.kind].label}</span>
        <p className="!mt-1.5 min-h-[3rem] text-sm leading-relaxed text-ink" aria-live="polite">
          {step.note}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-cyber-border bg-void px-3 py-2">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-dim">Output</div>
        <pre className="!m-0 min-h-[1.5em] !border-0 !bg-transparent !p-0 font-mono text-[12.5px] leading-relaxed text-ink">
          {step.out.length === 0 ? <span className="text-ink-dim">(nothing yet)</span> : step.out.join('\n')}
        </pre>
      </div>

      <div className="mt-3">
        <StepControls index={index} count={run.steps.length} onChange={setIndex} interval={1600} />
      </div>
      <figcaption className="mt-2 text-xs text-ink-dim">
        Follows JLS §12.4.2 (class initialisation) and §12.5 (creating an object), Java 25 rules including constructor
        prologues (JEP 513). The output of every program is checked on each build against answers worked out from the
        specification.
      </figcaption>
    </figure>
  )
}
