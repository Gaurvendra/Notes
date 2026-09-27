/** Diagrams for the "Packages & Access Modifiers" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

/** The four access levels as nested regions around one class, with a class that can see each level. */
export function VisibilityRings() {
  const rings = [
    { x: 10, y: 10, w: 540, h: 262, c: PAL.mint, label: 'public: everywhere', who: 'class Report (any package)', wx: 380, wy: 32 },
    { x: 34, y: 44, w: 492, h: 214, c: PAL.amber, label: 'protected: + subclasses in other packages', who: 'class Savings extends Account (bank.products)', wx: 206, wy: 244 },
    { x: 58, y: 78, w: 444, h: 150, c: PAL.cyan, label: 'no modifier (package-private): same package', who: 'class Teller (bank.core)', wx: 324, wy: 214 },
    { x: 82, y: 112, w: 396, h: 78, c: PAL.magenta, label: 'private: the class itself (and its nested classes)', who: '', wx: 0, wy: 0 },
  ]
  return (
    <Figure caption="Access levels as nested regions around class Account in package bank.core. Each level includes everything inside it: package-private code is visible to the whole package, protected adds subclasses in other packages (only through their own type), and public reaches everywhere. private stays inside Account and the classes nested in it.">
      <svg viewBox="0 0 560 282" width="100%" style={{ minWidth: 480 }} role="img" aria-labelledby="rings-title">
        <title id="rings-title">
          Nested regions: public outermost, then protected, then package-private, then private around class Account; example
          classes Report, Savings and Teller placed in the regions that can see Account's members
        </title>
        {rings.map((r) => (
          <g key={r.label}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={14} fill="none" stroke={r.c} strokeWidth={1.4} strokeDasharray={r.c === PAL.mint ? undefined : '6 4'} />
            <Txt x={r.x + 12} y={r.y + 18} size={10} color={r.c} weight={600}>
              {r.label}
            </Txt>
            {r.who && (
              <Txt x={r.wx} y={r.wy} size={9} color={PAL.muted}>
                {r.who}
              </Txt>
            )}
          </g>
        ))}
        <rect x={190} y={140} width={180} height={40} rx={8} fill={PAL.surface} stroke={PAL.magenta} strokeWidth={1.4} />
        <Txt x={280} y={157} anchor="middle" size={11} color={PAL.ink} weight={600}>
          class Account
        </Txt>
        <Txt x={280} y={172} anchor="middle" size={9} color={PAL.dim}>
          package bank.core
        </Txt>
      </svg>
    </Figure>
  )
}
