/** Diagrams for the "Inheritance" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

type Node = { x: number; y: number; label: string; iface?: boolean }
type Edge = [number, number]

const W = 38
const H = 20

/** One kind of inheritance: a titled panel with a tiny graph; arrows point from subtype to supertype. */
function Kind({ x, y, title, note, color, nodes, edges }: { x: number; y: number; title: string; note: string; color: string; nodes: Node[]; edges: Edge[] }) {
  return (
    <g>
      <rect x={x} y={y} width={186} height={150} rx={8} fill={PAL.surface} stroke={color} strokeWidth={1.2} />
      <Txt x={x + 10} y={y + 17} size={10.5} color={color} weight={700}>
        {title}
      </Txt>
      {edges.map(([from, to], i) => {
        const a = nodes[from]
        const b = nodes[to]
        return <Arrow key={i} x1={x + a.x} y1={y + a.y - H / 2} x2={x + b.x} y2={y + b.y + H / 2 + 1} color={PAL.dim} dashed={b.iface} />
      })}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={x + n.x - W / 2}
            y={y + n.y - H / 2}
            width={W}
            height={H}
            rx={n.iface ? 10 : 4}
            fill={PAL.void}
            stroke={n.iface ? PAL.magenta : PAL.cyan}
            strokeWidth={1.1}
            strokeDasharray={n.iface ? '3 2' : undefined}
          />
          <Txt x={x + n.x} y={y + n.y + 4} size={10} color={n.iface ? PAL.magenta : PAL.ink} anchor="middle">
            {n.label}
          </Txt>
        </g>
      ))}
      <Txt x={x + 10} y={y + 142} size={9} color={PAL.muted}>
        {note}
      </Txt>
    </g>
  )
}

/** Single, multilevel, hierarchical, multiple and hybrid inheritance, and which of them Java allows for classes. */
export function InheritanceKinds() {
  return (
    <Figure caption="The kinds of inheritance in the notes, plus hybrid. Arrows point from a subtype to its supertype; solid boxes are classes, rounded dashed ones interfaces. A class extends exactly one class (Object if none is named), so single, multilevel and hierarchical chains are fine; multiple inheritance is allowed only through interfaces, which carry no instance state, and hybrid combines one superclass with any number of interfaces.">
      <svg viewBox="0 0 400 488" width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="inheritance-kinds-title">
        <title id="inheritance-kinds-title">
          Single: B extends A. Multilevel: C extends B, which extends A. Hierarchical: B and C both extend A. Multiple: C
          would extend classes A and B, which Java forbids, but C may implement interfaces I and J. Hybrid: C extends class
          A and implements interfaces I and J.
        </title>
        <Kind
          x={8}
          y={8}
          title="Single"
          note="class B extends A"
          color={PAL.mint}
          nodes={[
            { x: 93, y: 46, label: 'A' },
            { x: 93, y: 110, label: 'B' },
          ]}
          edges={[[1, 0]]}
        />
        <Kind
          x={206}
          y={8}
          title="Multilevel"
          note="C extends B extends A"
          color={PAL.mint}
          nodes={[
            { x: 93, y: 38, label: 'A' },
            { x: 93, y: 78, label: 'B' },
            { x: 93, y: 118, label: 'C' },
          ]}
          edges={[
            [1, 0],
            [2, 1],
          ]}
        />
        <Kind
          x={8}
          y={168}
          title="Hierarchical"
          note="B and C both extend A"
          color={PAL.mint}
          nodes={[
            { x: 93, y: 46, label: 'A' },
            { x: 48, y: 110, label: 'B' },
            { x: 138, y: 110, label: 'C' },
          ]}
          edges={[
            [1, 0],
            [2, 0],
          ]}
        />
        <Kind
          x={206}
          y={168}
          title="Multiple"
          note="classes: no; interfaces: yes"
          color={PAL.amber}
          nodes={[
            { x: 48, y: 46, label: 'I', iface: true },
            { x: 138, y: 46, label: 'J', iface: true },
            { x: 93, y: 110, label: 'C' },
          ]}
          edges={[
            [2, 0],
            [2, 1],
          ]}
        />
        <Kind
          x={8}
          y={328}
          title="Hybrid"
          note="C extends A implements I, J"
          color={PAL.cyan}
          nodes={[
            { x: 36, y: 46, label: 'A' },
            { x: 93, y: 46, label: 'I', iface: true },
            { x: 150, y: 46, label: 'J', iface: true },
            { x: 93, y: 110, label: 'C' },
          ]}
          edges={[
            [3, 0],
            [3, 1],
            [3, 2],
          ]}
        />
        <rect x={206} y={328} width={186} height={150} rx={8} fill={PAL.void} stroke={PAL.rose} strokeWidth={1.2} strokeDasharray="4 3" />
        <Txt x={216} y={345} size={10.5} color={PAL.rose} weight={700}>
          Not allowed
        </Txt>
        <Txt x={216} y={366} size={9.5} color={PAL.ink}>
          class C extends A, B
        </Txt>
        <Txt x={216} y={382} size={9} color={PAL.muted}>
          two superclasses could both
        </Txt>
        <Txt x={216} y={395} size={9} color={PAL.muted}>
          give C a field or method body
        </Txt>
        <Txt x={216} y={408} size={9} color={PAL.muted}>
          with the same name: the
        </Txt>
        <Txt x={216} y={421} size={9} color={PAL.muted}>
          diamond problem for state
        </Txt>
        <Txt x={216} y={441} size={9} color={PAL.muted}>
          interfaces have no fields;
        </Txt>
        <Txt x={216} y={454} size={9} color={PAL.muted}>
          a clash of defaults must be
        </Txt>
        <Txt x={216} y={467} size={9} color={PAL.muted}>
          resolved by overriding
        </Txt>
      </svg>
    </Figure>
  )
}
