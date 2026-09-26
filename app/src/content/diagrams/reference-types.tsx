/** Diagrams for the "Reference Types" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

function Node({ x, y, w, h, title, lines = [], color, dashed }: { x: number; y: number; w: number; h: number; title: string; lines?: string[]; color: string; dashed?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={PAL.surface} stroke={color} strokeWidth={1.4} strokeDasharray={dashed ? '5 4' : undefined} />
      <Txt x={x + w / 2} y={y + 17} anchor="middle" size={10.5} color={PAL.ink} weight={600}>
        {title}
      </Txt>
      {lines.map((l, i) => (
        <Txt key={l} x={x + w / 2} y={y + 32 + i * 12} anchor="middle" size={8.5} color={PAL.muted}>
          {l}
        </Txt>
      ))}
    </g>
  )
}

/** Java's kinds of types (JLS §4.1–§4.4). */
export function TypeFamilies() {
  const kinds = [
    { t: 'class types', l: ['String, Integer, Teacher', 'enum & record: classes'] },
    { t: 'interface types', l: ['Person, Runnable, List', '@interface: annotations'] },
    { t: 'array types', l: ['int[], String[][]', 'objects with a length'] },
    { t: 'type variables', l: ['T in List<T>', 'erased at run time'] },
  ]
  const kx = (k: number) => 12 + k * 146
  return (
    <Figure caption="Every Java type is either one of the eight primitive types or a reference type. Reference types come in four kinds: classes (String, enums and records included), interfaces (annotations included), arrays and type variables. The null type has one value, null, which can be assigned to any reference type.">
      <svg viewBox="0 0 600 214" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="types-title">
        <title id="types-title">
          Java types split into primitive types (boolean, byte, short, int, long, char, float, double) and reference types;
          reference types are class, interface, array and type-variable types; the special null type has the single
          value null
        </title>
        <Node x={236} y={6} w={128} h={26} title="Java types" color={PAL.border} />
        {[87, 321, 529].map((cx) => (
          <line key={cx} x1={300} y1={32} x2={cx} y2={54} stroke={PAL.border} strokeWidth={1.2} />
        ))}
        <Node x={12} y={54} w={150} h={54} title="primitive types" lines={['boolean byte short int', 'long char float double']} color={PAL.amber} />
        <Node x={236} y={54} w={170} h={54} title="reference types" lines={['variables hold a reference', 'to an object, or null']} color={PAL.cyan} />
        <Node x={470} y={54} w={118} h={54} title="null type" lines={['one value: null', 'fits any reference']} color={PAL.border} dashed />
        {kinds.map((k, i) => (
          <line key={k.t} x1={321} y1={108} x2={kx(i) + 69} y2={134} stroke={PAL.border} strokeWidth={1.2} />
        ))}
        {kinds.map((k, i) => (
          <Node key={k.t} x={kx(i)} y={134} w={138} h={58} title={k.t} lines={k.l} color={i === 3 ? PAL.magenta : PAL.mint} />
        ))}
        <Txt x={12} y={208} size={8.5} color={PAL.dim}>
          The notes list "Class, String, Interface, Array": String is one of the class types.
        </Txt>
      </svg>
    </Figure>
  )
}
