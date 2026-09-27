import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'subtle'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors ' +
  'disabled:pointer-events-none disabled:opacity-45'

const VARIANTS: Record<ButtonVariant, string> = {
  // Filled accent. One per view at most — it is the "the thing to do here".
  primary: 'bg-cyan text-void hover:bg-cyan/85 active:bg-cyan/75 border border-transparent',
  // The default for almost everything: reads as a control, not as a call to action.
  secondary: 'border border-cyber-border bg-surface-2 text-ink hover:border-cyan/40 hover:text-cyan active:bg-surface-3',
  // Chromeless until hovered — toolbars, row actions, anything repeated.
  ghost: 'border border-transparent text-ink-muted hover:bg-surface-2 hover:text-ink active:bg-surface-3',
  danger: 'border border-rose/40 bg-rose/10 text-rose hover:bg-rose/20 active:bg-rose/25',
  success: 'border border-mint/40 bg-mint/10 text-mint hover:bg-mint/20 active:bg-mint/25',
  // Lowest emphasis that still reads as clickable.
  subtle: 'border border-transparent bg-surface-2 text-ink-muted hover:text-ink active:bg-surface-3',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-9 w-9 p-0 text-sm',
}

export function buttonStyles(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra = '') {
  return [BASE, VARIANTS[variant], SIZES[size], extra].filter(Boolean).join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Rendered before the label. */
  icon?: ReactNode
  /** Stretches to the container width — used in narrow sidebars and cards. */
  block?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  block,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles(variant, size, `${block ? 'w-full' : ''} ${className}`)} {...rest}>
      {icon}
      {children}
    </button>
  )
}
