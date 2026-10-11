/** Diagrams for "The Object Class Contracts" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, PAL, Txt } from '../svg'

const BUCKETS = 8
const CELL = 44
const LEFT = (400 - BUCKETS * CELL) / 2

/** How a hash map finds a key: hashCode picks the bucket, equals checks the entries in it. */
export function HashLookup() {
  const bucketY = 104
  const chosen = 2
  const cx = LEFT + chosen * CELL + CELL / 2
  return (
    <Figure caption="Why equal objects must have equal hash codes. A HashMap (and HashSet, which uses one inside) first turns key.hashCode() into a bucket number and then calls equals() only on the entries in that bucket, after checking that their stored hash codes match. If two equal keys had different hash codes, the lookup would search the wrong bucket and never compare them.">
      <svg viewBox="0 0 400 382" width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="hash-lookup-title">
        <title id="hash-lookup-title">
          map.get(key): key.hashCode() is 1042, which selects bucket 2 of 8. Bucket 2 holds two entries, keys k2 (hash code 3090)
          and k1 (hash code 1042). The lookup skips the entry whose hash code differs and calls key.equals on the one whose hash code
          matches, which returns true, so its value is returned.
        </title>
        <rect x={8} y={8} width={384} height={30} rx={7} fill={PAL.void} stroke={PAL.border} strokeWidth={1} />
        <Txt x={20} y={28} size={10.5} color={PAL.ink}>
          map.get(key)
        </Txt>
        <Txt x={128} y={28} size={10} color={PAL.muted}>
          key.hashCode() = 1042
        </Txt>
        <Arrow x1={cx} y1={40} x2={cx} y2={bucketY - 4} color={PAL.cyan} />
        <Txt x={cx + 10} y={64} size={9.5} color={PAL.cyan}>
          1042 → bucket 2 (of 8)
        </Txt>
        <Txt x={cx + 10} y={78} size={9} color={PAL.dim}>
          spread the bits, keep the low ones
        </Txt>
        {Array.from({ length: BUCKETS }, (_, i) => (
          <g key={i}>
            <rect
              x={LEFT + i * CELL}
              y={bucketY}
              width={CELL}
              height={30}
              fill={i === chosen ? PAL.surface : PAL.void}
              stroke={i === chosen ? PAL.cyan : PAL.border}
              strokeWidth={i === chosen ? 1.6 : 1}
            />
            <Txt x={LEFT + i * CELL + CELL / 2} y={bucketY + 19} size={10} color={i === chosen ? PAL.cyan : PAL.dim} anchor="middle">
              {String(i)}
            </Txt>
          </g>
        ))}
        <Arrow x1={cx} y1={bucketY + 31} x2={cx} y2={bucketY + 54} color={PAL.dim} />
        <rect x={40} y={bucketY + 56} width={320} height={44} rx={7} fill={PAL.surface} stroke={PAL.amber} strokeWidth={1.2} />
        <Txt x={52} y={bucketY + 74} size={10} color={PAL.ink}>
          entry: key k2, stored hash 3090
        </Txt>
        <Txt x={52} y={bucketY + 90} size={9.5} color={PAL.amber}>
          stored hash ≠ 1042: skipped, equals never called
        </Txt>
        <Arrow x1={cx} y1={bucketY + 101} x2={cx} y2={bucketY + 124} color={PAL.dim} />
        <rect x={40} y={bucketY + 126} width={320} height={44} rx={7} fill={PAL.surface} stroke={PAL.mint} strokeWidth={1.2} />
        <Txt x={52} y={bucketY + 144} size={10} color={PAL.ink}>
          entry: key k1, stored hash 1042
        </Txt>
        <Txt x={52} y={bucketY + 160} size={9.5} color={PAL.mint}>
          same hash → key.equals(k1) → true: found
        </Txt>
        <rect x={8} y={bucketY + 190} width={384} height={80} rx={9} fill={PAL.void} stroke={PAL.rose} strokeWidth={1.1} strokeDasharray="4 3" />
        <Txt x={20} y={bucketY + 210} size={10} color={PAL.rose} weight={700}>
          equals overridden, hashCode not:
        </Txt>
        <Txt x={20} y={bucketY + 228} size={9.5} color={PAL.ink}>
          an equal key has an unrelated identity hash code,
        </Txt>
        <Txt x={20} y={bucketY + 243} size={9.5} color={PAL.ink}>
          so it usually lands in another bucket: get returns
        </Txt>
        <Txt x={20} y={bucketY + 258} size={9.5} color={PAL.ink}>
          null and a HashSet happily stores a duplicate
        </Txt>
      </svg>
    </Figure>
  )
}
