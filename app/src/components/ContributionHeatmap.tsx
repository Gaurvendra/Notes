import { addDays, today } from '../lib/progress'

const LEVEL_CLASSES = ['bg-surface-3', 'bg-cyan/25', 'bg-cyan/45', 'bg-cyan/70', 'bg-cyan glow-cyan']

function bucket(actions: number): number {
  if (actions <= 0) return 0
  if (actions < 3) return 1
  if (actions < 8) return 2
  if (actions < 15) return 3
  return 4
}

/** A GitHub-style grid of study actions per day over the last `weeks` weeks (columns are weeks, Monday first). */
export function ContributionHeatmap({ activity, weeks = 26 }: { activity: Record<string, number>; weeks?: number }) {
  const end = today()
  const endDay = (new Date(`${end}T00:00:00Z`).getUTCDay() + 6) % 7 // 0 = Monday
  const start = addDays(end, -(weeks - 1) * 7 - endDay)
  const columns: string[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: string[] = []
    for (let d = 0; d < 7; d++) col.push(addDays(start, w * 7 + d))
    columns.push(col)
  }
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex w-max gap-1">
        {columns.map((col) => (
          <div key={col[0]} className="flex flex-col gap-1">
            {col.map((date) =>
              date > end ? (
                <div key={date} className="h-3 w-3" />
              ) : (
                <div key={date} title={`${date}: ${activity[date] ?? 0} actions`} className={`h-3 w-3 rounded-sm ${LEVEL_CLASSES[bucket(activity[date] ?? 0)]}`} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
