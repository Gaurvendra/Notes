import { useMemo, useState, type ReactNode } from 'react'
import { codePoints, isHighSurrogate, javaStringLiteral, unicodeEscape, unicodeName, utf8, utf8Of, type CodePoint } from '../../lib/utf16.mjs'

const PRESETS: { label: string; text: string }[] = [
  { label: 'Java', text: 'Java' },
  { label: 'café', text: 'café' },
  { label: 'cafe + ◌́', text: 'café' },
  { label: '😀', text: '😀' },
  { label: '👍🏽', text: '👍🏽' },
  { label: '🇮🇳', text: '🇮🇳' },
  { label: '𝄞', text: '𝄞' },
  { label: '漢字', text: '漢字' },
]
const MAX_SHOWN = 48
const hex2 = (b: number) => b.toString(16).toUpperCase().padStart(2, '0')

/** What to draw for a code point: invisible and combining characters get a visible stand-in. */
function glyph(p: CodePoint): string {
  if (p.lone) return '?'
  const s = String.fromCodePoint(p.cp)
  if (p.cp === 0x20) return '␣'
  if (p.cp === 0x0a) return '↵'
  if (/\p{Cc}/u.test(s)) return '·'
  if (/\p{M}/u.test(s)) return `◌${s}`
  return s
}

function graphemeCount(text: string): number | undefined {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return undefined
  return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length
}

/**
 * Character inspector: type any text and see it the way Java stores it: UTF-16 code units (`char` values), code
 * points, surrogate pairs and UTF-8 bytes. JavaScript strings are UTF-16 too, so the counts are Java's own
 * (src/lib/utf16.mjs, checked on every build).
 */
export function CharInspector({ initial = 'Hi ☕ 😀' }: { initial?: string }) {
  const [text, setText] = useState(initial)
  const points = useMemo(() => codePoints(text), [text])
  const bytes = useMemo(() => utf8(text).length, [text])
  const graphemes = useMemo(() => graphemeCount(text), [text])
  const shown = points.slice(0, MAX_SHOWN)
  const code = 'rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-cyan break-all'
  const stats: { label: ReactNode; value: number | undefined; note: string }[] = [
    { label: <code className={code}>length()</code>, value: text.length, note: 'char values (UTF-16 code units)' },
    { label: <code className={code}>codePointCount(…)</code>, value: points.length, note: 'Unicode code points' },
    { label: <code className={code}>getBytes(UTF_8).length</code>, value: bytes, note: 'bytes in a UTF-8 file' },
    { label: 'Graphemes', value: graphemes, note: 'what a reader sees as characters' },
  ]

  return (
    <figure className="jx-charlab my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <label className="flex flex-col gap-1 text-xs text-ink-dim">
        Type or paste any text
        <input
          type="text"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-10 rounded-md border border-cyber-border bg-void px-2 font-mono text-base text-ink outline-none focus:border-cyan"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Examples">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={text === p.text}
            onClick={() => setText(p.text)}
            className={`rounded-md border px-2 py-1 text-xs ${text === p.text ? 'border-cyan/50 text-cyan' : 'border-cyber-border text-ink-muted hover:border-cyan/40 hover:text-cyan'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg border border-cyber-border bg-surface-2 p-2">
            <dt className="text-[11px] text-ink-dim">{s.label}</dt>
            <dd className="font-mono text-xl text-ink">{s.value ?? '–'}</dd>
            <dd className="text-[11px] text-ink-dim">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {shown.map((p) => (
          <div
            key={p.index}
            className={`flex min-w-[5.5rem] flex-col items-center gap-1 rounded-lg border p-2 ${p.paired ? 'border-magenta/50 bg-magenta/5' : p.lone ? 'border-rose/60 bg-rose/5' : 'border-cyber-border bg-surface-2'}`}
          >
            <span className="text-2xl leading-8 text-ink">{glyph(p)}</span>
            <span className="font-mono text-[11px] text-ink-muted">{p.lone ? 'unpaired surrogate' : unicodeName(p.cp)}</span>
            <div className="flex gap-1">
              {p.units.map((u, k) => (
                <span
                  key={k}
                  title={`charAt(${p.index + k})`}
                  className={`flex flex-col items-center rounded border px-1 py-0.5 font-mono text-[10px] ${p.paired ? 'border-magenta/40 text-magenta' : 'border-cyan/40 text-cyan'}`}
                >
                  <span className="text-ink-dim">[{p.index + k}]</span>
                  {unicodeEscape(u)}
                  {p.paired && <span className="text-ink-dim">{isHighSurrogate(u) ? 'high' : 'low'}</span>}
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-ink-dim">UTF-8: {utf8Of(p).map(hex2).join(' ')}</span>
          </div>
        ))}
        {points.length > MAX_SHOWN && <p className="self-center text-xs text-ink-dim">…and {points.length - MAX_SHOWN} more code points</p>}
      </div>

      {text && (
        <p className="mt-3 text-xs text-ink-dim">
          As an ASCII-only Java literal: <code className={code}>{javaStringLiteral(text)}</code>
        </p>
      )}
      <p className="mt-2 text-[11px] text-ink-dim">
        <span className="text-magenta">Pink</span> boxes are code points above U+FFFF: Java stores each as two{' '}
        <code className="font-mono">char</code> values, a high and a low surrogate. Numbers in [brackets] are the{' '}
        <code className="font-mono">charAt</code> indexes.
      </p>
      <figcaption className="mt-3 border-t border-cyber-border pt-2 text-xs text-mint">
        ✓ Browser strings are UTF-16 like Java's, so these are Java's own counts; checked on every build against values
        verified on a JVM. Grapheme counts come from the browser's Unicode data.
      </figcaption>
    </figure>
  )
}
