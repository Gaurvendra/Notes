/** Diagrams for the "Varargs" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const CELL = 34

function Cells({ x, y, values, color }: { x: number; y: number; values: string[]; color: string }) {
  return (
    <g>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x + i * CELL} y={y} width={CELL} height={24} fill={PAL.void} stroke={color} strokeWidth={1.2} />
          <Txt x={x + i * CELL + CELL / 2} y={y + 16} anchor="middle" size={10} color={PAL.ink}>
            {v}
          </Txt>
        </g>
      ))}
    </g>
  )
}

function Chip({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = text.length * 6.2 + 14
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={6} fill={PAL.surface} stroke={color} strokeWidth={1.1} />
      <Txt x={x + 7} y={y + 15} size={9.5} color={PAL.ink}>
        {text}
      </Txt>
    </g>
  )
}

/** What the varargs parameter of the notes' sum(int a, int... variable) receives for four kinds of call. */
export function VarargsPacking() {
  const rowY = [8, 104, 200, 296]
  return (
    <Figure caption="What the notes' sum(int a, int... variable) receives. The compiler packs the extra arguments into a new array at the call site (first row). With no extra arguments the method still gets an array, an empty one (second row). An existing array is passed as it is, so the method and the caller share it (third row). A lone null is taken as the array itself, so the for-each loop inside sum throws NullPointerException (fourth row).">
      <svg viewBox="0 0 400 386" width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="varargs-title">
        <title id="varargs-title">
          sum(3, 8, 9, 10) passes a new int array of 8, 9 and 10. sum(3) passes a new empty array. sum(3, nums) passes the
          caller's own array nums, shared. sum(3, null) passes null, and the loop over it throws NullPointerException.
        </title>
        {/* row 1: packing */}
        <Txt x={8} y={rowY[0] + 14} size={11} color={PAL.cyan} weight={700}>
          sum(3, 8, 9, 10)
        </Txt>
        <Chip x={8} y={rowY[0] + 26} text="a = 3" color={PAL.border} />
        <Txt x={78} y={rowY[0] + 41} size={9.5} color={PAL.muted}>
          variable
        </Txt>
        <Arrow x1={130} y1={rowY[0] + 37} x2={156} y2={rowY[0] + 37} color={PAL.cyan} />
        <Cells x={158} y={rowY[0] + 25} values={['8', '9', '10']} color={PAL.cyan} />
        <Txt x={8} y={rowY[0] + 72} size={9} color={PAL.dim}>
          a new int[3], created by the compiler at the call · sum returns 27
        </Txt>

        {/* row 2: empty */}
        <Txt x={8} y={rowY[1] + 14} size={11} color={PAL.mint} weight={700}>
          sum(3)
        </Txt>
        <Chip x={8} y={rowY[1] + 26} text="a = 3" color={PAL.border} />
        <Txt x={78} y={rowY[1] + 41} size={9.5} color={PAL.muted}>
          variable
        </Txt>
        <Arrow x1={130} y1={rowY[1] + 37} x2={156} y2={rowY[1] + 37} color={PAL.mint} />
        <rect x={158} y={rowY[1] + 25} width={60} height={24} rx={3} fill={PAL.void} stroke={PAL.mint} strokeWidth={1.2} strokeDasharray="4 3" />
        <Txt x={188} y={rowY[1] + 41} anchor="middle" size={9} color={PAL.mint}>
          length 0
        </Txt>
        <Txt x={8} y={rowY[1] + 72} size={9} color={PAL.dim}>
          a new int[0], never null: the loop runs 0 times, sum returns 0
        </Txt>

        {/* row 3: shared array */}
        <Txt x={8} y={rowY[2] + 14} size={11} color={PAL.amber} weight={700}>
          int[] nums = {'{'}8, 9{'}'}; sum(3, nums)
        </Txt>
        <Chip x={8} y={rowY[2] + 26} text="nums" color={PAL.amber} />
        <Txt x={78} y={rowY[2] + 41} size={9.5} color={PAL.muted}>
          variable
        </Txt>
        <Arrow x1={130} y1={rowY[2] + 37} x2={156} y2={rowY[2] + 37} color={PAL.amber} />
        <Cells x={158} y={rowY[2] + 25} values={['8', '9']} color={PAL.amber} />
        <path d={`M 34 ${rowY[2] + 48} C 34 ${rowY[2] + 66}, 190 ${rowY[2] + 66}, 192 ${rowY[2] + 51}`} fill="none" stroke={PAL.amber} strokeWidth={1.3} strokeDasharray="4 3" />
        <Txt x={242} y={rowY[2] + 41} size={9} color={PAL.amber}>
          the same array object
        </Txt>
        <Txt x={8} y={rowY[2] + 80} size={9} color={PAL.dim}>
          no copy: a change inside sum would change the caller&apos;s nums
        </Txt>

        {/* row 4: null */}
        <Txt x={8} y={rowY[3] + 14} size={11} color={PAL.rose} weight={700}>
          sum(3, null)
        </Txt>
        <Chip x={8} y={rowY[3] + 26} text="a = 3" color={PAL.border} />
        <Txt x={78} y={rowY[3] + 41} size={9.5} color={PAL.muted}>
          variable = null
        </Txt>
        <Txt x={8} y={rowY[3] + 72} size={9} color={PAL.rose}>
          null is taken as the whole array: for (int var : variable)
        </Txt>
        <Txt x={8} y={rowY[3] + 86} size={9} color={PAL.rose}>
          throws NullPointerException
        </Txt>
      </svg>
    </Figure>
  )
}
