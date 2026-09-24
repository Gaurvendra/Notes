/** Renders the short Markdown strings of lesson data (quiz, interview, flashcards, hints). Content is our own. */
import { Marked } from 'marked'

const marked = new Marked({ gfm: true, breaks: false })

export function md(text: string | undefined): string {
  return marked.parse(text ?? '', { async: false })
}

export function mdInline(text: string | undefined): string {
  return marked.parseInline(text ?? '', { async: false })
}
