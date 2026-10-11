/** Diagrams for the "Encapsulation" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const PANEL_H = 196

/** A small object box with a title and one reference field ending in a dot. */
function ObjBox({ x, y, title, field, color }: { x: number; y: number; title: string; field: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={150} height={46} rx={7} fill={PAL.void} stroke={color} strokeWidth={1.2} />
      <Txt x={x + 10} y={y + 17} size={10.5} color={color} weight={700}>
        {title}
      </Txt>
      <Txt x={x + 10} y={y + 35} size={10} color={PAL.ink}>
        {field}
      </Txt>
      <circle cx={x + 136} cy={y + 31} r={3.5} fill={color} />
    </g>
  )
}

function ListBox({ x, y, title, items, color }: { x: number; y: number; title: string; items: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={150} height={44} rx={7} fill={PAL.surface} stroke={color} strokeWidth={1.2} />
      <Txt x={x + 10} y={y + 17} size={10} color={color}>
        {title}
      </Txt>
      <Txt x={x + 10} y={y + 34} size={10} color={PAL.ink}>
        {items}
      </Txt>
    </g>
  )
}

/** A getter that returns its internal list vs one that returns a read-only copy. */
export function LeakyGetter() {
  const y2 = 8 + PANEL_H + 12
  return (
    <Figure caption="The difference between private and encapsulated. On top, the field is private but the getter hands out the object it refers to, so any caller can change the course's list behind its back and every rule the course enforces in its own methods is bypassed. Below, the getter returns an unmodifiable copy: callers can read the students but can only change them through the course's methods.">
      <svg viewBox={`0 0 400 ${y2 + PANEL_H + 8}`} width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="leaky-getter-title">
        <title id="leaky-getter-title">
          Leaky version: the course's private students field and the list a caller got from students() refer to the same
          ArrayList, so the caller's add changes the course and bypasses its limit. Encapsulated version: students() returns
          an unmodifiable copy, a separate list; the caller's add throws UnsupportedOperationException and the course is
          unchanged.
        </title>

        <rect x={8} y={8} width={384} height={PANEL_H} rx={9} fill={PAL.surface} stroke={PAL.rose} strokeWidth={1.4} />
        <Txt x={20} y={27} size={11.5} color={PAL.rose} weight={700}>
          Leaky: students() returns the internal list
        </Txt>
        <ObjBox x={20} y={40} title="Course" field="students" color={PAL.cyan} />
        <ObjBox x={230} y={40} title="caller" field="list" color={PAL.amber} />
        <ListBox x={125} y={116} title="ArrayList" items="[Ann, Bo, Eve]" color={PAL.rose} />
        <Arrow x1={156} y1={71} x2={190} y2={114} color={PAL.cyan} />
        <Arrow x1={366} y1={71} x2={250} y2={114} color={PAL.amber} />
        <Txt x={20} y={182} size={9.5} color={PAL.rose}>
          {'list.add("Eve") changes the course: its limit is bypassed'}
        </Txt>

        <rect x={8} y={y2} width={384} height={PANEL_H} rx={9} fill={PAL.surface} stroke={PAL.mint} strokeWidth={1.4} />
        <Txt x={20} y={y2 + 19} size={11.5} color={PAL.mint} weight={700}>
          Encapsulated: students() returns a copy
        </Txt>
        <ObjBox x={20} y={y2 + 32} title="Course" field="students" color={PAL.cyan} />
        <ObjBox x={230} y={y2 + 32} title="caller" field="list" color={PAL.amber} />
        <ListBox x={20} y={y2 + 108} title="ArrayList (private)" items="[Ann, Bo]" color={PAL.cyan} />
        <ListBox x={230} y={y2 + 108} title="List.copyOf: read-only" items="[Ann, Bo]" color={PAL.amber} />
        <Arrow x1={156} y1={y2 + 63} x2={95} y2={y2 + 106} color={PAL.cyan} />
        <Arrow x1={366} y1={y2 + 63} x2={305} y2={y2 + 106} color={PAL.amber} />
        <Txt x={20} y={y2 + 174} size={9.5} color={PAL.mint}>
          list.add(...) throws; only the course's own methods
        </Txt>
        <Txt x={20} y={y2 + 188} size={9.5} color={PAL.mint}>
          can change its students, and they enforce the rules
        </Txt>
      </svg>
    </Figure>
  )
}
