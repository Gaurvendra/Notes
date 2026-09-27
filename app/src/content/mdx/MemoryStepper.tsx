import { useEffect, useMemo, useState } from 'react'
import { mdInline } from '../../lib/markdown'
import { loadTrace, type Trace } from '../../lib/traces'
import { CodeView } from './CodeView'
import { layoutMemory, memoryWidths, MemoryDiagram } from './memory'
import { StepControls, stepKeys } from './StepControls'

/**
 * Stack & heap stepper: a program on one side, its memory after each step on the other (frames, objects, the string
 * pool, arrows for references, popped frames and unreachable objects greyed out), with a note and the output so far.
 * The trace is src/content/traces/<trace>.yaml. Every step is drawn at the same size, so nothing jumps.
 */
export function MemoryStepper({ trace: id }: { trace: string }) {
  const [trace, setTrace] = useState<Trace | null>()
  const [index, setIndex] = useState(0)
  useEffect(() => {
    let alive = true
    loadTrace(id).then((t) => alive && setTrace(t ?? null))
    return () => {
      alive = false
    }
  }, [id])

  const size = useMemo(() => {
    if (!trace) return undefined
    const all = trace.steps
    const widths = {
      stack: Math.max(...all.map((s) => memoryWidths(s.frames, s.heap ?? []).stack)),
      heap: Math.max(...all.map((s) => memoryWidths(s.frames, s.heap ?? []).heap)),
    }
    const height = Math.max(...all.map((s) => layoutMemory(s.frames, s.heap ?? [], widths).height))
    return { widths, height }
  }, [trace])

  if (trace === undefined) return <p className="text-sm text-ink-dim">Loading the memory walkthrough…</p>
  if (trace === null || !size) return <p className="text-sm text-rose">Unknown memory trace: {id}</p>

  const lines = trace.code.replace(/\n$/, '').split('\n')
  const step = trace.steps[Math.min(index, trace.steps.length - 1)]
  const out = step.out?.replace(/\n$/, '')

  return (
    <figure
      className="jx-memstepper my-5 rounded-xl border border-cyan/30 bg-surface p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
      tabIndex={0}
      aria-label={`${trace.title}. Use the left and right arrow keys to step.`}
      onKeyDown={stepKeys(index, trace.steps.length, setIndex)}
    >
      <p className="!mt-0 font-display font-semibold text-ink">{trace.title}</p>
      <div className="mt-3">
        <CodeView lines={lines} current={step.line} title="Java" maxHeight={240} />
      </div>
      <div className="mt-3">
        <StepControls index={index} count={trace.steps.length} onChange={setIndex} interval={1800} />
      </div>
      <p className="!mt-2 min-h-[4.5rem] rounded-lg border border-cyber-border bg-surface-2 p-3 text-sm leading-relaxed text-ink" aria-live="polite" dangerouslySetInnerHTML={{ __html: mdInline(step.note) }} />
      <div className="mt-3 rounded-lg border border-cyber-border bg-void/40 p-2">
        <MemoryDiagram frames={step.frames} heap={step.heap ?? []} widths={size.widths} minHeight={size.height} bare caption={`Memory after step ${index + 1}`} />
      </div>
      {out !== undefined && (
        <div className="mt-3 rounded-lg border border-cyber-border bg-void px-3 py-2">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-dim">Output</div>
          <pre className="!m-0 min-h-[1.5em] !border-0 !bg-transparent !p-0 font-mono text-[12.5px] leading-relaxed text-ink">
            {out === '' ? <span className="text-ink-dim">(nothing yet)</span> : out}
          </pre>
        </div>
      )}
    </figure>
  )
}
