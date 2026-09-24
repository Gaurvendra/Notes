export type Format = 'float' | 'double';
export type Kind = 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan';

export const FORMATS: Record<Format, { total: number; expBits: number; fracBits: number; bias: number; maxDigits: number }>;
export function bitsOf(value: number, format: Format): bigint;
export function valueOf(bits: bigint, format: Format): number;
export function decompose(
	bits: bigint,
	format: Format,
): { sign: number; exponent: number; fraction: bigint; kind: Kind; significand: bigint; power: number; unbiased: number };
export function exactDecimal(significand: bigint, power: number): { digits: bigint; scale: number };
export function toPlain(decimal: { digits: bigint; scale: number }): string;
export function exactString(bits: bigint, format: Format): string;
export function javaToString(value: number, format: Format): string;
export function parseJava(text: string, format: Format): number | undefined;
export function parseDecimal(text: string): { negative: boolean; digits: bigint; scale: number } | undefined;
export function ulp(value: number, format: Format): number;
export function errorOf(text: string, bits: bigint, format: Format): string | undefined;
