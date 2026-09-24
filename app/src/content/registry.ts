/** Lesson guides, code-split: each MDX file becomes its own chunk, loaded when its page opens. */
import type { MDXContent } from 'mdx/types'

const modules = import.meta.glob<{ default: MDXContent }>('./lessons/*.mdx')

export function guideLoader(id: string) {
  return modules[`./lessons/${id}.mdx`]
}

export function hasGuide(id: string): boolean {
  return `./lessons/${id}.mdx` in modules
}

const checkpoints = import.meta.glob<{ default: MDXContent }>('./checkpoints/*.mdx')

/** A tier's checkpoint page content (intro, coding challenge, mock interview), if written. */
export function checkpointLoader(tier: number) {
  return checkpoints[`./checkpoints/tier-${tier}.mdx`]
}
