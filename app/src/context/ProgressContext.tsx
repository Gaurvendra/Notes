import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { readJSON, removeKey, writeJSON } from '../lib/storage'
import {
  BADGES,
  EMPTY_PROGRESS,
  earnedBadges,
  levelOf,
  normalise,
  schedule,
  streakOf,
  today,
  xpOf,
  type LevelInfo,
  type Progress,
  type XpBreakdown,
} from '../lib/progress'
import type { StreakResult } from '../engines/streak'
import { addTime } from '../lib/studytime.mjs'

const STORAGE_KEY = 'jmt:progress:v2'

export interface Toast {
  id: number
  kind: 'xp' | 'level' | 'badge'
  title: string
  body?: string
  icon?: string
}

interface ProgressContextValue {
  progress: Progress
  xp: XpBreakdown
  level: LevelInfo
  streak: StreakResult
  badges: Set<string>
  completedSet: ReadonlySet<string>
  toasts: Toast[]
  dismissToast: (id: number) => void
  toggleComplete: (lessonId: string) => void
  recordQuiz: (key: string, correct: number, total: number) => void
  reviewCard: (key: string, remembered: boolean) => void
  toggleExercise: (key: string) => void
  markPuzzle: (key: string, correct: boolean) => void
  rateInterview: (key: string, rating: 'confident' | 'shaky' | undefined) => void
  visitLesson: (lessonId: string) => void
  /** Adds seconds measured by the lesson timer (no XP: time is tracked, not rewarded). */
  addStudyTime: (key: string, seconds: number) => void
  /** Forgets the timer total of one lesson (the per-day history and the streak are kept). */
  resetStudyTime: (key: string) => void
  exportJSON: () => string
  importJSON: (json: string) => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function bump(p: Progress): Progress {
  const d = today()
  return { ...p, activity: { ...p.activity, [d]: (p.activity[d] ?? 0) + 1 } }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => normalise(readJSON(STORAGE_KEY, EMPTY_PROGRESS)))
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  useEffect(() => writeJSON(STORAGE_KEY, progress), [progress])

  const xp = useMemo(() => xpOf(progress), [progress])
  const level = useMemo(() => levelOf(xp.total), [xp.total])
  const streak = useMemo(() => streakOf(progress), [progress])
  const badges = useMemo(() => earnedBadges(progress), [progress])
  const completedSet = useMemo(() => new Set(Object.keys(progress.completed)), [progress.completed])

  // Toasts for level-ups and new badges are derived from state changes, so every action gets them for free.
  const seen = useRef({ level: level.level, badges })
  useEffect(() => {
    const push: Omit<Toast, 'id'>[] = []
    if (level.level > seen.current.level) push.push({ kind: 'level', title: `Level ${level.level}: ${level.title}`, icon: '👑' })
    for (const b of BADGES) {
      if (badges.has(b.id) && !seen.current.badges.has(b.id)) push.push({ kind: 'badge', title: b.name, body: b.description, icon: b.icon })
    }
    seen.current = { level: level.level, badges }
    if (push.length) setToasts((t) => [...t, ...push.map((x) => ({ ...x, id: nextId.current++ }))].slice(-4))
  }, [level.level, level.title, badges])

  const xpToast = useCallback((amount: number, title: string) => {
    if (amount <= 0) return
    setToasts((t) => [...t, { id: nextId.current++, kind: 'xp' as const, title, body: `+${amount} XP`, icon: '⚡' }].slice(-4))
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toggleComplete = useCallback(
    (lessonId: string) => {
      setProgress((p) => {
        const completed = { ...p.completed }
        if (completed[lessonId]) delete completed[lessonId]
        else completed[lessonId] = today()
        return bump({ ...p, completed })
      })
      if (!progress.completed[lessonId]) xpToast(100, 'Lesson complete')
    },
    [progress.completed, xpToast],
  )

  const recordQuiz = useCallback(
    (key: string, correct: number, total: number) => {
      const prevBest = progress.quiz[key]?.best ?? 0
      setProgress((p) => {
        const best = Math.max(p.quiz[key]?.best ?? 0, correct)
        return bump({ ...p, quiz: { ...p.quiz, [key]: { best, total, at: today() } } })
      })
      if (correct > prevBest) xpToast((correct - prevBest) * 10, 'New quiz best')
    },
    [progress.quiz, xpToast],
  )

  const reviewCard = useCallback((key: string, remembered: boolean) => {
    setProgress((p) => bump({ ...p, cards: { ...p.cards, [key]: schedule(p.cards[key], remembered) } }))
  }, [])

  const toggleExercise = useCallback(
    (key: string) => {
      setProgress((p) => {
        const exercises = { ...p.exercises }
        if (exercises[key]) delete exercises[key]
        else exercises[key] = today()
        return bump({ ...p, exercises })
      })
      if (!progress.exercises[key]) xpToast(40, 'Exercise solved')
    },
    [progress.exercises, xpToast],
  )

  const markPuzzle = useCallback(
    (key: string, correct: boolean) => {
      setProgress((p) => {
        const puzzles = { ...p.puzzles }
        if (correct) puzzles[key] = puzzles[key] ?? today()
        else delete puzzles[key]
        return bump({ ...p, puzzles })
      })
      if (correct && !progress.puzzles[key]) xpToast(15, 'Predicted correctly')
    },
    [progress.puzzles, xpToast],
  )

  const rateInterview = useCallback((key: string, rating: 'confident' | 'shaky' | undefined) => {
    setProgress((p) => {
      const interview = { ...p.interview }
      if (rating) interview[key] = rating
      else delete interview[key]
      return bump({ ...p, interview })
    })
  }, [])

  const visitLesson = useCallback((lessonId: string) => {
    setProgress((p) => (p.lastLesson === lessonId ? p : { ...p, lastLesson: lessonId }))
  }, [])

  const addStudyTime = useCallback((key: string, seconds: number) => {
    if (seconds < 1) return
    setProgress((p) => ({ ...p, ...addTime(p, key, seconds, today()) }))
  }, [])

  const resetStudyTime = useCallback((key: string) => {
    setProgress((p) => {
      if (!(key in p.time)) return p
      const time = { ...p.time }
      delete time[key]
      return { ...p, time }
    })
  }, [])

  const exportJSON = useCallback(() => JSON.stringify(progress, null, 2), [progress])
  const importJSON = useCallback((json: string) => {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object' || (parsed as Progress).version !== 2) {
      throw new Error('This file is not a Java Mastery Track progress export (version 2).')
    }
    setProgress(normalise(parsed))
  }, [])
  const reset = useCallback(() => {
    removeKey(STORAGE_KEY)
    setProgress(EMPTY_PROGRESS)
  }, [])

  const value = useMemo(
    () => ({
      progress,
      xp,
      level,
      streak,
      badges,
      completedSet,
      toasts,
      dismissToast,
      toggleComplete,
      recordQuiz,
      reviewCard,
      toggleExercise,
      markPuzzle,
      rateInterview,
      visitLesson,
      addStudyTime,
      resetStudyTime,
      exportJSON,
      importJSON,
      reset,
    }),
    [progress, xp, level, streak, badges, completedSet, toasts, dismissToast, toggleComplete, recordQuiz, reviewCard, toggleExercise, markPuzzle, rateInterview, visitLesson, addStudyTime, resetStudyTime, exportJSON, importJSON, reset],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
