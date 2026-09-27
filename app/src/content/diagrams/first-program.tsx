/** Diagrams for the "Your First Program" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** Three ways to run Java code: compile then run, run a source file, or type it into jshell. */
export function RunPaths() {
  return (
    <Figure caption="Classic path: javac writes Hello.class to disk, then java loads it by class name. Source-file mode: java compiles the file in memory and runs it, leaving no .class file. jshell: each snippet is compiled and run as you type it.">
      <svg viewBox="0 0 640 300" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="runpaths-title">
        <title id="runpaths-title">Three ways to run Java code</title>
        <Txt x={10} y={22} size={11} color={PAL.cyan} mono={false} weight={600}>
          1. Compile, then run
        </Txt>
        <Box x={10} y={32} w={120} h={42} title="Hello.java" sub="source" color={PAL.magenta} />
        <Arrow x1={130} y1={53} x2={190} y2={53} label="javac Hello.java" labelDy={-8} color={PAL.magenta} />
        <Box x={190} y={32} w={120} h={42} title="Hello.class" sub="bytecode on disk" color={PAL.cyan} />
        <Arrow x1={310} y1={53} x2={370} y2={53} label="java Hello" labelDy={-8} color={PAL.cyan} />
        <Box x={370} y={32} w={120} h={42} title="JVM" sub="runs main" color={PAL.mint} />
        <Arrow x1={490} y1={53} x2={530} y2={53} color={PAL.mint} />
        <Box x={530} y={32} w={100} h={42} title="output" color={PAL.amber} dashed />

        <Txt x={10} y={122} size={11} color={PAL.cyan} mono={false} weight={600}>
          2. Source-file mode (Java 11+, several files since 22)
        </Txt>
        <Box x={10} y={132} w={120} h={42} title="Hello.java" sub="source" color={PAL.magenta} />
        <Arrow x1={130} y1={153} x2={370} y2={153} label="java Hello.java  (compiled in memory, no .class file)" labelDy={-8} color={PAL.magenta} />
        <Box x={370} y={132} w={120} h={42} title="JVM" sub="runs main" color={PAL.mint} />
        <Arrow x1={490} y1={153} x2={530} y2={153} color={PAL.mint} />
        <Box x={530} y={132} w={100} h={42} title="output" color={PAL.amber} dashed />

        <Txt x={10} y={222} size={11} color={PAL.cyan} mono={false} weight={600}>
          3. jshell (Java 9+): read, evaluate, print, loop
        </Txt>
        <Box x={10} y={232} w={120} h={42} title="snippet" sub={'1 + 2'} color={PAL.magenta} />
        <Arrow x1={130} y1={253} x2={370} y2={253} label="compiled and run at once" labelDy={-8} color={PAL.magenta} />
        <Box x={370} y={232} w={120} h={42} title="jshell's JVM" sub="keeps your variables" color={PAL.mint} />
        <Arrow x1={490} y1={253} x2={530} y2={253} color={PAL.mint} />
        <Box x={530} y={232} w={100} h={42} title="result" sub="then next snippet" color={PAL.amber} dashed />
      </svg>
    </Figure>
  )
}

/** How the launcher picks the main method (JEP 512, Java 25). */
export function LaunchProtocol() {
  return (
    <Figure caption="The launcher first looks for a main method with a String[] parameter, then for one with no parameters (private methods don't count). A static main is called directly; an instance main is called on a new object created with the class's no-argument constructor.">
      <svg viewBox="0 0 640 250" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="launch-title">
        <title id="launch-title">How the java launcher chooses the main method in Java 25</title>
        <Box x={200} y={8} w={240} h={40} title="java Hello" sub="class loaded, look for main" color={PAL.magenta} />
        <Arrow x1={320} y1={48} x2={320} y2={74} color={PAL.dim} />
        <Box x={170} y={74} w={300} h={40} title="main(String[] args) declared?" sub="non-private, static or instance" color={PAL.cyan} />
        <Arrow x1={170} y1={94} x2={110} y2={140} color={PAL.mint} label="yes" labelDy={-4} />
        <Arrow x1={470} y1={94} x2={530} y2={140} color={PAL.rose} label="no" labelDy={-4} />
        <Box x={20} y={140} w={180} h={40} title="use main(String[])" color={PAL.mint} />
        <Box x={420} y={140} w={200} h={40} title="main() declared?" sub="non-private" color={PAL.cyan} />
        <Arrow x1={470} y1={180} x2={380} y2={206} color={PAL.mint} label="yes" labelDy={-4} />
        <Arrow x1={590} y1={180} x2={590} y2={206} color={PAL.rose} />
        <Box x={250} y={206} w={180} h={36} title="use main()" color={PAL.mint} />
        <Box x={470} y={206} w={160} h={36} title="error: no main method" color={PAL.rose} dashed />
        <Txt x={20} y={210} size={9.5} color={PAL.muted}>
          static → call it
        </Txt>
        <Txt x={20} y={226} size={9.5} color={PAL.muted}>
          instance → new Hello().main(…)
        </Txt>
      </svg>
    </Figure>
  )
}
