import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import lessonIndex from '../generated/lesson-index.json'
import { curriculum } from '../lib/curriculum'
import { ALL_NAV_ITEMS } from '../lib/nav'

interface Entry {
  id: string
  label: string
  hint: string
  to: string
  group: 'Go to' | 'Lesson' | 'Section'
}

interface IndexedLesson {
  headings: { depth: number; text: string; slug: string }[]
}

/** Built once: pages, all lessons (written or outlined) and the sections of every written lesson. */
function buildEntries(): Entry[] {
  const nav: Entry[] = ALL_NAV_ITEMS.map((item) => ({ id: `nav:${item.to}`, label: item.label, hint: 'Page', to: item.to, group: 'Go to' }))
  const lessons: Entry[] = curriculum.lessons.map((l) => ({
    id: `lesson:${l.id}`,
    label: l.label,
    hint: `${l.status === 'done' ? 'guide' : 'outline'} · T${l.tier} · ${l.title}`,
    to: l.url,
    group: 'Lesson',
  }))
  const indexed = (lessonIndex as { lessons: Record<string, IndexedLesson> }).lessons
  const sections: Entry[] = Object.entries(indexed).flatMap(([id, info]) =>
    info.headings.map((h) => ({
      id: `section:${id}#${h.slug}`,
      label: h.text,
      hint: curriculum.byId.get(id)?.label ?? id,
      to: `/lessons/${id}/#${h.slug}`,
      group: 'Section' as const,
    })),
  )
  return [...nav, ...lessons, ...sections]
}

const ENTRIES = buildEntries()

/** Subsequence match, so "objmod" finds "Object model" — cheap and forgiving. */
function score(entry: Entry, query: string): number {
  const haystack = entry.label.toLowerCase()
  const q = query.toLowerCase()
  if (!q) return 0
  const exact = haystack.indexOf(q)
  if (exact === 0) return 1000
  if (exact > 0) return 800 - exact
  // fall back to subsequence
  let qi = 0
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) qi++
  }
  if (qi === q.length) return 400 - haystack.length / 10
  return entry.hint.toLowerCase().includes(q) ? 100 : -1
}

/**
 * The dialog is mounted only while open, so every open starts with fresh
 * state — no effect needed to reset the query or the selection.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <PaletteDialog onClose={onClose} />
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return ENTRIES.filter((e) => e.group === 'Go to')
    return ENTRIES.map((e) => ({ e, s: score(e, query.trim()) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.e)
  }, [query])

  // Focus after paint, or the dialog steals it back.
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  // A shorter result list can strand the cursor past the end; clamping during
  // render avoids a reset-on-change effect entirely.
  const activeIndex = Math.min(selected, Math.max(0, results.length - 1))

  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function go(entry: Entry) {
    navigate(entry.to)
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(Math.min(activeIndex + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(Math.max(activeIndex - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      go(results[activeIndex])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-void/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and navigate"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-cyber-border bg-surface shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-cyber-border px-3">
          <Search size={16} className="shrink-0 text-ink-dim" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, sections and pages…"
            aria-label="Search lessons, sections and pages"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
          />
          <kbd className="shrink-0 rounded border border-cyber-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">
            esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No matches for “{query}”.</p>
        ) : (
          <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
            {results.map((entry, i) => {
              const showGroup = i === 0 || results[i - 1].group !== entry.group
              return (
                <li key={entry.id}>
                  {showGroup && (
                    <div className="px-2 pb-1 pt-2 font-display text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
                      {entry.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-selected={i === activeIndex}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => go(entry)}
                    className={[
                      'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                      i === activeIndex ? 'bg-surface-2' : 'hover:bg-surface-2',
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{entry.label}</span>
                      <span className="block truncate font-mono text-xs text-ink-dim">{entry.hint}</span>
                    </span>
                    {i === activeIndex && (
                      <CornerDownLeft size={13} className="shrink-0 text-cyan" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
