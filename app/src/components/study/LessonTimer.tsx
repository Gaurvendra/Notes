import { Focus, Maximize, Minimize, Minimize2, Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStudy } from '../../context/StudyContext'
import { againstEstimate, clock, duration } from '../../lib/studytime.mjs'
import type { StudyTimer } from '../../lib/useStudyTimer'
import { Button } from '../ui'

/** Re-renders the calling component once a second while `active`. Keep it in small leaf components. */
function useTick(active: boolean) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [active])
}

/** A small ring: time used against the estimate (amber once past it). */
function TimerRing({ fraction, over, size = 40 }: { fraction: number; over: boolean; size?: number }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={over ? 'var(--color-amber)' : 'var(--color-cyan)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - fraction)}
        className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
      />
    </svg>
  )
}

function status(timer: StudyTimer, seconds: number, estimate: number | undefined, idleMinutes: number, what: string) {
  const est = againstEstimate(seconds, estimate)
  if (timer.running) {
    if (!est.hasEstimate) return `Timing this ${what}`
    if (est.overMinutes > 0) return `${est.overMinutes} min past the estimate: take the time you need`
    return `${Math.floor(est.fraction * 100)}% of the estimated time`
  }
  switch (timer.pausedBy) {
    case 'hidden':
      return 'Paused while this tab was in the background'
    case 'idle':
      return `Paused after ${idleMinutes} min without activity`
    case 'complete':
      return `Paused: ${what} complete in ${duration(seconds)}`
    case 'user':
      return 'Paused'
    default:
      return seconds > 0 ? `${duration(seconds)} so far` : 'Not started'
  }
}

/**
 * The timer card under a lesson's header: time spent against the estimate, start/pause, reset and the focus-mode
 * switch. Shortcuts: T starts or pauses, F toggles focus mode.
 */
export function LessonTimerBar({
  timer,
  estimate,
  what = 'lesson',
  onFocus,
}: {
  timer: StudyTimer
  estimate?: number
  what?: 'lesson' | 'checkpoint'
  onFocus: () => void
}) {
  const { prefs } = useStudy()
  useTick(timer.running)
  const seconds = timer.elapsed()
  const est = againstEstimate(seconds, estimate)
  return (
    <div
      role="group"
      aria-label={`${what === 'lesson' ? 'Lesson' : 'Checkpoint'} timer`}
      className="jx-timer mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-cyber-border bg-surface px-4 py-3"
    >
      <div className="flex min-w-[14rem] flex-1 items-center gap-3">
        {est.hasEstimate ? (
          <TimerRing fraction={est.fraction} over={est.overMinutes > 0} />
        ) : (
          <Timer size={22} className="shrink-0 text-cyan" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="whitespace-nowrap font-mono text-lg font-semibold tabular-nums leading-tight text-ink">
            <span className="jx-timer__clock">{clock(seconds)}</span>
            {est.hasEstimate && <span className="text-sm font-normal text-ink-dim"> / ~{estimate} min</span>}
          </p>
          <p className="truncate text-xs text-ink-muted">{status(timer, seconds, estimate, prefs.timerIdleMinutes, what)}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={timer.running ? 'secondary' : 'primary'}
          icon={timer.running ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
          onClick={timer.toggle}
          title="Start or pause the timer (T)"
        >
          {timer.running ? 'Pause' : seconds >= 1 ? 'Resume' : 'Start'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw size={13} aria-hidden="true" />}
          disabled={seconds < 1}
          onClick={() => {
            if (window.confirm(`Reset the timer for this ${what}? Your study days and streak are kept.`)) timer.reset()
          }}
        >
          Reset
        </Button>
        <Button size="sm" icon={<Focus size={13} aria-hidden="true" />} onClick={onFocus} title="Focus mode (F)">
          Focus mode
        </Button>
      </div>
    </div>
  )
}

/** Tracks how far the page is scrolled (0–1) and the last section heading (an `h2` of the article) scrolled past. */
function useReadingPosition() {
  const [pos, setPos] = useState({ progress: 0, section: '' })
  useEffect(() => {
    let frame = 0
    function measure() {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      let section = ''
      for (const h of document.querySelectorAll('article h2')) {
        if (h.getBoundingClientRect().top < 90) section = h.textContent ?? ''
        else break
      }
      setPos({ progress: max > 0 ? Math.min(1, window.scrollY / max) : 0, section })
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return pos
}

function FocusClock({ timer, estimate }: { timer: StudyTimer; estimate?: number }) {
  useTick(timer.running)
  const seconds = timer.elapsed()
  return (
    <button
      type="button"
      onClick={timer.toggle}
      title="Start or pause the timer (T)"
      aria-label={`${timer.running ? 'Pause' : 'Start'} the timer, ${clock(seconds)} so far`}
      className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-sm tabular-nums transition-colors ${
        timer.running ? 'border-cyan/40 text-cyan hover:bg-cyan/10' : 'border-cyber-border text-ink-muted hover:text-ink'
      }`}
    >
      {timer.running ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
      <span className="jx-timer__clock">{clock(seconds)}</span>
      {estimate ? <span className="hidden text-ink-dim sm:inline">/ {estimate}m</span> : null}
    </button>
  )
}

/**
 * The only chrome left in focus mode: exit, the title and current section, the timer and (where the browser allows
 * it) full screen, with a reading-progress line underneath.
 */
export function FocusBar({
  title,
  timer,
  estimate,
  onExit,
}: {
  title: string
  timer: StudyTimer
  estimate?: number
  onExit: () => void
}) {
  const { progress, section } = useReadingPosition()
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement))
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [])

  return (
    <div role="region" aria-label="Focus mode" className="jx-focusbar fixed inset-x-0 top-0 z-40 border-b border-cyber-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-4xl items-center gap-2 px-3">
        <Button size="sm" variant="ghost" icon={<Minimize2 size={13} aria-hidden="true" />} onClick={onExit} title="Exit focus mode (Esc or F)">
          Exit<span className="hidden sm:inline"> focus</span>
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-sm font-semibold text-ink">{title}</p>
          <p className="hidden truncate text-[11px] leading-tight text-ink-dim sm:block">{section || '\u00a0'}</p>
        </div>
        <FocusClock timer={timer} estimate={estimate} />
        {canFullscreen && (
          <button
            type="button"
            onClick={() => (fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
            className="hidden rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink sm:block"
            aria-label={fullscreen ? 'Leave full screen' : 'Full screen'}
            title={fullscreen ? 'Leave full screen' : 'Full screen'}
          >
            {fullscreen ? <Minimize size={15} aria-hidden="true" /> : <Maximize size={15} aria-hidden="true" />}
          </button>
        )}
      </div>
      <div className="h-0.5 bg-surface-3" aria-hidden="true">
        <div className="h-full bg-cyan transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}

/**
 * Keeps the reader's place when the layout changes (entering or leaving focus mode moves everything): remembers the
 * first block of the article in view and puts it back at the same height after the next paint.
 */
export function keepReadingPosition(change: () => void) {
  const blocks = [...document.querySelectorAll('article > *')] as HTMLElement[]
  const anchor = blocks.find((el) => el.getBoundingClientRect().bottom > 72)
  const offset = anchor?.getBoundingClientRect().top ?? 0
  change()
  if (!anchor || window.scrollY < 40) return
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      window.scrollBy(0, anchor.getBoundingClientRect().top - offset)
    }),
  )
}

/** F toggles focus mode, Esc leaves it, T starts or pauses the timer; ignored while typing or with modifiers. */
export function useStudyShortcuts({
  enabled,
  focus,
  toggleFocus,
  exitFocus,
  timer,
}: {
  enabled: boolean
  focus: boolean
  toggleFocus: () => void
  exitFocus: () => void
  timer: StudyTimer
}) {
  useEffect(() => {
    if (!enabled) return
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      const k = e.key.toLowerCase()
      if (k === 'f') {
        e.preventDefault()
        toggleFocus()
      } else if (k === 't') {
        e.preventDefault()
        timer.toggle()
      } else if (k === 'escape' && focus) {
        exitFocus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enabled, focus, toggleFocus, exitFocus, timer])
}
