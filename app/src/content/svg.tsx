import type { ReactNode } from 'react'

/**
 * Minimal primitives for hand-authored inline SVG diagrams.
 *
 * Inline SVG rather than image files: it stays crisp at any zoom, inherits the
 * cyber palette, adds zero bytes to the PWA precache, and works fully offline.
 * Arrowheads are drawn as polygons instead of <marker> defs so that several
 * diagrams can share a page without colliding on element ids.
 */

/**
 * Diagram palette, as CSS variable references rather than literal hex.
 *
 * SVG presentation attributes accept `var(--x)`, so every hand-authored
 * diagram re-colours itself when the scheme changes — including into light
 * mode — without a single content file being touched. The variable names
 * are the same semantic slots the rest of the app uses (see styles/themes.css).
 */
export const PAL = {
  cyan: 'var(--color-cyan)',
  magenta: 'var(--color-magenta)',
  mint: 'var(--color-mint)',
  amber: 'var(--color-amber)',
  rose: 'var(--color-rose)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-ink-muted)',
  dim: 'var(--color-ink-dim)',
  border: 'var(--color-cyber-border)',
  surface: 'var(--color-surface-2)',
  surface3: 'var(--color-surface-3)',
  void: 'var(--color-void)',
} as const

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
const UI = 'Space Grotesk, ui-sans-serif, system-ui, sans-serif'

export function Canvas({
  w,
  h,
  minW,
  label,
  children,
}: {
  w: number
  h: number
  minW?: number
  label: string
  children: ReactNode
}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ minWidth: minW ?? w }} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

export function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  color = PAL.cyan,
  fill = PAL.surface,
  dashed,
}: {
  x: number
  y: number
  w: number
  h: number
  title?: string
  sub?: string
  color?: string
  fill?: string
  dashed?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={fill}
        stroke={color}
        strokeWidth={1.2}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      {title && (
        <text
          x={x + w / 2}
          y={sub ? y + h / 2 - 1 : y + h / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontFamily={UI}
          fill={PAL.ink}
        >
          {title}
        </text>
      )}
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={PAL.muted}>
          {sub}
        </text>
      )}
    </g>
  )
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = PAL.dim,
  dashed,
  label,
  labelDy = -5,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  dashed?: boolean
  label?: string
  labelDy?: number
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 7
  const bx = x2 - head * Math.cos(angle)
  const by = y2 - head * Math.sin(angle)
  const sin = Math.sin(angle) * head * 0.42
  const cos = Math.cos(angle) * head * 0.42
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={1.4} strokeDasharray={dashed ? '4 3' : undefined} />
      <polygon points={`${x2},${y2} ${bx + sin},${by - cos} ${bx - sin},${by + cos}`} fill={color} />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 + labelDy}
          textAnchor="middle"
          fontSize="8.5"
          fontFamily={MONO}
          fill={color}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export function Txt({
  x,
  y,
  children,
  color = PAL.muted,
  size = 9.5,
  anchor = 'start',
  mono = true,
  weight,
}: {
  x: number
  y: number
  children: ReactNode
  color?: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  mono?: boolean
  weight?: number
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily={mono ? MONO : UI} fill={color} fontWeight={weight}>
      {children}
    </text>
  )
}

/** A section label above a group of boxes. */
export function Caption({ x, y, children, color = PAL.dim }: { x: number; y: number; children: ReactNode; color?: string }) {
  return (
    <text x={x} y={y} fontSize="8.5" fontFamily={MONO} fill={color} letterSpacing="1.2">
      {children}
    </text>
  )
}
