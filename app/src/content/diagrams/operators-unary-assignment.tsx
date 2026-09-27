/** Diagrams for the "Unary & Assignment Operators" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** Postfix vs prefix increment: the value of the expression and the variable afterwards. */
export function PrefixPostfix() {
  const lane = (y: number, code: string, steps: [string, string][], note: string) => (
    <g>
      <Txt x={10} y={y + 22} size={13} color={PAL.ink} weight={600}>
        {code}
      </Txt>
      {steps.map(([title, sub], i) => (
        <g key={title}>
          <Box x={120 + i * 130} y={y} w={112} h={40} title={title} sub={sub} color={i === 1 ? PAL.amber : PAL.cyan} />
          {i < steps.length - 1 && <Arrow x1={232 + i * 130} y1={y + 20} x2={250 + i * 130} y2={y + 20} />}
        </g>
      ))}
      <Txt x={120} y={y + 58} size={9.5} color={PAL.muted}>
        {note}
      </Txt>
    </g>
  )
  return (
    <Figure caption="With i = 5, both forms increment i to 6 immediately. They differ only in the value of the expression: i++ is the saved old value (5), ++i the new one (6). Used on its own, as in i++;, the two are identical.">
      <svg viewBox="0 0 520 172" width="100%" style={{ minWidth: 460 }} role="img" aria-labelledby="pp-title">
        <title id="pp-title">i++ saves the old value, increments, and yields the old value; ++i increments and yields the new value</title>
        {lane(8, 'x = i++;', [['save old i', 'old = 5'], ['i = i + 1', 'i is 6'], ['value: old', 'x = 5']], 'postfix: increments at once, but its value is the saved old value')}
        {lane(92, 'x = ++i;', [['read i', 'i is 5'], ['i = i + 1', 'i is 6'], ['value: new', 'x = 6']], 'prefix: increments, and its value is the new value')}
      </svg>
    </Figure>
  )
}
