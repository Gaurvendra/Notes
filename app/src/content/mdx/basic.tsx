/**
 * Content components used by lesson MDX files. Names and props match the lessons' authoring guide
 * (project-plan/LESSON_TEMPLATE.md), so a lesson is plain Markdown plus these tags.
 */
import { Check, Copy, File, Folder } from 'lucide-react'
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import { mdInline } from '../../lib/markdown'

/* ------------------------------------------------------------------ Callout */

const CALLOUTS = {
  tldr: { icon: '📌', label: 'TL;DR', cls: 'border-cyan/40 bg-cyan/5', head: 'text-cyan' },
  myth: { icon: '🧱', label: 'Common belief', cls: 'border-rose/40 bg-rose/5', head: 'text-rose' },
  fact: { icon: '✅', label: 'Precise truth', cls: 'border-mint/40 bg-mint/5', head: 'text-mint' },
  doubt: { icon: '🤔', label: 'Doubt cleared', cls: 'border-magenta/40 bg-magenta/5', head: 'text-magenta' },
  senior: { icon: '🧭', label: 'Senior lens', cls: 'border-amber/40 bg-amber/5', head: 'text-amber' },
  pitfall: { icon: '⚠️', label: 'Pitfall', cls: 'border-rose/40 bg-rose/5', head: 'text-rose' },
  tip: { icon: '💡', label: 'Tip', cls: 'border-mint/40 bg-mint/5', head: 'text-mint' },
  version: { icon: '🆕', label: 'Modern Java', cls: 'border-magenta/40 bg-magenta/5', head: 'text-magenta' },
  'deep-dive': { icon: '🔬', label: 'Under the hood', cls: 'border-cyan/40 bg-cyan/5', head: 'text-cyan' },
} as const

export function Callout({ type, title, children }: { type: keyof typeof CALLOUTS; title?: string; children: ReactNode }) {
  const t = CALLOUTS[type]
  if (!t) throw new Error(`Callout: unknown type "${type}"`)
  return (
    <aside className={`jx-callout my-5 rounded-xl border p-4 ${t.cls}`} aria-label={title ?? t.label}>
      <p className={`!mt-0 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest ${t.head}`}>
        <span aria-hidden="true">{t.icon}</span>
        {title ?? t.label}
      </p>
      <div className="jx-callout__body mt-2">{children}</div>
    </aside>
  )
}

/* --------------------------------------------------------------- MythVsFact */

export function MythVsFact({ myth, audit, children }: { myth: string; audit?: string; children: ReactNode }) {
  return (
    <div className="my-5 grid overflow-hidden rounded-xl border border-cyber-border md:grid-cols-[2fr_3fr]">
      <div className="border-b border-cyber-border bg-rose/5 p-4 md:border-b-0 md:border-r">
        <p className="!mt-0 font-display text-[11px] font-semibold uppercase tracking-widest text-rose">🧱 Common belief</p>
        <p className="!mt-2 text-ink-muted">{myth}</p>
      </div>
      <div className="bg-mint/5 p-4">
        <p className="!mt-0 font-display text-[11px] font-semibold uppercase tracking-widest text-mint">
          ✅ Precise truth
          {audit && (
            <a href="/notes-audit" className="ml-2 font-mono normal-case tracking-normal text-ink-dim hover:text-cyan" title="See the notes audit">
              audit {audit}
            </a>
          )}
        </p>
        <div className="jx-flow mt-2">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- VersionBadge */

export function VersionBadge({
  since,
  preview,
  incubator,
  deprecated,
  removed,
  jep,
}: {
  since?: number
  preview?: number
  incubator?: number
  deprecated?: number
  removed?: number
  jep?: number
}) {
  let text: string
  let cls: string
  if (removed) [text, cls] = [`Removed in Java ${removed}`, 'border-rose/40 bg-rose/10 text-rose']
  else if (deprecated) [text, cls] = [`Deprecated since Java ${deprecated}`, 'border-amber/40 bg-amber/10 text-amber']
  else if (preview) [text, cls] = [`Preview in Java ${preview}`, 'border-magenta/40 bg-magenta/10 text-magenta']
  else if (incubator) [text, cls] = [`Incubator in Java ${incubator}`, 'border-magenta/40 bg-magenta/10 text-magenta']
  else if (since) [text, cls] = [`Java ${since}+`, 'border-mint/40 bg-mint/10 text-mint']
  else throw new Error('VersionBadge needs one of since/preview/incubator/deprecated/removed')
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-px align-middle font-mono text-[11px] font-medium ${cls}`}>
      {text}
      {jep ? ` · JEP ${jep}` : ''}
    </span>
  )
}

/* ------------------------------------------------------------------ FaqItem */

export function FaqItem({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="jx-faq group my-2 rounded-xl border border-cyber-border bg-surface open:border-cyan/40">
      <summary className="cursor-pointer list-none px-4 py-3 font-medium text-ink marker:hidden">
        <span className="mr-2 inline-block text-cyan transition-transform group-open:rotate-90" aria-hidden="true">
          ›
        </span>
        <span dangerouslySetInnerHTML={{ __html: mdInline(q) }} />
      </summary>
      <div className="jx-flow border-t border-cyber-border px-4 py-3">{children}</div>
    </details>
  )
}

/* --------------------------------------------------------------- CheatSheet */

export function CheatSheet({ title = 'Cheat sheet', children }: { title?: string; children: ReactNode }) {
  return (
    <section className="jx-cheatsheet my-5 rounded-xl border border-cyan/30 bg-cyan/5 p-4" aria-label={title}>
      <p className="!mt-0 font-display text-xs font-semibold uppercase tracking-widest text-cyan">📌 {title}</p>
      {children}
    </section>
  )
}

/* --------------------------------------------------------------------- Tabs */

export function TabItem({ children }: { label: string; children: ReactNode }) {
  return <>{children}</>
}

export function Tabs({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{ label: string; children: ReactNode }>[]
  const [active, setActive] = useState(0)
  const id = useId()
  return (
    <div className="jx-tabs my-5 rounded-xl border border-cyber-border bg-surface">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-cyber-border p-1.5">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => setActive(i)}
            className={[
              'shrink-0 rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-colors',
              i === active ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
            ].join(' ')}
          >
            {item.props.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="jx-flow px-4 pb-4 pt-3"
        >
          {item.props.children}
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- FileTree */

/** A Markdown list rendered as a folder tree: each item is "name comment…"; a trailing "/" marks a folder. */
export function FileTree({ children }: { children: ReactNode }) {
  const decorate = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (!isValidElement(child)) return child
      const el = child as ReactElement<{ children?: ReactNode }>
      if (el.type === 'li') {
        const kids = Children.toArray(el.props.children)
        const hasSub = kids.some((k) => isValidElement(k) && k.type === 'ul')
        const first = kids[0]
        if (typeof first === 'string') {
          const m = /^\s*(\S+)(\s*)([\s\S]*)$/.exec(first)!
          const folder = m[1].endsWith('/') || hasSub
          const Icon = folder ? Folder : File
          return (
            <li>
              <span className="inline-flex items-center gap-1.5 font-mono text-ink">
                <Icon size={13} className={folder ? 'text-amber' : 'text-ink-dim'} aria-hidden="true" />
                {m[1]}
              </span>
              <span className="text-ink-muted"> {m[3]}</span>
              {decorate(kids.slice(1))}
            </li>
          )
        }
      }
      return el.props.children ? cloneElement(el, undefined, decorate(el.props.children)) : el
    })
  return <div className="jx-filetree my-5 overflow-x-auto rounded-xl border border-cyber-border bg-surface px-4 py-3 text-sm">{decorate(children)}</div>
}

/* ---------------------------------------------------------------- CodeBlock */

type PreProps = ComponentProps<'pre'> & {
  'data-title'?: string
  'data-lang'?: string
  'data-kind'?: 'output' | 'terminal'
  'data-captured'?: string
  'data-verified'?: string
}

const LANG_LABEL: Record<string, string> = { java: 'Java', text: 'Output', shellsession: 'Terminal', sh: 'Shell', bash: 'Shell', yaml: 'YAML', xml: 'XML', json: 'JSON' }

/** Every fenced code block: a header with the file name or kind, a copy button, and provenance notes. */
export function CodeBlock(props: PreProps) {
  const { 'data-title': title, 'data-lang': lang = 'text', 'data-kind': kind, 'data-captured': captured, 'data-verified': verified, ...rest } = props
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const isTerminal = kind === 'terminal' || lang === 'shellsession'
  const isOutput = kind === 'output'
  const label = title ?? (isOutput ? 'Output' : isTerminal ? 'Terminal' : (LANG_LABEL[lang] ?? lang))

  async function copy() {
    const text = ref.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <figure className={`jx-code my-4 overflow-hidden rounded-xl border ${isOutput ? 'border-mint/30' : 'border-cyber-border'} bg-void`}>
      <figcaption className="flex items-center gap-2 border-b border-cyber-border bg-surface-2 px-3 py-1.5">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          {isTerminal ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-rose/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint/60" />
            </>
          ) : (
            <span className={`h-2.5 w-2.5 rounded-sm ${isOutput ? 'bg-mint/60' : 'bg-cyan/60'}`} />
          )}
        </span>
        <span className={`min-w-0 flex-1 truncate font-mono text-xs ${isOutput ? 'text-mint' : 'text-ink-muted'}`}>{label}</span>
        <button type="button" onClick={copy} className="shrink-0 rounded p-1 text-ink-dim hover:bg-surface-3 hover:text-ink" aria-label="Copy code">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
        </button>
      </figcaption>
      <pre ref={ref} {...rest} />
      {(captured || verified) && (
        <p className="!m-0 border-t border-cyber-border px-3 py-1.5 font-mono text-[11px] text-ink-dim">
          {verified && <span className="text-mint">✓ {verified}</span>}
          {captured && <span>Captured on {captured}</span>}
        </p>
      )}
    </figure>
  )
}

/* -------------------------------------------------------------- misc tags */

export function Table(props: ComponentProps<'table'>) {
  return (
    <div className="jx-table my-5 overflow-x-auto rounded-xl border border-cyber-border">
      <table {...props} />
    </div>
  )
}

export function Anchor({ href = '', ...rest }: ComponentProps<'a'>) {
  const external = /^https?:\/\//.test(href)
  return <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />
}
