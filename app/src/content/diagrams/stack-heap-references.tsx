/** Diagrams for the "Stack, Heap & References" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

/** The JVM's run-time data areas: per thread on the left, shared on the right. */
export function MemoryAreas() {
  const perThread = [
    { t: 'JVM stack', s: ['one frame per call in progress:', 'locals (incl. references), operands'], c: PAL.cyan, h: 62 },
    { t: 'pc register', s: ['the instruction being executed'], c: PAL.border, h: 40 },
    { t: 'native method stack', s: ['for native (C) code'], c: PAL.border, h: 40 },
  ]
  return (
    <Figure caption="The run-time data areas of the JVM specification. Each thread gets its own stack (with one frame per call), pc register and native stack. All threads share the heap, where every object and array lives (the string pool is part of it), and the method area, which HotSpot implements as Metaspace in native memory. The JVM also uses other native memory, such as the JIT's code cache.">
      <svg viewBox="0 0 560 262" width="100%" style={{ minWidth: 480 }} role="img" aria-labelledby="areas-title">
        <title id="areas-title">
          Per thread: JVM stack, pc register, native method stack. Shared: heap with objects, arrays and the string pool, and the
          method area (Metaspace) with class metadata
        </title>
        {[0, 1].map((k) => (
          <g key={k}>
            <rect x={14 + k * 10} y={30 + k * 10} width={220} height={200} rx={10} fill={PAL.surface} stroke={PAL.border} strokeWidth={1.2} />
          </g>
        ))}
        <Txt x={30} y={26} size={11} color={PAL.ink} weight={600}>
          per thread (one set each)
        </Txt>
        {perThread.map((p, i) => {
          const y = 56 + perThread.slice(0, i).reduce((n, q) => n + q.h + 10, 0)
          return (
            <g key={p.t}>
              <rect x={36} y={y} width={188} height={p.h} rx={8} fill={PAL.void} stroke={p.c} strokeWidth={1.3} />
              <Txt x={46} y={y + 17} size={10.5} color={PAL.ink} weight={600}>
                {p.t}
              </Txt>
              {p.s.map((line, j) => (
                <Txt key={line} x={46} y={y + 32 + j * 13} size={8.5} color={PAL.muted}>
                  {line}
                </Txt>
              ))}
            </g>
          )
        })}
        <Txt x={272} y={26} size={11} color={PAL.ink} weight={600}>
          shared by all threads
        </Txt>
        <rect x={270} y={34} width={276} height={140} rx={10} fill={PAL.surface} stroke={PAL.mint} strokeWidth={1.4} />
        <Txt x={284} y={54} size={10.5} color={PAL.ink} weight={600}>
          heap (-Xmx)
        </Txt>
        <Txt x={284} y={70} size={8.5} color={PAL.muted}>
          every object and array, their fields and elements
        </Txt>
        {['Person', 'int[5]', 'ArrayList'].map((o, i) => (
          <g key={o}>
            <rect x={284 + i * 82} y={82} width={72} height={26} rx={6} fill={PAL.void} stroke={PAL.cyan} strokeWidth={1.1} />
            <Txt x={320 + i * 82} y={99} anchor="middle" size={9.5} color={PAL.cyan}>
              {o}
            </Txt>
          </g>
        ))}
        <rect x={284} y={118} width={248} height={44} rx={8} fill="none" stroke={PAL.border} strokeDasharray="5 4" />
        <Txt x={296} y={136} size={9} color={PAL.muted}>
          string pool:
        </Txt>
        <Txt x={372} y={136} size={9} color={PAL.amber}>
          "hello"
        </Txt>
        <Txt x={296} y={152} size={9} color={PAL.muted}>
          Class objects, with static fields
        </Txt>
        <rect x={270} y={184} width={276} height={46} rx={10} fill={PAL.surface} stroke={PAL.magenta} strokeWidth={1.3} />
        <Txt x={284} y={203} size={10.5} color={PAL.ink} weight={600}>
          method area: Metaspace (native)
        </Txt>
        <Txt x={284} y={219} size={8.5} color={PAL.muted}>
          class metadata, bytecode, run-time constant pools
        </Txt>
        <Txt x={30} y={252} size={9} color={PAL.dim}>
          StackOverflowError: a stack is full · OutOfMemoryError: the heap or Metaspace is full
        </Txt>
      </svg>
    </Figure>
  )
}
