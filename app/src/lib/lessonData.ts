/**
 * Per-lesson structured data (quiz, interview questions, flashcards) from src/content/lesson-data/<id>.yaml.
 * Loaded lazily: a lesson page loads only its own file, the hubs load every written lesson's file.
 * The schema is enforced by scripts/check-content.mjs.
 */
import { load } from 'js-yaml'

export interface QuizOption {
  text: string
  correct?: boolean
  why: string
}
export interface QuizQuestion {
  q: string
  options: QuizOption[]
}
export type InterviewLevel = 'fresher' | 'mid' | 'senior' | 'staff'
export type InterviewType = 'concept' | 'code' | 'predict-output' | 'design' | 'behavioural'
export interface InterviewQuestion {
  level: InterviewLevel
  type?: InterviewType
  q: string
  answer: string
  followUps?: string[]
  redFlags?: string[]
  tests?: string
}
export interface Flashcard {
  front: string
  back: string
}
export interface LessonData {
  quiz: QuizQuestion[]
  interview: InterviewQuestion[]
  flashcards: Flashcard[]
}

export const INTERVIEW_LEVELS: Record<InterviewLevel, string> = {
  fresher: 'Fresher',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff / Manager',
}
export const INTERVIEW_ORDER: InterviewLevel[] = ['fresher', 'mid', 'senior', 'staff']

const files = import.meta.glob<string>('../content/lesson-data/*.yaml', { query: '?raw', import: 'default' })
const cache = new Map<string, Promise<LessonData | undefined>>()

function pathOf(id: string) {
  return `../content/lesson-data/${id}.yaml`
}

export function hasLessonData(id: string): boolean {
  return pathOf(id) in files
}

export function loadLessonData(id: string): Promise<LessonData | undefined> {
  const loader = files[pathOf(id)]
  if (!loader) return Promise.resolve(undefined)
  if (!cache.has(id)) {
    cache.set(
      id,
      loader().then((text) => {
        const data = (load(text) ?? {}) as Partial<LessonData>
        return { quiz: data.quiz ?? [], interview: data.interview ?? [], flashcards: data.flashcards ?? [] }
      }),
    )
  }
  return cache.get(id)!
}

/** Every lesson-data file, keyed by lesson id (the hubs aggregate across lessons). */
export async function loadAllLessonData(): Promise<Map<string, LessonData>> {
  const ids = Object.keys(files)
    .map((p) => /([^/]+)\.yaml$/.exec(p)![1])
    .filter((id) => id !== 'template')
  const entries = await Promise.all(ids.map(async (id) => [id, await loadLessonData(id)] as const))
  return new Map(entries.filter((e): e is readonly [string, LessonData] => e[1] !== undefined))
}

/** Stable key of a flashcard, used by the spaced-repetition scheduler. */
export function cardKey(lessonId: string, index: number) {
  return `${lessonId}#${index}`
}
