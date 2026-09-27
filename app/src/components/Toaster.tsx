import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useProgress, type Toast } from '../context/ProgressContext'

const LIFETIME_MS = 4500
const HEADINGS = { xp: 'Progress', level: 'Level up', badge: 'Badge unlocked' } as const

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, LIFETIME_MS)
    return () => clearTimeout(timer)
  }, [onClose])
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] animate-toast-in items-center gap-3 rounded-xl border border-amber/30 bg-surface p-3 shadow-xl"
    >
      <span className="flex h-11 w-11 shrink-0 animate-coin-pop items-center justify-center rounded-full bg-amber/15 text-2xl" aria-hidden="true">
        {toast.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-amber">{HEADINGS[toast.kind]}</p>
        <p className="truncate font-display text-sm font-semibold text-ink">{toast.title}</p>
        {toast.body && <p className="truncate text-xs text-ink-muted">{toast.body}</p>}
      </div>
      <button type="button" onClick={onClose} className="self-start rounded p-0.5 text-ink-dim hover:text-ink" aria-label="Dismiss">
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismissToast } = useProgress()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2" aria-live="polite">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}
