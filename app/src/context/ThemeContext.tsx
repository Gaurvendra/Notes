import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isThemeId, isThemeMode, type ThemeId, type ThemeMode } from '../lib/themes'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'jmt:theme:v1'

interface StoredTheme {
  theme: ThemeId
  mode: ThemeMode
}

const DEFAULT: StoredTheme = { theme: 'cyber', mode: 'dark' }

/**
 * Applied to <html> rather than a wrapper div so that the tokens are in scope
 * for everything — including `body`, the ambient backdrop, and anything
 * portalled outside the React tree.
 */
function apply({ theme, mode }: StoredTheme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.dataset.mode = mode
}

function readStored(): StoredTheme {
  const raw = readJSON<Partial<StoredTheme>>(STORAGE_KEY, {})
  return {
    theme: isThemeId(raw.theme) ? raw.theme : DEFAULT.theme,
    mode: isThemeMode(raw.mode) ? raw.mode : DEFAULT.mode,
  }
}

interface ThemeContextValue extends StoredTheme {
  setTheme: (theme: ThemeId) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredTheme>(readStored)

  useEffect(() => {
    apply(state)
    writeJSON(STORAGE_KEY, state)
  }, [state])

  const setTheme = useCallback((theme: ThemeId) => setState((s) => ({ ...s, theme })), [])
  const setMode = useCallback((mode: ThemeMode) => setState((s) => ({ ...s, mode })), [])
  const toggleMode = useCallback(
    () => setState((s) => ({ ...s, mode: s.mode === 'dark' ? 'light' : 'dark' })),
    [],
  )

  const value = useMemo(
    () => ({ ...state, setTheme, setMode, toggleMode }),
    [state, setTheme, setMode, toggleMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
