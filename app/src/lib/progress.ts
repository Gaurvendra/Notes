/**
 * The game layer, as pure functions over one stored object. Nothing here touches React or storage, so every rule is
 * easy to read in one place: XP, levels, spaced-repetition scheduling and badges are all derived from `Progress`.
 */
import { computeStreak, type StreakResult } from '../engines/streak'
import { curriculum } from './curriculum'

export interface CardState {
  /** Leitner box 0–4; the next interval is SRS_INTERVALS[box] days. */
  box: number
  due: string
  reviews: number
  lapses: number
}

export interface Progress {
  version: 2
  /** lesson id → date completed */
  completed: Record<string, string>
  /** lesson id (or `checkpoint-<tier>`) → best quiz result */
  quiz: Record<string, { best: number; total: number; at: string }>
  /** flashcard key (`<lesson>#<index>`) → schedule */
  cards: Record<string, CardState>
  /** exercise key (`<lesson>/<Class>`) → date marked solved */
  exercises: Record<string, string>
  /** puzzle key (`<lesson>/<anchor>`) → date predicted correctly */
  puzzles: Record<string, string>
  /** interview question key (`<lesson>#<index>`) → self-rating */
  interview: Record<string, 'confident' | 'shaky'>
  /** date → number of study actions that day (drives the streak and the heatmap) */
  activity: Record<string, number>
  /** lesson id (or `checkpoint-<tier>`) → seconds measured by the lesson timer */
  time: Record<string, number>
  /** date → seconds measured by the lesson timer that day */
  timeByDay: Record<string, number>
  lastLesson?: string
}

export const EMPTY_PROGRESS: Progress = {
  version: 2,
  completed: {},
  quiz: {},
  cards: {},
  exercises: {},
  puzzles: {},
  interview: {},
  activity: {},
  time: {},
  timeByDay: {},
}

/** Days until the next review, per box. A lapse goes back to box 0 (review again tomorrow). */
export const SRS_INTERVALS = [1, 4, 10, 21, 45] as const

export const XP_RULES = {
  lesson: 100,
  quizCorrect: 10,
  exercise: 40,
  puzzle: 15,
  review: 5,
  interview: 5,
} as const

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function normalise(value: unknown): Progress {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<Progress>
  return {
    version: 2,
    completed: v.completed ?? {},
    quiz: v.quiz ?? {},
    cards: v.cards ?? {},
    exercises: v.exercises ?? {},
    puzzles: v.puzzles ?? {},
    interview: v.interview ?? {},
    activity: v.activity ?? {},
    time: v.time ?? {},
    timeByDay: v.timeByDay ?? {},
    lastLesson: v.lastLesson,
  }
}

export function reviewsDone(p: Progress): number {
  return Object.values(p.cards).reduce((n, c) => n + c.reviews, 0)
}

export interface XpBreakdown {
  lessons: number
  quizzes: number
  exercises: number
  puzzles: number
  reviews: number
  interview: number
  total: number
}

export function xpOf(p: Progress): XpBreakdown {
  const lessons = Object.keys(p.completed).length * XP_RULES.lesson
  const quizzes = Object.values(p.quiz).reduce((n, q) => n + q.best, 0) * XP_RULES.quizCorrect
  const exercises = Object.keys(p.exercises).length * XP_RULES.exercise
  const puzzles = Object.keys(p.puzzles).length * XP_RULES.puzzle
  const reviews = reviewsDone(p) * XP_RULES.review
  const interview = Object.keys(p.interview).length * XP_RULES.interview
  return { lessons, quizzes, exercises, puzzles, reviews, interview, total: lessons + quizzes + exercises + puzzles + reviews + interview }
}

/** Level titles follow the path: each one names what a learner at that level has just mastered. */
const LEVEL_TITLES = [
  'Hello, World',
  'Bytecode Apprentice',
  'Primitive Tamer',
  'Operator Adept',
  'Loop Rider',
  'Method Maker',
  'Heap Walker',
  'Object Crafter',
  'Interface Architect',
  'Exception Handler',
  'Generics Wrangler',
  'Collection Curator',
  'Lambda Artisan',
  'Stream Surfer',
  'Thread Tamer',
  'Concurrency Captain',
  'Reflection Mage',
  'GC Whisperer',
  'Bytecode Sage',
  'JIT Whisperer',
  'Java Grandmaster',
]

/** XP needed to reach `level` (level 1 = 0 XP): 0, 100, 300, 600, 1000, … */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export interface LevelInfo {
  level: number
  title: string
  xp: number
  xpIntoLevel: number
  xpForNext: number
}

export function levelOf(xp: number): LevelInfo {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
  return { level, title, xp, xpIntoLevel: xp - xpForLevel(level), xpForNext: xpForLevel(level + 1) - xpForLevel(level) }
}

export function streakOf(p: Progress): StreakResult {
  return computeStreak(Object.keys(p.activity), today())
}

/* ------------------------------------------------------------ spaced repetition */

export function isDue(card: CardState | undefined, on = today()): boolean {
  return card === undefined || card.due <= on
}

export function schedule(card: CardState | undefined, remembered: boolean, on = today()): CardState {
  const prev = card ?? { box: 0, due: on, reviews: 0, lapses: 0 }
  // A new card that is remembered starts in box 0 (see it tomorrow); a forgotten card stays due today.
  const box = remembered ? (card ? Math.min(prev.box + 1, SRS_INTERVALS.length - 1) : 0) : 0
  return {
    box,
    due: remembered ? addDays(on, SRS_INTERVALS[box]) : on,
    reviews: prev.reviews + 1,
    lapses: prev.lapses + (remembered ? 0 : 1),
  }
}

/* ---------------------------------------------------------------------- badges */

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  earned: (p: Progress, streak: StreakResult) => boolean
}

function tierComplete(p: Progress, tier: number) {
  const lessons = curriculum.tiers.find((t) => t.n === tier)?.lessons ?? []
  return lessons.length > 0 && lessons.every((l) => p.completed[l.id])
}

export const BADGES: BadgeDef[] = [
  { id: 'first-lesson', name: 'First Class', icon: '☕', description: 'Complete your first lesson', earned: (p) => Object.keys(p.completed).length >= 1 },
  { id: 'five-lessons', name: 'Warming Up', icon: '🔥', description: 'Complete 5 lessons', earned: (p) => Object.keys(p.completed).length >= 5 },
  { id: 'perfect-quiz', name: 'Flawless', icon: '🎯', description: 'Get every question of a lesson quiz right', earned: (p) => Object.values(p.quiz).some((q) => q.total > 0 && q.best === q.total) },
  { id: 'first-exercise', name: 'Green Bar', icon: '✅', description: 'Solve your first exercise', earned: (p) => Object.keys(p.exercises).length >= 1 },
  { id: 'ten-exercises', name: 'Problem Solver', icon: '🧩', description: 'Solve 10 exercises', earned: (p) => Object.keys(p.exercises).length >= 10 },
  { id: 'puzzle-5', name: 'Output Oracle', icon: '🔮', description: 'Predict 5 outputs correctly', earned: (p) => Object.keys(p.puzzles).length >= 5 },
  { id: 'reviews-50', name: 'Memory Palace', icon: '🧠', description: 'Do 50 flashcard reviews', earned: (p) => reviewsDone(p) >= 50 },
  { id: 'reviews-500', name: 'Total Recall', icon: '🏛️', description: 'Do 500 flashcard reviews', earned: (p) => reviewsDone(p) >= 500 },
  { id: 'interview-20', name: 'Interview Ready', icon: '🎤', description: 'Rate 20 interview answers as confident', earned: (p) => Object.values(p.interview).filter((r) => r === 'confident').length >= 20 },
  { id: 'streak-3', name: 'On a Roll', icon: '⚡', description: 'Study 3 days in a row', earned: (_, s) => s.longestStreak >= 3 },
  { id: 'streak-7', name: 'Week Warrior', icon: '📅', description: 'Study 7 days in a row', earned: (_, s) => s.longestStreak >= 7 },
  { id: 'streak-30', name: 'Unstoppable', icon: '🚀', description: 'Study 30 days in a row', earned: (_, s) => s.longestStreak >= 30 },
  ...curriculum.levels.map((lv) => ({
    id: `level-${lv.name.toLowerCase()}`,
    name: `${lv.name} Cleared`,
    icon: { Beginner: '🟢', Intermediate: '🔵', Advanced: '🟣', Expert: '🟠' }[lv.name],
    description: `Complete every lesson of the ${lv.name} level`,
    earned: (p: Progress) => lv.tiers.every((t) => tierComplete(p, t.n)),
  })),
]

export function earnedBadges(p: Progress): Set<string> {
  const s = streakOf(p)
  return new Set(BADGES.filter((b) => b.earned(p, s)).map((b) => b.id))
}
