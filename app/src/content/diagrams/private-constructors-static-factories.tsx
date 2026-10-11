/** Diagrams for the "Private Constructors & Static Factories" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

type Step = { title: string; sub: string }

const PANEL_H = 206

/** One kind of factory: the calling code, two steps with an arrow between them, and a one-line summary. */
function Panel({ y, color, title, code, first, link, second, summary }: { y: number; color: string; title: string; code: string; first: Step; link: string; second: Step; summary: string }) {
  const box = (top: number, s: Step) => (
    <g>
      <rect x={40} y={top} width={320} height={42} rx={7} fill={PAL.void} stroke={color} strokeWidth={1.1} />
      <Txt x={200} y={top + 18} size={10.5} color={PAL.ink} anchor="middle">
        {s.title}
      </Txt>
      <Txt x={200} y={top + 33} size={9.5} color={PAL.muted} anchor="middle">
        {s.sub}
      </Txt>
    </g>
  )
  return (
    <g>
      <rect x={8} y={y} width={384} height={PANEL_H} rx={9} fill={PAL.surface} stroke={color} strokeWidth={1.4} />
      <Txt x={20} y={y + 19} size={11.5} color={color} weight={700}>
        {title}
      </Txt>
      <rect x={20} y={y + 28} width={360} height={26} rx={6} fill={PAL.void} stroke={PAL.border} strokeWidth={1} />
      <Txt x={30} y={y + 45} size={10.5} color={PAL.ink}>
        {code}
      </Txt>
      <Arrow x1={200} y1={y + 54} x2={200} y2={y + 71} color={color} />
      {box(y + 72, first)}
      <Arrow x1={200} y1={y + 114} x2={200} y2={y + 133} color={color} />
      <Txt x={210} y={y + 127} size={9.5} color={color}>
        {link}
      </Txt>
      {box(y + 134, second)}
      <Txt x={200} y={y + 195} size={10} color={color} anchor="middle">
        {summary}
      </Txt>
    </g>
  )
}

/** Static factory method vs the GoF Factory Method pattern: the two things the word "factory" is used for. */
export function FactoryKinds() {
  return (
    <Figure caption={`Two different things called factory. A static factory method is a class-level method whose own code chooses what to return: it can reuse an object, check its arguments first, or return a class the caller never sees. The GoF Factory Method is an overridable instance method that the class's other code calls, so each subclass decides what gets created. The notes' "Factory design pattern" example for static methods is the first kind.`}>
      <svg viewBox="0 0 400 432" width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="factory-kinds-title">
        <title id="factory-kinds-title">
          A static factory: Exporter.forFormat("csv") runs static code in Exporter that picks the object to return, here a
          shared instance of a package-private CsvExporter class. The GoF Factory Method: e.export(table) runs the final
          template method in Exporter, which calls newSink(); dynamic dispatch runs CsvExporter's override, which creates a
          CsvSink.
        </title>
        <Panel
          y={8}
          color={PAL.cyan}
          title="Static factory method"
          code={'Exporter e = Exporter.forFormat("csv");'}
          first={{ title: 'static code in Exporter picks the object', sub: 'by the argument: cached, checked, hidden' }}
          link="returns"
          second={{ title: 'CsvExporter.INSTANCE', sub: 'a shared object of a package-private class' }}
          summary="class level: the factory's own code decides"
        />
        <Panel
          y={8 + PANEL_H + 12}
          color={PAL.magenta}
          title="GoF Factory Method"
          code="String text = e.export(table);"
          first={{ title: 'Exporter.export(table)', sub: 'final template: checks, then calls newSink()' }}
          link="dynamic dispatch"
          second={{ title: 'CsvExporter.newSink()', sub: 'the override decides: new CsvSink()' }}
          summary="instance level: a subclass decides, by overriding"
        />
      </svg>
    </Figure>
  )
}
