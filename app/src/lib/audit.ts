/**
 * The notes audit (source-notes/AUDIT.md): every claim from the user's notes with its verdict and the precise
 * statement. Loaded lazily (about 100 KB), only by the pages that show audit items.
 */
export type Verdict = '✅' | '🔶' | '⚠️' | '✏️' | '➕'

export interface AuditItem {
  id: string
  note: string
  claim: string
  verdictText: string
  verdicts: Verdict[]
  precise: string
}

let cache: Promise<Map<string, AuditItem>> | undefined

export const VERDICTS: Record<Verdict, string> = {
  '✅': 'Correct as written',
  '🔶': 'Right in spirit, made precise',
  '⚠️': 'Incorrect or outdated, corrected',
  '✏️': 'Typo or code that would not compile',
  '➕': 'Missing related topic, added',
}

export function parseAudit(md: string): Map<string, AuditItem> {
  const items = new Map<string, AuditItem>()
  let note = ''
  for (const line of md.split('\n')) {
    const h = /^## (Note .+)$/.exec(line)
    if (h) note = h[1]
    const m = /^\| ([A-Za-z0-9]+\.\d+) \| (.*?) \| (.*?) \| (.*) \|\s*$/.exec(line)
    if (!m) continue
    const [, id, claim, verdictText, precise] = m
    const all = `${verdictText} ${precise}`
    const verdicts = (['⚠️', '🔶', '✏️', '➕', '✅'] as Verdict[]).filter((v) => all.includes(v))
    items.set(id, { id, note, claim, verdictText, verdicts, precise })
  }
  return items
}

export function loadAudit(): Promise<Map<string, AuditItem>> {
  cache ??= import('../../../source-notes/AUDIT.md?raw').then((m) => parseAudit(m.default))
  return cache
}
