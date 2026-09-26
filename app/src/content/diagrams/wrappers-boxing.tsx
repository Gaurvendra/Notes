/** Diagrams for the "Wrappers & Autoboxing" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

function Cell({ x, y, w, text, color = PAL.cyan, fill = PAL.void, dim }: { x: number; y: number; w: number; text: string; color?: string; fill?: string; dim?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} fill={fill} stroke={color} strokeWidth={1.1} />
      <Txt x={x + w / 2} y={y + 15} anchor="middle" size={dim ? 8.5 : 9.5} color={dim ? PAL.dim : PAL.ink}>
        {text}
      </Txt>
    </g>
  )
}

/** The Integer cache, and the memory cost of boxed values compared with an int[]. */
export function BoxingCost() {
  const cache = ['-128', '…', '9', '10', '11', '…', '127']
  return (
    <Figure caption="Top: Integer.valueOf, which autoboxing calls, returns shared objects from a cache for -128 to 127, so boxing 10 twice gives the same object; 128 is boxed into a new object every time. Bottom: an int[] stores the numbers themselves, while an Integer[] (or the array inside an ArrayList<Integer>) stores references to separate Integer objects. Sizes are typical for 64-bit HotSpot with compressed references.">
      <svg viewBox="0 0 600 244" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="boxing-title">
        <title id="boxing-title">
          Integer.valueOf(10) called twice returns the same cached object; valueOf(128) creates new objects. An int array of
          4 holds the values directly in 32 bytes; an Integer array of 4 holds references to four 16-byte objects, 96 bytes
          in total.
        </title>
        <Txt x={12} y={16} size={10} color={PAL.ink} weight={600}>
          Integer.valueOf(i): the cache
        </Txt>
        <Txt x={12} y={30} size={8.5} color={PAL.dim}>
          256 shared Integer objects, -128 to 127, created once
        </Txt>
        {cache.map((c, i) => (
          <Cell key={i} x={12 + i * 44} y={40} w={44} text={c} color={PAL.mint} fill={PAL.surface} dim={c === '…'} />
        ))}
        <Arrow x1={156} y1={84} x2={162} y2={63} color={PAL.cyan} />
        <Arrow x1={178} y1={84} x2={172} y2={63} color={PAL.cyan} />
        <Txt x={12} y={98} size={8.5} color={PAL.mint}>
          valueOf(10) twice: the same object, so == is true
        </Txt>

        <Txt x={352} y={16} size={10} color={PAL.ink} weight={600}>
          valueOf(128) twice
        </Txt>
        <Txt x={352} y={30} size={8.5} color={PAL.dim}>
          outside the cache
        </Txt>
        <Cell x={352} y={40} w={44} text="128" color={PAL.amber} />
        <Cell x={404} y={40} w={44} text="128" color={PAL.amber} />
        <Txt x={352} y={80} size={8.5} color={PAL.amber}>
          two new objects,
        </Txt>
        <Txt x={352} y={92} size={8.5} color={PAL.amber}>
          so == is false (equals is true)
        </Txt>

        <line x1={8} y1={110} x2={592} y2={110} stroke={PAL.border} strokeDasharray="3 4" />
        <Txt x={12} y={130} size={10} color={PAL.ink} weight={600}>
          int[] vs Integer[] for 4 numbers
        </Txt>
        <Cell x={12} y={142} w={44} text="len 4" color={PAL.border} fill={PAL.surface3} dim />
        {['500', '731', '902', '1200'].map((v, i) => (
          <Cell key={v} x={56 + i * 40} y={142} w={40} text={v} />
        ))}
        <Txt x={12} y={182} size={8.5} color={PAL.muted}>
          int[4]: the values inline, about 32 bytes
        </Txt>

        <Cell x={316} y={142} w={44} text="len 4" color={PAL.border} fill={PAL.surface3} dim />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={360 + i * 40} y={142} width={40} height={22} fill={PAL.void} stroke={PAL.cyan} strokeWidth={1.1} />
            <circle cx={380 + i * 40} cy={153} r={3} fill={PAL.cyan} />
            <Arrow x1={380 + i * 40} y1={160} x2={380 + i * 40} y2={186} color={PAL.cyan} />
          </g>
        ))}
        {['500', '731', '902', '1200'].map((v, i) => (
          <g key={v}>
            <rect x={362 + i * 40} y={188} width={36} height={22} rx={5} fill={PAL.surface} stroke={PAL.amber} strokeWidth={1.1} />
            <Txt x={380 + i * 40} y={203} anchor="middle" size={9} color={PAL.amber}>
              {v}
            </Txt>
          </g>
        ))}
        <Txt x={316} y={226} size={8.5} color={PAL.muted}>
          Integer[4]: 4 references + 4 objects of
        </Txt>
        <Txt x={316} y={238} size={8.5} color={PAL.muted}>
          16 bytes each, about 96 bytes
        </Txt>
      </svg>
    </Figure>
  )
}
