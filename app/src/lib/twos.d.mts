export type IntWidth = 4 | 8 | 16 | 32 | 64
export interface OpResult {
  value: bigint
  /** The mathematically correct result didn't fit, so Java's result wrapped around. */
  overflow: boolean
  exact: bigint
}
export const WIDTHS: { bits: IntWidth; name: string }[]
export function minValue(bits: IntWidth): bigint
export function maxValue(bits: IntWidth): bigint
export function wrap(value: bigint, bits: IntWidth): bigint
export function unsigned(value: bigint, bits: IntWidth): bigint
export function toBits(value: bigint, bits: IntWidth): string
export function fromBits(pattern: string): bigint
export function weights(bits: IntWidth): bigint[]
export function add(a: bigint, b: bigint, bits: IntWidth): OpResult
export function subtract(a: bigint, b: bigint, bits: IntWidth): OpResult
export function multiply(a: bigint, b: bigint, bits: IntWidth): OpResult
export function negate(a: bigint, bits: IntWidth): OpResult
export function invert(a: bigint, bits: IntWidth): OpResult
export function toHex(value: bigint, bits: IntWidth): string
export function parseInteger(text: string): bigint | undefined
