/** Diagrams for the "Arrays" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const W = 34 // element cell width
const H = 24 // cell height
const HW = 46 // header (length) cell width

/** One array object: a length header followed by its element cells. */
function ArrayBox({ x, y, cells, dots = [] }: { x: number; y: number; cells: string[]; dots?: number[] }) {
  return (
    <g>
      <rect x={x} y={y} width={HW} height={H} fill={PAL.surface3} stroke={PAL.border} />
      <Txt x={x + HW / 2} y={y + 16} anchor="middle" size={8.5} color={PAL.dim}>
        {`len ${cells.length}`}
      </Txt>
      {cells.map((c, i) => (
        <g key={i}>
          <rect x={x + HW + i * W} y={y} width={W} height={H} fill={PAL.void} stroke={PAL.cyan} strokeWidth={1.1} />
          {dots.includes(i) ? (
            <circle cx={x + HW + i * W + W / 2} cy={y + H / 2} r={3.2} fill={PAL.cyan} />
          ) : (
            <Txt x={x + HW + i * W + W / 2} y={y + 16} anchor="middle" size={c === 'null' ? 8.5 : 10} color={c === 'null' ? PAL.dim : PAL.ink}>
              {c}
            </Txt>
          )}
        </g>
      ))}
    </g>
  )
}

function Indexes({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Txt key={i} x={x + HW + i * W + W / 2} y={y} anchor="middle" size={8.5} color={PAL.dim}>
          {String(i)}
        </Txt>
      ))}
    </g>
  )
}

function StrObj({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={54} height={22} rx={6} fill={PAL.surface} stroke={PAL.amber} strokeWidth={1.1} />
      <Txt x={x + 27} y={y + 15} anchor="middle" size={9.5} color={PAL.amber}>
        {text}
      </Txt>
    </g>
  )
}

/** A primitive array, an array of references and a jagged 2-D array. */
export function ArrayLayouts() {
  const rows = [['1', '2', '3'], ['4'], ['5', '6']]
  return (
    <Figure caption="Every array is one object on the heap with a fixed length. The elements of a primitive array are the values themselves, stored one after another (the notes' int[5] example). The elements of an array of objects are references, possibly null, to objects elsewhere on the heap. A two-dimensional array is an array whose elements refer to separate row arrays, which can have different lengths.">
      <svg viewBox="0 0 600 238" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="arrays-title">
        <title id="arrays-title">
          An int array of length 5 holding 10, 6, 10, 40, 20; a String array of length 3 whose first two elements refer to
          the strings Ann and Bo and whose third is null; a two-dimensional int array whose three elements refer to rows of
          lengths 3, 1 and 2
        </title>
        <Txt x={12} y={16} size={10} color={PAL.ink} weight={600}>
          int[] arr = new int[5]
        </Txt>
        <ArrayBox x={12} y={28} cells={['10', '6', '10', '40', '20']} />
        <Indexes x={12} y={66} n={5} />
        <Txt x={12} y={86} size={8.5} color={PAL.muted}>
          the values themselves, side by side
        </Txt>

        <line x1={300} y1={6} x2={300} y2={100} stroke={PAL.border} strokeDasharray="3 4" />
        <Txt x={314} y={16} size={10} color={PAL.ink} weight={600}>
          String[] names
        </Txt>
        <ArrayBox x={314} y={28} cells={['', '', 'null']} dots={[0, 1]} />
        <Arrow x1={377} y1={43} x2={377} y2={62} color={PAL.cyan} />
        <StrObj x={350} y={63} text={'"Ann"'} />
        <Arrow x1={411} y1={43} x2={446} y2={62} color={PAL.cyan} />
        <StrObj x={420} y={63} text={'"Bo"'} />
        <Txt x={490} y={72} size={8.5} color={PAL.muted}>
          references (or null)
        </Txt>
        <Txt x={490} y={84} size={8.5} color={PAL.muted}>
          to other objects
        </Txt>

        <line x1={8} y1={104} x2={592} y2={104} stroke={PAL.border} strokeDasharray="3 4" />
        <Txt x={12} y={124} size={10} color={PAL.ink} weight={600}>
          int[][] grid = {'{{1, 2, 3}, {4}, {5, 6}}'}
        </Txt>
        <rect x={12} y={136} width={60} height={20} fill={PAL.surface3} stroke={PAL.border} />
        <Txt x={42} y={150} anchor="middle" size={8.5} color={PAL.dim}>
          len 3
        </Txt>
        {rows.map((r, i) => (
          <g key={i}>
            <rect x={12} y={156 + i * 26} width={60} height={26} fill={PAL.void} stroke={PAL.cyan} strokeWidth={1.1} />
            <Txt x={22} y={173 + i * 26} size={8.5} color={PAL.dim}>
              {String(i)}
            </Txt>
            <circle cx={56} cy={169 + i * 26} r={3.2} fill={PAL.cyan} />
            <Arrow x1={60} y1={169 + i * 26} x2={140} y2={169 + i * 26} color={PAL.cyan} />
            <ArrayBox x={142} y={157 + i * 26} cells={r} />
          </g>
        ))}
        <Txt x={352} y={170} size={8.5} color={PAL.muted}>
          an array of references to row arrays
        </Txt>
        <Txt x={352} y={184} size={8.5} color={PAL.muted}>
          rows are separate objects: lengths may differ
        </Txt>
        <Txt x={352} y={198} size={8.5} color={PAL.muted}>
          grid.length == 3, grid[1].length == 1
        </Txt>
      </svg>
    </Figure>
  )
}
