// Renders short Markdown strings from lesson data (quiz, interview, flashcards) at build time.
import { marked } from 'marked';

marked.use({ gfm: true, breaks: false });

/** Block Markdown → HTML (paragraphs, lists, code blocks). */
export function md(text) {
	return marked.parse(text ?? '', { async: false });
}

/** Inline Markdown → HTML (no wrapping <p>). */
export function mdInline(text) {
	return marked.parseInline(text ?? '', { async: false });
}
