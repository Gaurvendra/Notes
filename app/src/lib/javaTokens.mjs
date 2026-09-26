/**
 * A tiny Java tokenizer for code shown inside interactive widgets (lesson code blocks are highlighted at build time
 * by Shiki; widgets build their code at run time). One line at a time: comments, strings and chars, numbers,
 * keywords, types (capitalised names) and everything else. Joining the token texts gives the line back unchanged.
 */

const KEYWORDS = new Set(
  (
    'abstract assert boolean break byte case catch char class const continue default do double else enum extends final ' +
    'finally float for goto if implements import instanceof int interface long native new package private protected ' +
    'public return short static strictfp super switch synchronized this throw throws transient try void volatile while ' +
    'true false null var record yield sealed permits non-sealed'
  ).split(' '),
)

const PATTERN = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|('(?:[^'\\]|\\.)*'?)|(\b\d[\d_]*(?:\.\d+)?[lLfFdD]?\b|\b0[xX][\da-fA-F_]+[lL]?\b)|(non-sealed\b|[A-Za-z_$][\w$]*)|(\s+)|(.)/g

/** Splits one line into tokens: { text, kind } with kind one of comment, string, number, keyword, type, plain. */
export function tokenize(line) {
  const out = []
  for (const m of line.matchAll(PATTERN)) {
    const [text, comment, str, chr, num, word] = m
    let kind = 'plain'
    if (comment) kind = 'comment'
    else if (str || chr) kind = 'string'
    else if (num) kind = 'number'
    else if (word) kind = KEYWORDS.has(word) ? 'keyword' : /^[A-Z]/.test(word) ? 'type' : 'plain'
    out.push({ text, kind })
  }
  return out
}
