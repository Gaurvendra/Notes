export interface CodePoint {
  /** The code point (for an unpaired surrogate: the surrogate itself, as String.codePoints() does). */
  cp: number
  /** Index of its first UTF-16 code unit in the string. */
  index: number
  /** Its UTF-16 code units: one, or a high + low surrogate pair. */
  units: number[]
  paired: boolean
  /** An unpaired (malformed) surrogate. */
  lone?: boolean
}
export function isHighSurrogate(unit: number): boolean
export function isLowSurrogate(unit: number): boolean
export function unicodeName(cp: number): string
export function unicodeEscape(unit: number): string
export function toChars(cp: number): number[]
export function codePoints(s: string): CodePoint[]
export function utf8Of(point: CodePoint): number[]
export function utf8(s: string): number[]
export function javaEscape(unit: number, quote: "'" | '"'): string
export function javaCharLiteral(unit: number): string
export function javaStringLiteral(s: string): string
