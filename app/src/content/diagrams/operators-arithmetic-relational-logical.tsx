/** Diagrams for the "Arithmetic, Relational & Logical Operators" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** How && and || decide whether to evaluate their right operand. */
export function ShortCircuit() {
  const column = (x: number, op: string, stopOn: 'false' | 'true', other: 'false' | 'true') => (
    <g>
      <Txt x={x + 115} y={16} anchor="middle" size={12} mono color={PAL.ink} weight={600}>
        {`left ${op} right`}
      </Txt>
      <Box x={x + 55} y={28} w={120} h={34} title="evaluate left" color={PAL.cyan} />
      <Arrow x1={x + 90} y1={62} x2={x + 40} y2={100} color={PAL.amber} label={stopOn} labelDy={-4} />
      <Arrow x1={x + 140} y1={62} x2={x + 190} y2={100} color={PAL.mint} label={other} labelDy={-4} />
      <Box x={x} y={100} w={96} h={46} title={`result: ${stopOn}`} sub="right is skipped" color={PAL.amber} />
      <Box x={x + 134} y={100} w={96} h={34} title="evaluate right" color={PAL.cyan} />
      <Arrow x1={x + 182} y1={134} x2={x + 182} y2={166} color={PAL.mint} />
      <Box x={x + 134} y={166} w={96} h={34} title="result: right" color={PAL.mint} />
    </g>
  )
  return (
    <Figure caption="Short-circuit evaluation, always left to right. && evaluates its right operand only when the left one is true; || only when the left one is false. That's why x != null && x.isEmpty() can never throw a NullPointerException. The non-short-circuit & and | always evaluate both sides.">
      <svg viewBox="0 0 500 212" width="100%" style={{ minWidth: 440 }} role="img" aria-labelledby="sc-title">
        <title id="sc-title">For left and right, the right operand is skipped when left is false; for left or right, it is skipped when left is true</title>
        {column(10, '&&', 'false', 'true')}
        {column(262, '||', 'true', 'false')}
      </svg>
    </Figure>
  )
}
