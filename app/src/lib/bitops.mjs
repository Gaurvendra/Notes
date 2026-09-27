// Bitwise and shift operators exactly as the JLS defines them: §15.22.1 (& | ^ on integers, after binary numeric
// promotion), §15.15.5 (~, after unary promotion), §15.19 (<< >> >>>: each operand promoted separately, the result has
// the left operand's promoted type, and the shift distance is masked to 5 bits for int, 6 for long). Values are BigInt.
// Pure functions, no DOM: shared by src/content/mdx/BitwiseLab.tsx and scripts/check-content.mjs, which checks them
// against JVM-verified values.
import { toBits } from './twos.mjs'

export const OPERAND_TYPES = ['byte', 'short', 'char', 'int', 'long']
export const OPERATORS = ['&', '|', '^', '~', '<<', '>>', '>>>']
export const isShift = (op) => op === '<<' || op === '>>' || op === '>>>'

const WIDTH = { byte: 8, short: 16, char: 16, int: 32, long: 64 }
export const widthOf = (type) => WIDTH[type]

/** Unary numeric promotion (JLS §5.6): byte, short and char become int; the value is unchanged. */
export const promotedType = (type) => (type === 'long' ? 'long' : 'int')

/** The bit pattern of a value in its type (char is unsigned, the others two's complement). */
export const bitsOf = (value, type) => toBits(value, WIDTH[type])

const fit = (value, type) => (type === 'long' ? BigInt.asIntN(64, value) : BigInt.asIntN(32, value))

/**
 * Evaluate `a op b` (or `~a`). Returns the result, its type, and for shifts the masked distance.
 * `a` and `b` must already be valid values of their types.
 */
export function evaluate(op, a, aType, b = 0n, bType = 'int') {
  if (op === '~') {
    const type = promotedType(aType)
    return { value: fit(~a, type), type }
  }
  if (isShift(op)) {
    const type = promotedType(aType) // the right operand's type never affects the result type
    const mask = type === 'long' ? 63n : 31n
    const distance = b & mask // two's-complement AND: also correct for negative distances
    const bits = type === 'long' ? 64 : 32
    let value
    if (op === '<<') value = fit(a << distance, type)
    else if (op === '>>') value = a >> distance // BigInt >> is arithmetic (sign-filling), like Java's >>
    else value = fit(BigInt.asUintN(bits, a) >> distance, type)
    return { value, type, distance }
  }
  const type = aType === 'long' || bType === 'long' ? 'long' : 'int' // binary numeric promotion
  const value = op === '&' ? a & b : op === '|' ? a | b : a ^ b
  return { value: fit(value, type), type }
}

/** Short explanations of what Java did, in order, for the lab's "what happened" list. */
export function explain(op, a, aType, b, bType) {
  const steps = []
  const r = evaluate(op, a, aType, b, bType)
  const promote = (t, name) => {
    if (t === 'int' || t === 'long') return
    const target = isShift(op) || op === '~' ? promotedType(t) : r.type
    steps.push(
      t === 'char'
        ? `${name} is a char: promoted to ${target} by adding zeros on the left (char is unsigned).`
        : `${name} is a ${t}: promoted to ${target} first, copying its sign bit into the new high bits (sign extension).`,
    )
  }
  promote(aType, 'The left operand')
  if (!isShift(op) && op !== '~') {
    promote(bType, 'The right operand')
    if (aType !== bType && (aType === 'long' || bType === 'long')) steps.push('One operand is a long, so both are computed as long.')
  }
  if (isShift(op)) {
    promote(bType, 'The shift distance')
    const bits = r.type === 'long' ? 64 : 32
    if (r.distance !== b) steps.push(`Only the low ${bits === 64 ? 6 : 5} bits of the distance count: ${b} & ${bits - 1} = ${r.distance}.`)
    if (op === '<<') steps.push('<< shifts left and fills with zeros; bits pushed past the top are lost (it can overflow).')
    if (op === '>>') steps.push('>> shifts right and copies the sign bit into the gap, so negatives stay negative (it rounds toward −∞).')
    if (op === '>>>') steps.push('>>> shifts right and fills with zeros, so the result is never negative unless the distance is 0.')
  }
  if (op === '~') steps.push(`~ flips every bit: ~x is always −x − 1, here ${r.value}.`)
  return { ...r, steps }
}

export { toBits }
