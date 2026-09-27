export type OperandType = 'byte' | 'short' | 'char' | 'int' | 'long'
export type BitOperator = '&' | '|' | '^' | '~' | '<<' | '>>' | '>>>'
export interface BitResult {
  value: bigint
  type: 'int' | 'long'
  /** For shifts: the distance actually used, after masking. */
  distance?: bigint
}
export const OPERAND_TYPES: OperandType[]
export const OPERATORS: BitOperator[]
export function isShift(op: BitOperator): boolean
export function widthOf(type: OperandType): number
export function promotedType(type: OperandType): 'int' | 'long'
export function bitsOf(value: bigint, type: OperandType): string
export function evaluate(op: BitOperator, a: bigint, aType: OperandType, b?: bigint, bType?: OperandType): BitResult
export function explain(op: BitOperator, a: bigint, aType: OperandType, b: bigint, bType: OperandType): BitResult & { steps: string[] }
export function toBits(value: bigint, bits: number): string
