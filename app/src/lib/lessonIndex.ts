/** Typed access to src/generated/lesson-index.json (built from the MDX lessons by scripts/build-index.mjs). */
import index from '../generated/lesson-index.json'

export interface LessonFrontmatter {
  title: string
  description: string
  estimatedMinutes?: number
  fastTrackMinutes?: number
  sourcePages?: string[]
  javaBaseline?: number
  lastVerified?: string
}
export interface IndexedHeading {
  depth: number
  text: string
  slug: string
}
export interface IndexedExercise {
  key: string
  title: string
  difficulty: 'warmup' | 'core' | 'challenge'
  anchor: string
}
export interface IndexedPuzzle {
  key: string
  title: string
  anchor: string
}
export interface IndexedLesson {
  frontmatter: LessonFrontmatter
  headings: IndexedHeading[]
  exercises: IndexedExercise[]
  puzzles: IndexedPuzzle[]
  counts: { quiz: number; interview: number; flashcards: number }
}

export const lessonIndex = (index as unknown as { lessons: Record<string, IndexedLesson> }).lessons

export function indexed(id: string): IndexedLesson | undefined {
  return lessonIndex[id]
}
