export type ClassName = 'Object' | 'Animal' | 'Dog' | 'Puppy' | 'Cat'
export type Creatable = 'Animal' | 'Dog' | 'Puppy' | 'Cat'
export type MemberId = 'speak' | 'eat' | 'describe' | 'fetch' | 'breathe' | 'info' | 'name'

export interface Declared {
  id: string
  text: string
  kind: 'field' | 'method' | 'final' | 'static'
  value?: string
  prints?: string[]
  overrides?: boolean
  hides?: boolean
  superFirst?: boolean
}

export interface Resolution {
  code: [string, string]
  compile:
    | { ok: false; line: 1 | 2; error: string; note: string }
    | { ok: true; type: ClassName; foundIn: ClassName; kind: Declared['kind']; bytecode: string[]; note: string }
  runtime?: {
    ok: boolean
    objectClass: Creatable
    /** Classes the JVM looked at, from the object's class up to the selected one (instance methods only). */
    searched: ClassName[]
    selected?: ClassName
    /** For describe(): the class whose speak() ran inside it. */
    speakFrom?: ClassName
    output: string[]
    exception?: string
    note: string
  }
}

export const TYPES: ClassName[]
export const CREATABLE: Creatable[]
export const PARENT: Record<ClassName, ClassName | null>
export const MEMBERS: { id: MemberId; label: string }[]
export const DECLARES: Record<ClassName, Declared[]>
export const SOURCE: string[]
export function ancestors(c: ClassName): ClassName[]
export function isSubtype(a: ClassName, b: ClassName): boolean
export function resolve(q: { declared: ClassName; created: Creatable; cast: ClassName | null; member: MemberId }): Resolution
export function methodTable(created: Creatable): { id: string; text: string; introducedBy: ClassName; impl: ClassName }[]
