import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { today } from '../../lib/progress'
import { duration } from '../../lib/studytime.mjs'

const LEVEL_CLASSES = ['bg-surface-3', 'bg-cyan/25', 'bg-cyan/45', 'bg-cyan/70', 'bg-cyan glow-cyan']
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function bucket(actions: number): number {
  if (actions <= 0) return 0
  if (actions < 3) return 1
  if (actions < 8) return 2
  if (actions < 15) return 3
  return 4
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * A month-at-a-time calendar: each day coloured by study actions (same five-step scale as the 26-week heatmap), a
 * ring on today, a dot on days with a completed lesson or checkpoint, and previous/next navigation.
 */
export function ActivityCalendar({
  activity,
  timeByDay,
  completedDates,
}: {
  activity: Record<string, number>
  timeByDay: Record<string, number>
  completedDates: ReadonlySet<string>
}) {
  const now = new Date(`${today()}T00:00:00Z`)
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())

  const isCurrentMonth = year === now.getUTCFullYear() && month === now.getUTCMonth()
  const startWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const cells: (string | null)[] = Array(startWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  function go(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1))
    setYear(d.getUTCFullYear())
    setMonth(d.getUTCMonth())
  }

  const activeDays = cells.filter((d): d is string => d !== null && (activity[d] ?? 0) > 0).length
  const monthSeconds = cells.reduce((n, d) => n + (d ? (timeByDay[d] ?? 0) : 0), 0)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous month"
            className="rounded-md p-1 text-ink-dim hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="min-w-[9.5rem] text-center font-display text-sm font-semibold text-ink">{monthLabel(year, month)}</span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="rounded-md p-1 text-ink-dim hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => {
                setYear(now.getUTCFullYear())
                setMonth(now.getUTCMonth())
              }}
              className="ml-1 rounded-md border border-cyber-border px-2 py-0.5 text-xs text-ink-muted hover:border-cyan/40 hover:text-cyan"
            >
              Today
            </button>
          )}
        </div>
        <p className="text-xs text-ink-dim">
          {activeDays} active day{activeDays === 1 ? '' : 's'} · {duration(monthSeconds)} studied
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-dim">
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} aria-hidden="true" />
          const n = activity[date] ?? 0
          const level = bucket(n)
          const isToday = date === today()
          return (
            <div
              key={date}
              title={`${date}: ${n} action${n === 1 ? '' : 's'} · ${duration(timeByDay[date] ?? 0)}`}
              className={[
                'relative flex aspect-square items-center justify-center rounded-md font-mono text-[11px]',
                LEVEL_CLASSES[level],
                level >= 4 ? 'font-semibold text-void' : n > 0 ? 'text-ink' : 'text-ink-dim',
                isToday ? 'ring-2 ring-cyan ring-offset-1 ring-offset-surface' : '',
              ].join(' ')}
            >
              {Number(date.slice(8))}
              {completedDates.has(date) && <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-ink-dim">
        <span className="mr-0.5 inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" /> lesson completed
        </span>
        <span className="ml-2">Less</span>
        {LEVEL_CLASSES.map((c, i) => (
          <span key={i} className={`h-3 w-3 rounded-sm ${c}`} aria-hidden="true" />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
