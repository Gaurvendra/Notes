/** Diagrams for the "How Java Runs" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** From source code to CPU, as it really happens. */
export function JvmPipeline() {
  return (
    <Figure caption="javac compiles ahead of time, once. Inside the JVM, the class loader subsystem loads, links (verifies, prepares, resolves) and initialises each class the first time it is needed. The execution engine starts by interpreting bytecode and compiles only the hot methods to machine code; everything else stays interpreted.">
      <svg viewBox="0 0 660 330" width="100%" style={{ minWidth: 560 }} role="img" aria-labelledby="pipeline-title">
        <title id="pipeline-title">The path from Java source code to machine code inside the JVM</title>
        <Box x={10} y={20} w={110} h={46} title="Hello.java" sub="source" color={PAL.magenta} />
        <Arrow x1={120} y1={43} x2={160} y2={43} label="javac" labelDy={-8} color={PAL.magenta} />
        <Box x={160} y={20} w={110} h={46} title="Hello.class" sub="bytecode" color={PAL.cyan} />
        <Arrow x1={270} y1={43} x2={306} y2={43} color={PAL.cyan} />
        <rect x={300} y={6} width={350} height={316} rx={10} fill="none" stroke={PAL.mint} strokeDasharray="5 4" />
        <Txt x={312} y={22} size={10} color={PAL.mint} mono={false} weight={600}>
          JVM process
        </Txt>
        <Box x={312} y={32} w={326} h={78} color={PAL.cyan} />
        <Txt x={322} y={50} size={11} color={PAL.ink} mono={false} weight={600}>
          Class loader subsystem
        </Txt>
        <Txt x={322} y={68} size={9.5}>
          load → link (verify · prepare · resolve)
        </Txt>
        <Txt x={322} y={84} size={9.5}>
          → initialise (static initialisers run)
        </Txt>
        <Txt x={322} y={100} size={9} color={PAL.dim}>
          bootstrap · platform · application loaders
        </Txt>
        <Arrow x1={475} y1={110} x2={475} y2={132} color={PAL.dim} />
        <Box x={312} y={132} w={326} h={56} color={PAL.amber} />
        <Txt x={322} y={150} size={11} color={PAL.ink} mono={false} weight={600}>
          Runtime data areas
        </Txt>
        <Txt x={322} y={168} size={9.5}>
          heap · method area (Metaspace) · code cache
        </Txt>
        <Txt x={322} y={182} size={9} color={PAL.dim}>
          per thread: JVM stack of frames · PC register
        </Txt>
        <Arrow x1={475} y1={188} x2={475} y2={210} color={PAL.dim} />
        <Box x={312} y={210} w={326} h={100} color={PAL.mint} />
        <Txt x={322} y={228} size={11} color={PAL.ink} mono={false} weight={600}>
          Execution engine
        </Txt>
        <Box x={322} y={238} w={96} h={40} title="interpreter" sub="every method" color={PAL.muted} />
        <Arrow x1={418} y1={258} x2={430} y2={258} color={PAL.dim} />
        <Box x={430} y={238} w={96} h={40} title="C1 JIT" sub="warm code" color={PAL.cyan} />
        <Arrow x1={526} y1={258} x2={538} y2={258} color={PAL.dim} />
        <Box x={538} y={238} w={92} h={40} title="C2 JIT" sub="hot code" color={PAL.magenta} />
        <Txt x={322} y={298} size={9} color={PAL.dim}>
          + garbage collector · profiling data · deoptimisation
        </Txt>
        <Arrow x1={300} y1={258} x2={200} y2={258} color={PAL.amber} label="machine code" labelDy={-8} />
        <Box x={70} y={236} w={130} h={44} title="CPU" sub="x86-64, ARM64…" color={PAL.amber} dashed />
      </svg>
    </Figure>
  )
}

/** Tiered compilation in HotSpot: the usual path of a method, and the way back. */
export function TieredCompilation() {
  return (
    <Figure caption="A method starts in the interpreter (tier 0). When it has been called or looped often enough, C1 compiles it with profiling (tier 3). If it stays hot, C2 recompiles it using that profile (tier 4). If an assumption behind the optimised code stops being true, the JVM deoptimises: it throws the compiled code away and continues in the interpreter.">
      <svg viewBox="0 0 640 190" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="tiers-title">
        <title id="tiers-title">Tiered compilation: interpreter, C1 with profiling, C2, and deoptimisation</title>
        <Box x={20} y={40} w={150} h={56} title="Tier 0: interpreter" sub="starts at once, collects counts" color={PAL.muted} />
        <Arrow x1={170} y1={68} x2={240} y2={68} label="called often" labelDy={-8} color={PAL.cyan} />
        <Box x={240} y={40} w={160} h={56} title="Tier 3: C1 + profiling" sub="fast compile, records types" color={PAL.cyan} />
        <Arrow x1={400} y1={68} x2={470} y2={68} label="still hot" labelDy={-8} color={PAL.magenta} />
        <Box x={470} y={40} w={150} h={56} title="Tier 4: C2" sub="optimised with the profile" color={PAL.magenta} />
        <path d="M545,96 C545,160 95,160 95,100" fill="none" stroke={PAL.rose} strokeWidth={1.4} strokeDasharray="5 4" />
        <polygon points="95,96 91,106 99,106" fill={PAL.rose} />
        <Txt x={320} y={150} anchor="middle" size={10} color={PAL.rose}>
          deoptimisation: an assumption broke (new subclass, rare branch taken…)
        </Txt>
        <Txt x={320} y={176} anchor="middle" size={9} color={PAL.dim}>
          tiers 1 and 2 (C1 without or with light profiling) are used when C2 is busy or for trivial methods
        </Txt>
        <Txt x={20} y={24} size={9} color={PAL.dim}>
          HotSpot, tiered compilation on by default since Java 8
        </Txt>
      </svg>
    </Figure>
  )
}
