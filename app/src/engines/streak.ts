export const FREEZES_PER_MONTH = 2

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function monthKey(iso: string): string {
  return iso.slice(0, 7) // YYYY-MM
}

export interface StreakResult {
  /** Streak length as of `today` (0 if today itself has no activity and streak broke). */
  currentStreak: number
  longestStreak: number
  /** Streak freezes consumed per calendar month (YYYY-MM -> count, max 2). */
  freezesUsedByMonth: Record<string, number>
  /** Purchased freezes spent once a month's free ones ran out. */
  bankedFreezesUsed: number
  /** Whether today already counts — false means the streak is still at risk. */
  activeToday: boolean
}

/**
 * Walks every day from the earliest active date through `today`. A day with
 * >= 1 completed block extends the streak. A day with none auto-consumes a
 * streak freeze (up to 2 per calendar month) to preserve the streak; once
 * those are gone it draws on `bankedFreezes` (bought in the store), and only
 * when both are exhausted does the streak reset to 0.
 *
 * Today is never charged: a day with no activity YET is still in progress,
 * so it neither extends the streak nor burns a freeze.
 */
export function computeStreak(activeDates: string[], today: string, bankedFreezes = 0): StreakResult {
  const activeSet = new Set(activeDates)
  const freezesUsedByMonth: Record<string, number> = {}
  const activeToday = activeSet.has(today)

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, freezesUsedByMonth, bankedFreezesUsed: 0, activeToday }
  }

  const start = [...activeDates].sort()[0]

  let currentStreak = 0
  let longestStreak = 0
  let bankedFreezesUsed = 0

  for (let date = start; date <= today; date = addDays(date, 1)) {
    if (activeSet.has(date)) {
      currentStreak += 1
      longestStreak = Math.max(longestStreak, currentStreak)
      continue
    }
    if (date === today) break

    const key = monthKey(date)
    const used = freezesUsedByMonth[key] ?? 0
    if (used < FREEZES_PER_MONTH) {
      freezesUsedByMonth[key] = used + 1
      // streak preserved through the freeze
    } else if (bankedFreezesUsed < bankedFreezes) {
      bankedFreezesUsed += 1
    } else {
      currentStreak = 0
    }
  }

  return { currentStreak, longestStreak, freezesUsedByMonth, bankedFreezesUsed, activeToday }
}

/** Minutes studied per day, for the contribution heatmap. */
export function buildHeatmap(entries: Array<{ date: string; minutes: number }>): Record<string, number> {
  const heatmap: Record<string, number> = {}
  for (const entry of entries) {
    heatmap[entry.date] = (heatmap[entry.date] ?? 0) + entry.minutes
  }
  return heatmap
}
