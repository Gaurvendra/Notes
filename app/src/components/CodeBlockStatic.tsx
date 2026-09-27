/** A plain code block for app pages (lessons use highlighted fenced blocks instead). */
export function CodeBlockStatic({ code, lang = 'Terminal' }: { code: string; lang?: string }) {
  return (
    <figure className="my-3 overflow-hidden rounded-xl border border-cyber-border bg-void">
      <figcaption className="border-b border-cyber-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-ink-muted">{lang}</figcaption>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </figure>
  )
}
