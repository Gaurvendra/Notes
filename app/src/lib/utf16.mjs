// UTF-16 helpers for the character inspector, with Java's semantics. A JavaScript string is a sequence of UTF-16 code
// units, exactly like a Java String, so `s.length` is Java's `length()` and `s.charCodeAt(i)` is `charAt(i)`. Code
// points follow `String.codePoints()` (an unpaired surrogate is its own code point) and UTF-8 bytes follow
// `getBytes(StandardCharsets.UTF_8)` (an unpaired surrogate becomes '?'). Pure functions, no DOM: shared by
// src/content/mdx/CharInspector.tsx and scripts/check-content.mjs, which checks them against JVM-verified values.

export const isHighSurrogate = (unit) => unit >= 0xd800 && unit <= 0xdbff
export const isLowSurrogate = (unit) => unit >= 0xdc00 && unit <= 0xdfff

/** U+XXXX notation (at least four hex digits), as in the Unicode standard. */
export const unicodeName = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`

/** The Java escape for one UTF-16 code unit: \uXXXX. */
export const unicodeEscape = (unit) => `\\u${unit.toString(16).toUpperCase().padStart(4, '0')}`

/** The UTF-16 code units of a code point (one, or a surrogate pair): Character.toChars. */
export function toChars(cp) {
  if (cp < 0x10000) return [cp]
  const v = cp - 0x10000
  return [0xd800 + (v >> 10), 0xdc00 + (v & 0x3ff)]
}

/** Split a string into code points, each with its UTF-16 units and the index of its first unit. */
export function codePoints(s) {
  const out = []
  for (let i = 0; i < s.length; ) {
    const hi = s.charCodeAt(i)
    const lo = i + 1 < s.length ? s.charCodeAt(i + 1) : -1
    if (isHighSurrogate(hi) && isLowSurrogate(lo)) {
      out.push({ cp: 0x10000 + ((hi - 0xd800) << 10) + (lo - 0xdc00), index: i, units: [hi, lo], paired: true })
      i += 2
    } else {
      out.push({ cp: hi, index: i, units: [hi], paired: false, lone: isHighSurrogate(hi) || isLowSurrogate(hi) })
      i += 1
    }
  }
  return out
}

/** UTF-8 bytes of one code point; an unpaired surrogate encodes as '?' (0x3F), as String.getBytes(UTF_8) does. */
export function utf8Of(point) {
  const cp = point.cp
  if (point.lone) return [0x3f]
  if (cp < 0x80) return [cp]
  if (cp < 0x800) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)]
  if (cp < 0x10000) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)]
  return [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)]
}

export const utf8 = (s) => codePoints(s).flatMap(utf8Of)

const SIMPLE_ESCAPES = { 0x08: '\\b', 0x09: '\\t', 0x0a: '\\n', 0x0c: '\\f', 0x0d: '\\r', 0x22: '\\"', 0x27: "\\'", 0x5c: '\\\\' }

/** How to write one code unit inside a Java literal: printable ASCII as itself, the rest as an escape. */
export function javaEscape(unit, quote) {
  if (unit === 0x22 && quote === "'") return '"'
  if (unit === 0x27 && quote === '"') return "'"
  if (SIMPLE_ESCAPES[unit]) return SIMPLE_ESCAPES[unit]
  if (unit >= 0x20 && unit < 0x7f) return String.fromCharCode(unit)
  return unicodeEscape(unit)
}

/** A Java char literal for one code unit, e.g. 'A', '\n', 'é'. */
export const javaCharLiteral = (unit) => `'${javaEscape(unit, "'")}'`

/** A Java string literal that uses only ASCII characters, e.g. "café". */
export function javaStringLiteral(s) {
  let out = ''
  for (let i = 0; i < s.length; i++) out += javaEscape(s.charCodeAt(i), '"')
  return `"${out}"`
}
