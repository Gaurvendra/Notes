/** Diagrams for the "final & Constants" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

type Quad = { code: string; reassign: boolean; mutate: boolean; note: string }

function Panel({ x, y, q }: { x: number; y: number; q: Quad }) {
  const both = !q.reassign && !q.mutate
  return (
    <g>
      <rect x={x} y={y} width={282} height={84} rx={9} fill={PAL.surface} stroke={both ? PAL.mint : PAL.border} strokeWidth={both ? 1.6 : 1.2} />
      <Txt x={x + 12} y={y + 20} size={9} color={PAL.ink}>
        {q.code}
      </Txt>
      <rect x={x + 12} y={y + 32} width={58} height={22} rx={5} fill={PAL.void} stroke={q.reassign ? PAL.cyan : PAL.amber} strokeWidth={q.reassign ? 1.1 : 1.8} />
      <Txt x={x + 41} y={y + 47} anchor="middle" size={8.5} color={q.reassign ? PAL.muted : PAL.amber}>
        {q.reassign ? 'variable' : 'final var'}
      </Txt>
      <Arrow x1={x + 72} y1={y + 43} x2={x + 104} y2={y + 43} color={PAL.cyan} />
      <rect x={x + 106} y={y + 32} width={58} height={22} rx={5} fill={PAL.void} stroke={q.mutate ? PAL.cyan : PAL.mint} strokeWidth={q.mutate ? 1.1 : 1.8} />
      <Txt x={x + 135} y={y + 47} anchor="middle" size={8.5} color={q.mutate ? PAL.muted : PAL.mint}>
        {q.mutate ? 'mutable' : 'immutable'}
      </Txt>
      <Txt x={x + 172} y={y + 41} size={8.5} color={q.reassign ? PAL.rose : PAL.mint}>
        {q.reassign ? 'reassign: yes' : 'reassign: no'}
      </Txt>
      <Txt x={x + 172} y={y + 54} size={8.5} color={q.mutate ? PAL.rose : PAL.mint}>
        {q.mutate ? 'change contents: yes' : 'change contents: no'}
      </Txt>
      <Txt x={x + 12} y={y + 74} size={8.5} color={both ? PAL.mint : PAL.dim}>
        {q.note}
      </Txt>
    </g>
  )
}

/** final is about the variable; immutability is about the object. */
export function FinalMatrix() {
  const quads: Quad[] = [
    { code: 'List<String> a = new ArrayList<>();', reassign: true, mutate: true, note: 'anything can change' },
    { code: 'final List<String> b = new ArrayList<>();', reassign: false, mutate: true, note: 'the arrow is fixed, the list is not' },
    { code: 'List<String> c = List.of("x");', reassign: true, mutate: false, note: 'the list is fixed, the arrow can move' },
    { code: 'final List<String> d = List.of("x");', reassign: false, mutate: false, note: 'a real constant: nothing can change' },
  ]
  return (
    <Figure caption="final and immutability are independent. final fixes the variable: it can't be pointed at another object. Immutability is a property of the object: its contents can't change. Only when both hold (bottom right) do you get a value that can never change, which is what a constant should be.">
      <svg viewBox="0 0 600 214" width="100%" style={{ minWidth: 560 }} role="img" aria-labelledby="final-title">
        <title id="final-title">
          Four cases: a plain variable to a mutable list can be reassigned and changed; a final variable to a mutable list can
          be changed but not reassigned; a plain variable to an immutable list can be reassigned but not changed; a final
          variable to an immutable list can do neither.
        </title>
        <Txt x={153} y={14} anchor="middle" size={9.5} color={PAL.dim} weight={600}>
          object mutable
        </Txt>
        <Txt x={447} y={14} anchor="middle" size={9.5} color={PAL.dim} weight={600}>
          object immutable
        </Txt>
        <Panel x={12} y={22} q={quads[0]} />
        <Panel x={306} y={22} q={quads[2]} />
        <Panel x={12} y={118} q={quads[1]} />
        <Panel x={306} y={118} q={quads[3]} />
      </svg>
    </Figure>
  )
}
