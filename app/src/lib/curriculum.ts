/**
 * The learning graph, read from project-plan/curriculum.yaml (the single source of truth, validated by
 * project-plan/tools/curriculum.py). Parsed once at start-up; nothing here changes at runtime.
 */
import { load } from 'js-yaml'
import raw from '../../../project-plan/curriculum.yaml?raw'

export type LevelName = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
export type LessonStatus = 'todo' | 'drafting' | 'review' | 'done'

export interface Lesson {
  id: string
  label: string
  title: string
  tier: number
  prereqs: string[]
  sources: string[]
  audit: string[]
  status: LessonStatus
  level: LevelName
  unlocks: string[]
  /** Position in a topological order (tier first, then file order): the recommended reading order. */
  order: number
  url: string
}

export interface Tier {
  n: number
  name: string
  level: LevelName
  lessons: Lesson[]
}

export interface Level {
  name: LevelName
  tiers: Tier[]
}

interface RawCurriculum {
  version: number
  updated: string
  levels: { name: LevelName; tiers: number[] }[]
  tiers: Record<string, string>
  lessons: {
    id: string
    label: string
    title: string
    tier: number
    prereqs: string[]
    sources: string[]
    audit: string[]
    status?: LessonStatus
  }[]
}

export const LEVEL_STYLE: Record<LevelName, { emoji: string; tone: 'success' | 'primary' | 'secondary' | 'warning'; blurb: string }> = {
  Beginner: { emoji: '🟢', tone: 'success', blurb: 'Platform, data types, operators and control flow' },
  Intermediate: { emoji: '🔵', tone: 'primary', blurb: 'Methods, memory and references, constructors, OOP core' },
  Advanced: {
    emoji: '🟣',
    tone: 'secondary',
    blurb: 'Special classes, interfaces and sealed types, exceptions, generics, collections, lambdas and streams',
  },
  Expert: { emoji: '🟠', tone: 'warning', blurb: 'Concurrency, reflection and annotations, JVM memory and GC, bytecode' },
}

/** Human names for the source-note keys used in curriculum.yaml (see CONTEXT.md §3). */
export const NOTE_NAMES: Record<string, string> = {
  '01': 'OOPS Concepts',
  '02': 'JDK, JRE, JVM',
  '04': 'Primitive Variables',
  '06': 'Non-Primitive Variables',
  '07': 'Methods',
  '08': 'Constructors',
  '09': 'Memory Management',
  '12-13': 'POJO, Enum, Singleton Classes',
  '14-15': 'Interfaces',
  '16': 'Functional Interfaces & Lambdas',
  '17': 'Reflection',
  '18': 'Annotations',
  '19': 'Exception Handling',
  '20': 'Operators',
  '21': 'Control Flow',
  '28': 'Streams',
  '40': 'Sequenced Collections',
  '41': 'Sealed Classes',
  Optional: 'Optional',
  gap: 'Gap-fill (related topic not in the notes)',
}

function build() {
  const data = load(raw) as RawCurriculum
  const levelOfTier = new Map<number, LevelName>()
  for (const level of data.levels) for (const t of level.tiers) levelOfTier.set(t, level.name)

  const byId = new Map<string, Lesson>()
  const fileIndex = new Map<string, number>()
  data.lessons.forEach((l, i) => {
    fileIndex.set(l.id, i)
    byId.set(l.id, {
      ...l,
      status: l.status ?? 'todo',
      level: levelOfTier.get(l.tier)!,
      unlocks: [],
      order: 0,
      url: `/lessons/${l.id}/`,
    })
  })
  for (const l of byId.values()) for (const p of l.prereqs) byId.get(p)?.unlocks.push(l.id)

  // Kahn's algorithm, always taking the earliest (tier, file position) lesson that is ready.
  const indeg = new Map([...byId.keys()].map((id) => [id, byId.get(id)!.prereqs.length]))
  const cmp = (a: string, b: string) =>
    byId.get(a)!.tier - byId.get(b)!.tier || fileIndex.get(a)! - fileIndex.get(b)!
  const ready = [...indeg].filter(([, d]) => d === 0).map(([id]) => id).sort(cmp)
  const ordered: Lesson[] = []
  while (ready.length) {
    const id = ready.shift()!
    const lesson = byId.get(id)!
    lesson.order = ordered.length
    ordered.push(lesson)
    for (const c of lesson.unlocks) {
      indeg.set(c, indeg.get(c)! - 1)
      if (indeg.get(c) === 0) {
        ready.push(c)
        ready.sort(cmp)
      }
    }
  }

  const tiers: Tier[] = Object.entries(data.tiers)
    .map(([n, name]) => ({
      n: Number(n),
      name,
      level: levelOfTier.get(Number(n))!,
      lessons: ordered.filter((l) => l.tier === Number(n)),
    }))
    .sort((a, b) => a.n - b.n)

  const levels: Level[] = data.levels.map((lv) => ({
    name: lv.name,
    tiers: tiers.filter((t) => lv.tiers.includes(t.n)),
  }))

  return { version: data.version, updated: data.updated, levels, tiers, lessons: ordered, byId }
}

export const curriculum = build()

export function getLesson(id: string | undefined): Lesson | undefined {
  return id ? curriculum.byId.get(id) : undefined
}

/** Every lesson that must come before `id` (transitive prerequisites). */
export function ancestorsOf(id: string): Set<string> {
  const seen = new Set<string>()
  const stack = [...(curriculum.byId.get(id)?.prereqs ?? [])]
  while (stack.length) {
    const p = stack.pop()!
    if (!seen.has(p)) {
      seen.add(p)
      stack.push(...curriculum.byId.get(p)!.prereqs)
    }
  }
  return seen
}

/** A lesson is unlocked once all its direct prerequisites are complete. Locks are advice, never a wall. */
export function isUnlocked(lesson: Lesson, completed: ReadonlySet<string>): boolean {
  return lesson.prereqs.every((p) => completed.has(p))
}

/** The first lesson in reading order that isn't complete and whose prerequisites are. */
export function nextLesson(completed: ReadonlySet<string>, preferWritten = true): Lesson | undefined {
  const open = curriculum.lessons.filter((l) => !completed.has(l.id) && isUnlocked(l, completed))
  return (preferWritten ? open.find((l) => l.status === 'done') : undefined) ?? open[0]
}

export const writtenLessons = curriculum.lessons.filter((l) => l.status === 'done')
