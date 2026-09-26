// Execution of a classic switch on an int, exactly as the JLS defines it (§14.11.3): control jumps to the matching
// case label, or to `default` if no label matches (wherever `default` is written), or past the switch if there is no
// default; with colon labels it then runs every following arm until a `break` or the end ("fall-through"); with arrow
// labels (Java 14) only the matching arm runs. Pure functions: shared by src/content/mdx/SwitchFlow.tsx and
// scripts/check-content.mjs, which checks them against the JVM-verified output of the notes' example.

/**
 * The example from the notes: `switch (a + b)` with `default` in the middle. Each arm: its labels (numbers, or
 * 'default'), what it prints, and whether it ends with `break`.
 */
export const NOTES_EXAMPLE = [
  { labels: [3], prints: ['a+b is 3'], hasBreak: false },
  { labels: [4], prints: ['a+b is 4'], hasBreak: true },
  { labels: ['default'], prints: ['{value}'], hasBreak: false },
  { labels: [2], prints: ['a+b is 2'], hasBreak: true },
]

/** Index of the arm control jumps to, or -1 when nothing matches and there is no default. */
export function entryArm(arms, value) {
  const match = arms.findIndex((arm) => arm.labels.includes(value))
  if (match >= 0) return match
  return arms.findIndex((arm) => arm.labels.includes('default'))
}

/**
 * Run the switch. Returns the arms executed (in order) and the printed lines. `arrow` selects `case 3 ->` labels,
 * which never fall through (a `break` is then redundant).
 */
export function run(arms, value, arrow = false) {
  const start = entryArm(arms, value)
  const executed = []
  const output = []
  if (start < 0) return { start, executed, output }
  for (let i = start; i < arms.length; i++) {
    executed.push(i)
    for (const line of arms[i].prints) output.push(line.replace('{value}', String(value)))
    if (arrow || arms[i].hasBreak) break
  }
  return { start, executed, output }
}
