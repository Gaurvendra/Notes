/** Diagrams for the "Constructors" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

type Line = { text: string; color?: string }

const SIZE = 10.5
const LINE = 17
/** JetBrains Mono advances 0.6 em per character, so leading spaces become an x offset (SVG text collapses them). */
const CHAR = SIZE * 0.6

function codeHeight(code: string[]) {
  return code.length * LINE + 12
}

function panelHeight(code: string[], results: Line[]) {
  return 56 + codeHeight(code) + (results.length - 1) * LINE
}

function Panel({ y, title, code, results, color }: { y: number; title: string; code: string[]; results: Line[]; color: string }) {
  const codeH = codeHeight(code)
  return (
    <g>
      <rect x={8} y={y} width={384} height={panelHeight(code, results)} rx={9} fill={PAL.surface} stroke={color} strokeWidth={1.4} />
      <Txt x={20} y={y + 19} size={11.5} color={color} weight={700}>
        {title}
      </Txt>
      <rect x={20} y={y + 28} width={360} height={codeH} rx={6} fill={PAL.void} stroke={PAL.border} strokeWidth={1} />
      {code.map((c, i) => {
        const indent = c.length - c.trimStart().length
        return (
          <Txt key={i} x={30 + indent * CHAR} y={y + 45 + i * LINE} size={SIZE} color={c.trim().startsWith('//') ? PAL.dim : PAL.ink}>
            {c.trimStart()}
          </Txt>
        )
      })}
      {results.map((r, i) => (
        <Txt key={i} x={20} y={y + 46 + codeH + i * LINE} size={SIZE} color={r.color ?? PAL.muted}>
          {r.text}
        </Txt>
      ))}
    </g>
  )
}

const PANELS: { title: string; color: string; code: string[]; results: Line[] }[] = [
  {
    title: '1. No constructor written',
    color: PAL.mint,
    code: ['class Customer {', '    // javac adds: Customer() { super(); }', '}'],
    results: [{ text: 'new Customer()   compiles: the default constructor exists', color: PAL.mint }],
  },
  {
    title: '2. One constructor written',
    color: PAL.amber,
    code: ['class Customer {', '    Customer(String id) { ... }', '}'],
    results: [
      { text: 'no default constructor any more', color: PAL.amber },
      { text: 'new Customer()   error: cannot be applied to given types', color: PAL.rose },
    ],
  },
  {
    title: '3. A subclass of version 2',
    color: PAL.rose,
    code: ['class Vip extends Customer {', '    // javac adds: Vip() { super(); }', '}'],
    results: [
      { text: 'super() finds no Customer(): compile error', color: PAL.rose },
      { text: 'fix: Vip(String id) { super(id); }', color: PAL.mint },
    ],
  },
]

/** The default constructor: added only when a class declares none, and what disappears when you write one. */
export function DefaultConstructorRule() {
  const ys: number[] = []
  let y = 8
  for (const p of PANELS) {
    ys.push(y)
    y += panelHeight(p.code, p.results) + 12
  }
  return (
    <Figure caption="The default constructor is a convenience the compiler adds only to a class that declares no constructor at all: no parameters, the class's access, and a body that just calls super(). Fields already have their default values by then; it doesn't set them. Declare any constructor and the default one is gone: new Customer() stops compiling, and so does every subclass that relied on the implicit super() call.">
      <svg viewBox={`0 0 400 ${y - 4}`} width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="default-ctor-title">
        <title id="default-ctor-title">
          A class with no constructor gets Customer() with super() from the compiler, so new Customer() compiles. A class that
          declares Customer(String id) has no default constructor, so new Customer() is an error. A subclass with no
          constructor gets Vip() calling super(), which finds no Customer() to call: a compile error, fixed by passing an
          argument with super(id).
        </title>
        {PANELS.map((p, i) => (
          <Panel key={p.title} y={ys[i]} {...p} />
        ))}
      </svg>
    </Figure>
  )
}
