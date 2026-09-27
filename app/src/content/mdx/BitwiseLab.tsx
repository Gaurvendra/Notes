import { useState } from 'react'
import { OPERAND_TYPES, OPERATORS, bitsOf, explain, isShift, promotedType, toBits, widthOf, type BitOperator, type OperandType } from '../../lib/bitops.mjs'
import { parseValue } from '../../lib/conversion.mjs'

const PRESETS: { label: string; a: [OperandType, string]; op: BitOperator; b: [OperandType, string] }[] = [
  { label: '4 & 6', a: ['int', '4'], op: '&', b: ['int', '6'] },
  { label: '4 ^ 6', a: ['int', '4'], op: '^', b: ['int', '6'] },
  { label: '~4', a: ['int', '4'], op: '~', b: ['int', '0'] },
  { label: '-5 >> 1', a: ['int', '-5'], op: '>>', b: ['int', '1'] },
  { label: '-8 >>> 1', a: ['int', '-8'], op: '>>>', b: ['int', '1'] },
  { label: '1 << 32', a: ['int', '1'], op: '<<', b: ['int', '32'] },
  { label: '(byte) 0xC6 >>> 1', a: ['byte', '-58'], op: '>>>', b: ['int', '1'] },
  { label: '0xC6 & 0xFF', a: ['byte', '-58'], op: '&', b: ['int', '0xFF'] },
  { label: 'flags | READ', a: ['int', '0b0100'], op: '|', b: ['int', '0b0001'] },
]

/** A row of bits in groups of 8; `extension` marks the leftmost bits added by promotion. */
function Bits({ bits, extension = 0, strong = false }: { bits: string; extension?: number; strong?: boolean }) {
  const groups = bits.match(/.{1,8}/g) ?? []
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[13px] leading-5">
      {groups.map((g, gi) => (
        <span key={gi} className="whitespace-nowrap">
          {[...g].map((b, i) => {
            const pos = gi * 8 + i
            const cls = pos < extension ? 'text-amber' : b === '1' ? (strong ? 'text-cyan' : 'text-ink') : 'text-ink-dim'
            return (
              <span key={i} className={cls}>
                {b}
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}

/**
 * Bitwise & shift lab: pick operand types and values and an operator, and see the bit patterns, the promotion Java
 * applies first (sign extension of byte/short, zero extension of char), shift-distance masking and the result. The
 * rules live in src/lib/bitops.mjs and are checked on every build against JVM-verified values.
 */
export function BitwiseLab({ a = '4', op = '&', b = '6' }: { a?: string; op?: BitOperator; b?: string }) {
  const [aType, setAType] = useState<OperandType>('int')
  const [aText, setAText] = useState(a)
  const [operator, setOperator] = useState<BitOperator>(op)
  const [bType, setBType] = useState<OperandType>('int')
  const [bText, setBText] = useState(b)
  const pa = parseValue(aText, aType)
  const pb = parseValue(bText, bType)
  const unary = operator === '~'
  const ready = pa.value !== undefined && (unary || pb.value !== undefined)
  const r = ready ? explain(operator, pa.value as bigint, aType, unary ? 0n : (pb.value as bigint), bType) : undefined
  const select = 'h-9 rounded-md border border-cyber-border bg-void px-1 font-mono text-xs text-ink'
  const input = (bad: boolean) =>
    `h-9 w-full min-w-0 flex-1 rounded-md border bg-void px-2 font-mono text-sm text-ink outline-none focus:border-cyan ${bad ? 'border-rose' : 'border-cyber-border'}`

  const rows: { label: string; bits: string; value: string; extension?: number; strong?: boolean }[] = []
  if (r && pa.value !== undefined) {
    const av = pa.value as bigint
    const target = unary || isShift(operator) ? promotedType(aType) : r.type
    rows.push({ label: `a (${aType})`, bits: bitsOf(av, aType), value: av.toString() })
    if (target !== aType) {
      rows.push({ label: `a as ${target}`, bits: toBits(av, widthOf(target)), value: av.toString(), extension: widthOf(target) - widthOf(aType) })
    }
    if (!unary && pb.value !== undefined) {
      const bv = pb.value as bigint
      if (isShift(operator)) {
        rows.push({ label: 'distance', bits: toBits(r.distance as bigint, 8), value: r.distance === bv ? bv.toString() : `${bv} → ${r.distance}` })
      } else {
        rows.push({ label: `b (${bType})`, bits: bitsOf(bv, bType), value: bv.toString() })
        if (r.type !== bType) {
          rows.push({ label: `b as ${r.type}`, bits: toBits(bv, widthOf(r.type)), value: bv.toString(), extension: widthOf(r.type) - widthOf(bType) })
        }
      }
    }
    rows.push({ label: `result (${r.type})`, bits: toBits(r.value, widthOf(r.type)), value: r.value.toString(), strong: true })
  }

  return (
    <figure className="jx-bitlab my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-[11rem] flex-1 flex-col gap-1 text-xs text-ink-dim">
          <span>Left operand a</span>
          <span className="flex gap-1">
            <select aria-label="Type of a" value={aType} onChange={(e) => setAType(e.target.value as OperandType)} className={select}>
              {OPERAND_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input type="text" spellCheck={false} value={aText} onChange={(e) => setAText(e.target.value)} aria-invalid={!!pa.error} className={input(!!pa.error)} />
          </span>
        </label>
        <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Operator">
          {OPERATORS.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={operator === o}
              onClick={() => setOperator(o)}
              className={`rounded-md px-2.5 py-1.5 font-mono text-sm ${operator === o ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {o}
            </button>
          ))}
        </div>
        {!unary && (
          <label className="flex min-w-[11rem] flex-1 flex-col gap-1 text-xs text-ink-dim">
            <span>{isShift(operator) ? 'Shift distance b' : 'Right operand b'}</span>
            <span className="flex gap-1">
              <select aria-label="Type of b" value={bType} onChange={(e) => setBType(e.target.value as OperandType)} className={select}>
                {OPERAND_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input type="text" spellCheck={false} value={bText} onChange={(e) => setBText(e.target.value)} aria-invalid={!!pb.error} className={input(!!pb.error)} />
            </span>
          </label>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Examples">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setAType(p.a[0])
              setAText(p.a[1])
              setOperator(p.op)
              setBType(p.b[0])
              setBText(p.b[1])
            }}
            className="rounded-md border border-cyber-border px-2 py-1 font-mono text-[11px] text-ink-muted hover:border-cyan/40 hover:text-cyan"
          >
            {p.label}
          </button>
        ))}
      </div>
      {pa.error && <p className="mt-2 text-xs text-rose">a: {pa.error}</p>}
      {!unary && pb.error && <p className="mt-2 text-xs text-rose">b: {pb.error}</p>}

      {r && (
        <>
          <p className="mt-4 font-mono text-sm text-ink">
            {unary ? `~a` : `a ${operator} b`} = <span className="text-cyan">{r.value.toString()}</span>
            <span className="text-ink-dim"> ({r.type})</span>
          </p>
          <div className="mt-3 grid gap-x-4 gap-y-2 rounded-lg border border-cyber-border bg-surface-2 p-3 sm:grid-cols-[8.5rem_1fr_auto]" aria-live="polite">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <span className={`font-mono text-xs ${row.strong ? 'text-cyan' : 'text-ink-dim'} sm:self-center`}>{row.label}</span>
                <Bits bits={row.bits} extension={row.extension} strong={row.strong} />
                <span className={`font-mono text-xs sm:text-right ${row.strong ? 'text-cyan' : 'text-ink-muted'} sm:self-center`}>{row.value}</span>
              </div>
            ))}
          </div>
          {r.steps.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink-muted">
              {r.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-ink-dim">
            <span className="text-amber">Amber</span> bits were added by promotion before the operator ran.
          </p>
        </>
      )}
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Follows JLS §15.15, §15.19 and §15.22; checked on every build against values verified on a JVM
      </figcaption>
    </figure>
  )
}
