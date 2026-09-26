export type TokenKind = 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'plain'
export function tokenize(line: string): { text: string; kind: TokenKind }[]
