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

/* ------------------------------------------- Definition of Done minimums */
const ALLOWED_TAGS = new Set([
  'Callout', 'MythVsFact', 'VersionBadge', 'FaqItem', 'CheatSheet', 'Tabs', 'TabItem', 'FileTree', 'Figure', 'LayerDiagram',
  'BitLayout', 'FloatSpacing', 'FloatLab', 'PredictOutput', 'Reveal', 'Exercise', 'Starter', 'Tests', 'Solution', 'Quiz',
  'InterviewSet', 'Flashcards', 'MemoryDiagram', 'Stepper', 'Step', 'CheckpointQuiz', 'IntegerLab', 'CharInspector', 'CastExplorer',
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

if (errors.length) {
  console.error(errors.join('\n'))
  console.error(`FAILED: ${errors.length} content problem(s)`)
  process.exit(1)
}
console.log(
  `OK: ${Object.keys(index).length} written lessons, ${dataIds.length} lesson-data files, ` +
    `${Object.keys(built.checkpoints).length} checkpoint(s), links and anchors valid; ` +
    `IEEE 754 lab agrees with the JVM on ${rows.length} fixture rows and ${randomRows.length} random bit patterns; ` +
    `integer lab, char inspector and cast explorer agree with the JVM/JLS values`,
)
