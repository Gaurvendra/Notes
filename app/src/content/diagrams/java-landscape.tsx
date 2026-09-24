/** Diagrams for the "Java in 2026" lesson, as themed inline SVG. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

const LTS = [
  { v: 8, y: 2014, m: 3 },
  { v: 11, y: 2018, m: 9 },
  { v: 17, y: 2021, m: 9 },
  { v: 21, y: 2023, m: 9 },
  { v: 25, y: 2025, m: 9 },
  { v: 29, y: 2027, m: 9, planned: true },
]

/** Feature releases since Java 8: every six months from Java 10, an LTS every two years from Java 17. */
export function ReleaseTimeline() {
  const x = (year: number, month: number) => 30 + (year + (month - 1) / 12 - 2014) * 47
  const releases: { v: number; y: number; m: number }[] = [{ v: 9, y: 2017, m: 9 }]
  for (let v = 10; v <= 28; v++) releases.push({ v, y: 2018 + Math.floor((v - 10) / 2), m: (v - 10) % 2 === 0 ? 3 : 9 })
  const lts = new Set(LTS.map((l) => l.v))
  const AXIS = 110
  return (
    <Figure caption="Java 9 (September 2017) was the last release of the old model. Since Java 10 (March 2018) a feature release ships every March and September. Java 8 and 11 are LTS; since Java 17 every fourth release (two years) is. Java 29 (September 2027) is the planned next LTS. Today is September 2026: Java 27 is the newest release and Java 25 the newest LTS.">
      <svg viewBox="0 0 720 200" width="100%" style={{ minWidth: 600 }} role="img" aria-labelledby="timeline-title">
        <title id="timeline-title">Java release timeline from 2014 to 2027, with long-term-support releases highlighted</title>
        <line x1={20} y1={AXIS} x2={700} y2={AXIS} stroke={PAL.dim} strokeWidth={1.5} />
        {Array.from({ length: 14 }, (_, i) => 2014 + i).map((year) => (
          <g key={year}>
            <line x1={x(year, 1)} y1={AXIS - 4} x2={x(year, 1)} y2={AXIS + 4} stroke={PAL.dim} />
            <Txt x={x(year, 1)} y={AXIS + 58} anchor="middle" size={10} color={PAL.muted}>
              {year}
            </Txt>
          </g>
        ))}
        {releases
          .filter((r) => !lts.has(r.v))
          .map((r) => (
            <g key={r.v}>
              <circle cx={x(r.y, r.m)} cy={AXIS} r={4} fill={r.v > 27 ? PAL.void : PAL.surface} stroke={PAL.muted} strokeDasharray={r.v > 27 ? '2 2' : undefined} />
              <Txt x={x(r.y, r.m)} y={AXIS + 20 + (r.v % 2) * 12} anchor="middle" size={9} color={PAL.muted}>
                {r.v}
              </Txt>
            </g>
          ))}
        {LTS.map((l) => (
          <g key={l.v}>
            <line x1={x(l.y, l.m)} y1={AXIS - 10} x2={x(l.y, l.m)} y2={AXIS - 34} stroke={PAL.cyan} strokeDasharray={l.planned ? '3 3' : undefined} />
            <circle cx={x(l.y, l.m)} cy={AXIS} r={9} fill={l.planned ? PAL.void : PAL.cyan} stroke={PAL.cyan} strokeWidth={2} strokeDasharray={l.planned ? '3 2' : undefined} />
            <Txt x={x(l.y, l.m)} y={AXIS - 40} anchor="middle" size={12} color={PAL.cyan} mono={false} weight={600}>
              {`Java ${l.v}`}
            </Txt>
            <Txt x={x(l.y, l.m)} y={AXIS - 54} anchor="middle" size={9} color={PAL.cyan}>
              {l.planned ? 'next LTS' : 'LTS'}
            </Txt>
          </g>
        ))}
        <line x1={x(2026, 9.8)} y1={AXIS - 22} x2={x(2026, 9.8)} y2={AXIS + 38} stroke={PAL.amber} strokeDasharray="4 3" />
        <Txt x={x(2026, 9.8) + 4} y={AXIS + 46} size={9} color={PAL.amber}>
          today
        </Txt>
        <Txt x={x(2014, 3) + 14} y={AXIS + 36} size={9} color={PAL.dim}>
          3½ years without a release
        </Txt>
      </svg>
    </Figure>
  )
}

/** One open-source code base, many builds: who produces the JDK you download. */
export function BuildersDiagram() {
  const vendors = [
    ['Oracle JDK', 'Oracle'],
    ['Oracle OpenJDK builds', 'jdk.java.net'],
    ['Eclipse Temurin', 'Adoptium'],
    ['Amazon Corretto', 'Amazon'],
    ['Azul Zulu', 'Azul'],
    ['Microsoft Build', 'of OpenJDK'],
    ['Red Hat build', 'of OpenJDK'],
    ['Liberica · SapMachine', 'BellSoft · SAP'],
  ]
  return (
    <Figure caption="Almost every JDK you can download is built from the same OpenJDK source code. Vendors differ in licence, support, update speed and platforms, not in the language or the core libraries. IBM Semeru swaps HotSpot for the Eclipse OpenJ9 JVM, and GraalVM adds the Graal compiler and Native Image.">
      <svg viewBox="0 0 640 290" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="builders-title">
        <title id="builders-title">The OpenJDK source code is built by many vendors into compatible JDK distributions</title>
        <Box x={180} y={10} w={280} h={50} title="OpenJDK source code" sub="GPLv2 + CPE · HotSpot · javac · libraries" color={PAL.magenta} />
        <Arrow x1={320} y1={60} x2={320} y2={92} color={PAL.magenta} />
        <Txt x={328} y={82} size={9} color={PAL.magenta}>
          built, tested, signed by each vendor
        </Txt>
        {vendors.map(([title, sub], i) => (
          <Box key={title} x={20 + (i % 4) * 152} y={98 + Math.floor(i / 4) * 62} w={140} h={48} title={title} sub={sub} color={PAL.cyan} />
        ))}
        <Arrow x1={320} y1={212} x2={320} y2={236} color={PAL.mint} />
        <Box x={150} y={238} w={340} h={44} title="Java SE compatibility test suite (TCK)" sub="certified builds behave the same for your code" color={PAL.mint} dashed />
      </svg>
    </Figure>
  )
}
