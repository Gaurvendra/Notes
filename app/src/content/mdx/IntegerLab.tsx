import { useState } from 'react'
import {
  WIDTHS,
  add,
  fromBits,
  invert,
  maxValue,
  minValue,
  multiply,
  negate,
  parseInteger,
  toBits,
  toHex,
  unsigned,
  weights,
  wrap,
  type IntWidth,
  type OpResult,
} from '../../lib/twos.mjs'

const TYPE_NAME: Record<IntWidth, string> = { 4: '4-bit number', 8: 'byte', 16: 'short', 32: 'int', 64: 'long' }
const fmt = (v: bigint) => v.toLocaleString('en-US').replace(/^-/, '−')

/** The overflow wheel: every value of the width sits on a circle, so +1 from MAX lands on MIN. */
function Wheel({ value, bits }: { value: bigint; bits: IntWidth }) {
  const R = 70
  const C = 90
  const total = 1n << BigInt(bits)
  // Position on the circle as a fraction of a turn, 0 at the top, clockwise; `half` moves half a step further and
  // `nudge` (degrees) separates labels of neighbouring values on the wide types.
  const angleOf = (v: bigint, half = false, nudge = 0) => ((Number(unsigned(v, bits) * 2n + (half ? 1n : 0n)) / Number(total * 2n)) * 360 - 90 + nudge) * (Math.PI / 180)
  const point = (v: bigint, r = R, half = false, nudge = 0) => [C + r * Math.cos(angleOf(v, half, nudge)), C + r * Math.sin(angleOf(v, half, nudge))]
  // On byte and wider, 0 and −1 (top) and MAX and MIN (bottom) are neighbours: push their labels apart.
  const nudgeOf = (v: bigint) => (bits === 4 ? 0 : v === 0n || v === minValue(bits) ? 10 : -10)
  const labelled: bigint[] = bits === 4 ? Array.from({ length: 16 }, (_, i) => BigInt(i - 8)) : [0n, maxValue(bits), minValue(bits), -1n]
  const [mx, my] = point(value, R)
  const [bx1, by1] = point(maxValue(bits), R + 9, true)
  const [bx2, by2] = point(maxValue(bits), R - 9, true)
  return (
    <div className="flex shrink-0 flex-col items-center">
      <svg viewBox="0 0 180 180" width={180} height={180} role="img" aria-label={`Overflow wheel for ${TYPE_NAME[bits]}: the current value ${value} on a circle of all values`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-cyber-border-strong)" strokeWidth={2} />
        <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke="var(--color-rose)" strokeWidth={2} />
        {labelled.map((v) => {
          const [x, y] = point(v, bits === 4 ? R + 12 : R + 14, false, nudgeOf(v))
          const [tx, ty] = point(v, R)
          return (
            <g key={v.toString()}>
              <circle cx={tx} cy={ty} r={2} fill="var(--color-ink-dim)" />
              <text x={x} y={y + 3} textAnchor="middle" fontSize={bits === 4 ? 9 : 8} fill={v < 0n ? 'var(--color-magenta)' : 'var(--color-cyan)'} fontFamily="JetBrains Mono, monospace">
                {bits === 4 ? v.toString() : v === 0n ? '0' : v === -1n ? '−1' : v > 0n ? 'MAX' : 'MIN'}
              </text>
            </g>
          )
        })}
        <line x1={C} y1={C} x2={mx} y2={my} stroke="var(--color-amber)" strokeWidth={2} />
        <circle cx={C} cy={C} r={3} fill="var(--color-amber)" />
        <circle cx={mx} cy={my} r={5} fill="var(--color-amber)" />
      </svg>
      <p className="max-w-[180px] text-center text-[11px] text-ink-dim">
        Clockwise is +1. The <span className="text-rose">red mark</span> is where MAX + 1 wraps to MIN.
      </p>
    </div>
  )
}

/**
 * Interactive two's-complement lab: flip bits, type a Java literal, or apply operations, and watch the value, the
 * bit weights and the overflow wheel. The arithmetic (src/lib/twos.mjs) follows the JLS and is checked on every build.
 */
export function IntegerLab({ initial = '3', width = 4 }: { initial?: string; width?: IntWidth }) {
  const [bits, setBits] = useState<IntWidth>(width)
  const [value, setValue] = useState<bigint>(() => wrap(parseInteger(initial) ?? 0n, width))
  const [text, setText] = useState(initial)
  const [invalid, setInvalid] = useState(false)
  const [last, setLast] = useState<{ label: string; result: OpResult } | undefined>()

  const pattern = toBits(value, bits)
  const w = weights(bits)

  const set = (v: bigint, label?: string, result?: OpResult) => {
    setValue(v)
    setText(v.toString())
    setInvalid(false)
    setLast(label && result ? { label, result } : undefined)
  }
  const type = (t: string) => {
    setText(t)
    const parsed = parseInteger(t)
    if (parsed === undefined) {
      setInvalid(t.trim() !== '')
      return
    }
    setInvalid(false)
    const wrapped = wrap(parsed, bits)
    setValue(wrapped)
    setLast(wrapped !== parsed ? { label: `(${TYPE_NAME[bits]}) ${t.trim()}`, result: { value: wrapped, overflow: true, exact: parsed } } : undefined)
  }
  const flip = (i: number) => {
    const next = pattern.slice(0, i) + (pattern[i] === '1' ? '0' : '1') + pattern.slice(i + 1)
    set(fromBits(next))
  }
  const run = (label: string, result: OpResult) => set(result.value, label, result)

  const ones = [...pattern].map((b, i) => (b === '1' ? w[i] : 0n)).filter((x) => x !== 0n)
  const showSum = bits <= 16
  const btn = 'rounded-md border border-cyber-border px-2 py-1 font-mono text-xs text-ink-muted hover:border-cyan/40 hover:text-cyan'
  const code = 'rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-cyan break-all'

  return (
    <figure className="jx-intlab my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Width">
          {WIDTHS.map((wd) => (
            <button
              key={wd.bits}
              type="button"
              aria-pressed={bits === wd.bits}
              onClick={() => {
                setBits(wd.bits)
                set(wrap(value, wd.bits))
              }}
              className={`rounded-md px-2.5 py-1.5 font-mono text-xs ${bits === wd.bits ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {wd.name}
            </button>
          ))}
        </div>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs text-ink-dim">
          Type a Java integer literal
          <input
            type="text"
            spellCheck={false}
            value={text}
            aria-invalid={invalid}
            onChange={(e) => type(e.target.value)}
            className={`h-9 rounded-md border bg-void px-2 font-mono text-sm text-ink outline-none focus:border-cyan ${invalid ? 'border-rose' : 'border-cyber-border'}`}
          />
        </label>
      </div>
      {invalid && <p className="mt-2 text-xs text-rose">Not a Java integer literal. Try 42, -3, 0x7F, 0b1010, 1_000 or 017 (octal!).</p>}

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex w-max gap-0.5">
          {[...pattern].map((b, i) => (
            <div key={i} className={`flex flex-col items-center ${i > 0 && i % 4 === 0 ? 'ml-1.5' : ''}`}>
              <button
                type="button"
                onClick={() => flip(i)}
                aria-label={`bit ${bits - 1 - i} is ${b}, weight ${w[i]}, click to flip`}
                title={`weight ${w[i]}`}
                className={`h-7 w-[1.1rem] rounded border font-mono text-xs transition-transform hover:scale-110 ${i === 0 ? 'border-rose/50 bg-rose/10 text-rose' : b === '1' ? 'border-cyan/50 bg-cyan/15 text-cyan' : 'border-cyber-border bg-surface-2 text-ink-dim'}`}
              >
                {b}
              </button>
              {bits <= 8 && <span className="mt-0.5 font-mono text-[9px] text-ink-dim">{w[i].toString()}</span>}
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-ink-dim">
          The leftmost bit (red) weighs <span className="font-mono">−2<sup>{bits - 1}</sup></span>; every other bit adds its
          positive weight.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Operations">
        <button type="button" className={btn} onClick={() => run('+ 1', add(value, 1n, bits))}>+1</button>
        <button type="button" className={btn} onClick={() => run('− 1', add(value, -1n, bits))}>−1</button>
        <button type="button" className={btn} onClick={() => run('× 2', multiply(value, 2n, bits))}>×2</button>
        <button type="button" className={btn} onClick={() => run('−x', negate(value, bits))}>−x</button>
        <button type="button" className={btn} onClick={() => run('~x', invert(value, bits))}>~x</button>
        <button type="button" className={btn} onClick={() => set(minValue(bits))}>MIN</button>
        <button type="button" className={btn} onClick={() => set(maxValue(bits))}>MAX</button>
        <button type="button" className={btn} onClick={() => set(0n)}>0</button>
        <button type="button" className={btn} onClick={() => set(-1n)}>−1 (all ones)</button>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <dl className="grid min-w-[14rem] flex-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]" aria-live="polite">
          <dt className="text-ink-dim">Value ({TYPE_NAME[bits]})</dt>
          <dd>
            <code className={code}>{value.toString()}</code>
          </dd>
          {showSum && (
            <>
              <dt className="text-ink-dim">Sum of weights</dt>
              <dd className="text-ink-muted">
                <code className={code}>{ones.length ? ones.map((x) => x.toString()).join(' + ').replace(/\+ -/g, '− ') : '0'}</code>
              </dd>
            </>
          )}
          <dt className="text-ink-dim">Unsigned reading</dt>
          <dd>
            <code className={code}>{unsigned(value, bits).toString()}</code>
          </dd>
          <dt className="text-ink-dim">Hex</dt>
          <dd>
            <code className={code}>0x{toHex(value, bits)}</code>
          </dd>
          <dt className="text-ink-dim">Range</dt>
          <dd className="text-ink-muted">
            <code className={code}>{fmt(minValue(bits))}</code> to <code className={code}>{fmt(maxValue(bits))}</code>
          </dd>
          {last && (
            <>
              <dt className="text-ink-dim">Last step</dt>
              <dd className={last.result.overflow ? 'text-rose' : 'text-ink-muted'}>
                {last.result.overflow ? (
                  <>
                    Overflow: the exact result <code className={code}>{last.result.exact.toString()}</code> doesn't fit
                    in a {TYPE_NAME[bits]}, so Java keeps the low {bits} bits: <code className={code}>{last.result.value.toString()}</code>.
                    No exception is thrown.
                  </>
                ) : (
                  <>
                    {last.label}: fits, no overflow.
                  </>
                )}
              </dd>
            </>
          )}
        </dl>
        <Wheel value={value} bits={bits} />
      </div>
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Follows the JLS rules for integer arithmetic and narrowing; checked on every build against values verified on a
        JVM
      </figcaption>
    </figure>
  )
}
