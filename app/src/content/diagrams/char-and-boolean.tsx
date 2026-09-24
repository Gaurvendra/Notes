/** Diagrams for the "char & boolean" lesson. */
import { Figure } from '../mdx/diagrams'
import { Box, Caption, PAL, Txt } from '../svg'

/** One string, four views: characters, code points, UTF-16 code units (Java's char values) and UTF-8 bytes. */
export function EncodingLayers() {
  // Columns sized by UTF-8 bytes (64 per byte): A = 1, é = 2, 😀 = 4.
  const cols = [
    { x: 10, w: 64, glyph: 'A', cp: 'U+0041', units: [{ t: "'A'", s: '[0] \\u0041' }], bytes: ['41'] },
    { x: 86, w: 128, glyph: 'é', cp: 'U+00E9', units: [{ t: "'é'", s: '[1] \\u00E9' }], bytes: ['C3', 'A9'] },
    {
      x: 226,
      w: 256,
      glyph: '😀',
      cp: 'U+1F600',
      units: [
        { t: '\\uD83D', s: '[2] high surrogate' },
        { t: '\\uDE00', s: '[3] low surrogate' },
      ],
      bytes: ['F0', '9F', '98', '80'],
    },
  ]
  const GAP = 8
  const row = (i: number) => 18 + i * 56
  return (
    <Figure caption={'The string "Aé😀" four ways. A reader sees 3 characters; they are 3 Unicode code points; Java stores them as 4 char values (the emoji needs a surrogate pair), so length() is 4; a UTF-8 file holds 7 bytes.'}>
      <svg viewBox="0 0 492 246" width="100%" style={{ minWidth: 440 }} role="img" aria-labelledby="enc-title">
        <title id="enc-title">The string A, e-acute, grinning face as characters, code points, UTF-16 char values and UTF-8 bytes</title>
        <Caption x={10} y={row(0) - 6}>WHAT A READER SEES</Caption>
        <Caption x={10} y={row(1) - 6}>UNICODE CODE POINTS</Caption>
        <Caption x={10} y={row(2) - 6}>UTF-16: JAVA&apos;S char VALUES (charAt index)</Caption>
        <Caption x={10} y={row(3) - 6}>UTF-8 BYTES (files, network)</Caption>
        {cols.map((c) => {
          const unitW = (c.w - GAP * (c.units.length - 1)) / c.units.length
          const byteW = (c.w - GAP * (c.bytes.length - 1)) / c.bytes.length
          return (
            <g key={c.cp}>
              <Box x={c.x} y={row(0)} w={c.w} h={30} color={PAL.ink} />
              <Txt x={c.x + c.w / 2} y={row(0) + 21} anchor="middle" size={16} mono={false} color={PAL.ink}>
                {c.glyph}
              </Txt>
              <Box x={c.x} y={row(1)} w={c.w} h={30} title={c.cp} color={PAL.amber} />
              {c.units.map((u, k) => (
                <Box key={u.t} x={c.x + k * (unitW + GAP)} y={row(2)} w={unitW} h={32} title={u.t} sub={u.s} color={c.units.length > 1 ? PAL.magenta : PAL.cyan} />
              ))}
              {c.bytes.map((b, k) => (
                <Box key={k} x={c.x + k * (byteW + GAP)} y={row(3)} w={byteW} h={30} title={b} color={PAL.mint} />
              ))}
            </g>
          )
        })}
        <Txt x={10} y={row(4) - 6} size={9.5} color={PAL.ink}>
          length() = 4 · codePointCount(0, 4) = 3 · getBytes(UTF_8).length = 7
        </Txt>
      </svg>
    </Figure>
  )
}
