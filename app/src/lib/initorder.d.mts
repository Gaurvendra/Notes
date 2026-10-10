export type InitProgramId = 'blocks' | 'override' | 'override25' | 'chaining'

export interface InitProgram {
  label: string
  summary: string
  /** Set on a variant of another program (shown as a toggle on that program). */
  variantOf?: InitProgramId
}

export type InitStepKind = 'start' | 'print' | 'clinit' | 'static' | 'alloc' | 'ctor' | 'prologue' | 'init' | 'body' | 'call' | 'method' | 'done' | 'end'

export interface InitClassState {
  name: string
  superName: string
  state: 'uninitialised' | 'initialising' | 'initialised'
  statics: { name: string; type: string; value: string; changed: boolean }[]
}

export interface InitField {
  owner: string
  name: string
  type: string
  final: boolean
  value: string
  /** Whether an initialiser or assignment has run (otherwise it holds its default value). */
  assigned: boolean
  changed: boolean
}

export interface InitObject {
  id: number
  cls: string
  done: boolean
  active: boolean
  fields: InitField[]
}

export interface InitFrame {
  label: string
  kind: 'main' | 'clinit' | 'ctor' | 'method'
  line: number
  detail: string
}

export interface InitStep {
  kind: InitStepKind
  line: number
  note: string
  out: string[]
  classes: InitClassState[]
  objects: InitObject[]
  /** Top of the stack first. */
  frames: InitFrame[]
}

export const INIT_PROGRAMS: Record<InitProgramId, InitProgram>
export function initTrace(id: InitProgramId): { source: string[]; steps: InitStep[]; output: string[] }
