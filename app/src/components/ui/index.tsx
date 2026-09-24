import type { ReactNode } from 'react'

export { Button, buttonStyles } from './Button'
export type { ButtonSize, ButtonVariant } from './Button'

/* ----------------------------------------------------------------- Card */

export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  return <Tag className={`rounded-xl border border-cyber-border bg-surface ${className}`}>{children}</Tag>
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border-b border-cyber-border px-4 py-3 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>
}

/* ---------------------------------------------------------------- Badge */

export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-cyber-border bg-surface-2 text-ink-muted',
  primary: 'border-cyan/30 bg-cyan/10 text-cyan',
  secondary: 'border-magenta/30 bg-magenta/10 text-magenta',
  success: 'border-mint/30 bg-mint/10 text-mint',
  warning: 'border-amber/30 bg-amber/10 text-amber',
  danger: 'border-rose/30 bg-rose/10 text-rose',
}

export function Badge({
  children,
  tone = 'neutral',
  mono,
  className = '',
}: {
  children: ReactNode
  tone?: BadgeTone
  mono?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
        mono ? 'font-mono' : 'font-medium'
      } ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ----------------------------------------------------------- PageHeader */

/** One consistent page title treatment, so every route opens the same way. */
export function PageHeader({
  title,
  lead,
  actions,
  meta,
}: {
  title: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-cyber-border pb-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-wide text-ink">{title}</h1>
        {lead && <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">{lead}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/* ----------------------------------------------------------- EmptyState */

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-cyber-border-strong bg-surface p-8 text-center">
      {icon && <div className="mb-3 flex justify-center text-ink-dim">{icon}</div>}
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------ SegmentedControl */

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
}: {
  value: T
  onChange: (value: T) => void
  options: readonly { value: T; label: ReactNode }[]
  label: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-lg border border-cyber-border bg-surface-2 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-md font-medium transition-colors',
              size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- Stat */

export function Stat({
  label,
  value,
  tone = 'text-ink',
  hint,
}: {
  label: ReactNode
  value: ReactNode
  tone?: string
  hint?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-cyber-border bg-surface px-3 py-2.5">
      <div className={`font-mono text-xl font-semibold tabular-nums ${tone}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-dim">{label}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  )
}

/* -------------------------------------------------------------- Divider */

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-ink-dim">{children}</div>
  )
}
