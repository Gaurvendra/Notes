import { useId, type ReactNode } from 'react'
import { mdInline } from '../../lib/markdown'

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs leading-relaxed text-ink-dim">{children}</figcaption>
}

/** A figure frame for any diagram: scrolls sideways on a phone instead of shrinking text to nothing. */
export function Figure({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="jx-figure my-5 rounded-xl border border-cyber-border bg-surface p-4">
      <div className="overflow-x-auto">{children}</div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

/* ------------------------------------------------------------ LayerDiagram */

interface Layer {
  title: string
  note?: string
  items?: string[]
}

const LAYER_COLOURS = ['var(--color-cyan)', 'var(--color-magenta)', 'var(--color-mint)', 'var(--color-amber)']

function LayerBox({ layers, depth = 0 }: { layers: Layer[]; depth?: number }) {
  const [layer, ...inner] = layers
  const c = LAYER_COLOURS[depth % LAYER_COLOURS.length]
  return (
    <div
      className="rounded-xl border-2 p-3"
      style={{ borderColor: `color-mix(in oklab, ${c} 55%, transparent)`, background: `color-mix(in oklab, ${c} 6%, transparent)` }}
    >
      <p className="!m-0 flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-sm font-semibold" style={{ color: c }}>
          {layer.title}
        </span>
        {layer.note && <span className="text-xs text-ink-dim">{layer.note}</span>}
      </p>
      {layer.items && layer.items.length > 0 && (
        <ul className="!my-2 flex flex-wrap gap-1.5 !pl-0">
          {layer.items.map((item, i) => (
            <li
              key={i}
              className="!m-0 list-none rounded-md border border-cyber-border bg-surface px-1.5 py-0.5 text-xs text-ink-muted"
              dangerouslySetInnerHTML={{ __html: mdInline(item) }}
            />
          ))}
        </ul>
      )}
      {inner.length > 0 && <LayerBox layers={inner} depth={depth + 1} />}
    </div>
  )
}

/** "A contains B contains C" as real nested boxes, outermost first. Items accept inline Markdown. */
export function LayerDiagram({ layers, caption }: { layers: Layer[]; caption?: string }) {
  return (
    <figure className="jx-figure my-5 rounded-xl border border-cyber-border bg-surface p-4">
      <LayerBox layers={layers} />
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

/* ---------------------------------------------------------------- BitLayout */

interface BitGroup {
  bits: string
  label?: string
  kind?: 'sign' | 'exponent' | 'mantissa' | 'value'
}

const BIT_KIND = {
  sign: 'border-rose/50 bg-rose/10 text-rose',
  exponent: 'border-cyan/50 bg-cyan/10 text-cyan',
  mantissa: 'border-magenta/50 bg-magenta/10 text-magenta',
  value: 'border-mint/50 bg-mint/10 text-mint',
} as const

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n: number) => String(n).split('').map((c) => SUP[c]).join('')

/** Bit-level layout, e.g. IEEE 754 fields or two's complement (with `weights`, and `signed` for a negative MSB). */
export function BitLayout({ groups, weights = false, signed = false, caption }: { groups: BitGroup[]; weights?: boolean; signed?: boolean; caption?: string }) {
  for (const g of groups) if (!/^[01]+$/.test(g.bits)) throw new Error(`BitLayout: invalid bits "${g.bits}"`)
  const total = groups.reduce((n, g) => n + g.bits.length, 0)
  const kinds = ['sign', 'exponent', 'mantissa'] as const
  let position = total
  const aria = caption ?? groups.map((g) => `${g.label ?? 'bits'}: ${g.bits}`).join('; ')
  return (
    <figure className="jx-figure my-5 rounded-xl border border-cyber-border bg-surface p-4" role="img" aria-label={aria}>
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max gap-2">
          {groups.map((g, gi) => {
            const kind = g.kind ?? (groups.length === 3 ? kinds[gi] : 'value')
            return (
              <div key={gi} className="flex flex-col items-center gap-1">
                <div className="flex gap-px">
                  {[...g.bits].map((b, i) => {
                    position--
                    const w = position === total - 1 && signed ? `-2${sup(position)}` : `2${sup(position)}`
                    return (
                      <span key={i} className="flex flex-col items-center">
                        {weights && <span className="font-mono text-[9px] text-ink-dim">{w}</span>}
                        <span className={`flex h-7 w-[1.1rem] items-center justify-center rounded border font-mono text-xs ${BIT_KIND[kind]}`}>{b}</span>
                      </span>
                    )
                  })}
                </div>
                {g.label && <span className="text-[11px] text-ink-muted">{g.label}</span>}
              </div>
            )
          })}
        </div>
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

/* ------------------------------------------------------------- FloatSpacing */

/**
 * Every positive value of a toy floating-point format (2 fraction bits) on a linear number line: each
 * power-of-two range holds the same number of values, so the gap between neighbours doubles each time.
 */
export function FloatSpacing({ caption }: { caption?: string }) {
  const titleId = useId()
  const FRACTION_BITS = 2
  const W = 720
  const LEFT = 20
  const RIGHT = 700
  const AXIS_Y = 50
  const x = (v: number) => LEFT + (v / 16) * (RIGHT - LEFT)
  const binades = []
  for (let e = -1; e <= 3; e++) {
    const values = []
    for (let m = 0; m < 1 << FRACTION_BITS; m++) values.push((1 + m / (1 << FRACTION_BITS)) * 2 ** e)
    binades.push({ e, from: 2 ** e, to: 2 ** (e + 1), gap: 2 ** e / (1 << FRACTION_BITS), values })
  }
  const colours = ['var(--color-cyan)', 'var(--color-magenta)']
  return (
    <Figure caption={caption}>
      <svg viewBox={`0 0 ${W} 150`} width="100%" style={{ minWidth: 560 }} role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          Values of a tiny floating-point format on a number line from 0 to 16: four values in every power-of-two range, so the
          gap doubles from 0.125 near 0.5 to 2 near 16.
        </title>
        <line x1={LEFT} y1={AXIS_Y} x2={RIGHT} y2={AXIS_Y} stroke="var(--color-ink-dim)" strokeWidth={1.5} />
        {[0, 1, 2, 4, 8, 16].map((v) => (
          <text key={v} x={x(v)} y={AXIS_Y + 42} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="var(--color-ink-muted)">
            {v}
          </text>
        ))}
        {binades.map((b, i) => (
          <g key={b.e} stroke={colours[i % 2]} fill="none">
            {b.values.map((v) => (
              <line key={v} x1={x(v)} y1={AXIS_Y - 16} x2={x(v)} y2={AXIS_Y + 16} strokeWidth={2} />
            ))}
            <path d={`M ${x(b.from)} ${AXIS_Y + 24} V ${AXIS_Y + 28} H ${x(b.to)} V ${AXIS_Y + 24}`} strokeWidth={1.2} />
            {b.e >= 1 && (
              <text x={(x(b.from) + x(b.to)) / 2} y={AXIS_Y - 24} textAnchor="middle" fontSize="12" stroke="none" fill={colours[i % 2]} fontFamily="JetBrains Mono, monospace">
                gap {b.gap}
              </text>
            )}
          </g>
        ))}
        <line x1={x(0)} y1={AXIS_Y - 16} x2={x(0)} y2={AXIS_Y + 16} stroke="var(--color-ink)" strokeWidth={2} />
        <text x={x(0.75)} y={AXIS_Y - 24} textAnchor="middle" fontSize="12" fill="var(--color-ink-muted)" fontFamily="JetBrains Mono, monospace">
          gap 0.125 → 0.25
        </text>
        <text x={LEFT} y={AXIS_Y + 80} fontSize="13" fill="var(--color-ink-muted)">
          Each range [2ⁿ, 2ⁿ⁺¹) holds the same 4 values, so the gap doubles each time.
        </text>
      </svg>
    </Figure>
  )
}
