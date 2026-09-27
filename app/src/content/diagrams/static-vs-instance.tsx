/** Diagrams for the "static vs Instance" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

/** One class with its static members; several objects, each with its own instance fields. */
export function ClassAndObjects() {
  const objects = [
    { y: 26, id: 1 },
    { y: 102, id: 2 },
    { y: 178, id: 3 },
  ]
  return (
    <Figure caption="Static members belong to the class: one copy, shared by every object and reachable through the class name, even when no object exists. Instance members belong to each object: every Counter has its own id. A static method runs without an object (no this); an instance method always runs on one.">
      <svg viewBox="0 0 560 250" width="100%" style={{ minWidth: 470 }} role="img" aria-labelledby="classobj-title">
        <title id="classobj-title">Class Counter holding static created = 3 and static next(); three objects each holding their own id 1, 2 and 3</title>
        <rect x={20} y={62} width={210} height={124} rx={10} fill={PAL.surface} stroke={PAL.amber} strokeWidth={1.5} />
        <Txt x={34} y={84} size={12} color={PAL.ink} weight={600}>
          class Counter
        </Txt>
        <Txt x={34} y={100} size={9} color={PAL.dim}>
          static members: one copy
        </Txt>
        <Txt x={34} y={124} size={11} color={PAL.amber}>
          static int created = 3
        </Txt>
        <Txt x={34} y={146} size={11} color={PAL.amber}>
          static Counter next()
        </Txt>
        <Txt x={34} y={170} size={9} color={PAL.dim}>
          Counter.created · Counter.next()
        </Txt>
        {objects.map((o) => (
          <g key={o.id}>
            <rect x={340} y={o.y} width={200} height={50} rx={10} fill={PAL.surface} stroke={PAL.cyan} strokeWidth={1.3} />
            <Txt x={354} y={o.y + 20} size={11} color={PAL.ink} weight={600}>
              {`Counter object #${o.id}`}
            </Txt>
            <Txt x={354} y={o.y + 38} size={11} color={PAL.mint}>
              {`int id = ${o.id}`}
            </Txt>
            <Arrow x1={340} y1={o.y + 25} x2={232} y2={124} color={PAL.dim} />
          </g>
        ))}
        <Txt x={20} y={212} size={9} color={PAL.dim}>
          arrows: each object knows its class
        </Txt>
        <Txt x={340} y={244} size={9} color={PAL.dim}>
          instance members: one copy per object
        </Txt>
      </svg>
    </Figure>
  )
}
