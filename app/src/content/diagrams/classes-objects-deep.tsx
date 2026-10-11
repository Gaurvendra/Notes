/** Diagrams for the "Classes & Objects in Depth" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

type Stage = { title: string; lines: string[]; color: string }

const STAGES: Stage[] = [
  {
    title: 'Created',
    color: PAL.cyan,
    lines: ['new: class initialised if needed, memory', 'allocated, constructor run (or clone,', 'deserialization, reflection)'],
  },
  {
    title: 'Reachable: in use',
    color: PAL.mint,
    lines: ['a chain of references leads to it from a', 'GC root: a local variable, a static field,', 'a running thread'],
  },
  {
    title: 'Unreachable',
    color: PAL.amber,
    lines: ['the last such chain is gone: variable', 'reassigned or out of scope, object', 'removed from its collection'],
  },
  {
    title: 'Collected',
    color: PAL.rose,
    lines: ['the GC reclaims the memory when it', 'chooses, maybe never before the JVM', 'exits; no destructor runs'],
  },
]

const BOX_H = 74
const GAP = 26

/** The life of an object, from new to garbage collection. */
export function ObjectLifecycle() {
  const height = 8 + STAGES.length * BOX_H + (STAGES.length - 1) * GAP + 8 + 64
  const noteY = 8 + STAGES.length * BOX_H + (STAGES.length - 1) * GAP + 8
  return (
    <Figure caption="An object's life. It's created by new (or, without running a constructor, by clone and deserialization), stays alive while some chain of references reaches it from a GC root, and once nothing reaches it, the garbage collector may reclaim it at a time of its choosing. Java has no destructors: anything that must be released at a known time, such as files, sockets and locks, needs an explicit close(), best with try-with-resources.">
      <svg viewBox={`0 0 400 ${height}`} width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="object-lifecycle-title">
        <title id="object-lifecycle-title">
          Four stages. Created: new initialises the class if needed, allocates memory and runs the constructor. Reachable:
          a chain of references leads to the object from a GC root. Unreachable: the last chain is gone. Collected: the
          garbage collector reclaims the memory when it chooses, and no destructor runs. Resources must be released
          explicitly with close or try-with-resources; finalize is deprecated for removal.
        </title>
        {STAGES.map((s, i) => {
          const y = 8 + i * (BOX_H + GAP)
          return (
            <g key={s.title}>
              <rect x={8} y={y} width={384} height={BOX_H} rx={9} fill={PAL.surface} stroke={s.color} strokeWidth={1.4} />
              <Txt x={20} y={y + 20} size={11.5} color={s.color} weight={700}>
                {`${i + 1}. ${s.title}`}
              </Txt>
              {s.lines.map((line, k) => (
                <Txt key={k} x={20} y={y + 38 + k * 14} size={10} color={PAL.ink}>
                  {line}
                </Txt>
              ))}
              {i < STAGES.length - 1 && <Arrow x1={200} y1={y + BOX_H + 2} x2={200} y2={y + BOX_H + GAP - 2} color={PAL.dim} />}
            </g>
          )
        })}
        <rect x={8} y={noteY} width={384} height={56} rx={9} fill={PAL.void} stroke={PAL.border} strokeWidth={1} strokeDasharray="4 3" />
        <Txt x={20} y={noteY + 20} size={10} color={PAL.muted}>
          files, sockets, locks: release them yourself with
        </Txt>
        <Txt x={20} y={noteY + 36} size={10} color={PAL.muted}>
          close() and try-with-resources; Cleaner is a safety
        </Txt>
        <Txt x={20} y={noteY + 50} size={10} color={PAL.muted}>
          net; finalize() is deprecated for removal
        </Txt>
      </svg>
    </Figure>
  )
}
