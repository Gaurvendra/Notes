import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

/**
 * Study preferences (the lesson timer's behaviour) and focus mode. Preferences persist in this browser; focus mode is
 * per visit: it switches off when you leave the lesson or checkpoint pages.
 */
export interface StudyPrefs {
  /** Start the timer when a lesson you haven't completed opens. */
  timerAutoStart: boolean
  /** Pause while the tab is hidden, and resume when you come back. */
  timerPauseWhenHidden: boolean
  /** Pause after this many minutes without any input (0 = never). */
  timerIdleMinutes: number
}

const PREFS_KEY = 'jmt:prefs:v1'
export const DEFAULT_PREFS: StudyPrefs = { timerAutoStart: true, timerPauseWhenHidden: true, timerIdleMinutes: 10 }
export const IDLE_CHOICES = [5, 10, 20, 0] as const

function readPrefs(): StudyPrefs {
  const raw = readJSON<Partial<StudyPrefs>>(PREFS_KEY, {})
  return {
    timerAutoStart: typeof raw.timerAutoStart === 'boolean' ? raw.timerAutoStart : DEFAULT_PREFS.timerAutoStart,
    timerPauseWhenHidden: typeof raw.timerPauseWhenHidden === 'boolean' ? raw.timerPauseWhenHidden : DEFAULT_PREFS.timerPauseWhenHidden,
    timerIdleMinutes: IDLE_CHOICES.includes(raw.timerIdleMinutes as never) ? (raw.timerIdleMinutes as number) : DEFAULT_PREFS.timerIdleMinutes,
  }
}

interface StudyContextValue {
  prefs: StudyPrefs
  setPrefs: (patch: Partial<StudyPrefs>) => void
  focus: boolean
  setFocus: (on: boolean) => void
}

const StudyContext = createContext<StudyContextValue | null>(null)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<StudyPrefs>(readPrefs)
  const [focus, setFocus] = useState(false)

  useEffect(() => writeJSON(PREFS_KEY, prefs), [prefs])
  // One attribute on <html> lets CSS calm the page down (no ambient glow) while focus mode is on.
  useEffect(() => {
    if (focus) document.documentElement.dataset.focus = 'on'
    else delete document.documentElement.dataset.focus
  }, [focus])

  const setPrefs = useCallback((patch: Partial<StudyPrefs>) => setPrefsState((p) => ({ ...p, ...patch })), [])
  const value = useMemo(() => ({ prefs, setPrefs, focus, setFocus }), [prefs, setPrefs, focus])
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within a StudyProvider')
  return ctx
}
