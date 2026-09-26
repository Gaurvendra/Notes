/** Diagrams for the "Pass-by-Value" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const FW = 88 // frame width

function Frame({ x, y, name, line, dot, hl }: { x: number; y: number; name: string; line: string; dot?: boolean; hl?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={FW} height={42} rx={7} fill={PAL.void} stroke={hl ? PAL.cyan : PAL.border} strokeWidth={hl ? 1.6 : 1.2} />
      <Txt x={x + 8} y={y + 15} size={9.5} color={PAL.ink} weight={600}>
        {name}
      </Txt>
      <Txt x={x + 8} y={y + 31} size={8.5} color={PAL.muted}>
        {line}
      </Txt>
      {dot && <circle cx={x + FW - 9} cy={y + 28} r={3} fill={PAL.cyan} />}
    </g>
  )
}

function Obj({ x, y, label, field, hl, faded }: { x: number; y: number; label: string; field: string; hl?: boolean; faded?: boolean }) {
  return (
    <g opacity={faded ? 0.5 : 1}>
      <rect x={x} y={y} width={70} height={38} rx={7} fill={PAL.surface} stroke={hl ? PAL.mint : PAL.border} strokeWidth={hl ? 1.6 : 1.2} />
      <Txt x={x + 8} y={y + 15} size={9} color={PAL.ink} weight={600}>
        {label}
      </Txt>
      <Txt x={x + 8} y={y + 29} size={8.5} color={PAL.muted}>
        {field}
      </Txt>
    </g>
  )
}

/** Three calls side by side: a copied int, a copied reference used to mutate, a copied reference reassigned. */
export function ArgumentCopies() {
  const panels = [
    { title: '1 · primitive', sub: 'the value is copied', n1: 'cash is still 10', n2: 'the method changed its copy' },
    { title: '2 · reference, mutated', sub: 'the reference is copied', n1: 'acc sees balance 5', n2: 'one object, two references' },
    { title: '3 · reference, reassigned', sub: 'only the copy moves', n1: 'acc still has balance 5', n2: 'the new one: garbage on return' },
  ]
  const bx = (k: number) => 8 + k * 198
  return (
    <Figure caption="Each argument's value is copied into a new parameter variable in the callee's frame. For a primitive that value is the number itself. For an object it's a reference: the method can follow it and change the caller's object (2), but assigning a new object to the parameter only re-points the method's own copy (3; the dashed arrow shows where it pointed before). Java has no way to pass the caller's variable itself.">
      <svg viewBox="0 0 600 196" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="pbv-title">
        <title id="pbv-title">
          Three panels. A primitive argument is copied, so the caller's value stays 10. A reference argument is copied, so
          both frames point to one Account and a change through the parameter is visible to the caller. Reassigning the
          parameter points only the method's copy to a new Account; the caller's variable still points to the old one.
        </title>
        {panels.map((p, k) => (
          <g key={p.title}>
            {k > 0 && <line x1={bx(k) - 7} y1={6} x2={bx(k) - 7} y2={190} stroke={PAL.border} strokeDasharray="3 4" />}
            <Txt x={bx(k)} y={15} size={10.5} color={PAL.ink} weight={600}>
              {p.title}
            </Txt>
            <Txt x={bx(k)} y={28} size={8.5} color={PAL.dim}>
              {p.sub}
            </Txt>
            <Txt x={bx(k)} y={170} size={8.5} color={PAL.mint}>
              {p.n1}
            </Txt>
            <Txt x={bx(k)} y={183} size={8.5} color={PAL.muted}>
              {p.n2}
            </Txt>
          </g>
        ))}

        {/* 1: primitive */}
        <Frame x={bx(0)} y={40} name="main" line="cash  10" />
        <Frame x={bx(0)} y={102} name="addInterest" line="balance 10 → 15" hl />
        <Arrow x1={bx(0) + 44} y1={82} x2={bx(0) + 44} y2={102} color={PAL.amber} />
        <Txt x={bx(0) + 52} y={96} size={8.5} color={PAL.amber}>
          copy of 10
        </Txt>
        <Txt x={bx(0) + FW + 16} y={60} size={8.5} color={PAL.dim}>
          nothing
        </Txt>
        <Txt x={bx(0) + FW + 16} y={72} size={8.5} color={PAL.dim}>
          on the heap
        </Txt>

        {/* 2: reference, mutated */}
        <Frame x={bx(1)} y={40} name="main" line="acc" dot />
        <Frame x={bx(1)} y={102} name="deposit" line="account" dot hl />
        <Obj x={bx(1) + 112} y={72} label="Account" field="balance 5" hl />
        <Arrow x1={bx(1) + FW - 6} y1={68} x2={bx(1) + 112} y2={86} color={PAL.cyan} />
        <Arrow x1={bx(1) + FW - 6} y1={130} x2={bx(1) + 112} y2={100} color={PAL.cyan} />

        {/* 3: reference, reassigned */}
        <Frame x={bx(2)} y={40} name="main" line="acc" dot />
        <Frame x={bx(2)} y={102} name="replace" line="account" dot hl />
        <Obj x={bx(2) + 112} y={44} label="Account" field="balance 5" />
        <Obj x={bx(2) + 112} y={108} label="Account" field="balance 99" hl />
        <Arrow x1={bx(2) + FW - 6} y1={68} x2={bx(2) + 112} y2={63} color={PAL.cyan} />
        <Arrow x1={bx(2) + FW - 6} y1={130} x2={bx(2) + 112} y2={127} color={PAL.cyan} />
        <Arrow x1={bx(2) + FW - 6} y1={126} x2={bx(2) + 112} y2={76} color={PAL.border} dashed />
      </svg>
    </Figure>
  )
}
