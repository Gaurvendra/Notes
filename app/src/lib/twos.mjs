// Two's-complement arithmetic for the integer lab, exactly as Java defines it for byte, short, int and long
// (JLS §4.2.1, §4.2.2: integer operators wrap around silently; §5.1.3: narrowing keeps the low-order bits).
// BigInt keeps every width exact, including 64-bit long. Pure functions, no DOM: shared by the React widget
// (src/content/mdx/IntegerLab.tsx) and scripts/check-content.mjs, which checks them against JVM-verified values.

export const WIDTHS = [
  { bits: 4, name: '4-bit (toy)' },
  { bits: 8, name: 'byte' },
  { bits: 16, name: 'short' },
  { bits: 32, name: 'int' },
  { bits: 64, name: 'long' },
]

export const minValue = (bits) => -(1n << BigInt(bits - 1))
export const maxValue = (bits) => (1n << BigInt(bits - 1)) - 1n

/** Reduce any integer to the given width, keeping the low-order bits (Java's wrap-around and narrowing rule). */
export const wrap = (value, bits) => BigInt.asIntN(bits, value)

/** The unsigned reading of the same bits (what Integer.toUnsignedString shows for an int). */
export const unsigned = (value, bits) => BigInt.asUintN(bits, value)

/** The bit pattern, most significant bit first. */
export const toBits = (value, bits) => unsigned(value, bits).toString(2).padStart(bits, '0')

/** Read a bit pattern (MSB first) as a signed two's-complement number. */
export function fromBits(pattern) {
  if (!/^[01]+$/.test(pattern)) throw new Error(`not a bit pattern: ${pattern}`)
  return BigInt.asIntN(pattern.length, BigInt(`0b${pattern}`))
}

/** Weight of each bit position, MSB first: the MSB counts −2^(n−1), every other bit +2^k. */
export function weights(bits) {
  return Array.from({ length: bits }, (_, i) => {
    const power = 1n << BigInt(bits - 1 - i)
    return i === 0 ? -power : power
  })
}

function op(exact, bits) {
  const value = wrap(exact, bits)
  return { value, overflow: value !== exact, exact }
}

export const add = (a, b, bits) => op(a + b, bits)
export const subtract = (a, b, bits) => op(a - b, bits)
export const multiply = (a, b, bits) => op(a * b, bits)
/** Unary minus: -MIN_VALUE overflows back to MIN_VALUE. */
export const negate = (a, bits) => op(-a, bits)
/** Bitwise NOT: ~x == -x - 1 for every x; it never overflows. */
export const invert = (a, bits) => op(-a - 1n, bits)

/** Hex digits of the bit pattern, padded to the full width. */
export const toHex = (value, bits) => unsigned(value, bits).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')

/**
 * Parse a Java integer literal (optionally signed): 42, -7, 0x7F, 0b1010, 1_000, 017 (octal!), with an optional
 * L suffix. Returns undefined for anything Java wouldn't accept, such as 08 (not a valid octal literal).
 */
export function parseInteger(text) {
  const t = text.trim().replace(/[lL]$/, '')
  const m = /^([+-]?)(0[xX][0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?|0[bB][01](?:[01_]*[01])?|0[0-7_]*[0-7]|0|[1-9](?:[\d_]*\d)?)$/.exec(t)
  if (!m) return undefined
  const digits = m[2].replace(/_/g, '')
  let magnitude
  if (/^0[xX]/.test(digits)) magnitude = BigInt(`0x${digits.slice(2)}`)
  else if (/^0[bB]/.test(digits)) magnitude = BigInt(`0b${digits.slice(2)}`)
  else if (/^0[0-7]+$/.test(digits)) magnitude = BigInt(`0o${digits.slice(1)}`)
  else magnitude = BigInt(digits)
  return m[1] === '-' ? -magnitude : magnitude
}
