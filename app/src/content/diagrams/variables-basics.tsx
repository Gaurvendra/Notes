/** Diagrams for the "Variables & Typing" lesson. */
import { Figure } from '../mdx/diagrams'
import { Box, PAL, Txt } from '../svg'

/** The types of Java, in the JLS's own terms. */
export function TypeTree() {
  const line = (x1: number, y1: number, x2: number, y2: number) => (
    <path d={`M${x1},${y1} V${(y1 + y2) / 2} H${x2} V${y2}`} fill="none" stroke={PAL.dim} strokeWidth={1.2} />
  )
  return (
    <Figure caption="Every Java type is either primitive (8 fixed types, holding the value itself) or a reference type (holding a reference to an object). char is numerically an integral type: an unsigned 16-bit number. String is not a separate kind of type: it is a class.">
      <svg viewBox="0 0 660 300" width="100%" style={{ minWidth: 560 }} role="img" aria-labelledby="types-title">
        <title id="types-title">Java types: primitive types (numeric and boolean) and reference types (class, interface, array, type variable)</title>
        <Box x={260} y={8} w={140} h={36} title="Java types" color={PAL.ink} />
        {line(330, 44, 165, 72)}
        {line(330, 44, 500, 72)}
        <Box x={85} y={72} w={160} h={40} title="Primitive types" sub="hold the value itself" color={PAL.cyan} />
        <Box x={410} y={72} w={180} h={40} title="Reference types" sub="hold a reference to an object" color={PAL.magenta} />
        {line(165, 112, 95, 140)}
        {line(165, 112, 245, 140)}
        <Box x={25} y={140} w={140} h={36} title="Numeric types" color={PAL.cyan} />
        <Box x={195} y={140} w={100} h={36} title="boolean" sub="true / false" color={PAL.amber} />
        {line(95, 176, 55, 204)}
        {line(95, 176, 150, 204)}
        <Box x={5} y={204} w={100} h={36} title="Integral" color={PAL.cyan} />
        <Box x={112} y={204} w={100} h={36} title="Floating-point" color={PAL.cyan} />
        <Txt x={55} y={258} anchor="middle" size={9.5}>
          byte short int
        </Txt>
        <Txt x={55} y={272} anchor="middle" size={9.5}>
          long char
        </Txt>
        <Txt x={162} y={258} anchor="middle" size={9.5}>
          float double
        </Txt>
        {[
          { x: 330, t: 'Classes', s: 'String, Integer, Dog…' },
          { x: 440, t: 'Interfaces', s: 'List, Runnable…' },
          { x: 550, t: 'Arrays', s: 'int[], String[][]' },
        ].map((c) => (
          <g key={c.t}>
            {line(500, 112, c.x + 50, 140)}
            <Box x={c.x} y={140} w={100} h={40} title={c.t} sub={c.s} color={PAL.magenta} />
          </g>
        ))}
        <Txt x={330} y={206} size={9.5}>
          enums and records are kinds of classes;
        </Txt>
        <Txt x={330} y={220} size={9.5}>
          type variables (the T in List&lt;T&gt;) are reference types too
        </Txt>
        <Txt x={330} y={250} size={9.5} color={PAL.dim}>
          default value of a field: null
        </Txt>
        <Txt x={25} y={292} size={9.5} color={PAL.dim}>
          default value of a field: 0, 0.0, '\u0000' or false
        </Txt>
      </svg>
    </Figure>
  )
}
