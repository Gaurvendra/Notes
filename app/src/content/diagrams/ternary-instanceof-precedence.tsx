/** Diagrams for the "Ternary, instanceof & Precedence" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

type Node = { id: string; label: string; x: number; y: number; leaf?: number }

/** The tree `a + b * c > d && !e` parses into, with the left-to-right evaluation order of its operands. */
export function ExpressionTree() {
  const nodes: Node[] = [
    { id: 'and', label: '&&', x: 300, y: 26 },
    { id: 'gt', label: '>', x: 190, y: 84 },
    { id: 'not', label: '!', x: 420, y: 84 },
    { id: 'plus', label: '+', x: 120, y: 142 },
    { id: 'd', label: 'd', x: 262, y: 142, leaf: 4 },
    { id: 'e', label: 'e', x: 420, y: 142, leaf: 5 },
    { id: 'a', label: 'a', x: 60, y: 200, leaf: 1 },
    { id: 'times', label: '*', x: 180, y: 200 },
    { id: 'b', label: 'b', x: 140, y: 258, leaf: 2 },
    { id: 'c', label: 'c', x: 222, y: 258, leaf: 3 },
  ]
  const edges: [string, string][] = [
    ['and', 'gt'], ['and', 'not'], ['gt', 'plus'], ['gt', 'd'], ['not', 'e'],
    ['plus', 'a'], ['plus', 'times'], ['times', 'b'], ['times', 'c'],
  ]
  const at = (id: string) => nodes.find((n) => n.id === id) as Node
  return (
    <Figure caption="Precedence decides the shape of the tree: * binds tighter than +, + tighter than >, > tighter than &&, and ! applies to e alone. Evaluation still goes left to right through the operands (numbered), and each operator runs once its operands are ready, so the multiplication b * c happens before the addition. && may skip its whole right branch.">
      <svg viewBox="0 0 520 290" width="100%" style={{ minWidth: 400 }} role="img" aria-labelledby="tree-title">
        <title id="tree-title">Expression tree: and at the root; greater-than of (a plus (b times c)) and d on the left; not e on the right</title>
        {edges.map(([p, c]) => (
          <line key={p + c} x1={at(p).x} y1={at(p).y + 14} x2={at(c).x} y2={at(c).y - 14} stroke={PAL.border} strokeWidth={1.5} />
        ))}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={16} fill={PAL.surface} stroke={n.leaf ? PAL.mint : PAL.cyan} strokeWidth={1.5} />
            <Txt x={n.x} y={n.y + 4.5} anchor="middle" size={13} color={n.leaf ? PAL.mint : PAL.cyan} weight={600}>
              {n.label}
            </Txt>
            {n.leaf && (
              <g>
                <circle cx={n.x + 16} cy={n.y - 14} r={8} fill={PAL.amber} />
                <Txt x={n.x + 16} y={n.y - 10.5} anchor="middle" size={9.5} color={PAL.void} weight={700}>
                  {n.leaf}
                </Txt>
              </g>
            )}
          </g>
        ))}
        <Txt x={292} y={250} size={9.5} color={PAL.muted}>
          amber numbers: the order in which
        </Txt>
        <Txt x={292} y={264} size={9.5} color={PAL.muted}>
          operands are evaluated (JLS §15.7)
        </Txt>
      </svg>
    </Figure>
  )
}
