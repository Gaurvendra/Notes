#!/usr/bin/env node
// Content checks that need no JDK (decision D-023). Fails the build on:
//  1. lesson data (src/content/lesson-data/*.yaml) that breaks the schema;
//  2. lessons out of sync with project-plan/curriculum.yaml (status: done ⇔ guide + data exist);
//  3. a written lesson below the Definition of Done minimums (quiz, interview levels, flashcards, FAQ, practice…);
//  4. unknown MDX tags, code fences without a language, broken internal links or anchors;
//  5. the IEEE 754 lab's arithmetic disagreeing with answers recorded from the JVM (scripts/fixtures/*.tsv).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import { buildIndex } from './build-index.mjs'
import { bitsOf, decompose, errorOf, exactString, javaToString, parseJava, ulp, valueOf } from '../src/lib/ieee754.mjs'
import * as twos from '../src/lib/twos.mjs'
import * as utf16 from '../src/lib/utf16.mjs'
import * as conv from '../src/lib/conversion.mjs'
import * as bitops from '../src/lib/bitops.mjs'
import * as sw from '../src/lib/switchflow.mjs'
import * as st from '../src/lib/studytime.mjs'
import * as cs from '../src/lib/callstack.mjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const errors = []
const fail = (where, msg) => errors.push(`${where}: ${msg}`)

/* ------------------------------------------------------------ curriculum */
const curriculum = load(fs.readFileSync(path.join(REPO, 'project-plan/curriculum.yaml'), 'utf8'))
const lessons = new Map(curriculum.lessons.map((l) => [l.id, l]))
const tiers = Object.keys(curriculum.tiers).map(Number)
const built = buildIndex()
const index = built.lessons
const dataDir = path.join(APP, 'src/content/lesson-data')
const dataIds = fs.readdirSync(dataDir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''))

for (const id of Object.keys(index)) {
  if (!lessons.has(id)) fail(`lessons/${id}.mdx`, 'no lesson with this id in curriculum.yaml')
  else if (lessons.get(id).status !== 'done') fail(`lessons/${id}.mdx`, 'has a guide, so curriculum.yaml must say status: done')
}
for (const l of lessons.values()) {
  if (l.status === 'done' && !index[l.id]) fail(`curriculum.yaml`, `${l.id} is done but src/content/lessons/${l.id}.mdx is missing`)
  if (l.status === 'done' && !dataIds.includes(l.id)) fail(`curriculum.yaml`, `${l.id} is done but lesson-data/${l.id}.yaml is missing`)
}
for (const id of dataIds) if (!lessons.has(id)) fail(`lesson-data/${id}.yaml`, 'no lesson with this id')

/* ----------------------------------------------------------- lesson data */
const str = (v) => typeof v === 'string' && v.trim().length > 0
const LEVELS = ['fresher', 'mid', 'senior', 'staff']
const TYPES = ['concept', 'code', 'predict-output', 'design', 'behavioural']
function validateData(where, d) {
  for (const k of Object.keys(d)) if (!['quiz', 'interview', 'flashcards'].includes(k)) fail(where, `unknown key ${k}`)
  ;(d.quiz ?? []).forEach((q, i) => {
    if (!str(q.q)) fail(where, `quiz[${i}].q is empty`)
    if (!Array.isArray(q.options) || q.options.length < 2) fail(where, `quiz[${i}] needs at least 2 options`)
    else {
      if (!q.options.some((o) => o.correct === true)) fail(where, `quiz[${i}] has no correct option`)
      q.options.forEach((o, j) => {
        if (!str(o.text) || !str(o.why)) fail(where, `quiz[${i}].options[${j}] needs text and why`)
        if (o.correct !== undefined && typeof o.correct !== 'boolean') fail(where, `quiz[${i}].options[${j}].correct must be true/false`)
      })
    }
    if (/choose all that apply/i.test(q.q ?? '')) fail(where, `quiz[${i}]: don't write "choose all that apply"; the quiz adds it`)
  })
  ;(d.interview ?? []).forEach((q, i) => {
    if (!LEVELS.includes(q.level)) fail(where, `interview[${i}].level must be one of ${LEVELS.join(', ')}`)
    if (q.type !== undefined && !TYPES.includes(q.type)) fail(where, `interview[${i}].type must be one of ${TYPES.join(', ')}`)
    if (!str(q.q) || !str(q.answer)) fail(where, `interview[${i}] needs q and answer`)
    for (const k of ['followUps', 'redFlags']) if (q[k] !== undefined && !(Array.isArray(q[k]) && q[k].every(str))) fail(where, `interview[${i}].${k} must be a list of strings`)
  })
  ;(d.flashcards ?? []).forEach((c, i) => {
    if (!str(c.front) || !str(c.back)) fail(where, `flashcards[${i}] needs front and back`)
  })
}
const data = {}
for (const id of dataIds) {
  data[id] = load(fs.readFileSync(path.join(dataDir, `${id}.yaml`), 'utf8')) ?? {}
  validateData(`lesson-data/${id}.yaml`, data[id])
}

/* ----------------------------------------------------------- memory traces */
// MemoryStepper traces (src/content/traces/*.yaml): structure, code lines, every arrow points to an object of the
// same step, unique object ids, and output that only grows from step to step.
const traceDir = path.join(APP, 'src/content/traces')
const traceIds = fs.existsSync(traceDir) ? fs.readdirSync(traceDir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, '')) : []
for (const id of traceIds) {
  const where = `traces/${id}.yaml`
  const t = load(fs.readFileSync(path.join(traceDir, `${id}.yaml`), 'utf8')) ?? {}
  for (const k of Object.keys(t)) if (!['title', 'code', 'steps'].includes(k)) fail(where, `unknown key ${k}`)
  if (!str(t.title) || !str(t.code)) fail(where, 'needs a title and code')
  if (!Array.isArray(t.steps) || t.steps.length < 2) { fail(where, 'needs at least 2 steps'); continue }
  const lineCount = String(t.code).replace(/\n$/, '').split('\n').length
  let prevOut = ''
  const checkVar = (w, v) => {
    if (!str(v?.name)) fail(w, 'a variable needs a name')
    if ((v.ref === undefined) === (v.value === undefined)) fail(w, `${v.name}: give exactly one of value or ref`)
    for (const k of Object.keys(v)) if (!['name', 'value', 'ref', 'type', 'highlight'].includes(k)) fail(w, `${v.name}: unknown key ${k}`)
  }
  t.steps.forEach((s, i) => {
    const w = `${where} step ${i + 1}`
    for (const k of Object.keys(s)) if (!['line', 'note', 'frames', 'heap', 'out'].includes(k)) fail(w, `unknown key ${k}`)
    if (!Number.isInteger(s.line) || s.line < 1 || s.line > lineCount) fail(w, `line ${s.line} is outside the code (1–${lineCount})`)
    if (!str(s.note)) fail(w, 'needs a note')
    if (!Array.isArray(s.frames)) fail(w, 'needs frames (use [] for an empty stack)')
    const heap = s.heap ?? []
    const ids = heap.map((o) => o.id)
    if (new Set(ids).size !== ids.length) fail(w, 'duplicate heap ids')
    for (const o of heap) {
      if (!str(o.id) || !str(o.label)) fail(w, 'a heap object needs an id and a label')
      for (const k of Object.keys(o)) if (!['id', 'label', 'fields', 'pool', 'gc', 'highlight'].includes(k)) fail(w, `${o.id}: unknown key ${k}`)
      for (const f of o.fields ?? []) checkVar(w, f)
    }
    const refs = [...(s.frames ?? []).flatMap((f) => f.vars ?? []), ...heap.flatMap((o) => o.fields ?? [])].filter((v) => v.ref !== undefined)
    for (const f of s.frames ?? []) {
      if (!str(f.name)) fail(w, 'a frame needs a name')
      for (const v of f.vars ?? []) checkVar(w, v)
    }
    for (const v of refs) if (!ids.includes(v.ref)) fail(w, `${v.name} points to ${v.ref}, which is not in this step's heap`)
    if (s.out !== undefined) {
      if (typeof s.out !== 'string') fail(w, 'out must be a string')
      else if (!s.out.startsWith(prevOut)) fail(w, 'output must only grow from one step to the next')
      else prevOut = s.out
    }
  })
}

/* ------------------------------------------- Definition of Done minimums */
const ALLOWED_TAGS = new Set([
  'Callout', 'MythVsFact', 'VersionBadge', 'FaqItem', 'CheatSheet', 'Tabs', 'TabItem', 'FileTree', 'Figure', 'LayerDiagram',
  'BitLayout', 'FloatSpacing', 'FloatLab', 'PredictOutput', 'Reveal', 'Exercise', 'Starter', 'Tests', 'Solution', 'Quiz',
  'InterviewSet', 'Flashcards', 'MemoryDiagram', 'Stepper', 'Step', 'CheckpointQuiz', 'IntegerLab', 'CharInspector', 'CastExplorer', 'BitwiseLab', 'SwitchFlow',
  'CallStackLab', 'MemoryStepper',
])
const ROUTES = new Set(['/', '/start', '/path', '/roadmap', '/revision', '/practice', '/interview', '/cheatsheets', '/glossary', '/java-versions', '/notes-audit', '/profile', '/settings'])
const lessonDir = path.join(APP, 'src/content/lessons')

function anchorsOf(id) {
  const info = index[id]
  if (!info) return undefined
  return new Set([...info.headings.map((h) => h.slug), ...info.exercises.map((e) => e.anchor), ...info.puzzles.map((p) => p.anchor)])
}

function checkLink(where, href, selfId) {
  if (/^(https?:|mailto:)/.test(href)) return
  const m = /^(\/[^#]*)?(?:#(.*))?$/.exec(href)
  if (!m) return fail(where, `odd link ${href}`)
  const [, route, hash] = m
  if (!route) {
    if (hash && selfId && !anchorsOf(selfId)?.has(hash)) fail(where, `no anchor #${hash} in this lesson`)
    return
  }
  const lesson = /^\/lessons\/([a-z0-9-]+)\/?$/.exec(route)
  const checkpoint = /^\/checkpoints\/(\d+)\/?$/.exec(route)
  if (lesson) {
    if (!lessons.has(lesson[1])) return fail(where, `link to unknown lesson ${href}`)
    if (hash) {
      const anchors = anchorsOf(lesson[1])
      if (!anchors) fail(where, `link to #${hash} in ${lesson[1]}, which has no guide yet`)
      else if (!anchors.has(hash)) fail(where, `no anchor #${hash} in lesson ${lesson[1]}`)
    }
  } else if (checkpoint) {
    if (!tiers.includes(Number(checkpoint[1]))) fail(where, `link to unknown checkpoint ${href}`)
  } else if (!ROUTES.has(route.replace(/\/$/, '') || '/')) fail(where, `link to unknown page ${href}`)
}

const linksIn = (text) => [...text.matchAll(/\]\(([^)\s]+)\)|href=["']([^"']+)["']/g)].map((m) => m[1] ?? m[2])

/** Checks tags and code fences of an MDX file and returns its prose lines (outside code fences). */
function scanMdx(where, src) {
  const imported = new Set([...src.matchAll(/^import \{([^}]+)\} from/gm)].flatMap((m) => m[1].split(',').map((s) => s.trim())))
  let inFence = false
  const prose = []
  src.split('\n').forEach((line, n) => {
    const fence = /^(\s*)```(\S*)/.exec(line)
    if (fence) {
      if (!inFence && !fence[2]) fail(`${where}:${n + 1}`, 'code fence without a language (use text for plain output)')
      inFence = !inFence
      return
    }
    if (inFence) return
    prose.push(line)
    for (const t of line.replace(/`[^`]*`/g, '').matchAll(/<([A-Z]\w*)/g)) if (!ALLOWED_TAGS.has(t[1]) && !imported.has(t[1])) fail(`${where}:${n + 1}`, `unknown component <${t[1]}>`)
    for (const t of line.matchAll(/<MemoryStepper\s+trace="([^"]*)"/g)) if (!traceIds.includes(t[1])) fail(`${where}:${n + 1}`, `no memory trace src/content/traces/${t[1]}.yaml`)
    for (const t of line.matchAll(/<CallStackLab\b[^>]*program="([^"]*)"/g)) if (!(t[1] in cs.PROGRAMS)) fail(`${where}:${n + 1}`, `CallStackLab has no program "${t[1]}"`)
  })
  return prose
}

for (const [id, info] of Object.entries(index)) {
  const where = `lessons/${id}.mdx`
  const src = fs.readFileSync(path.join(lessonDir, `${id}.mdx`), 'utf8')
  const fm = info.frontmatter
  for (const k of ['title', 'description', 'estimatedMinutes', 'fastTrackMinutes', 'sourcePages', 'javaBaseline', 'lastVerified']) {
    if (fm[k] === undefined) fail(where, `front-matter needs ${k}`)
  }
  if (lessons.get(id) && fm.title !== lessons.get(id).label) fail(where, `title "${fm.title}" must equal the curriculum label "${lessons.get(id).label}"`)

  const prose = scanMdx(where, src)
  for (const href of linksIn(prose.join('\n'))) checkLink(where, href, id)

  const count = (re) => (prose.join('\n').match(re) ?? []).length
  const d = data[id] ?? {}
  const levels = new Set((d.interview ?? []).map((q) => q.level))
  const minimums = [
    ['quiz questions', d.quiz?.length ?? 0, 8],
    ['interview questions', d.interview?.length ?? 0, 10],
    ['interview levels', levels.size, 4],
    ['flashcards', d.flashcards?.length ?? 0, 8],
    ['FAQ entries', count(/<FaqItem\b/g), 8],
    ['predict-the-output puzzles', info.puzzles.length, 3],
    ['exercises', info.exercises.length, 3],
    ['myths vs facts', count(/<MythVsFact\b/g), 1],
  ]
  for (const [what, n, min] of minimums) if (n < min) fail(where, `${n} ${what}, the Definition of Done needs ${min}`)
  for (const section of ['why-this-matters', 'tldr', 'mental-model', 'scenarios', 'myths-vs-facts', 'doubts-cleared', 'senior-lens', 'modern-java', 'practice', 'quiz', 'interview-corner', 'cheat-sheet', 'references']) {
    if (!info.headings.some((h) => h.slug === section)) fail(where, `missing section ## ${section}`)
  }
}
for (const [id, d] of Object.entries(data)) {
  const text = JSON.stringify(d)
  for (const href of linksIn(text.replace(/\\"/g, '"'))) checkLink(`lesson-data/${id}.yaml`, href, id)
}

/* ------------------------------------------------------------ checkpoints */
const cpDataDir = path.join(APP, 'src/content/checkpoint-data')
const cpDataFiles = fs.existsSync(cpDataDir) ? fs.readdirSync(cpDataDir).filter((f) => f.endsWith('.yaml')) : []
const cpData = {}
for (const file of cpDataFiles) {
  const where = `checkpoint-data/${file}`
  const m = /^tier-(\d+)\.yaml$/.exec(file)
  if (!m || !tiers.includes(Number(m[1]))) {
    fail(where, 'must be named tier-<n>.yaml for an existing tier')
    continue
  }
  cpData[m[1]] = load(fs.readFileSync(path.join(cpDataDir, file), 'utf8')) ?? {}
  validateData(where, cpData[m[1]])
}
for (const [tier, info] of Object.entries(built.checkpoints)) {
  const where = `checkpoints/tier-${tier}.mdx`
  if (!tiers.includes(Number(tier))) fail(where, `no tier ${tier} in curriculum.yaml`)
  const src = fs.readFileSync(path.join(APP, 'src/content/checkpoints', `tier-${tier}.mdx`), 'utf8')
  const prose = scanMdx(where, src)
  const anchors = new Set([...info.headings.map((h) => h.slug), ...info.exercises.map((e) => e.anchor), ...info.puzzles.map((p) => p.anchor)])
  for (const href of linksIn(prose.join('\n'))) {
    if (href.startsWith('#')) {
      if (!anchors.has(href.slice(1))) fail(where, `no anchor ${href} in this checkpoint`)
    } else checkLink(where, href)
  }
  const d = cpData[tier] ?? {}
  if (!/<CheckpointQuiz\b/.test(src)) fail(where, 'needs <CheckpointQuiz />')
  if (info.exercises.length < 1) fail(where, 'needs a coding challenge (<Exercise>)')
  if ((d.interview?.length ?? 0) < 5) fail(where, `mock interview needs ≥ 5 questions in checkpoint-data/tier-${tier}.yaml`)
}

/* ------------------------------------------------ IEEE 754 lab vs the JVM */
const fixtures = path.join(APP, 'scripts/fixtures')
const rows = fs.readFileSync(path.join(fixtures, 'float-lab.tsv'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'))
for (const row of rows) {
  const [format, input, hex, toString, exact, kind, ulpText] = row.split('\t')
  const value = parseJava(input, format)
  const bits = bitsOf(value, format)
  const actual = { bits: bits.toString(16), toString: javaToString(value, format), exact: exactString(bits, format), kind: decompose(bits, format).kind, ulp: javaToString(ulp(value, format), format) }
  const expected = { bits: hex, toString, exact, kind, ulp: ulpText }
  for (const k of Object.keys(expected)) if (actual[k] !== expected[k]) fail('IEEE 754 lab', `${format} ${input} ${k}: JVM says ${expected[k].slice(0, 80)}, lab says ${actual[k].slice(0, 80)}`)
}
const randomRows = fs.readFileSync(path.join(fixtures, 'float-lab-random.tsv'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'))
for (const row of randomRows) {
  const [format, hex, toString, ulpText] = row.split('\t')
  const bits = BigInt(`0x${hex}`)
  const value = valueOf(bits, format)
  if (javaToString(value, format) !== toString) fail('IEEE 754 lab', `${format} ${hex} toString: JVM says ${toString}`)
  if (javaToString(ulp(value, format), format) !== ulpText) fail('IEEE 754 lab', `${format} ${hex} ulp: JVM says ${ulpText}`)
  if (bitsOf(parseJava(toString, format), format) !== bits) fail('IEEE 754 lab', `${format} ${hex}: parsing ${toString} gives other bits`)
}
// Error readout (typed − stored); expected values computed on the JVM with
// new BigDecimal(text).subtract(new BigDecimal(x)).round(new MathContext(3)).
for (const [text, format, expected] of [
  ['0.7', 'float', '1.19e-8'],
  ['0.1', 'double', '-5.55e-18'],
  ['16777217', 'float', '1.00'],
  ['4.125', 'float', '0'],
  ['5e-324', 'double', '5.93e-326'],
  ['1e-45', 'float', '-4.01e-46'],
]) {
  const actual = errorOf(text, bitsOf(parseJava(text, format), format), format)
  if (actual !== expected) fail('IEEE 754 lab', `errorOf(${text}, ${format}): JVM says ${expected}, lab says ${actual}`)
}

/* ------------------------------------------ two's-complement integer lab */
// Expected values: JVM-verified in AUDIT.md (batch 1) or fixed by the JLS (§3.10.1 literals, §4.2.1 ranges,
// §15.15.4 −MIN_VALUE, §15.15.5 ~x == −x − 1, §5.1.3 narrowing keeps the low bits).
const expectTwos = (label, actual, expected) => {
  if (actual !== expected) fail('integer lab', `${label}: expected ${expected}, got ${actual}`)
}
expectTwos('(byte) 128', twos.wrap(128n, 8), -128n)
expectTwos('(byte) 148', twos.wrap(148n, 8), -108n)
expectTwos('Integer.MAX_VALUE + 1', twos.add(2147483647n, 1n, 32).value, -2147483648n)
expectTwos('MAX + 1 overflows', twos.add(2147483647n, 1n, 32).overflow, true)
expectTwos('-Integer.MIN_VALUE', twos.negate(-2147483648n, 32).value, -2147483648n)
expectTwos('~5', twos.invert(5n, 8).value, -6n)
expectTwos('+3 in 4 bits', twos.toBits(3n, 4), '0011')
expectTwos('-3 in 4 bits', twos.toBits(-3n, 4), '1101')
expectTwos('+3 + -3', twos.add(3n, -3n, 4).value, 0n)
expectTwos('Integer.toHexString(-1)', twos.toHex(-1n, 32), 'FFFFFFFF')
expectTwos('Integer.toUnsignedString(-1)', twos.unsigned(-1n, 32), 4294967295n)
expectTwos('Long.MIN_VALUE', twos.minValue(64), -9223372036854775808n)
expectTwos('Byte.MAX_VALUE', twos.maxValue(8), 127n)
// Values printed in the integer-types lesson (JLS arithmetic; also listed in VERIFY_LATER.md for a JVM run).
expectTwos('(byte) 200', twos.wrap(200n, 8), -56n)
expectTwos('Byte.toUnsignedInt((byte) 0xC8)', twos.unsigned(-56n, 8), 200n)
expectTwos('50_000 * 50_000', twos.multiply(50000n, 50000n, 32).value, -1794967296n)
expectTwos('24 * 60 * 60 * 1000 * 1000 (int)', twos.wrap(24n * 60n * 60n * 1000n * 1000n, 32), 500654080n)
expectTwos('Integer.MAX_VALUE + 1 exact', twos.add(2147483647n, 1n, 32).exact, 2147483648n)
for (const [literal, value] of [['017', 15n], ['0x7F', 127n], ['0b1010', 10n], ['1_000_000', 1000000n], ['100L', 100n], ['08', undefined], ['_1', undefined], ['1_', undefined], ['0x', undefined]]) {
  expectTwos(`literal ${literal}`, twos.parseInteger(literal), value)
}
for (let i = 0; i < 2000; i++) {
  const bits = [4, 8, 16, 32, 64][i % 5]
  const v = BigInt(Math.floor(Math.random() * 2 ** 52)) * (i % 2 ? -1n : 1n) * BigInt(1 + (i % 7))
  expectTwos(`fromBits(toBits(${v}))`, twos.fromBits(twos.toBits(v, bits)), twos.wrap(v, bits))
  const sum = twos.weights(bits).reduce((acc, w, k) => acc + (twos.toBits(v, bits)[k] === '1' ? w : 0n), 0n)
  expectTwos(`sum of weights of ${v}`, sum, twos.wrap(v, bits))
}

/* --------------------------------------------------------- UTF-16 character inspector */
// Expected values: JVM-verified in AUDIT.md (batch 1: "😀".length() == 2, one code point) or fixed by the Unicode
// standard (§3.9 UTF-16 and UTF-8 encoding forms) and the JLS (§3.3 Unicode escapes, §3.10.6 escape sequences).
const expectUtf = (label, actual, expected) => {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) fail('char inspector', `${label}: expected ${e}, got ${a}`)
}
expectUtf('"😀".length()', '😀'.length, 2)
expectUtf('"😀" code points', utf16.codePoints('😀').length, 1)
expectUtf('Character.toChars(0x1F600)', utf16.toChars(0x1f600), [0xd83d, 0xde00])
expectUtf('code point of \uD83D\uDE00', utf16.codePoints('\uD83D\uDE00')[0].cp, 0x1f600)
expectUtf('U+1D11E surrogates', utf16.toChars(0x1d11e), [0xd834, 0xdd1e])
expectUtf('UTF-8 of "A"', utf16.utf8('A'), [0x41])
expectUtf('UTF-8 of "é"', utf16.utf8('\u00E9'), [0xc3, 0xa9])
expectUtf('UTF-8 of "☕"', utf16.utf8('\u2615'), [0xe2, 0x98, 0x95])
expectUtf('UTF-8 of "😀"', utf16.utf8('😀'), [0xf0, 0x9f, 0x98, 0x80])
expectUtf('UTF-8 of a lone high surrogate', utf16.utf8('a\uD83Db'), [0x61, 0x3f, 0x62])
expectUtf('lone surrogate is its own code point', utf16.codePoints('\uDE00x').map((p) => p.cp), [0xde00, 0x78])
expectUtf("char literal 'A'", utf16.javaCharLiteral(0x41), "'A'")
expectUtf("char literal '\\n'", utf16.javaCharLiteral(0x0a), "'\\n'")
expectUtf("char literal quote", utf16.javaCharLiteral(0x27), "'\\''")
expectUtf("char literal é", utf16.javaCharLiteral(0xe9), "'\\u00E9'")
expectUtf('string literal', utf16.javaStringLiteral('caf\u00E9 "😀"'), '"caf\\u00E9 \\"\\uD83D\\uDE00\\""')
expectUtf('U+ notation', utf16.unicodeName(0x41), 'U+0041')
for (let cp = 0; cp <= 0x10ffff; cp += 0x101) {
  if (cp >= 0xd800 && cp <= 0xdfff) continue
  const s = String.fromCodePoint(cp)
  expectUtf(`toChars(${cp})`, utf16.toChars(cp), [...s].flatMap((c) => [...Array(c.length).keys()].map((k) => c.charCodeAt(k))))
  expectUtf(`UTF-8 of U+${cp.toString(16)}`, utf16.utf8(s), [...new TextEncoder().encode(s)])
  expectUtf(`code point ${cp}`, utf16.codePoints(s)[0].cp, cp)
}

/* --------------------------------------------------------- casting & promotion explorer */
// Expected values: JVM-verified in AUDIT.md (batch 1: (byte)128, (byte)148, long → float, (int)3.99e10, (int)NaN,
// (int)-7.9) or fixed by the JLS (§5.1.2–5.1.4 conversions, §5.6 promotion) and Double/Float.toString.
const expectConv = (label, actual, expected) => {
  if (!Object.is(actual, expected)) fail('cast explorer', `${label}: expected ${String(expected)}, got ${String(actual)}`)
}
const cv = (text, from, to) => conv.convert(conv.parseValue(text, from).value, from, to)
expectConv('(byte) 128', cv('128', 'int', 'byte'), -128n)
expectConv('(byte) 148', cv('148', 'int', 'byte'), -108n)
expectConv('(float) 123456789123456789L', cv('123456789123456789L', 'long', 'float'), 123456790519087104)
expectConv('(int) 3.99e10', cv('3.99e10', 'double', 'int'), 2147483647n)
expectConv('(int) NaN', cv('NaN', 'double', 'int'), 0n)
expectConv('(int) -7.9', cv('-7.9', 'double', 'int'), -7n)
expectConv('(long) 1e19', cv('1e19', 'double', 'long'), 9223372036854775807n)
expectConv('(int) -1e10', cv('-1e10', 'double', 'int'), -2147483648n)
expectConv('(byte) 300.7', cv('300.7', 'double', 'byte'), 44n)
expectConv('(byte) 1e10', cv('1e10', 'double', 'byte'), -1n)
expectConv('(char) -1.5', cv('-1.5', 'double', 'char'), 65535n)
expectConv('(char) (byte) -1', cv('-1', 'byte', 'char'), 65535n)
expectConv('(short) (char) 65535', cv('65535', 'char', 'short'), -1n)
expectConv("(int) 'A'", cv("'A'", 'char', 'int'), 65n)
expectConv('(float) 16777217', cv('16777217', 'int', 'float'), 16777216)
expectConv('(float) 1e40', cv('1e40', 'double', 'float'), Infinity)
expectConv('(float) 1e-50', cv('1e-50', 'double', 'float'), 0)
expectConv('(double) 0.1f prints', conv.format(cv('0.1', 'float', 'double'), 'double'), '0.10000000149011612')
expectConv('(float) 0.1 prints', conv.format(cv('0.1', 'double', 'float'), 'float'), '0.1')
expectConv('(long) -0.9', cv('-0.9', 'double', 'long'), 0n)
expectConv('kind byte → char', conv.kindOf('byte', 'char'), 'widening-narrowing')
expectConv('kind char → short', conv.kindOf('char', 'short'), 'narrowing')
expectConv('kind int → float', conv.kindOf('int', 'float'), 'widening')
expectConv('int → float may lose precision', conv.mayLosePrecision('int', 'float'), true)
expectConv('int → double exact', conv.mayLosePrecision('int', 'double'), false)
expectConv('byte + byte', conv.promote('byte', 'byte'), 'int')
expectConv('char + short', conv.promote('char', 'short'), 'int')
expectConv('int + long', conv.promote('int', 'long'), 'long')
expectConv('long + float', conv.promote('long', 'float'), 'float')
expectConv('char + double', conv.promote('char', 'double'), 'double')
expectConv('byte literal 128 rejected', conv.parseValue('128', 'byte').error !== undefined, true)
expectConv("char literal '\\n'", conv.parseValue("'\\n'", 'char').value, 10n)
expectConv("char literal '\\u00E9'", conv.parseValue("'\\u00E9'", 'char').value, 233n)
// long → float agrees with float(BigInt) computed another way: the exact decimal of the nearest float.
for (let i = 0; i < 3000; i++) {
  const v = BigInt.asIntN(64, BigInt(Math.floor(Math.random() * 2 ** 53)) * BigInt(Math.floor(Math.random() * 2 ** 11)) + BigInt(i))
  const f = conv.bigintToFloat(v)
  const up = Math.fround(f) === f && Number.isFinite(f)
  if (!up) fail('cast explorer', `bigintToFloat(${v}) is not a float`)
  if (Math.abs(f) < 2 ** 24) {
    if (BigInt(f) !== v) fail('cast explorer', `bigintToFloat(${v}) = ${f}: small integers are exact`)
    continue
  }
  // f is the nearest float: neither neighbour is closer to v, and on a tie f has an even significand
  const [lo, hi] = [nextFloatToward(f, -Infinity), nextFloatToward(f, Infinity)]
  const dist = (x) => { const d = BigInt(x) - v; return d < 0n ? -d : d }
  if (dist(lo) < dist(f) || dist(hi) < dist(f)) fail('cast explorer', `bigintToFloat(${v}) = ${f} is not the nearest float`)
  const tie = dist(lo) === dist(f) || dist(hi) === dist(f)
  const view = new DataView(new ArrayBuffer(4))
  view.setFloat32(0, f)
  if (tie && (view.getInt32(0) & 1) !== 0) fail('cast explorer', `bigintToFloat(${v}) = ${f}: a tie must round to even`)
}
for (const [v, f] of [[16777217n, 16777216], [16777219n, 16777220], [-16777217n, -16777216], [(1n << 63n) - 1n, 2 ** 63]]) {
  expectConv(`(float) ${v}L`, conv.bigintToFloat(v), f)
}
function nextFloatToward(f, dir) {
  const buf = new DataView(new ArrayBuffer(4))
  buf.setFloat32(0, f)
  const bits = buf.getInt32(0)
  buf.setInt32(0, (f > 0) === (dir > 0) ? bits + 1 : bits - 1)
  return buf.getFloat32(0)
}

/* --------------------------------------------------------- bitwise & shift lab */
// Expected values: JVM-verified in AUDIT.md (batch 3, source-notes/verification/batch3/verify3-output.txt) or fixed by
// the JLS (§15.19 shift-distance masking, §15.15.5 ~x == -x - 1).
const expectBits = (label, actual, expected) => {
  if (actual !== expected) fail('bitwise lab', `${label}: expected ${expected}, got ${actual}`)
}
const ev = (op, a, at, b, bt) => bitops.evaluate(op, a, at, b, bt).value
expectBits('4 & 6', ev('&', 4n, 'int', 6n, 'int'), 4n)
expectBits('4 | 6', ev('|', 4n, 'int', 6n, 'int'), 6n)
expectBits('4 ^ 6', ev('^', 4n, 'int', 6n, 'int'), 2n)
expectBits('~4', ev('~', 4n, 'int'), -5n)
expectBits('~-5', ev('~', -5n, 'int'), 4n)
expectBits('4 << 1', ev('<<', 4n, 'int', 1n, 'int'), 8n)
expectBits('4 << 2', ev('<<', 4n, 'int', 2n, 'int'), 16n)
expectBits('4 >> 1', ev('>>', 4n, 'int', 1n, 'int'), 2n)
expectBits('4 >> 2', ev('>>', 4n, 'int', 2n, 'int'), 1n)
expectBits('1 << 32', ev('<<', 1n, 'int', 32n, 'int'), 1n)
expectBits('1 << 33', ev('<<', 1n, 'int', 33n, 'int'), 2n)
expectBits('1L << 64', ev('<<', 1n, 'long', 64n, 'int'), 1n)
expectBits('1 << 31', ev('<<', 1n, 'int', 31n, 'int'), -2147483648n)
expectBits('0x40000000 << 1', ev('<<', 0x40000000n, 'int', 1n, 'int'), -2147483648n)
expectBits('-5 >> 1', ev('>>', -5n, 'int', 1n, 'int'), -3n)
expectBits('-8 >>> 1', ev('>>>', -8n, 'int', 1n, 'int'), 2147483644n)
expectBits('-8 >>> 28', ev('>>>', -8n, 'int', 28n, 'int'), 15n)
expectBits('(byte) 0b11000110 >>> 1', ev('>>>', -58n, 'byte', 1n, 'int'), 2147483619n)
expectBits('(b & 0xFF) >>> 1', ev('>>>', ev('&', -58n, 'byte', 0xffn, 'int'), 'int', 1n, 'int'), 99n)
expectBits('true ^ true is not integral; 5 ^ 3', ev('^', 5n, 'int', 3n, 'int'), 6n)
expectBits('int & long type', bitops.evaluate('&', 1n, 'int', 1n, 'long').type, 'long')
expectBits('shift type ignores the distance type', bitops.evaluate('<<', 1n, 'int', 1n, 'long').type, 'int')
expectBits('char promotes without sign', ev('|', 0xffffn, 'char', 0n, 'int'), 65535n)
expectBits('-1 >>> 0', ev('>>>', -1n, 'int', 0n, 'int'), -1n)
expectBits('1 << -1', ev('<<', 1n, 'int', -1n, 'int'), -2147483648n)
for (let i = 0; i < 1000; i++) {
  const x = BigInt.asIntN(32, BigInt(Math.floor(Math.random() * 2 ** 32)))
  expectBits(`~${x} == -x - 1`, ev('~', x, 'int'), BigInt.asIntN(32, -x - 1n))
  const d = BigInt(Math.floor(Math.random() * 31))
  expectBits(`${x} >> ${d} rounds toward -inf`, ev('>>', x, 'int', d, 'int'), x >= 0n ? x / (1n << d) : -((-x + (1n << d) - 1n) / (1n << d)))
}

/* --------------------------------------------------------- switch fall-through flow */
// Expected values: JVM-verified in AUDIT.md (batch 3: the notes' default-in-middle example with a + b = 10 prints
// "10|a+b is 2|") and JLS §14.11.3 (fall-through, arrow labels don't fall through).
const expectSwitch = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('switch flow', `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
expectSwitch('notes example, sum 10', sw.run(sw.NOTES_EXAMPLE, 10).output, ['10', 'a+b is 2'])
expectSwitch('notes example, sum 3', sw.run(sw.NOTES_EXAMPLE, 3).output, ['a+b is 3', 'a+b is 4'])
expectSwitch('notes example, sum 2', sw.run(sw.NOTES_EXAMPLE, 2).output, ['a+b is 2'])
expectSwitch('arrow labels, sum 10', sw.run(sw.NOTES_EXAMPLE, 10, true).output, ['10'])
expectSwitch('arrow labels, sum 3', sw.run(sw.NOTES_EXAMPLE, 3, true).output, ['a+b is 3'])
expectSwitch('no match, no default', sw.run([{ labels: [1], prints: ['one'], hasBreak: true }], 5).output, [])

/* ------------------------------------------------------------------ call-stack lab */
// src/lib/callstack.mjs: results, call counts and depths follow from the programs (factorial as a Java long,
// naive fib makes 2·fib(n+1) − 1 calls, countDown prints on the way down and up), and every step is consistent.
{
  const expectCs = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('call-stack lab', `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
  const fibOf = (n) => (n < 2 ? n : fibOf(n - 1) + fibOf(n - 2))
  let longFact = 1n
  for (let n = 0; n <= 25; n++) {
    if (n > 1) longFact = BigInt.asIntN(64, longFact * BigInt(n))
    const r = cs.trace('factorial', n)
    const last = r.steps.at(-1)
    expectCs(`factorial(${n}) output`, last.out, [String(longFact)])
    expectCs(`factorial(${n}) calls`, last.calls, Math.max(n, 1))
    expectCs(`factorial(${n}) max depth`, last.maxDepth, Math.max(n, 1) + 1)
  }
  expectCs('21! as a long', cs.trace('factorial', 21).steps.at(-1).out, ['-4249290049419214848'])
  for (let n = 0; n <= 7; n++) {
    const last = cs.trace('fib', n).steps.at(-1)
    expectCs(`fib(${n}) output`, last.out, [String(fibOf(n))])
    expectCs(`fib(${n}) calls`, last.calls, 2 * fibOf(n + 1) - 1)
    expectCs(`fib(${n}) max depth`, last.maxDepth, Math.max(n, 1) + 1)
  }
  for (let n = 0; n <= 6; n++) {
    const down = Array.from({ length: n }, (_, i) => String(n - i))
    const up = Array.from({ length: n }, (_, i) => `back in ${i + 1}`)
    expectCs(`countDown(${n}) output`, cs.trace('countDown', n).steps.at(-1).out, [...down, 'Liftoff!', ...up])
  }
  for (let cap = 4; cap <= 14; cap++) {
    const r = cs.trace('overflow', cap)
    const over = r.steps.filter((s) => s.kind === 'overflow')
    expectCs(`overflow(${cap}) happens once, with a full stack`, over.map((s) => s.depth), [cap])
    expectCs(`overflow(${cap}) error`, r.steps.at(-1).out[0], 'Exception in thread "main" java.lang.StackOverflowError')
  }
  for (const id of Object.keys(cs.PROGRAMS)) {
    const p = cs.PROGRAMS[id]
    for (let a = p.min; a <= p.max; a++) {
      const r = cs.trace(id, a)
      let prev
      r.steps.forEach((s, i) => {
        const w = `${id}(${a}) step ${i + 1}`
        if (s.line < 1 || s.line > r.source.length) fail('call-stack lab', `${w}: line ${s.line} outside the source`)
        if (s.frames.length !== s.depth) fail('call-stack lab', `${w}: ${s.frames.length} frames but depth ${s.depth}`)
        for (const f of s.frames) if (f.line < 1 || f.line > r.source.length) fail('call-stack lab', `${w}: frame ${f.method} at line ${f.line}`)
        if (!s.note) fail('call-stack lab', `${w}: no note`)
        if (prev && (s.calls < prev.calls || s.out.length < prev.out.length)) fail('call-stack lab', `${w}: calls or output went backwards`)
        prev = s
      })
      if (r.steps.at(-1).kind !== 'end' || r.steps.at(-1).depth !== 0) fail('call-stack lab', `${id}(${a}) must end with an empty stack`)
    }
  }
}

/* ------------------------------------------------------------------- lesson timer */
// The timer's rules (src/lib/studytime.mjs): whole seconds, a study day at 5 minutes, idle credit, formatting.
const expectTime = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('lesson timer', `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
{
  const empty = { time: {}, timeByDay: {}, activity: {} }
  const a = st.addTime(empty, 'l', 299.9, '2026-09-26')
  expectTime('whole seconds', a.time, { l: 299 })
  expectTime('below 5 min: no activity yet', a.activity, {})
  const b = st.addTime(a, 'l', 1, '2026-09-26')
  expectTime('5 min reached: one activity point', b.activity, { '2026-09-26': 1 })
  const c = st.addTime(b, 'other', 600, '2026-09-26')
  expectTime('only once per day', c.activity, { '2026-09-26': 1 })
  expectTime('per-day total', c.timeByDay, { '2026-09-26': 900 })
  expectTime('per-key totals', c.time, { l: 300, other: 600 })
  expectTime('inputs unchanged', empty, { time: {}, timeByDay: {}, activity: {} })
  expectTime('under a second is a no-op', st.addTime(c, 'l', 0.5, '2026-09-27'), c)
  expectTime('a new day', st.addTime(c, 'l', 300, '2026-09-27').activity, { '2026-09-26': 1, '2026-09-27': 1 })
  expectTime('idle: up to last input + grace', st.idleCredit(0, 100_000, 900_000, 60_000), 160_000)
  expectTime('idle: never more than the segment', st.idleCredit(0, 100_000, 120_000, 60_000), 120_000)
  expectTime('idle: input before the segment', st.idleCredit(50_000, 10_000, 900_000, 60_000), 60_000)
  expectTime('clock', [st.clock(0), st.clock(59.9), st.clock(61), st.clock(3599), st.clock(3600), st.clock(3661)], ['0:00', '0:59', '1:01', '59:59', '1:00:00', '1:01:01'])
  expectTime('duration', [st.duration(59), st.duration(60), st.duration(2700), st.duration(3600), st.duration(3900)], ['< 1 min', '1 min', '45 min', '1 h', '1 h 5 min'])
  expectTime('estimate: half', st.againstEstimate(1350, 45), { fraction: 0.5, overMinutes: 0, hasEstimate: true })
  expectTime('estimate: over', st.againstEstimate(3000, 45), { fraction: 1, overMinutes: 5, hasEstimate: true })
  expectTime('no estimate', st.againstEstimate(10, undefined), { fraction: 0, overMinutes: 0, hasEstimate: false })
  expectTime('last 7 days', st.lastDays({ '2026-09-20': 100, '2026-09-19': 50, '2026-09-26': 7, '2026-09-27': 1000 }, '2026-09-26', 7), 107)
}

if (errors.length) {
  console.error(errors.join('\n'))
  console.error(`FAILED: ${errors.length} content problem(s)`)
  process.exit(1)
}
console.log(
  `OK: ${Object.keys(index).length} written lessons, ${dataIds.length} lesson-data files, ` +
    `${Object.keys(built.checkpoints).length} checkpoint(s), links and anchors valid; ` +
    `IEEE 754 lab agrees with the JVM on ${rows.length} fixture rows and ${randomRows.length} random bit patterns; ` +
    `integer lab, char inspector, cast explorer, bitwise lab and switch flow agree with the JVM/JLS values; ${traceIds.length} memory trace(s) valid; call-stack lab and lesson-timer rules hold`,
)
