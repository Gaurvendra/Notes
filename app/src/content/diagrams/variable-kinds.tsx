/** Diagrams for the "Kinds of Variables" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

/** How long each kind of variable exists, on one timeline of a running program. */
export function VariableLifetimes() {
  const rows = [
    { name: 'static field', x1: 150, x2: 548, color: PAL.magenta, from: 'class initialised', to: 'class unloaded (usually: JVM exit)' },
    { name: 'instance field', x1: 205, x2: 470, color: PAL.cyan, from: 'new', to: 'object unreachable, then GC' },
    { name: 'parameter', x1: 262, x2: 420, color: PAL.mint, from: 'method called', to: 'method returns' },
    { name: 'local variable', x1: 292, x2: 400, color: PAL.amber, from: 'declared', to: 'end of its block' },
    { name: 'loop variable', x1: 318, x2: 372, color: PAL.amber, from: 'for (…)', to: 'loop ends' },
  ]
  return (
    <Figure caption="Lifetimes on one timeline: a static field exists once per class for as long as the class is loaded; an instance field lives inside its object until the object becomes unreachable; parameters and local variables exist only while their method (or block) runs.">
      <svg viewBox="0 0 560 222" width="100%" style={{ minWidth: 470 }} role="img" aria-labelledby="life-title">
        <title id="life-title">Timeline: static fields live longest, then instance fields, then parameters, local variables and loop variables</title>
        <line x1={150} y1={206} x2={548} y2={206} stroke={PAL.dim} strokeWidth={1} />
        <polygon points="552,206 544,202 544,210" fill={PAL.dim} />
        <Txt x={548} y={218} anchor="end" size={9} color={PAL.dim}>
          time while the program runs →
        </Txt>
        {rows.map((r, i) => {
          const y = 14 + i * 38
          return (
            <g key={r.name}>
              <Txt x={10} y={y + 10} size={10.5} mono={false} color={PAL.ink}>
                {r.name}
              </Txt>
              <rect x={r.x1} y={y} width={r.x2 - r.x1} height={12} rx={3} fill={r.color} opacity={0.85} />
              <Txt x={r.x1} y={y + 24} size={8.5} color={PAL.muted}>
                {`${r.from} → ${r.to}`}
              </Txt>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
