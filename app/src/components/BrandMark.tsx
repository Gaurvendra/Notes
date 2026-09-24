/** The brand mark: a "J" monogram with a steam curl, inline so it picks up the theme's gradient. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="brand-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-cyan)" />
          <stop offset="1" stopColor="var(--color-magenta)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="11" stroke="url(#brand-gradient)" strokeWidth="1.5" fill="var(--color-surface)" />
      <path d="M28 14v14a7 7 0 0 1-14 0" stroke="url(#brand-gradient)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M33 9c2 2 2 4 0 6s-2 4 0 6" stroke="url(#brand-gradient)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
