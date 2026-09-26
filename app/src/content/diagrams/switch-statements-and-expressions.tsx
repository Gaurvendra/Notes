/** Diagrams for the "switch Statements & Expressions" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

/** How switch grew from an int jump table into a pattern-matching expression. */
export function SwitchTimeline() {
  const events = [
    { v: '1.0', t: 'int, char, short, byte', s: 'colon labels, fall-through, break', c: PAL.dim },
    { v: '5', t: 'enums and wrappers', s: 'Integer, Character… (unboxed)', c: PAL.cyan },
    { v: '7', t: 'String', s: 'hashCode, then equals', c: PAL.cyan },
    { v: '14', t: 'switch expressions', s: 'case A, B ->  ·  yield  ·  exhaustive', c: PAL.mint },
    { v: '21', t: 'pattern matching', s: 'any reference type · when · case null · records', c: PAL.magenta },
    { v: '27', t: 'primitive patterns (preview)', s: 'long, float, double, boolean', c: PAL.amber },
  ]
  const x0 = 70
  const step = 38
  return (
    <Figure caption="The switch statement of Java 1.0 worked on small integer types only. Enums and wrappers came with Java 5, strings with Java 7, switch expressions and arrow labels with Java 14 (JEP 361), and pattern matching for any reference type with Java 21 (JEP 441). Switching on long, float, double and boolean is still a preview feature (JEP 532, fifth preview in JDK 27).">
      <svg viewBox="0 0 520 250" width="100%" style={{ minWidth: 420 }} role="img" aria-labelledby="sw-title">
        <title id="sw-title">Timeline of switch: Java 1.0 small integers, 5 enums, 7 strings, 14 expressions, 21 patterns, 27 preview primitives</title>
        <line x1={x0} y1={16} x2={x0} y2={16 + step * (events.length - 1)} stroke={PAL.border} strokeWidth={2} />
        {events.map((e, i) => {
          const y = 16 + i * step
          return (
            <g key={e.v}>
              <circle cx={x0} cy={y} r={7} fill={PAL.surface} stroke={e.c} strokeWidth={2} />
              <Txt x={x0 - 16} y={y + 4} anchor="end" size={11} color={e.c} weight={600}>
                {`Java ${e.v}`}
              </Txt>
              <Txt x={x0 + 18} y={y + 1} size={11.5} mono={false} color={PAL.ink} weight={600}>
                {e.t}
              </Txt>
              <Txt x={x0 + 18} y={y + 15} size={9} color={PAL.muted}>
                {e.s}
              </Txt>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
