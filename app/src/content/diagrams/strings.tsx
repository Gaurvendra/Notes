/** Diagrams for the "Strings" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const CW = 16 // cell width
const CH = 18 // cell height

function Cells({ x, y, chars, total, faded }: { x: number; y: number; chars: string; total?: number; faded?: boolean }) {
  const n = total ?? chars.length
  return (
    <g opacity={faded ? 0.45 : 1}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect
            x={x + i * CW}
            y={y}
            width={CW}
            height={CH}
            fill={i < chars.length ? PAL.void : PAL.surface}
            stroke={faded ? PAL.border : i < chars.length ? PAL.cyan : PAL.border}
            strokeWidth={1}
            strokeDasharray={faded ? '3 3' : undefined}
          />
          {i < chars.length && (
            <Txt x={x + i * CW + CW / 2} y={y + 13} anchor="middle" size={9.5} color={faded ? PAL.dim : PAL.ink}>
              {chars[i]}
            </Txt>
          )}
        </g>
      ))}
    </g>
  )
}

/** Appending in a loop: += makes a new String each time; StringBuilder writes into one growing buffer. */
export function ConcatCost() {
  const words = ['a', 'ab', 'abc', 'abcd']
  return (
    <Figure caption="Strings are immutable, so s += c can't add to the existing text: every step builds a new String and copies all the characters so far into it, and the previous one becomes garbage. For n steps that's about n²/2 characters copied. A StringBuilder keeps one array with spare capacity and writes each character in place; when the array is full it grows to about twice its size, so n appends copy only about n characters in total, plus one final copy in toString().">
      <svg viewBox="0 0 600 196" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="concat-title">
        <title id="concat-title">
          Left: a loop with s += c creates the strings a, ab, abc and abcd, each a new object with all characters copied,
          the earlier ones garbage. Right: a StringBuilder with capacity 16 holds a, b, c, d in one array; toString copies
          once.
        </title>
        <line x1={300} y1={8} x2={300} y2={188} stroke={PAL.border} strokeDasharray="3 4" />

        <Txt x={12} y={18} size={10.5} color={PAL.ink} weight={600}>
          s += c (in a loop)
        </Txt>
        <Txt x={12} y={31} size={8.5} color={PAL.dim}>
          every step: a new String, all chars copied
        </Txt>
        {words.map((w, i) => (
          <g key={w}>
            <Cells x={12} y={42 + i * 26} chars={w} faded={i < words.length - 1} />
            <Txt x={12 + 4 * CW + 14} y={42 + i * 26 + 13} size={8.5} color={i < words.length - 1 ? PAL.dim : PAL.muted}>
              {`new String, ${w.length} copied${i < words.length - 1 ? ' → garbage' : ''}`}
            </Txt>
          </g>
        ))}
        <Txt x={12} y={166} size={8.5} color={PAL.amber}>
          copied so far: 1 + 2 + 3 + 4 = 10 chars
        </Txt>
        <Txt x={12} y={180} size={8.5} color={PAL.muted}>
          n steps: about n²/2 (10,000 steps: 50 million)
        </Txt>

        <Txt x={312} y={18} size={10.5} color={PAL.ink} weight={600}>
          StringBuilder
        </Txt>
        <Txt x={312} y={31} size={8.5} color={PAL.dim}>
          one array with spare room: append writes in place
        </Txt>
        <Txt x={312} y={52} size={8.5} color={PAL.muted}>
          value (capacity 16), count = 4
        </Txt>
        <Cells x={312} y={58} chars="abcd" total={16} />
        <Arrow x1={344} y1={80} x2={344} y2={110} color={PAL.mint} />
        <Txt x={352} y={99} size={8.5} color={PAL.mint}>
          toString(): one copy
        </Txt>
        <Cells x={312} y={112} chars="abcd" />
        <Txt x={312 + 4 * CW + 10} y={125} size={8.5} color={PAL.muted}>
          the String result
        </Txt>
        <Txt x={312} y={166} size={8.5} color={PAL.amber}>
          full? grow to about twice the size
        </Txt>
        <Txt x={312} y={180} size={8.5} color={PAL.muted}>
          n appends: about n chars copied in total
        </Txt>
      </svg>
    </Figure>
  )
}
