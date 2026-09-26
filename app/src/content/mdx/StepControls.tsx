import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { Button } from '../../components/ui'

/**
 * First / previous / play / next / last for step-through widgets. Play advances every `interval` ms and stops at
 * the last step. The parent owns the step index; ←/→ on the widget work through `stepKeys`.
 */
export function StepControls({
  index,
  count,
  onChange,
  interval = 1100,
}: {
  index: number
  count: number
  onChange: (i: number) => void
  interval?: number
}) {
  const [playing, setPlaying] = useState(false)
  const last = count - 1
  const atEnd = index >= last
  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => onChange(index + 1), interval)
    return () => clearTimeout(timer)
  }, [playing, atEnd, index, interval, onChange])
  const go = (i: number) => {
    setPlaying(false)
    onChange(Math.max(0, Math.min(last, i)))
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" aria-label="First step" disabled={index === 0} onClick={() => go(0)}>
          <ChevronsLeft size={14} aria-hidden="true" />
        </Button>
        <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} aria-hidden="true" />} disabled={index === 0} onClick={() => go(index - 1)}>
          Prev
        </Button>
        <Button
          size="sm"
          variant={playing ? 'secondary' : 'primary'}
          icon={playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
          onClick={() => {
            if (playing) setPlaying(false)
            else {
              if (atEnd) onChange(0)
              setPlaying(true)
            }
          }}
        >
          {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
        </Button>
        <Button size="sm" variant="ghost" disabled={atEnd} onClick={() => go(index + 1)}>
          Next <ChevronRight size={14} aria-hidden="true" />
        </Button>
        <Button size="sm" variant="ghost" aria-label="Last step" disabled={atEnd} onClick={() => go(last)}>
          <ChevronsRight size={14} aria-hidden="true" />
        </Button>
      </div>
      <span className="font-mono text-xs text-ink-dim" aria-live="polite">
        Step {index + 1} of {count}
      </span>
    </div>
  )
}

/** ←/→ handler for a focusable widget container. */
export function stepKeys(index: number, count: number, onChange: (i: number) => void) {
  return (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'ArrowRight' && index < count - 1) {
      e.preventDefault()
      onChange(index + 1)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      onChange(index - 1)
    }
  }
}
