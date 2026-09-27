import { useEffect, useRef } from 'react'
import { tokenize } from '../../lib/javaTokens.mjs'

/**
 * Java source for widgets: line numbers, light syntax colouring and a highlighted current line (kept in view by
 * scrolling the panel, never the page). `paused` marks lines where other frames are waiting.
 */
export function CodeView({
  lines,
  current,
  paused = [],
  title,
  maxHeight = 360,
}: {
  lines: string[]
  current?: number
  paused?: number[]
  title?: string
  maxHeight?: number
}) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const panel = box.current
    const row = panel?.querySelector<HTMLElement>('[data-current="true"]')
    if (!panel || !row) return
    const top = row.offsetTop - panel.clientHeight / 2 + row.clientHeight / 2
    panel.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [current, lines])
  return (
    <div className="jx-codeview min-w-0 overflow-hidden rounded-lg border border-cyber-border bg-void">
      {title && <div className="border-b border-cyber-border px-3 py-1.5 font-mono text-[11px] text-ink-dim">{title}</div>}
      <div ref={box} className="relative overflow-auto py-2" style={{ maxHeight }}>
        <pre className="!m-0 !border-0 !bg-transparent !p-0 font-mono text-[12.5px] leading-[1.6]">
          {lines.map((line, i) => {
            const n = i + 1
            const isCurrent = n === current
            const isPaused = !isCurrent && paused.includes(n)
            return (
              <div
                key={i}
                data-current={isCurrent || undefined}
                className={`flex min-w-max pr-4 ${isCurrent ? 'bg-cyan/15' : isPaused ? 'bg-amber/10' : ''}`}
              >
                <span
                  className={`w-9 shrink-0 select-none border-r pr-2 text-right ${isCurrent ? 'border-cyan text-cyan' : isPaused ? 'border-amber/60 text-amber' : 'border-transparent text-ink-dim'}`}
                  aria-hidden="true"
                >
                  {n}
                </span>
                <span className="whitespace-pre pl-3">
                  {line === '' ? ' ' : tokenize(line).map((t, j) => (t.kind === 'plain' ? t.text : <span key={j} className={`jx-tok-${t.kind}`}>{t.text}</span>))}
                </span>
                {isCurrent && <span className="sr-only"> (current line)</span>}
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
