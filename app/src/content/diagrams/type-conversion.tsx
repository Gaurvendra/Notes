/** Diagrams for the "Type Conversion & Casting" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** The widening conversions of JLS §5.1.2 as a chain, with the three that can round marked. */
export function WideningMap() {
  const Y = 64
  const W = 76
  const H = 38
  const xs = { byte: 10, short: 104, int: 198, long: 292, float: 386, double: 480 }
  const bits = { byte: '8-bit', short: '16-bit', int: '32-bit', long: '64-bit', float: '32-bit IEEE', double: '64-bit IEEE' }
  const names = Object.keys(xs) as (keyof typeof xs)[]
  const cx = (n: keyof typeof xs) => xs[n] + W / 2
  // dashed arcs above the chain for the widenings that may round
  const arc = (from: keyof typeof xs, to: keyof typeof xs, lift: number) => {
    const x1 = cx(from)
    const x2 = cx(to)
    const tip = `${x2},${Y - 1} ${x2 - 4},${Y - 9} ${x2 + 4},${Y - 9}`
    return (
      <g key={`${from}-${to}`}>
        <path d={`M${x1},${Y} C${x1},${Y - lift} ${x2},${Y - lift} ${x2},${Y - 8}`} fill="none" stroke={PAL.amber} strokeWidth={1.3} strokeDasharray="4 3" />
        <polygon points={tip} fill={PAL.amber} />
      </g>
    )
  }
  return (
    <Figure caption="Widening conversions go left to right along the chain (and char joins at int): Java does them automatically. Three of them can round the value (dashed): int → float, long → float and long → double. Every conversion in the other direction, and between char and byte or short, is narrowing and needs a cast. boolean converts to nothing.">
      <svg viewBox="0 0 566 236" width="100%" style={{ minWidth: 470 }} role="img" aria-labelledby="widen-title">
        <title id="widen-title">Widening chain byte, short, int, long, float, double, with char joining at int; int to float, long to float and long to double may round</title>
        {arc('int', 'float', 52)}
        {arc('long', 'double', 44)}
        <Txt x={339} y={16} anchor="middle" size={9} color={PAL.amber}>
          may round: int → float, long → float, long → double
        </Txt>
        {names.map((n, i) => (
          <g key={n}>
            <Box x={xs[n]} y={Y} w={W} h={H} title={n} sub={bits[n]} color={n === 'float' || n === 'double' ? PAL.magenta : PAL.cyan} />
            {i < names.length - 1 && (
              <Arrow x1={xs[n] + W} y1={Y + H / 2} x2={xs[names[i + 1]]} y2={Y + H / 2} color={n === 'long' ? PAL.amber : PAL.mint} dashed={n === 'long'} />
            )}
          </g>
        ))}
        <Box x={104} y={146} w={W} h={H} title="char" sub="16-bit unsigned" color={PAL.cyan} />
        <Arrow x1={104 + W} y1={165} x2={cx('int') - 4} y2={Y + H} color={PAL.mint} />
        <Txt x={10} y={214} size={9.5} color={PAL.mint}>
          → widening: automatic, value preserved
        </Txt>
        <Txt x={10} y={229} size={9.5} color={PAL.rose}>
          ← the reverse direction (and byte/short ↔ char): narrowing, needs a cast
        </Txt>
        <Txt x={300} y={165} size={9.5} color={PAL.dim}>
          boolean: no conversions
        </Txt>
        <Txt x={300} y={179} size={9.5} color={PAL.dim}>
          to or from any other type
        </Txt>
      </svg>
    </Figure>
  )
}
