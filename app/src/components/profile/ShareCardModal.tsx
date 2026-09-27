import { Check, Copy, Download, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../ui'
import { buildSummaryText, canvasToBlob, renderShareCard, shareCardFileName, type ShareCardData } from '../../lib/exportCard'
import { displayName } from '../../lib/identity'

type Status = 'loading' | 'ready' | 'error'

/** Builds the share card on open (a canvas, drawn once) and offers it as a PNG download or a paste-ready caption. */
export function ShareCardModal({ data, onClose }: { data: ShareCardData; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [copied, setCopied] = useState(false)

  const build = useCallback(async () => {
    if (!canvasRef.current) return
    setStatus('loading')
    try {
      await renderShareCard(canvasRef.current, data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [data])

  useEffect(() => {
    build()
  }, [build])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function download() {
    if (!canvasRef.current || status !== 'ready') return
    const blob = await canvasToBlob(canvasRef.current)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = shareCardFileName(displayName(data.identity), data.generatedOn)
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildSummaryText(data))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-void/70 px-4 py-[6vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-card-title"
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-cyber-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
          <div>
            <h2 id="share-card-title" className="font-display text-base font-semibold text-ink">
              Share your progress
            </h2>
            <p className="text-xs text-ink-dim">A ready-to-post image, built from what's in this browser right now.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ink-dim hover:bg-surface-2 hover:text-ink">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="relative overflow-hidden rounded-lg border border-cyber-border bg-void">
            <canvas ref={canvasRef} className={`block h-auto w-full ${status === 'ready' ? '' : 'opacity-0'}`} aria-label="Generated progress card" />
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted" aria-live="polite">
                Building your card…
              </div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-ink-muted">
                <p>Something went wrong while drawing the card.</p>
                <Button size="sm" onClick={build}>
                  Try again
                </Button>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink-dim">
            Sized for LinkedIn posts and portfolios. Nothing is uploaded — the image is drawn in your browser from your saved
            progress and profile.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-cyber-border px-5 py-3">
          <Button
            variant="secondary"
            icon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            onClick={copySummary}
          >
            {copied ? 'Copied' : 'Copy caption text'}
          </Button>
          <Button variant="primary" icon={<Download size={14} aria-hidden="true" />} onClick={download} disabled={status !== 'ready'}>
            Download PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
