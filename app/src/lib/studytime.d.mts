export const STUDY_DAY_SECONDS: number
export const IDLE_GRACE_MS: number

export interface TimeMaps {
  time: Record<string, number>
  timeByDay: Record<string, number>
  activity: Record<string, number>
}

export function addTime(maps: TimeMaps, key: string, seconds: number, day: string): TimeMaps
export function idleCredit(segmentStart: number, lastActivity: number, now: number, graceMs?: number): number
export function clock(seconds: number): string
export function duration(seconds: number): string
export function againstEstimate(seconds: number, estimateMinutes: number | undefined): {
  fraction: number
  overMinutes: number
  hasEstimate: boolean
}
export function lastDays(timeByDay: Record<string, number>, today: string, days: number): number
