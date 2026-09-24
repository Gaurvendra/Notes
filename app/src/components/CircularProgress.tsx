/**
 * A ring progress tracker (cyan→magenta gradient stroke), generic and
 * reusable — not tied to any one section. `breakdown` renders small
 * secondary counts below the ring (e.g. Easy/Medium/Hard).
 */
export function CircularProgress({
  done,
  total,
  size = 128,
  strokeWidth = 10,
  breakdown,
}: {
  done: number
  total: number
  size?: number
  strokeWidth?: number
  breakdown?: Array<{ label: string; done: number; total: number; colorClass: string }>
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = total > 0 ? Math.min(1, done / total) : 0
  const offset = circumference * (1 - fraction)
  const percent = total > 0 ? Math.round(fraction * 100) : 0

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <defs>
          <linearGradient id="circular-progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-cyan)" />
            <stop offset="100%" stopColor="var(--color-magenta)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#circular-progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-ink font-display text-lg font-semibold"
        >
          {percent}%
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-ink-muted font-mono text-xs"
        >
          {done}/{total}
        </text>
      </svg>
      {breakdown && breakdown.length > 0 && (
        <dl className="space-y-1 text-sm">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${b.colorClass}`} aria-hidden="true" />
              <dt className="text-ink-muted">{b.label}</dt>
              <dd className="font-mono text-ink">
                {b.done}/{b.total}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
