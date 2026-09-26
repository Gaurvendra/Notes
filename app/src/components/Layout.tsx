import { Flame, Menu, Search, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { useStudy } from '../context/StudyContext'
import { curriculum } from '../lib/curriculum'
import { NAV } from '../lib/nav'
import { BrandMark } from './BrandMark'
import { CommandPalette } from './CommandPalette'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Toaster } from './Toaster'

function GameBar() {
  const { level, streak } = useProgress()
  const pct = Math.round((level.xpIntoLevel / level.xpForNext) * 100)
  const streakTitle = streak.activeToday
    ? `${streak.currentStreak}-day streak: safe for today`
    : streak.currentStreak > 0
      ? `${streak.currentStreak}-day streak: study today to keep it going`
      : 'No streak yet: study today to start one'
  return (
    <div className="flex items-center gap-1">
      <Link
        to="/profile"
        title={streakTitle}
        aria-label={streakTitle}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors hover:bg-surface-2"
      >
        <Flame size={17} aria-hidden="true" className={streak.activeToday ? 'fill-amber/40 text-amber' : 'text-ink-dim'} />
        <span className={streak.activeToday ? 'text-amber' : 'text-ink-muted'}>{streak.currentStreak}</span>
      </Link>
      <Link
        to="/profile"
        title={`Level ${level.level} · ${level.title} · ${level.xpIntoLevel}/${level.xpForNext} XP to the next level`}
        aria-label={`Your profile: level ${level.level}, ${level.title}`}
        className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-2"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold text-cyan"
          style={{ background: `conic-gradient(var(--color-cyan) ${pct}%, var(--color-surface-3) 0)` }}>
          <span className="absolute inset-[3px] rounded-full bg-surface" />
          <span className="relative">{level.level}</span>
        </span>
        <span className="hidden flex-col leading-tight lg:flex">
          <span className="font-display text-xs font-semibold text-ink">{level.title}</span>
          <span className="font-mono text-[10px] text-ink-dim">{level.xp.toLocaleString()} XP</span>
        </span>
      </Link>
    </div>
  )
}

export function Layout() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { focus, setFocus } = useStudy()

  // Focus mode belongs to lessons and checkpoints: leaving them switches it off.
  useEffect(() => {
    if (!/^\/(lessons|checkpoints)\//.test(location.pathname)) setFocus(false)
  }, [location.pathname, setFocus])

  // ⌘K / Ctrl-K from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // A new page starts at the top; a link to an anchor is handled by the page once its content has loaded.
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  // Plain <a href="/…"> links inside rendered content (MDX, lesson-data Markdown) navigate inside the app
  // instead of reloading the page.
  function onContentClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target) return
    e.preventDefault()
    navigate(href)
  }

  const written = curriculum.lessons.filter((l) => l.status === 'done').length

  const sidebar = (
    <nav aria-label="Primary" className="flex flex-col gap-5" onClick={() => setDrawerOpen(false)}>
      {NAV.map((group) => (
        <div key={group.label}>
          <div className="mb-1.5 px-3 font-display text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-cyan/40 bg-cyan/10 text-cyan'
                        : 'border-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
                    ].join(' ')
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="px-3 font-mono text-[11px] leading-relaxed text-ink-dim">
        {curriculum.lessons.length} lessons · {written} written
        <br />
        Java 25 LTS baseline
      </p>
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-cyan focus:px-3 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>

      {!focus && (
      <header className="sticky top-0 z-40 border-b border-cyber-border bg-surface/85 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 md:px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <Link to="/" className="flex min-w-0 shrink items-center gap-2">
            <BrandMark size={28} />
            <span className="hidden truncate font-display text-base font-semibold tracking-wide text-ink sm:inline">
              Java Mastery Track
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-md border border-cyber-border bg-surface-2 px-2.5 py-1.5 text-xs text-ink-dim transition-colors hover:border-cyan/40 hover:text-ink"
              aria-label="Search lessons and pages"
            >
              <Search size={14} aria-hidden="true" />
              <span className="hidden lg:inline">Search…</span>
              <kbd className="hidden rounded border border-cyber-border bg-surface px-1 py-0.5 font-mono text-[10px] lg:inline">
                ⌘K
              </kbd>
            </button>
            <ThemeSwitcher />
            <span className="mx-1 hidden h-6 w-px bg-cyber-border sm:block" aria-hidden="true" />
            <GameBar />
          </div>
        </div>
      </header>
      )}

      <div className="flex flex-1">
        {!focus && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-cyber-border bg-surface/40 px-2 py-5 md:block">
            {sidebar}
          </aside>
        )}

        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 h-full w-full bg-void/70 backdrop-blur-sm"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-cyber-border bg-surface px-2 py-4">
              <div className="mb-4 flex items-center justify-between px-3">
                <span className="font-display text-sm font-semibold text-ink">Java Mastery Track</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
                  aria-label="Close navigation"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main
          id="main-content"
          className={`min-w-0 flex-1 px-4 md:px-8 ${focus ? 'pb-16 pt-20' : 'py-6 md:py-8'}`}
          onClick={onContentClick}
        >
          <div className={`mx-auto ${focus ? 'max-w-3xl' : 'max-w-6xl'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster />
    </div>
  )
}
