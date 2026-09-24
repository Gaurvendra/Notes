import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Children, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react'
import { Button } from '../../components/ui'

/* ------------------------------------------------------------ MemoryDiagram */

interface Var {
  name: string
  value?: string
  ref?: string
  type?: string
  highlight?: boolean
}
interface Frame {
  name: string
  vars: Var[]
  gone?: boolean
  highlight?: boolean
}
interface HeapObject {
  id: string
  label: string
  fields?: Var[]
  pool?: boolean
  gc?: boolean
  highlight?: boolean
}

const C = {
  box: 'var(--color-surface-2)',
  border: 'var(--color-cyber-border-strong)',
  head: 'var(--color-ink)',
  name: 'var(--color-ink-muted)',
  value: 'var(--color-mint)',
  ref: 'var(--color-cyan)',
  muted: 'var(--color-ink-dim)',
  hl: 'var(--color-amber)',
}
const MONO = 'JetBrains Mono, ui-monospace, monospace'

/**
 * Stack & heap diagram as inline SVG. Frames are listed top of stack first. Flags: frame.gone (popped),
 * object.gc (unreachable), *.highlight. Objects with `pool` sit in the String Constant Pool region.
 *
 * <MemoryDiagram caption="…" frames={[{ name: 'main()', vars: [{ name: 'p', ref: 'p1' }] }]}
 *   heap={[{ id: 'p1', label: 'Person', fields: [{ name: 'name', ref: 's1' }] }, { id: 's1', label: '"Ann"', pool: true }]} />
 */
export function MemoryDiagram({
  frames,
  heap = [],
  caption,
  stackTitle = 'Stack',
  heapTitle = 'Heap',
}: {
  frames: Frame[]
  heap?: HeapObject[]
  caption?: string
  stackTitle?: string
  heapTitle?: string
}) {
  const markerId = `mem-arrow-${useId().replace(/:/g, '')}`
  const PAD = 16, TITLE = 28, STACK_W = 240, GAP = 110, HEAP_W = 250, RIGHT = 60
  const FRAME_HEAD = 28, ROW = 24, OBJ_HEAD = 28, OBJ_ROW = 22, V_GAP = 14
  const stackX = PAD
  const heapX = PAD + STACK_W + GAP

  let y = PAD + TITLE
  const frameBoxes = frames.map((f) => {
    const h = FRAME_HEAD + Math.max(1, f.vars.length) * ROW + 8
    const box = { ...f, x: stackX, y, w: STACK_W, h }
    y += h + V_GAP
    return box
  })
  const stackBottom = y

  const objectHeight = (o: HeapObject) => (o.fields?.length ? OBJ_HEAD + o.fields.length * OBJ_ROW + 6 : OBJ_HEAD + 6)
  let hy = PAD + TITLE
  const objBoxes = new Map<string, HeapObject & { x: number; y: number; w: number; h: number }>()
  for (const o of heap.filter((o) => !o.pool)) {
    const h = objectHeight(o)
    objBoxes.set(o.id, { ...o, x: heapX, y: hy, w: HEAP_W, h })
    hy += h + V_GAP
  }
  let pool: { x: number; y: number; w: number; h: number } | undefined
  const pooled = heap.filter((o) => o.pool)
  if (pooled.length) {
    const poolTop = hy + 6
    let py = poolTop + 30
    for (const o of pooled) {
      const h = objectHeight(o)
      objBoxes.set(o.id, { ...o, x: heapX + 14, y: py, w: HEAP_W - 28, h })
      py += h + 10
    }
    pool = { x: heapX, y: poolTop, w: HEAP_W, h: py - poolTop + 4 }
    hy = py + 14
  }
  const width = heapX + HEAP_W + RIGHT
  const height = Math.max(stackBottom, hy) + PAD - V_GAP + 4

  const arrows: { d: string; gc: boolean }[] = []
  const missing: string[] = []
  frameBoxes.forEach((f) =>
    f.vars.forEach((v, i) => {
      if (!v.ref) return
      const t = objBoxes.get(v.ref)
      if (!t) return void missing.push(v.ref)
      const x1 = f.x + f.w - 8, y1 = f.y + FRAME_HEAD + i * ROW + ROW / 2
      const x2 = t.x, y2 = t.y + OBJ_HEAD / 2
      const mx = (x1 + x2) / 2
      arrows.push({ d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 2},${y2}`, gc: Boolean(f.gone || t.gc) })
    }),
  )
  ;[...objBoxes.values()].forEach((o) =>
    (o.fields ?? []).forEach((fd, i) => {
      if (!fd.ref) return
      const t = objBoxes.get(fd.ref)
      if (!t) return void missing.push(fd.ref)
      const x1 = o.x + o.w, y1 = o.y + OBJ_HEAD + i * OBJ_ROW + OBJ_ROW / 2
      const x2 = t.x + t.w, y2 = t.y + OBJ_HEAD / 2
      const bulge = Math.max(x1, x2) + 44
      arrows.push({ d: `M${x1 - 6},${y1} C${bulge},${y1} ${bulge},${y2} ${x2 + 2},${y2}`, gc: Boolean(o.gc || t.gc) })
    }),
  )
  if (missing.length) throw new Error(`MemoryDiagram: unknown ref(s) ${missing.join(', ')}`)

  const row = (v: Var, x: number, w: number, ty: number, key: number) => (
    <g key={key}>
      <text x={x + 12} y={ty} fill={v.highlight ? C.hl : C.name} fontWeight={v.highlight ? 700 : 400}>
        {v.type ? `${v.type} ` : ''}
        {v.name}
      </text>
      <text x={x + w - 14} y={ty} textAnchor="end" fill={v.ref ? C.ref : C.value} fontSize={v.ref ? 18 : 13} fontWeight={600}>
        {v.ref ? '•' : v.value}
      </text>
    </g>
  )

  return (
    <figure className="jx-figure my-5 rounded-xl border border-cyber-border bg-surface p-4">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ minWidth: 520, maxWidth: 768 }} role="img" aria-label={caption ?? 'Memory diagram: stack frames on the left, heap objects on the right'} fontFamily={MONO} fontSize={13}>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={C.ref} />
            </marker>
          </defs>
          <text x={stackX} y={PAD + 14} fill={C.name} fontWeight={700} fontSize={14} fontFamily="Space Grotesk, sans-serif">
            {stackTitle}
          </text>
          <text x={heapX} y={PAD + 14} fill={C.name} fontWeight={700} fontSize={14} fontFamily="Space Grotesk, sans-serif">
            {heapTitle}
          </text>
          {frameBoxes.map((f, fi) => (
            <g key={fi} opacity={f.gone ? 0.45 : 1}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="8" fill={C.box} stroke={f.highlight ? C.hl : C.border} strokeWidth={f.highlight ? 2.4 : 1.2} />
              <text x={f.x + 10} y={f.y + 19} fill={C.head} fontWeight={700}>
                {f.name}
                {f.gone ? '  (popped)' : ''}
              </text>
              {f.vars.length === 0 && (
                <text x={f.x + 12} y={f.y + FRAME_HEAD + 16} fill={C.muted} fontSize={12}>
                  no locals
                </text>
              )}
              {f.vars.map((v, i) => row(v, f.x, f.w, f.y + FRAME_HEAD + i * ROW + 16, i))}
            </g>
          ))}
          {pool && (
            <g>
              <rect x={pool.x} y={pool.y} width={pool.w} height={pool.h} rx="10" fill="none" stroke={C.border} strokeDasharray="5 4" />
              <text x={pool.x + 10} y={pool.y + 19} fill={C.muted} fontSize={12}>
                String Constant Pool
              </text>
            </g>
          )}
          {[...objBoxes.values()].map((o) => (
            <g key={o.id} opacity={o.gc ? 0.45 : 1}>
              <rect x={o.x} y={o.y} width={o.w} height={o.h} rx="8" fill={C.box} stroke={o.highlight ? C.hl : C.border} strokeWidth={o.highlight ? 2.4 : 1.2} />
              <text x={o.x + 10} y={o.y + 19} fill={C.head} fontWeight={700}>
                {o.label}
              </text>
              {o.gc && (
                <text x={o.x + o.w - 10} y={o.y + 19} textAnchor="end" fill={C.muted} fontSize={12}>
                  unreachable
                </text>
              )}
              {(o.fields ?? []).map((fd, i) => row(fd, o.x, o.w, o.y + OBJ_HEAD + i * OBJ_ROW + 15, i))}
            </g>
          ))}
          {arrows.map((a, i) => (
            <path key={i} d={a.d} fill="none" stroke={a.gc ? C.border : C.ref} strokeWidth={1.6} strokeDasharray={a.gc ? '4 4' : undefined} markerEnd={`url(#${markerId})`} />
          ))}
        </svg>
      </div>
      {caption && <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-ink-dim">{caption}</figcaption>}
    </figure>
  )
}

/* ---------------------------------------------------------------- Stepper */

export function Step({ children }: { title: string; children: ReactNode }) {
  return <>{children}</>
}

/** Step-through walkthrough (memory, call stack, GC…): children are <Step title="…"> elements. ←/→ keys work. */
export function Stepper({ title, children }: { title?: string; children: ReactNode }) {
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement<{ title: string; children: ReactNode }>[]
  const [i, setI] = useState(0)
  const go = (n: number) => setI(Math.max(0, Math.min(steps.length - 1, n)))
  const step = steps[i]
  return (
    <div
      className="jx-stepper my-5 rounded-xl border border-cyber-border bg-surface p-4"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(i + 1)
        if (e.key === 'ArrowLeft') go(i - 1)
      }}
    >
      {title && <p className="!mt-0 font-display font-semibold text-ink">{title}</p>}
      <p className="!mt-2 font-display text-sm font-semibold text-cyan">{step?.props.title}</p>
      <div className="jx-flow">{step?.props.children}</div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} aria-hidden="true" />} disabled={i === 0} onClick={() => go(i - 1)}>
          Prev
        </Button>
        <span className="font-mono text-xs text-ink-dim" aria-live="polite">
          Step {i + 1} of {steps.length}
        </span>
        <Button size="sm" variant="ghost" disabled={i === steps.length - 1} onClick={() => go(i + 1)}>
          Next <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
