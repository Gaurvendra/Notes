import { md, mdInline } from '../lib/markdown'

/** Markdown from lesson data. `inline` renders without a wrapping paragraph. */
export function Md({ text, inline, className = '' }: { text: string | undefined; inline?: boolean; className?: string }) {
  if (inline) return <span className={className} dangerouslySetInnerHTML={{ __html: mdInline(text) }} />
  return <div className={`prose-jmt ${className}`} dangerouslySetInnerHTML={{ __html: md(text) }} />
}
