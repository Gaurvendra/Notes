/** Diagrams for the "JDK, JRE & JVM" lesson, as themed inline SVG (they re-colour with the scheme and mode). */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** Compile once, run on every platform: one class file, three platform-specific JVMs. */
export function WoraDiagram() {
  const jvms = [
    { x: 20, jvm: 'Linux x64', cpu: 'x86-64' },
    { x: 220, jvm: 'macOS ARM', cpu: 'ARM64' },
    { x: 420, jvm: 'Windows x64', cpu: 'x86-64' },
  ]
  return (
    <Figure caption="javac compiles Hello.java into one Hello.class file; JVMs built for Linux x64, macOS ARM and Windows x64 each run that same file and turn it into their own machine code.">
      <svg viewBox="0 0 600 330" width="100%" style={{ minWidth: 460 }} role="img" aria-labelledby="wora-title">
        <title id="wora-title">Compile once, run on every platform</title>
        <Box x={210} y={10} w={180} h={46} title="Hello.java" sub="source code" color={PAL.magenta} />
        <Arrow x1={300} y1={56} x2={300} y2={100} color={PAL.magenta} />
        <Txt x={308} y={82} color={PAL.magenta} size={10}>
          javac
        </Txt>
        <Box x={190} y={100} w={220} h={46} title="Hello.class" sub="same bytecode everywhere" color={PAL.cyan} />
        {jvms.map((j) => (
          <g key={j.jvm}>
            <Arrow x1={300} y1={146} x2={j.x + 80} y2={196} color={PAL.cyan} />
            <Box x={j.x} y={196} w={160} h={46} title="JVM for" sub={j.jvm} color={PAL.mint} />
            <Arrow x1={j.x + 80} y1={242} x2={j.x + 80} y2={274} color={PAL.dim} />
            <Box x={j.x} y={274} w={160} h={46} title={j.cpu} sub="machine code" color={PAL.amber} dashed />
          </g>
        ))}
      </svg>
    </Figure>
  )
}

/** jlink builds small runtimes from the JDK's modules. */
export function JlinkDiagram() {
  return (
    <Figure caption="From a full JDK 25 with 69 modules (330 MB), jlink with java.base gives a 1-module, 55 MB runtime whose bin folder holds java and keytool; jlink with java.sql also adds java.logging, java.transaction.xa and java.xml.">
      <svg viewBox="0 0 640 250" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="jlink-title">
        <title id="jlink-title">jlink builds small runtimes from the JDK</title>
        <Box x={220} y={10} w={200} h={50} title="Full JDK 25" sub="69 modules · 330 MB" color={PAL.magenta} />
        <Arrow x1={290} y1={60} x2={160} y2={140} color={PAL.cyan} />
        <Arrow x1={350} y1={60} x2={480} y2={140} color={PAL.cyan} />
        <Txt x={196} y={96} anchor="end" color={PAL.cyan} size={10}>
          jlink --add-modules java.base
        </Txt>
        <Txt x={444} y={96} anchor="start" color={PAL.cyan} size={10}>
          jlink --add-modules java.sql
        </Txt>
        <Box x={40} y={140} w={240} h={70} color={PAL.mint} />
        <Txt x={160} y={164} anchor="middle" mono={false} color={PAL.ink} size={12}>
          Custom runtime
        </Txt>
        <Txt x={160} y={182} anchor="middle" size={10}>
          1 module · 55 MB
        </Txt>
        <Txt x={160} y={198} anchor="middle" size={10}>
          bin/: java, keytool
        </Txt>
        <Box x={360} y={140} w={250} h={86} color={PAL.mint} />
        <Txt x={485} y={164} anchor="middle" mono={false} color={PAL.ink} size={12}>
          Custom runtime
        </Txt>
        <Txt x={485} y={182} anchor="middle" size={10}>
          java.sql + java.logging +
        </Txt>
        <Txt x={485} y={198} anchor="middle" size={10}>
          java.transaction.xa + java.xml
        </Txt>
        <Txt x={485} y={214} anchor="middle" size={10}>
          + java.base
        </Txt>
      </svg>
    </Figure>
  )
}
