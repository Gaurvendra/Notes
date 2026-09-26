export type StepKind = 'call' | 'line' | 'print' | 'return' | 'overflow' | 'end'

export interface FrameSnapshot {
  method: string
  args: Record<string, string | number | bigint>
  line: number | null
  waiting: string | null
}

export interface CallStep {
  kind: StepKind
  line: number
  note: string
  out: string[]
  /** Top of the stack first. */
  frames: FrameSnapshot[]
  depth: number
  calls: number
  maxDepth: number
}

export interface Program {
  label: string
  argLabel: string
  min: number
  max: number
  initial: number
}

export type ProgramId = 'factorial' | 'countDown' | 'fib' | 'overflow'
export const PROGRAMS: Record<ProgramId, Program>
export function trace(programId: ProgramId, arg: number): { source: string[]; steps: CallStep[]; arg: number }
