import { load } from 'js-yaml'
import type { Frame, HeapObject } from '../content/mdx/memory'

/**
 * Memory traces for the MemoryStepper widget: a Java program and its state after each step, written by hand in
 * src/content/traces/<id>.yaml and validated by scripts/check-content.mjs (lines exist, every arrow points to an
 * object of the same step, output only grows).
 */
export interface TraceStep {
  /** 1-based line of `code` that has just run (or is running, for a call). */
  line: number
  note: string
  /** Top of the stack first. */
  frames: Frame[]
  heap?: HeapObject[]
  /** Everything printed so far. */
  out?: string
}

export interface Trace {
  title: string
  code: string
  steps: TraceStep[]
}

const files = import.meta.glob<string>('../content/traces/*.yaml', { query: '?raw', import: 'default' })
const cache = new Map<string, Promise<Trace | undefined>>()

export function loadTrace(id: string): Promise<Trace | undefined> {
  const loader = files[`../content/traces/${id}.yaml`]
  if (!loader) return Promise.resolve(undefined)
  if (!cache.has(id)) cache.set(id, loader().then((text) => load(text) as Trace))
  return cache.get(id)!
}
