import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useProgress } from '../context/ProgressContext'
import { useStudy } from '../context/StudyContext'
import { idleCredit } from './studytime.mjs'

export type PauseReason = 'user' | 'hidden' | 'idle' | 'complete'

export interface StudyTimer {
  key: string
  running: boolean
  /** Why the timer last stopped (null: never started on this visit). */
  pausedBy: PauseReason | null
  /** Seconds measured for this key, including the running segment. Read it from a ticking component. */
  elapsed: () => number
  start: () => void
  pause: (reason?: PauseReason) => void
  toggle: () => void
  reset: () => void
}

/** How often a running timer saves, so a crash or a closed tab loses at most this much. */
const SAVE_EVERY_MS = 30_000
const IDLE_CHECK_MS = 15_000
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'] as const

/**
 * The lesson timer for one key (a lesson id or `checkpoint-<tier>`). Only `running` and `pausedBy` are React state;
 * the clock itself is a timestamp in a ref, so the page doesn't re-render every second. Time is saved in whole seconds
 * every 30 s, on pause, when the tab is hidden or closed, and when you move to another lesson.
 */
export function useStudyTimer(key: string, autoStart: boolean): StudyTimer {
  const { progress, addStudyTime, resetStudyTime } = useProgress()
  const { prefs } = useStudy()
  const stored = progress.time[key] ?? 0

  const [running, setRunning] = useState(false)
  const [pausedBy, setPausedBy] = useState<PauseReason | null>(null)
  const base = useRef(stored) // seconds saved (or being saved) for this key
  const segmentStart = useRef<number | null>(null) // when the running segment began (ms), null while paused
  const lastActivity = useRef(0)
  const pausedByRef = useRef<PauseReason | null>(null)

  // After a save the store catches up with `base`; after an import or a reset elsewhere, `base` follows the store.
  useEffect(() => {
    base.current = stored
  }, [stored])

  /** Saves the whole seconds of `ms` under `k` and returns the milliseconds saved. */
  const bank = useCallback(
    (k: string, ms: number) => {
      const s = Math.floor(ms / 1000)
      if (s <= 0) return 0
      base.current += s
      addStudyTime(k, s)
      return s * 1000
    },
    [addStudyTime],
  )

  const start = useCallback(() => {
    if (segmentStart.current !== null) return
    segmentStart.current = Date.now()
    lastActivity.current = Date.now()
    pausedByRef.current = null
    setRunning(true)
    setPausedBy(null)
  }, [])

  const stopAs = useCallback(
    (k: string, reason: PauseReason, creditMs?: number) => {
      if (segmentStart.current === null) return
      bank(k, creditMs ?? Date.now() - segmentStart.current)
      segmentStart.current = null
      pausedByRef.current = reason
      setRunning(false)
      setPausedBy(reason)
    },
    [bank],
  )

  const save = useCallback(
    (k: string) => {
      if (segmentStart.current !== null) segmentStart.current += bank(k, Date.now() - segmentStart.current)
    },
    [bank],
  )

  // A new key (another lesson): save the old one's running time under the old key, then start fresh.
  useEffect(() => {
    base.current = stored
    pausedByRef.current = null
    setPausedBy(null)
    if (autoStart) start()
    return () => stopAs(key, 'user')
    // Only the key decides: `stored` and `autoStart` are read once, when a lesson opens.
  }, [key])

  // Save periodically while running.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => save(key), SAVE_EVERY_MS)
    return () => clearInterval(timer)
  }, [running, key, save])

  // Hidden tab: pause (or just save) synchronously, because the page may be about to close. Visible again: resume.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        flushSync(() => (prefs.timerPauseWhenHidden ? stopAs(key, 'hidden') : save(key)))
      } else if (pausedByRef.current === 'hidden') {
        start()
      }
    }
    function onPageHide() {
      flushSync(() => save(key))
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [key, prefs.timerPauseWhenHidden, save, start, stopAs])

  // No input for a while: pause, counting only up to shortly after the last input.
  useEffect(() => {
    if (!running || prefs.timerIdleMinutes <= 0) return
    const limit = prefs.timerIdleMinutes * 60_000
    const mark = () => {
      lastActivity.current = Date.now()
    }
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, mark, { passive: true })
    const timer = setInterval(() => {
      const now = Date.now()
      if (segmentStart.current !== null && now - lastActivity.current >= limit) {
        stopAs(key, 'idle', idleCredit(segmentStart.current, lastActivity.current, now))
      }
    }, IDLE_CHECK_MS)
    return () => {
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, mark)
      clearInterval(timer)
    }
  }, [running, key, prefs.timerIdleMinutes, stopAs])

  const pause = useCallback((reason: PauseReason = 'user') => stopAs(key, reason), [key, stopAs])
  const toggle = useCallback(() => (segmentStart.current === null ? start() : stopAs(key, 'user')), [key, start, stopAs])
  const reset = useCallback(() => {
    if (segmentStart.current !== null) segmentStart.current = Date.now()
    base.current = 0
    resetStudyTime(key)
  }, [key, resetStudyTime])
  const elapsed = useCallback(
    () => base.current + (segmentStart.current === null ? 0 : (Date.now() - segmentStart.current) / 1000),
    [],
  )

  return useMemo(
    () => ({ key, running, pausedBy, elapsed, start, pause, toggle, reset }),
    [key, running, pausedBy, elapsed, start, pause, toggle, reset],
  )
}
