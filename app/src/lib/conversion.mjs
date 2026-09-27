// Primitive conversions exactly as the JLS defines them: §5.1.2 widening, §5.1.3 narrowing, §5.1.4 widening and
// narrowing (byte → char), §5.6 numeric promotion. Integral values (including char) are BigInt, float and double
// values are JS numbers (a float is a number that Math.fround leaves unchanged). Pure functions, no DOM: shared by
// src/content/mdx/CastExplorer.tsx and scripts/check-content.mjs, which checks them against JVM-verified values.
import { javaToString, parseJava } from './ieee754.mjs'
import { parseInteger } from './twos.mjs'
import { javaCharLiteral } from './utf16.mjs'

export const TYPES = ['byte', 'short', 'char', 'int', 'long', 'float', 'double']

const INTEGRAL = { byte: { bits: 8, signed: true }, short: { bits: 16, signed: true }, char: { bits: 16, signed: false }, int: { bits: 32, signed: true }, long: { bits: 64, signed: true } }

export const isIntegral = (type) => type in INTEGRAL

/** [min, max] of an integral type, as BigInt. */
export function rangeOf(type) {
  const { bits, signed } = INTEGRAL[type]
  return signed ? [-(1n << BigInt(bits - 1)), (1n << BigInt(bits - 1)) - 1n] : [0n, (1n << BigInt(bits)) - 1n]
}

/** JLS §5.1.2: the 19 widening primitive conversions. */
const WIDER = {
  byte: ['short', 'int', 'long', 'float', 'double'],
  short: ['int', 'long', 'float', 'double'],
  char: ['int', 'long', 'float', 'double'],
  int: ['long', 'float', 'double'],
  long: ['float', 'double'],
  float: ['double'],
  double: [],
}

/** 'identity' | 'widening' | 'narrowing' | 'widening-narrowing' (JLS §5.1). */
export function kindOf(from, to) {
  if (from === to) return 'identity'
  if (WIDER[from].includes(to)) return 'widening'
  if (from === 'byte' && to === 'char') return 'widening-narrowing'
  return 'narrowing'
}

/** Widening conversions that can lose precision (JLS §5.1.2): the result is rounded to the nearest float/double. */
export const mayLosePrecision = (from, to) => (from === 'int' && to === 'float') || (from === 'long' && (to === 'float' || to === 'double'))

/** Keep the low-order bits of an integer in an integral type (narrowing, and every integral widening too). */
const fit = (value, type) => (INTEGRAL[type].signed ? BigInt.asIntN(INTEGRAL[type].bits, value) : BigInt.asUintN(INTEGRAL[type].bits, value))

/** The float nearest to an exact integer, ties to even, without rounding twice (BigInt → double → float could). */
export function bigintToFloat(v) {
  if (v === 0n) return 0
  const negative = v < 0n
  const m = negative ? -v : v
  const length = m.toString(2).length
  if (length <= 24) return negative ? -Number(m) : Number(m)
  const shift = BigInt(length - 24)
  let q = m >> shift
  const rest = m - (q << shift)
  const half = 1n << (shift - 1n)
  if (rest > half || (rest === half && (q & 1n) === 1n)) q += 1n
  const f = Math.fround(Number(q) * 2 ** Number(shift)) // exact: q has at most 25 bits
  return negative ? -f : f
}

/**
 * Convert a value from one primitive type to another, as a cast would. Floating → integral is JLS §5.1.3 in two
 * steps: to int (or long) with NaN → 0, truncation toward zero and saturation at MIN/MAX; then, for byte, short and
 * char, narrowing that int.
 */
export function convert(value, from, to) {
  if (isIntegral(from)) {
    if (isIntegral(to)) return fit(value, to)
    if (to === 'double') return Number(value) // ECMAScript: nearest double, ties to even
    return bigintToFloat(value)
  }
  if (to === 'double') return value // every float is exactly a double
  if (to === 'float') return Math.fround(value) // IEEE 754 round to nearest; too large → ±Infinity
  return fit(floatingToIntOrLong(value, to === 'long' ? 'long' : 'int'), to)
}

function floatingToIntOrLong(value, wide) {
  const [min, max] = rangeOf(wide)
  const limit = wide === 'long' ? 2 ** 63 : 2 ** 31
  if (Number.isNaN(value)) return 0n
  if (value >= limit) return max
  if (value <= -limit) return min
  return BigInt(Math.trunc(value))
}

const TYPE_MAX = { int: 'Integer.MAX_VALUE', long: 'Long.MAX_VALUE' }
const TYPE_MIN = { int: 'Integer.MIN_VALUE', long: 'Long.MIN_VALUE' }

/** How Java would print a value of this type with println (a char prints as the character itself). */
export function format(value, type) {
  if (type === 'float' || type === 'double') return javaToString(value, type)
  if (type === 'char') return `${javaCharLiteral(Number(value))} (${value})`
  return value.toString()
}

/** Did the conversion keep the value exactly? */
export function preserved(value, from, result, to) {
  if (isIntegral(from) && isIntegral(to)) return value === result
  if (isIntegral(from)) return Number.isInteger(result) && BigInt(result) === value
  if (isIntegral(to)) return Number.isFinite(value) && Number.isInteger(value) && BigInt(value) === result
  return Object.is(result, value) || (Number.isNaN(value) && Number.isNaN(result))
}

/** A one-line explanation of what the conversion did to this value. */
export function explain(value, from, to) {
  const result = convert(value, from, to)
  const kept = preserved(value, from, result, to)
  if (from === to) return { result, kept, note: 'Same type: nothing to convert.' }
  if (isIntegral(from) && isIntegral(to)) {
    if (kept) return { result, kept, note: kindOf(from, to) === 'widening' ? 'Value preserved.' : 'Fits in the target range, so the value is unchanged.' }
    return { result, kept, note: `Doesn't fit: Java keeps the low ${INTEGRAL[to].bits} bits and reads them as a ${to}. No exception.` }
  }
  if (isIntegral(from)) {
    return { result, kept, note: kept ? 'Exactly representable.' : `Rounded to the nearest ${to}: too many significant bits. No warning.` }
  }
  if (!isIntegral(to)) {
    if (to === 'double') {
      const same = javaToString(value, 'float') === javaToString(result, 'double')
      return { result, kept, note: same ? 'Exact: every float value is also a double value.' : "Exact (every float is also a double), but double's toString prints the float's binary error." }
    }
    if (kept) return { result, kept, note: 'Exactly representable as a float.' }
    if (!Number.isFinite(result) && Number.isFinite(value)) return { result, kept, note: 'Too large for a float: becomes Infinity.' }
    if (result === 0 && value !== 0) return { result, kept, note: 'Too small for a float: underflows to zero.' }
    return { result, kept, note: 'Rounded to the nearest float.' }
  }
  const wide = to === 'long' ? 'long' : 'int'
  const step1 = floatingToIntOrLong(value, wide)
  let note
  if (Number.isNaN(value)) note = `NaN becomes 0.`
  else if (value >= (wide === 'long' ? 2 ** 63 : 2 ** 31)) note = `Too large: saturates at ${TYPE_MAX[wide]}.`
  else if (value <= -(wide === 'long' ? 2 ** 63 : 2 ** 31)) note = value === -(2 ** 63) || value === -(2 ** 31) ? 'Exactly the minimum value.' : `Too small: saturates at ${TYPE_MIN[wide]}.`
  else if (!Number.isInteger(value)) note = `The fraction is dropped (rounds toward zero): ${step1}.`
  else note = kept ? 'A whole number in range: unchanged.' : `As an ${wide}: ${step1}.`
  if (wide !== to && fit(step1, to) !== step1) note = `${note} Then (int) ${step1} → (${to}) keeps the low ${INTEGRAL[to].bits} bits.`.trim()
  return { result, kept, note }
}

/** Parse a Java literal of the given source type. Returns { value } or { error }. */
export function parseValue(text, type) {
  const t = text.trim()
  if (type === 'char') {
    const m = /^'(?:([^'\\])|\\u([0-9a-fA-F]{4})|\\([btnfrs"'\\]))'$/.exec(t)
    if (m) {
      if (m[1] !== undefined) return { value: BigInt(m[1].charCodeAt(0)) }
      if (m[2] !== undefined) return { value: BigInt(parseInt(m[2], 16)) }
      const esc = { b: 8, t: 9, n: 10, f: 12, r: 13, s: 32, '"': 34, "'": 39, '\\': 92 }
      return { value: BigInt(esc[m[3]]) }
    }
  }
  if (isIntegral(type)) {
    const v = parseInteger(t)
    if (v === undefined) return { error: type === 'char' ? "Type a char literal like 'A' or '\\n', or a number from 0 to 65535." : `Not an integer literal. Try 42, -7, 0x7F or 0b1010.` }
    const [min, max] = rangeOf(type)
    if (v < min || v > max) return { error: `${t} is outside the ${type} range (${min} to ${max}): a ${type} variable can't hold it.` }
    return { value: v }
  }
  const body = t.replace(/[fFdD]$/, '')
  const v = parseJava(body, type)
  if (v === undefined) return { error: 'Not a number. Try 3.99e10, -7.9, 0.1, NaN or Infinity.' }
  return { value: v }
}

/** Binary numeric promotion (JLS §5.6): the type of a + b, a * b, a < b… for numeric operands. */
export function promote(a, b) {
  if (a === 'double' || b === 'double') return 'double'
  if (a === 'float' || b === 'float') return 'float'
  if (a === 'long' || b === 'long') return 'long'
  return 'int'
}
