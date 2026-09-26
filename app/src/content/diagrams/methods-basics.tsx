/** Diagrams for the "Methods" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

const X0 = 20
const CW = 7.8 // advance of one 13 px monospace character

/** The parts of a declaration (the notes' example, with a body) and what one call does. */
export function MethodAnatomy() {
  const decl = 'public static int sum(int a, int b) throws IOException {'
  const at = (i: number) => X0 + i * CW
  // ly: the label's baseline; "return type" sits higher so it doesn't collide with "name".
  const parts: { from: number; to: number; label: string; color: string; ly: number }[] = [
    { from: 0, to: 13, label: 'modifiers', color: PAL.magenta, ly: 24 },
    { from: 14, to: 17, label: 'return type', color: PAL.cyan, ly: 10 },
    { from: 18, to: 21, label: 'name', color: PAL.mint, ly: 24 },
    { from: 21, to: 35, label: 'parameters', color: PAL.amber, ly: 24 },
    { from: 36, to: 54, label: 'throws clause', color: PAL.muted, ly: 24 },
  ]
  const flow = [
    { t: 'sum(2, 5)', s: 'call: arguments', c: PAL.mint },
    { t: 'a = 2, b = 5', s: 'parameters (copies)', c: PAL.amber },
    { t: 'return 7', s: 'body runs, returns', c: PAL.cyan },
    { t: 'price = 7', s: 'caller uses the value', c: PAL.border },
  ]
  return (
    <Figure caption="A declaration: modifiers, return type, name, parameter list, an optional throws clause and the body. The signature is only the name and the parameter types, sum(int, int). A call evaluates the arguments, copies their values into the parameters, runs the body in a new frame, and the returned value takes the place of the call.">
      <svg viewBox="0 0 560 250" width="100%" style={{ minWidth: 500 }} role="img" aria-labelledby="anatomy-title">
        <title id="anatomy-title">
          public static int sum(int a, int b) throws IOException, with its parts labelled, and a call sum(2, 5) flowing into
          parameters a = 2 and b = 5, a return of 7, and price = 7 in the caller
        </title>
        {parts.map((p) => (
          <g key={p.label}>
            <Txt x={(at(p.from) + at(p.to)) / 2} y={p.ly} anchor="middle" size={9.5} color={p.color} weight={600}>
              {p.label}
            </Txt>
            <path d={`M${at(p.from) + 1},36 V31 H${at(p.to) - 1} V36`} fill="none" stroke={p.color} strokeWidth={1.3} />
            {p.ly < 20 && <line x1={(at(p.from) + at(p.to)) / 2} y1={p.ly + 3} x2={(at(p.from) + at(p.to)) / 2} y2={31} stroke={p.color} strokeWidth={1} />}
          </g>
        ))}
        <Txt x={X0} y={54} size={13} color={PAL.ink} weight={600}>
          {decl}
        </Txt>
        <Txt x={at(4)} y={74} size={13} color={PAL.muted}>
          int total = a + b;
        </Txt>
        <Txt x={at(4)} y={92} size={13} color={PAL.muted}>
          return total;
        </Txt>
        <Txt x={X0} y={110} size={13} color={PAL.ink}>
          {'}'}
        </Txt>
        <Txt x={at(26)} y={78} size={10} color={PAL.amber} weight={600}>
          signature: sum(int, int)
        </Txt>
        <Txt x={at(26)} y={92} size={9} color={PAL.dim}>
          name + parameter types only
        </Txt>
        <Txt x={at(26)} y={104} size={9} color={PAL.dim}>
          (not the return type, names or throws)
        </Txt>
        {flow.map((f, i) => (
          <g key={f.t}>
            <Box x={20 + i * 140} y={150} w={110} h={40} title={f.t} sub={f.s} color={f.c} />
            {i < flow.length - 1 && <Arrow x1={130 + i * 140} y1={170} x2={160 + i * 140} y2={170} color={PAL.dim} />}
          </g>
        ))}
        <Txt x={20} y={142} size={9} color={PAL.dim}>
          int price = sum(2, 5);
        </Txt>
        <Txt x={20} y={214} size={9} color={PAL.dim}>
          arguments are evaluated left to right, then copied; the body runs in its own stack frame
        </Txt>
      </svg>
    </Figure>
  )
}
