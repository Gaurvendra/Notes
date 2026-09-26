/** Diagrams for the "Loops & Branching" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** Where the condition sits in for, while and do-while, and where continue jumps to. */
export function LoopShapes() {
  const W = 120
  const col = (x: number, title: string, steps: { t: string; c: string; test?: boolean }[], back: [number, number], cont: string[]) => (
    <g>
      <Txt x={x} y={14} size={11} color={PAL.ink} weight={600}>
        {title}
      </Txt>
      {steps.map((s, i) => (
        <g key={s.t}>
          <Box x={x} y={26 + i * 52} w={W} h={32} title={s.t} sub={s.test ? 'false → exit' : undefined} color={s.c} />
          {i < steps.length - 1 && <Arrow x1={x + W / 2} y1={58 + i * 52} x2={x + W / 2} y2={78 + i * 52} color={PAL.dim} />}
        </g>
      ))}
      <path
        d={`M${x + W},${42 + back[0] * 52} H${x + W + 14} V${42 + back[1] * 52} H${x + W + 4}`}
        fill="none"
        stroke={PAL.amber}
        strokeWidth={1.4}
      />
      <polygon points={`${x + W},${42 + back[1] * 52} ${x + W + 6},${38 + back[1] * 52} ${x + W + 6},${46 + back[1] * 52}`} fill={PAL.amber} />
      {cont.map((line, i) => (
        <Txt key={line} x={x} y={236 + i * 13} size={9} color={PAL.muted}>
          {line}
        </Txt>
      ))}
    </g>
  )
  return (
    <Figure caption="The three loop shapes. for and while test their condition before each pass, so the body may run zero times; do-while tests after the body, so it always runs at least once. In a for loop, continue jumps to the update step; in while and do-while it jumps straight to the condition.">
      <svg viewBox="0 0 520 256" width="100%" style={{ minWidth: 470 }} role="img" aria-labelledby="loops-title">
        <title id="loops-title">for: init, condition, body, update, back to condition. while: condition, body, back. do-while: body, condition, back to body</title>
        {col(4, 'for (init; cond; update)', [
          { t: 'init (once)', c: PAL.border },
          { t: 'cond?', c: PAL.amber, test: true },
          { t: 'body', c: PAL.cyan },
          { t: 'update', c: PAL.mint },
        ], [3, 1], ['continue → update'])}
        {col(200, 'while (cond)', [
          { t: 'cond?', c: PAL.amber, test: true },
          { t: 'body', c: PAL.cyan },
        ], [1, 0], ['continue → cond'])}
        {col(376, 'do { } while (cond)', [
          { t: 'body', c: PAL.cyan },
          { t: 'cond?', c: PAL.amber, test: true },
        ], [1, 0], ['continue → cond', 'body runs ≥ 1×'])}
      </svg>
    </Figure>
  )
}
