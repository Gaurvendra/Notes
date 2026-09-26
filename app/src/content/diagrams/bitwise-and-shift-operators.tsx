/** Diagrams for the "Bitwise & Shift Operators" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

/** Why `b >>> 1` on a negative byte isn't the notes' 8-bit picture: promotion to int comes first. */
export function PromotionThenShift() {
  const row = (y: number, label: string, bits: string, value: string, color: string, highlight = 0) => (
    <g>
      <Txt x={10} y={y} size={10} mono={false} color={PAL.muted}>
        {label}
      </Txt>
      <text x={158} y={y} fontSize={11.5} fontFamily="JetBrains Mono, ui-monospace, monospace" xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
        {[...bits].map((c, i) => (
          <tspan key={i} fill={i < highlight && c !== ' ' ? PAL.amber : c === '1' ? color : PAL.dim}>
            {c}
          </tspan>
        ))}
      </text>
      <Txt x={560} y={y} size={10.5} anchor="end" color={color}>
        {value}
      </Txt>
    </g>
  )
  return (
    <Figure caption="Java never shifts a byte: b is first promoted to int by sign extension (amber: 24 copies of the sign bit), and the shift then acts on 32 bits. The zero from >>> lands far to the left, so the result is 2,147,483,619, not the notes' 8-bit answer 01100011 (99). Masking with 0xFF first removes the copied sign bits, and then >>> 1 gives 99. Both results verified on a JVM.">
      <svg viewBox="0 0 570 206" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="pts-title">
        <title id="pts-title">A byte 11000110 is sign-extended to 32 bits before the shift, so b &gt;&gt;&gt; 1 is 2147483619; (b &amp; 0xFF) &gt;&gt;&gt; 1 is 99</title>
        {row(22, 'byte b', '                           11000110', '−58', PAL.cyan)}
        {row(48, 'promoted to int', '11111111 11111111 11111111 11000110', '−58', PAL.cyan, 27)}
        {row(74, 'b >>> 1', '01111111 11111111 11111111 11100011', '2147483619', PAL.rose)}
        <line x1={10} y1={96} x2={560} y2={96} stroke={PAL.border} />
        {row(124, 'b & 0xFF', '00000000 00000000 00000000 11000110', '198', PAL.mint)}
        {row(150, '(b & 0xFF) >>> 1', '00000000 00000000 00000000 01100011', '99', PAL.mint)}
        <Txt x={10} y={190} size={9.5} color={PAL.dim}>
          The notes&apos; 8-bit picture (11000110 &gt;&gt;&gt; 1 = 01100011) is what the masked version computes.
        </Txt>
      </svg>
    </Figure>
  )
}
