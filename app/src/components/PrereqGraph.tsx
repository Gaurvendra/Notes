import { useMemo, useState } from 'react'
import { useProgress } from '../context/ProgressContext'
import { curriculum, isUnlocked, type LevelName } from '../lib/curriculum'

const NODE_W = 168, NODE_H = 40, GAP_X = 16, ROW_GAP = 30, BAND_HEAD = 30, BAND_GAP = 10, PAD = 12

const LEVEL_COLOUR: Record<LevelName, string> = {
  Beginner: 'var(--color-mint)',
  Intermediate: 'var(--color-cyan)',
  Advanced: 'var(--color-magenta)',
  Expert: 'var(--color-amber)',
}

/**
 * The whole learning graph laid out in tier bands: lessons inside a tier sit in sub-rows by their in-tier
 * dependencies, ordered with a barycenter heuristic to reduce crossings. Computed once; nothing changes at runtime.
 */
function layout() {
  const { lessons, tiers, byId } = curriculum
  type Row = { tier: number; ids: string[] }
  const rows: Row[] = []
  const rowOf = new Map<string, number>()
  for (const t of tiers) {
    const local = new Map<string, number>()
    const depth = (id: string): number => {
      if (!local.has(id)) {
        const ps = byId.get(id)!.prereqs.filter((p) => byId.get(p)!.tier === t.n)
        local.set(id, ps.length ? 1 + Math.max(...ps.map(depth)) : 0)
      }
      return local.get(id)!
    }
    t.lessons.forEach((l) => depth(l.id))
    const levels = Math.max(...local.values()) + 1
    for (let k = 0; k < levels; k++) {
      const ids = t.lessons.filter((l) => local.get(l.id) === k).map((l) => l.id)
      ids.forEach((id) => rowOf.set(id, rows.length))
      rows.push({ tier: t.n, ids })
    }
  }
  const maxPerRow = Math.max(...rows.map((r) => r.ids.length))
  const width = PAD * 2 + maxPerRow * NODE_W + (maxPerRow - 1) * GAP_X
  const xOf = new Map<string, number>()
  const place = (r: Row) => r.ids.forEach((id, i) => xOf.set(id, width / 2 + (i - (r.ids.length - 1) / 2) * (NODE_W + GAP_X)))
  rows.forEach(place)
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined)
  for (let sweep = 0; sweep < 6; sweep++) {
    for (const r of sweep % 2 === 0 ? rows : [...rows].reverse()) {
      const key = (id: string) => {
        const l = byId.get(id)!
        return avg((sweep % 2 === 0 ? l.prereqs : l.unlocks).map((x) => xOf.get(x)!)) ?? xOf.get(id)!
      }
      r.ids.sort((a, b) => key(a) - key(b))
      place(r)
    }
  }
  const yOfRow: number[] = []
  const bands: { tier: number; name: string; level: LevelName; y: number; h: number }[] = []
  let y = PAD
  for (const t of tiers) {
    const top = y
    y += BAND_HEAD
    rows.forEach((r, i) => {
      if (r.tier !== t.n) return
      yOfRow[i] = y + NODE_H / 2
      y += NODE_H + ROW_GAP
    })
    y = y - ROW_GAP + 14
    bands.push({ tier: t.n, name: t.name, level: t.level, y: top, h: y - top })
    y += BAND_GAP
  }
  const height = y + PAD - BAND_GAP
  const pos = (id: string) => ({ x: xOf.get(id)!, y: yOfRow[rowOf.get(id)!] })
  const nodes = lessons.map((l) => ({ l, ...pos(l.id) }))
  const edges = lessons.flatMap((l) =>
    l.prereqs.map((p) => {
      const a = pos(p), b = pos(l.id)
      const y1 = a.y + NODE_H / 2, y2 = b.y - NODE_H / 2
      const dy = Math.max(24, (y2 - y1) / 2)
      return { from: p, to: l.id, d: `M${a.x},${y1} C${a.x},${y1 + dy} ${b.x},${y2 - dy} ${b.x},${y2}` }
    }),
  )
  return { width, height, bands, nodes, edges }
}

const LAYOUT = layout()

function wrap(text: string) {
  if (text.length <= 22) return [text]
  const lines = ['']
  for (const w of text.split(' ')) {
    const cur = lines[lines.length - 1]
    if ((cur + ' ' + w).trim().length > 22 && cur) lines.push(w)
    else lines[lines.length - 1] = (cur + ' ' + w).trim()
  }
  return lines.length > 2 ? [lines[0], lines.slice(1).join(' ').slice(0, 21) + '…'] : lines
}

function walk(start: string, next: (id: string) => string[]) {
  const seen = new Set<string>()
  const stack = [...next(start)]
  while (stack.length) {
    const id = stack.pop()!
    if (!seen.has(id)) {
      seen.add(id)
      stack.push(...next(id))
    }
  }
  return seen
}

/** The prerequisite graph: hover or focus a lesson to trace everything it needs and everything it unlocks. */
export function PrereqGraph() {
  const { completedSet } = useProgress()
  const [focus, setFocus] = useState<string | null>(null)
  const related = useMemo(() => {
    if (!focus) return null
    const byId = curriculum.byId
    return new Set([...walk(focus, (x) => byId.get(x)!.prereqs), ...walk(focus, (x) => byId.get(x)!.unlocks), focus])
  }, [focus])
  const { width, height, bands, nodes, edges } = LAYOUT

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        {(Object.keys(LEVEL_COLOUR) as LevelName[]).map((lv) => (
          <span key={lv} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_COLOUR[lv] }} /> {lv}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan" /> completed (filled)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border-2 border-ink" /> ready to start (bold)
        </span>
        <span className="text-ink-dim">Hover or focus a lesson to trace its prerequisites.</span>
      </div>
      <div className="max-h-[75vh] overflow-auto rounded-xl border border-cyber-border bg-surface" tabIndex={0} aria-label="Learning path graph (scrollable)">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Graph of ${nodes.length} lessons and their prerequisites, in ${bands.length} tier bands`} fontFamily="Inter, sans-serif">
          {bands.map((b) => (
            <g key={b.tier}>
              <rect x={2} y={b.y} width={width - 4} height={b.h} rx={10} fill={LEVEL_COLOUR[b.level]} fillOpacity={0.05} stroke={LEVEL_COLOUR[b.level]} strokeOpacity={0.25} />
              <text x={12} y={b.y + 19} fontSize={12} fontWeight={600} fill={LEVEL_COLOUR[b.level]} fontFamily="Space Grotesk, sans-serif">
                T{b.tier} · {b.name}
              </text>
            </g>
          ))}
          <g fill="none">
            {edges.map((e) => {
              const on = related ? related.has(e.from) && related.has(e.to) : false
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={e.d}
                  stroke={on ? 'var(--color-cyan)' : 'var(--color-cyber-border-strong)'}
                  strokeWidth={on ? 2 : 1.2}
                  opacity={related && !on ? 0.15 : 1}
                />
              )
            })}
          </g>
          {nodes.map(({ l, x, y }) => {
            const done = completedSet.has(l.id)
            const ready = !done && isUnlocked(l, completedSet)
            const dim = related && !related.has(l.id)
            const colour = LEVEL_COLOUR[l.level]
            return (
              <a
                key={l.id}
                href={l.url}
                onMouseEnter={() => setFocus(l.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(l.id)}
                onBlur={() => setFocus(null)}
                style={{ cursor: 'pointer', opacity: dim ? 0.25 : 1 }}
              >
                <title>{`T${l.tier} · ${l.label}${l.status === 'done' ? ' (guide)' : ' (outline)'}${l.prereqs.length ? `\nNeeds: ${l.prereqs.map((p) => curriculum.byId.get(p)!.label).join(', ')}` : ''}`}</title>
                <rect
                  x={x - NODE_W / 2}
                  y={y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={9}
                  fill={done ? colour : 'var(--color-surface-2)'}
                  fillOpacity={done ? 0.3 : 1}
                  stroke={focus === l.id ? 'var(--color-ink)' : colour}
                  strokeWidth={focus === l.id || ready ? 2.4 : 1.2}
                  strokeDasharray={l.status === 'done' ? undefined : '4 3'}
                />
                {wrap(l.label).map((line, i, arr) => (
                  <text key={i} x={x} y={y + (arr.length === 1 ? 4 : i === 0 ? -3 : 11)} textAnchor="middle" fontSize={11.5} fill="var(--color-ink)" fontWeight={ready ? 600 : 400}>
                    {line}
                  </text>
                ))}
              </a>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-ink-dim">Solid border: guide written · dashed border: outline. Click a lesson to open it.</p>
    </div>
  )
}
