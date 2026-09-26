/** Diagrams for the "Conditionals" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** An else-if ladder: conditions are tested top-down and the first true one wins (the notes' example, val = 13). */
export function LadderFlow() {
  const rows = [
    { cond: 'val == 1', body: 'print "val is 1"' },
    { cond: 'val == 2', body: 'print "val is 2"' },
    { cond: 'val == 3', body: 'print "val is 3"' },
  ]
  const y0 = 16
  const step = 58
  return (
    <Figure caption="An if / else-if / else ladder with the notes' values. Conditions are tested from the top; the first true one runs its block and the rest are skipped. With val = 13 every test is false (amber path), so the final else runs, and then execution continues after the ladder.">
      <svg viewBox="0 0 470 302" width="100%" style={{ minWidth: 400 }} role="img" aria-labelledby="ladder-title">
        <title id="ladder-title">Ladder of three conditions, each with a yes branch to its block and a no branch to the next test, ending in else</title>
        {rows.map((r, i) => {
          const y = y0 + i * step
          return (
            <g key={r.cond}>
              <Box x={20} y={y} w={130} h={34} title={r.cond} sub="true?" color={PAL.amber} />
              <Arrow x1={150} y1={y + 17} x2={214} y2={y + 17} color={PAL.dim} label="yes" />
              <Box x={214} y={y} w={140} h={34} title={r.body} color={PAL.border} />
              <Arrow x1={85} y1={y + 34} x2={85} y2={y + step} color={PAL.amber} label="no" labelDy={4} />
              <path d={`M354,${y + 17} H420 V${y0 + 3 * step + 70}`} fill="none" stroke={PAL.border} strokeWidth={1.2} />
            </g>
          )
        })}
        <Box x={20} y={y0 + 3 * step} w={130} h={34} title="else" sub='print "val is: 13"' color={PAL.mint} />
        <Arrow x1={85} y1={y0 + 3 * step + 34} x2={85} y2={y0 + 3 * step + 70} color={PAL.mint} />
        <Arrow x1={420} y1={y0 + 3 * step + 70} x2={150} y2={y0 + 3 * step + 88} color={PAL.border} />
        <Box x={20} y={y0 + 3 * step + 70} w={130} h={34} title="after the ladder" sub="always runs" color={PAL.cyan} />
        <Txt x={180} y={y0 + 3 * step + 22} size={9.5} color={PAL.muted}>
          val = 13: no test is true, so else runs
        </Txt>
      </svg>
    </Figure>
  )
}
