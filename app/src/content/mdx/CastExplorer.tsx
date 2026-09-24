import { useState } from 'react'
import { TYPES, explain, format, kindOf, mayLosePrecision, parseValue, promote, type PrimType } from '../../lib/conversion.mjs'

const PRESETS: { label: string; type: PrimType; text: string }[] = [
  { label: '(byte) 128', type: 'int', text: '128' },
  { label: '(byte) 148', type: 'int', text: '148' },
  { label: '3.99e10', type: 'double', text: '3.99e10' },
  { label: '-7.9', type: 'double', text: '-7.9' },
  { label: 'NaN', type: 'double', text: 'NaN' },
  { label: '300.7', type: 'double', text: '300.7' },
  { label: '16777217', type: 'int', text: '16777217' },
  { label: '123456789123456789L', type: 'long', text: '123456789123456789L' },
  { label: "'A'", type: 'char', text: "'A'" },
  { label: '0.1f', type: 'float', text: '0.1' },
]

const KIND_LABEL = {
  identity: { text: 'same type', cls: 'border-cyber-border text-ink-dim' },
  widening: { text: 'widening: automatic', cls: 'border-mint/40 text-mint' },
  lossy: { text: 'widening: automatic, may round', cls: 'border-amber/50 text-amber' },
  narrowing: { text: 'narrowing: needs a cast', cls: 'border-rose/50 text-rose' },
  'widening-narrowing': { text: 'byte → int → char: needs a cast', cls: 'border-rose/50 text-rose' },
} as const

/**
 * Casting & promotion explorer: pick a source type and value, and see what every cast does to it (JLS §5.1), plus the
 * result type of mixed arithmetic (§5.6). The rules live in src/lib/conversion.mjs and are checked on every build.
 */
export function CastExplorer({ type = 'int', value = '128' }: { type?: PrimType; value?: string }) {
  const [from, setFrom] = useState<PrimType>(type)
  const [text, setText] = useState(value)
  const [left, setLeft] = useState<PrimType>('byte')
  const [right, setRight] = useState<PrimType>('byte')
  const parsed = parseValue(text, from)
  const code = 'rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-cyan break-all'
  const select = 'h-8 rounded-md border border-cyber-border bg-void px-1 font-mono text-xs text-ink'
  const sum = promote(left, right)

  return (
    <figure className="jx-castlab my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Source type">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={from === t}
              onClick={() => setFrom(t)}
              className={`rounded-md px-2 py-1.5 font-mono text-xs ${from === t ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs text-ink-dim">
          <span>
            A value of type <span className="font-mono text-ink">{from}</span>
          </span>
          <input
            type="text"
            spellCheck={false}
            value={text}
            aria-invalid={!!parsed.error}
            onChange={(e) => setText(e.target.value)}
            className={`h-9 rounded-md border bg-void px-2 font-mono text-sm text-ink outline-none focus:border-cyan ${parsed.error ? 'border-rose' : 'border-cyber-border'}`}
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Examples">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setFrom(p.type)
              setText(p.text)
            }}
            className="rounded-md border border-cyber-border px-2 py-1 font-mono text-[11px] text-ink-muted hover:border-cyan/40 hover:text-cyan"
          >
            {p.label}
          </button>
        ))}
      </div>
      {parsed.error && <p className="mt-2 text-xs text-rose">{parsed.error}</p>}

      {parsed.value !== undefined && (
        <div className="mt-4 divide-y divide-cyber-border rounded-lg border border-cyber-border" aria-live="polite">
          {TYPES.map((to) => {
            const { result, kept, note } = explain(parsed.value, from, to)
            const kind = kindOf(from, to)
            const badge = KIND_LABEL[kind === 'widening' && mayLosePrecision(from, to) ? 'lossy' : kind]
            return (
              <div key={to} className="grid gap-x-3 gap-y-1 p-2.5 text-sm sm:grid-cols-[7.5rem_minmax(8rem,12rem)_1fr]">
                <div className="font-mono text-xs text-ink-muted">
                  {to === from ? to : `(${to}) x`}
                </div>
                <div>
                  <code className={code}>{format(result, to)}</code>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className={`rounded border px-1.5 py-0.5 ${badge.cls}`}>{badge.text}</span>
                  <span className={kept ? 'text-ink-dim' : 'text-amber'}>{note}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-cyber-border bg-surface-2 p-3 text-sm">
        <p className="text-xs text-ink-dim">Promotion in arithmetic: what type does an expression have?</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
          <select aria-label="Type of a" value={left} onChange={(e) => setLeft(e.target.value as PrimType)} className={select}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-ink">a +</span>
          <select aria-label="Type of b" value={right} onChange={(e) => setRight(e.target.value as PrimType)} className={select}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-ink">b</span>
          <span className="text-ink-dim">has type</span>
          <code className={code}>{sum}</code>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {sum === 'int' && left !== 'int' && right !== 'int'
            ? `byte, short and char are always promoted to int before arithmetic, even for 1 + 2. So ${left} r = a + b; needs a cast, unless a and b are compile-time constants whose sum fits.`
            : left === right
              ? `Both operands are ${sum}: no promotion.`
              : `The operands are converted to the wider type, ${sum}${mayLosePrecision(left === sum ? right : left, sum) ? ' (which can round large values)' : ''}.`}{' '}
          Compound assignment (<span className="font-mono">a += b</span>) always compiles for numeric types: it includes a cast back to the type
          of <span className="font-mono">a</span>.
        </p>
      </div>
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Follows JLS §5.1 and §5.6; checked on every build against values verified on a JVM
      </figcaption>
    </figure>
  )
}
