/** Diagrams for the "Overloading" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

type Phase = { n: number; title: string; allows: string; examples: string[]; color: string }

const PHASES: Phase[] = [
  { n: 1, title: 'Strict', allows: 'identity and widening only', examples: ['byte → int', 'int → long', 'String → Object'], color: PAL.cyan },
  { n: 2, title: 'Loose', allows: 'also boxing and unboxing', examples: ['int → Integer → Object', 'Integer → int → long'], color: PAL.magenta },
  { n: 3, title: 'Varargs', allows: 'also packs extra arguments into an array', examples: ['f(1, 2, 3) → f(int...)', 'f() → f(int...)'], color: PAL.amber },
]

const BOX_W = 318
const BOX_H = 66
const GAP = 22
const BUS = 368

/** The three phases of overload resolution (JLS §15.12.2), and what happens inside the phase that finds a match. */
export function OverloadPhases() {
  const boxY = (i: number) => 8 + i * (BOX_H + GAP)
  const noneY = boxY(3)
  const panelY = noneY + 44
  return (
    <Figure caption="How javac chooses among overloads. It tries three phases in order, each allowing more conversions than the one before. The first phase that finds at least one applicable method ends the search, even if a later phase would have found a method that looks like a better fit. Inside that phase, the most specific method wins; if there is no single most specific one, the call is ambiguous. If no phase finds anything, no method can be applied. All of this happens at compile time, from the static types of the arguments.">
      <svg viewBox="0 0 400 452" width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="phases-title">
        <title id="phases-title">
          Phase 1 allows identity and widening conversions only. If nothing applies, phase 2 also allows boxing and unboxing.
          If still nothing applies, phase 3 also allows varargs. The first phase with an applicable method picks the most
          specific one, or reports an ambiguity; if no phase finds one, the call doesn't compile.
        </title>
        {PHASES.map((p, i) => {
          const y = boxY(i)
          return (
            <g key={p.n}>
              <rect x={8} y={y} width={BOX_W} height={BOX_H} rx={9} fill={PAL.surface} stroke={p.color} strokeWidth={1.5} />
              <Txt x={20} y={y + 20} size={11} color={p.color} weight={700}>
                {`Phase ${p.n} · ${p.title}`}
              </Txt>
              <Txt x={20} y={y + 36} size={9.5} color={PAL.muted}>
                {p.allows}
              </Txt>
              {p.examples.map((e, k) => (
                <Txt key={e} x={20 + k * (p.examples.length === 3 ? 100 : 150)} y={y + 55} size={9.5} color={PAL.ink}>
                  {e}
                </Txt>
              ))}
              <line x1={8 + BOX_W} y1={y + BOX_H / 2} x2={BUS} y2={y + BOX_H / 2} stroke={PAL.mint} strokeWidth={1.4} />
              <Txt x={(8 + BOX_W + BUS) / 2} y={y + BOX_H / 2 - 5} size={8.5} anchor="middle" color={PAL.mint}>
                found
              </Txt>
              <Arrow x1={167} y1={y + BOX_H + 1} x2={167} y2={y + BOX_H + GAP - 1} color={PAL.dim} />
              <Txt x={176} y={y + BOX_H + 15} size={8.5} color={PAL.dim}>
                {i < 2 ? 'none applicable: next phase' : 'none applicable'}
              </Txt>
            </g>
          )
        })}
        <line x1={BUS} y1={boxY(0) + BOX_H / 2} x2={BUS} y2={panelY - 8} stroke={PAL.mint} strokeWidth={1.4} />
        <Arrow x1={BUS} y1={panelY - 9} x2={BUS} y2={panelY - 1} color={PAL.mint} />

        <rect x={8} y={noneY} width={BOX_W} height={26} rx={7} fill={PAL.void} stroke={PAL.rose} strokeWidth={1.2} />
        <Txt x={8 + BOX_W / 2} y={noneY + 17} anchor="middle" size={9.5} color={PAL.rose}>
          compile error: no suitable method found
        </Txt>

        <rect x={8} y={panelY} width={384} height={452 - panelY - 6} rx={9} fill={PAL.surface} stroke={PAL.mint} strokeWidth={1.3} strokeDasharray="5 4" />
        <Txt x={20} y={panelY + 20} size={11} color={PAL.mint} weight={700}>
          In the first phase that finds methods
        </Txt>
        <Txt x={20} y={panelY + 38} size={9.5} color={PAL.ink}>
          pick the most specific: its parameter types are
        </Txt>
        <Txt x={20} y={panelY + 52} size={9.5} color={PAL.ink}>
          subtypes of every other candidate&apos;s
        </Txt>
        <Txt x={20} y={panelY + 68} size={9} color={PAL.muted}>
          int beats long · String beats Object · char[] beats Object
        </Txt>
        <rect x={20} y={panelY + 80} width={172} height={40} rx={7} fill={PAL.void} stroke={PAL.mint} strokeWidth={1.1} />
        <Txt x={106} y={panelY + 96} anchor="middle" size={9.5} color={PAL.mint} weight={600}>
          exactly one: chosen
        </Txt>
        <Txt x={106} y={panelY + 111} anchor="middle" size={8.5} color={PAL.dim}>
          written into the class file
        </Txt>
        <rect x={208} y={panelY + 80} width={172} height={40} rx={7} fill={PAL.void} stroke={PAL.rose} strokeWidth={1.1} />
        <Txt x={294} y={panelY + 96} anchor="middle" size={9.5} color={PAL.rose} weight={600}>
          a tie: compile error
        </Txt>
        <Txt x={294} y={panelY + 111} anchor="middle" size={8.5} color={PAL.dim}>
          &quot;reference to m is ambiguous&quot;
        </Txt>
      </svg>
    </Figure>
  )
}
