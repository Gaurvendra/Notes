import { Check, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { THEMES, type ThemeId } from '../lib/themes'
import { Button } from './ui'

/**
 * Scheme swatches are rendered by temporarily scoping the target theme's
 * tokens to a tiny element via data attributes, so each preview shows the
 * REAL colours of that scheme in the CURRENT light/dark mode — no duplicated
 * hex values to drift out of sync with styles/themes.css.
 */
function Swatch({ theme }: { theme: ThemeId }) {
  return (
    <span
      data-theme={theme}
      className="inline-flex h-5 w-9 shrink-0 overflow-hidden rounded border border-cyber-border"
      aria-hidden="true"
    >
      <span className="h-full w-1/3 bg-void" />
      <span className="h-full w-1/3 bg-cyan" />
      <span className="h-full w-1/3 bg-magenta" />
    </span>
  )
}

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      </Button>

      <div className="relative" ref={ref}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Colour scheme"
          title="Colour scheme"
        >
          <Palette size={16} aria-hidden="true" />
        </Button>

        {open && (
          <div
            role="menu"
            aria-label="Colour scheme"
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-cyber-border bg-surface shadow-xl"
          >
            <div className="border-b border-cyber-border px-3 py-2">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-ink-dim">
                Colour scheme
              </p>
            </div>
            <ul className="max-h-80 overflow-y-auto p-1">
              {THEMES.map((t) => {
                const active = t.id === theme
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        setTheme(t.id)
                        setOpen(false)
                      }}
                      className={[
                        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                        active ? 'bg-surface-2' : 'hover:bg-surface-2',
                      ].join(' ')}
                    >
                      <Swatch theme={t.id} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink">{t.name}</span>
                        <span className="block truncate text-xs text-ink-dim">{t.blurb}</span>
                      </span>
                      {active && <Check size={14} className="shrink-0 text-cyan" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-cyber-border px-3 py-2">
              <p className="text-xs text-ink-dim">
                Each scheme has a light and a dark variant — the sun/moon button switches between them.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
