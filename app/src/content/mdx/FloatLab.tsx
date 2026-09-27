import { useState } from 'react'
import {
  FORMATS,
  bitsOf,
  decompose,
  errorOf,
  exactDecimal,
  exactString,
  javaToString,
  parseJava,
  toPlain,
  ulp,
  valueOf,
  type Format,
} from '../../lib/ieee754.mjs'

const PRESETS = ['0.1', '0.7', '4.125', '16777217', '-0', '1e-45', 'Infinity', 'NaN']
const KIND_TEXT = {
  normal: 'normal number',
  subnormal: 'subnormal number (exponent bits all 0: no hidden 1, fixed exponent)',
  zero: 'zero (exponent and fraction all 0; the sign bit gives +0.0 or −0.0)',
  infinity: 'infinity (exponent bits all 1, fraction 0)',
  nan: 'NaN, "not a number" (exponent bits all 1, fraction not 0)',
} as const
const LONG = 90
const FIELD_STYLE = {
  sign: 'border-rose/50 bg-rose/10 text-rose',
  exp: 'border-cyan/50 bg-cyan/10 text-cyan',
  frac: 'border-magenta/50 bg-magenta/10 text-magenta',
} as const

/**
 * Interactive IEEE 754 explorer: type a number or flip bits; every readout matches what Java prints.
 * The arithmetic lives in src/lib/ieee754.mjs and is checked against answers recorded from the JVM
 * (scripts/fixtures/float-lab*.tsv) by `npm run check`.
 */
export function FloatLab({ initial = '0.7', format: initialFormat = 'float' }: { initial?: string; format?: Format }) {
  const [format, setFormat] = useState<Format>(initialFormat)
  const [text, setText] = useState(initial)
  const [typed, setTyped] = useState<string | undefined>(initial)
  const [bits, setBits] = useState<bigint>(() => bitsOf(parseJava(initial, initialFormat) ?? 0, initialFormat))
  const [invalid, setInvalid] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const f = FORMATS[format]
  const value = valueOf(bits, format)
  const parts = decompose(bits, format)

  const apply = (input: string, fmt: Format) => {
    setText(input)
    setShowAll(false)
    const parsed = parseJava(input, fmt)
    if (parsed === undefined) {
      setInvalid(input.trim() !== '')
      return
    }
    setInvalid(false)
    setTyped(input)
    setBits(bitsOf(parsed, fmt))
  }
  const switchFormat = (fmt: Format) => {
    if (fmt === format) return
    setFormat(fmt)
    apply(typed ?? javaToString(value, format), fmt)
  }
  const flip = (index: number) => {
    const next = bits ^ (1n << BigInt(f.total - 1 - index))
    setBits(next)
    setTyped(undefined)
    setInvalid(false)
    setShowAll(false)
    setText(javaToString(valueOf(next, format), format))
  }

  const bitString = bits.toString(2).padStart(f.total, '0')
  const fields = [
    { name: 'sign' as const, label: 'sign', from: 0, to: 1 },
    { name: 'exp' as const, label: `exponent (${f.expBits} bits)`, from: 1, to: 1 + f.expBits },
    { name: 'frac' as const, label: `fraction (${f.fracBits} bits)`, from: 1 + f.expBits, to: f.total },
  ]

  const exact = exactString(bits, format)
  const shownExact = exact.length > LONG && !showAll ? `${exact.slice(0, LONG)}…` : exact
  const error = typed === undefined ? undefined : errorOf(typed, bits, format)
  const finite = parts.kind !== 'nan' && parts.kind !== 'infinity'
  const significandText = toPlain(exactDecimal(parts.significand, -f.fracBits))
  const exponentText =
    parts.kind === 'normal' ? `${parts.exponent} − ${f.bias} = ${parts.unbiased}` : `1 − ${f.bias} = ${parts.unbiased} (fixed)`
  const javaType = format === 'float' ? 'Float' : 'Double'
  const hex = `0x${bits.toString(16).toUpperCase().padStart(f.total / 4, '0')}`
  const code = 'rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-cyan break-all'

  return (
    <figure className="jx-floatlab my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label="Format">
          {(['float', 'double'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              aria-pressed={format === fmt}
              onClick={() => switchFormat(fmt)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs ${format === fmt ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
            >
              {fmt} ({FORMATS[fmt].total} bits)
            </button>
          ))}
        </div>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-ink-dim">
          Type a number
          <input
            type="text"
            inputMode="decimal"
            spellCheck={false}
            value={text}
            aria-invalid={invalid}
            onChange={(e) => apply(e.target.value, format)}
            className={`h-9 rounded-md border bg-void px-2 font-mono text-sm text-ink outline-none focus:border-cyan ${invalid ? 'border-rose' : 'border-cyber-border'}`}
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Examples">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => apply(p, format)} className="rounded-md border border-cyber-border px-2 py-0.5 font-mono text-xs text-ink-muted hover:border-cyan/40 hover:text-cyan">
            {p}
          </button>
        ))}
      </div>
      {invalid && <p className="mt-2 text-xs text-rose">Not a number Java can parse. Try 0.1, -2.5e3, NaN or Infinity.</p>}

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex w-max gap-2">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col items-center gap-1">
              <div className="flex gap-px">
                {bitString
                  .slice(field.from, field.to)
                  .split('')
                  .map((bit, i) => {
                    const index = field.from + i
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`h-7 w-[1.1rem] rounded border font-mono text-xs transition-transform hover:scale-110 ${FIELD_STYLE[field.name]}`}
                        aria-label={`bit ${f.total - 1 - index} (${field.name}) is ${bit}, click to flip`}
                        title={`bit ${f.total - 1 - index}: click to flip`}
                        onClick={() => flip(index)}
                      >
                        {bit}
                      </button>
                    )
                  })}
              </div>
              <span className="text-[11px] text-ink-muted">{field.label}</span>
            </div>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]" aria-live="polite">
        <dt className="text-ink-dim">{javaType}.toString</dt>
        <dd>
          <code className={code}>{javaToString(value, format)}</code>
        </dd>
        <dt className="text-ink-dim">Exactly stored</dt>
        <dd className="min-w-0">
          <code className={code}>{shownExact}</code>
          {exact.length > LONG && (
            <button type="button" className="ml-2 text-xs text-cyan hover:underline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'show less' : `show all ${exact.replace(/[-.]/g, '').length} digits`}
            </button>
          )}
        </dd>
        {error !== undefined && (
          <>
            <dt className="text-ink-dim">Error</dt>
            <dd className="text-ink-muted">
              {error === '0' ? (
                '0: stored exactly'
              ) : (
                <>
                  you typed <code className={code}>{typed}</code>; typed − stored = <code className={code}>{error}</code>
                </>
              )}
            </dd>
          </>
        )}
        <dt className="text-ink-dim">Kind</dt>
        <dd className="text-ink-muted">{KIND_TEXT[parts.kind]}</dd>
        {finite && (
          <>
            <dt className="text-ink-dim">Formula</dt>
            <dd className="text-ink-muted">
              <code className={code}>
                (−1)<sup>{parts.sign}</sup> × {significandText} × 2<sup>{parts.unbiased}</sup>
              </code>
              <span className="ml-2 text-xs text-ink-dim">exponent {exponentText}</span>
            </dd>
            <dt className="text-ink-dim">Gap to next (Math.ulp)</dt>
            <dd>
              <code className={code}>{javaToString(ulp(value, format), format)}</code>
            </dd>
          </>
        )}
        <dt className="text-ink-dim">Bits in hex</dt>
        <dd className="text-ink-muted">
          <code className={code}>{hex}</code>
          {parts.kind === 'nan' && (
            <span className="ml-2 text-xs text-ink-dim">
              {javaType}.{format === 'float' ? 'floatToIntBits' : 'doubleToLongBits'} returns every NaN as{' '}
              <code className={code}>{format === 'float' ? '0x7FC00000' : '0x7FF8000000000000'}</code>; the raw bits are shown here
            </span>
          )}
        </dd>
      </dl>
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Every readout is checked against answers recorded from the JVM on every build
      </figcaption>
    </figure>
  )
}
