export type PrimType = 'byte' | 'short' | 'char' | 'int' | 'long' | 'float' | 'double'
/** BigInt for byte, short, char, int and long; number for float and double. */
export type PrimValue = bigint | number
export type ConversionKind = 'identity' | 'widening' | 'narrowing' | 'widening-narrowing'
export const TYPES: PrimType[]
export function isIntegral(type: PrimType): boolean
export function rangeOf(type: PrimType): [bigint, bigint]
export function kindOf(from: PrimType, to: PrimType): ConversionKind
export function mayLosePrecision(from: PrimType, to: PrimType): boolean
export function bigintToFloat(v: bigint): number
export function convert(value: PrimValue, from: PrimType, to: PrimType): PrimValue
export function format(value: PrimValue, type: PrimType): string
export function preserved(value: PrimValue, from: PrimType, result: PrimValue, to: PrimType): boolean
export function explain(value: PrimValue, from: PrimType, to: PrimType): { result: PrimValue; kept: boolean; note: string }
export function parseValue(text: string, type: PrimType): { value: PrimValue; error?: undefined } | { error: string; value?: undefined }
export function promote(a: PrimType, b: PrimType): PrimType
