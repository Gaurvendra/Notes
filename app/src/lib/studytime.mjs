/**
 * Study-time rules for the lesson timer, as pure functions (no React, no storage, no clock), so every rule is checked
 * in scripts/check-content.mjs.
 *
 * Time is stored in whole seconds: per lesson key (a lesson id or `checkpoint-<tier>`) and per calendar day.
 */

/** A day with at least this much timed study counts as a study day for the streak and the heatmap. */
export const STUDY_DAY_SECONDS = 5 * 60

/** When the timer pauses for inactivity, time after the last input still counts for this long (reading time). */
export const IDLE_GRACE_MS = 60 * 1000

/**
 * Adds `seconds` of study to `key` on `day`. Returns new maps (the inputs are not changed). The first time a day's
 * total reaches STUDY_DAY_SECONDS, that day gets one activity point, exactly like any other study action.
 */
export function addTime({ time, timeByDay, activity }, key, seconds, day) {
  const s = Math.max(0, Math.floor(seconds))
  if (s === 0) return { time, timeByDay, activity }
  const before = timeByDay[day] ?? 0
  const after = before + s
  const crossed = before < STUDY_DAY_SECONDS && after >= STUDY_DAY_SECONDS
  return {
    time: { ...time, [key]: (time[key] ?? 0) + s },
    timeByDay: { ...timeByDay, [day]: after },
    activity: crossed ? { ...activity, [day]: (activity[day] ?? 0) + 1 } : activity,
  }
}

/**
 * Milliseconds to credit when a running segment that started at `segmentStart` stops at `now` because the learner was
 * idle since `lastActivity`: the time up to the last input plus a short grace period, never more than the segment.
 */
export function idleCredit(segmentStart, lastActivity, now, graceMs = IDLE_GRACE_MS) {
  const end = Math.min(now, Math.max(lastActivity, segmentStart) + graceMs)
  return Math.max(0, end - segmentStart)
}

/** A running clock: `m:ss` below an hour, `h:mm:ss` from an hour on. */
export function clock(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** A summary duration: `< 1 min`, `42 min`, `1 h`, `1 h 5 min` (minutes rounded down). */
export function duration(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60)
  if (m < 1) return '< 1 min'
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h === 0) return `${m} min`
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`
}

/** Progress against a lesson's estimate: the fraction (capped at 1) and the minutes beyond it, if any. */
export function againstEstimate(seconds, estimateMinutes) {
  if (!estimateMinutes || estimateMinutes <= 0) return { fraction: 0, overMinutes: 0, hasEstimate: false }
  const est = estimateMinutes * 60
  return {
    fraction: Math.min(1, Math.max(0, seconds) / est),
    overMinutes: seconds > est ? Math.floor((seconds - est) / 60) : 0,
    hasEstimate: true,
  }
}

/** Total seconds of the last `days` calendar days ending with `today` (ISO dates), from a per-day map. */
export function lastDays(timeByDay, today, days) {
  const end = new Date(`${today}T00:00:00Z`)
  let total = 0
  for (let i = 0; i < days; i++) {
    const d = new Date(end)
    d.setUTCDate(end.getUTCDate() - i)
    total += timeByDay[d.toISOString().slice(0, 10)] ?? 0
  }
  return total
}
