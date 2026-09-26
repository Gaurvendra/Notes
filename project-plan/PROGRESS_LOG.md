# Progress Log

Newest entry on top. One entry per work session (or per lesson). Keep each entry short: what was done, what's
next, any blockers or decisions.

---

## 2026-09-26 — Session 5 (cont.): `static-vs-instance` · T3 lessons done

- **`static-vs-instance`:** instance vs static members, one copy per class (4.17, with a new `MemoryStepper` trace
  `static-counter`: the class's statics next to each object's id), the static context (7.10 myth: instance members
  are fine through a reference), hiding vs overriding incl. static calls through `null` (7.10 myth), class
  initialisation order and failure, when to make methods static and static factory methods vs the GoF Factory
  Method (7.11 myth), where statics live (4.17 myth), the problems of mutable static state. New SVG (one class, many
  objects). Exercises Units (a proper utility class) / Sequence (instance and static counters, reset hook for tests) /
  Color (216 cached instances from a static factory, with the static-initialiser order trap).
- Checks (local): DAG OK, content check OK (2 traces), build OK, 40 routes OK; diagram and stepper reviewed.
- **Next:** checkpoint 3.

---

## 2026-09-26 — Session 5 (cont.): `packages-access-modifiers`

- **`packages-access-modifiers`:** packages as namespaces and folders, imports (single-type, on-demand, static,
  Java 25 module imports) and their rules, the four access levels with the full matrix (7.3 myth: "access modifiers",
  not only for methods; top-level classes), private per class and nest-mates, the protected subtlety (7.3 myth, JLS
  §6.6.2.1, statics excepted), access and overriding, modules as one more layer, choosing access. New SVG (nested
  visibility regions). Exercises Account (modifiers checked by reflection) / Sensors (a public interface + factory
  over package-private classes) / AccessRules (the matrix as code, checked against **javac** in two packages).
- Checks (local): DAG OK, content check OK, build OK, 39 routes OK; diagram and phone file tree reviewed.
- **Next:** `static-vs-instance`, then checkpoint 3.

---

## 2026-09-26 — Session 5 (cont.): `call-stack`

- **`call-stack`:** frames and what they hold (9.2), push on call / pop on return with two embedded `CallStackLab`s
  (factorial, and the no-base-case overflow), scope vs frame (9.6 myth: the whole frame is popped, block exits free
  nothing), recursion with base case and progress, no tail-call elimination, stack size and `StackOverflowError`
  vs heap/Metaspace OOM (9.7), one stack per thread and thread-safe locals, virtual threads (9.5), reading stack
  traces incl. `Caused by` / `... n more`, `StackWalker`. New SVG (two thread stacks with an opened frame).
  Exercises Recursion (log-depth `power` vs `modPow`) / Hanoi (moves replayed on simulated pegs) / Trees (explicit
  stack, checked on a million-node chain).
- Checks (local): DAG OK, content check OK, build OK, 38 routes OK; diagram reviewed in both themes.
- **Next:** `packages-access-modifiers`.

---

## 2026-09-26 — Session 5 (cont.): `methods-basics`

- **`methods-basics`:** what a method is and why (the notes' `Calculation` / `getPriceOfPen` example, 7.1), every part
  of a declaration and the signature (7.2 myth: the return type isn't part of it), parameters vs arguments with
  left-to-right evaluation and copies, return and `void` incl. "missing return statement" and abrupt completion
  (7.4, 7.6 myth), naming (7.5), kinds of methods with the standard terms (7.7 myth) and links forward, method
  design rules. New SVG (declaration anatomy + call flow). Exercises TextStats / Invoice (half-even cents vs
  `BigDecimal`) / Scores (side-effect-free statistics vs the JDK, input must not change).
- Checks (local): DAG OK, content check OK, build OK, 37 routes OK; diagram reviewed in both themes (label
  collision and lost indentation fixed).
- **Next:** `call-stack` (with `CallStackLab`).

---

## 2026-09-26 — Session 5 (cont.): call-stack and memory steppers

- **`CallStackLab`**: four recursive programs (factorial as a Java `long`, countDown printing on the way down and
  back up, naive fib, and a method with no base case that fills a small stack until `StackOverflowError`), an
  argument you can change, step/play controls and ←/→. Shows the code with the current line and the lines where
  other frames wait, the frames (top first) with their parameters and pending expressions, depth / calls / max
  depth, notes and output. Traces come from `src/lib/callstack.mjs`; `check-content` checks results (incl. 21! as a
  long), call counts (fib: 2·fib(n+1) − 1), depths, the single overflow at a full stack and step consistency for
  every argument.
- **`MemoryStepper`**: code + `MemoryDiagram` + note + output per step, from hand-written YAML traces in
  `src/content/traces/`; `check-content` validates lines, refs (same step), ids and growing output. First trace:
  the notes' `MemoryManagement` example (note 09 pp. 2–4) in 11 steps, adding the `this` and `args` slots the notes'
  picture leaves out and the pooled literal that stays reachable (AUDIT 9.12).
- Supporting pieces: `CodeView` (widget code with a tiny Java tokenizer, `src/lib/javaTokens.mjs`), shared
  `StepControls` (first/prev/play/next/last), and `MemoryDiagram` now sizes its columns from the content (long frame
  names no longer overflow) with fixed sizes for steppers. Authoring guide updated.
- Reviewed in both themes and on a phone (prose styles leaking into widget code and lists fixed).
- **Next:** T3 lessons: `methods-basics`, `call-stack`, `packages-access-modifiers`, `static-vs-instance`.

---

## 2026-09-26 — Session 5: Phase 5 approved (D-025) · focus mode and lesson timer

- **Approval:** "start with phase 5 and stop before phase 6 also add a focus mode and a timer for each lesson" →
  D-025 (stop before Phase 6), PLAN and CLAUDE.md updated.
- **Lesson timer** (lessons and checkpoints): time spent against the lesson's estimate (ring, `m:ss`, status line),
  start/pause (T), reset; starts by itself on written lessons you haven't completed; pauses when the tab is hidden,
  after 10 min without input (counting up to a minute after the last input), and when you mark the lesson complete.
  Saved in whole seconds every 30 s, on pause, on tab hide/close (synchronously) and when moving to another lesson,
  in the progress store (`time`, `timeByDay`; included in export/import). Five timed minutes make a study day for the
  streak. The lesson body is memoised so the clock never re-renders it. Time shows on the path cards and in a new
  "Study time" section of the profile; Settings has the three timer options.
- **Focus mode** (F / Esc / button): hides the header, sidebar, prerequisites, table of contents and breadcrumbs;
  a slim bar keeps exit, the title and current section, the timer and full screen, with a reading-progress line;
  the ambient backdrop is switched off; the reading position is kept when entering or leaving; leaving the
  lesson/checkpoint pages ends it.
- **Checks:** the timer rules live in `src/lib/studytime.mjs` and are checked by `check-content`; `check-pages` now
  drives the features in Chromium (auto-start, F, T saves and stops the clock, Esc, leaving the page, phone width
  in focus mode). Build and 36 routes OK; screenshots reviewed (phone timer card fixed).
- **Next:** Phase 5 widgets (call-stack stepper, stack/heap stepper), then T3.

---

## 2026-09-26 — Session 4 (end): checkpoint 2 · **Phase 4 ✅** · stop before Phase 5 (D-024)

- **Checkpoint 2 (Operators & Control Flow):** six cross-lesson quiz questions (continue/break inside a switch in a
  loop, postfix with short-circuiting, shift-loop counts, a `Long` in an `Integer` pattern switch, `&` vs `!=`
  precedence, a halving loop over negative numbers), plus every Tier 2 lesson quiz; the **`TinyMachine`** challenge
  (a register machine whose instructions must behave like Java's operators; 400 random programs checked against
  **javac**, loop programs against `Integer.bitCount`/`reverse`, `BigInteger.gcd`, a stream factorial; step limit and
  upfront validation); an eight-question mock interview across the four levels.
- **Phase 4 closed:** 7 T2 lessons, `BitwiseLab` and `SwitchFlow` widgets, checkpoint 2. PLAN status set to waiting.
- Checks (local): DAG OK, content check OK, build OK, 36 routes in Chromium OK; checkpoint page reviewed on a phone.
- **Next:** **ask the user for approval before Phase 5** (D-024). Phase 5 = T3 Methods Essentials + T4 References &
  Memory Basics (11 lessons, call-stack and stack/heap widgets, checkpoints 3–4).

---

## 2026-09-26 — Session 4 (cont.): `loops-and-branching`

- **`loops-and-branching`:** `for`, nested `for`, `while`, `do-while` and for-each with the notes' outputs (21.12),
  do-while's at-least-once pass and the for-each copy (verified), removing inside a for-each (CME, and the verified
  silent early exit), `break` in nested loops and labeled `break`/`continue` (21.13, verified), `continue` skipping a
  `while` increment (21.14), off-by-one, termination, invariants and streams as the declarative alternative (21.15).
  New SVG (the three loop shapes and where `continue` jumps). Exercises Numbers (digit loops, Euclid vs
  `BigInteger`) / Primes (trial division and sieve vs `isProbablePrime`, overflow-safe bounds) / Life (Game of Life
  with pattern and symmetry tests).
- Checks (local): DAG OK, content check OK, build OK, 35 routes in Chromium OK; diagram reviewed in both themes
  (clipped labels fixed).
- **Next:** checkpoint 2, close Phase 4 and stop (D-024).

---

## 2026-09-26 — Session 4 (cont.): `conditionals`, `switch-statements-and-expressions`

- **`conditionals`:** the control-flow families with the jump statements the notes omit (21.1), `if` / `if-else` /
  ladders / nested `if` with the notes' examples and their typo (21.2), boolean-only conditions, braces and the
  dangling else (goto fail as the hook), ordering overlapping conditions, scope and definite assignment, guard
  clauses. New SVG (ladder flowchart). Exercises Grades / Calendar (vs `java.time`) / DayOfWeek (Zeller vs
  `LocalDate`).
- **`switch-statements-and-expressions`:** classic switch and fall-through with the notes' default-in-the-middle
  example and the `SwitchFlow` widget (21.3, 21.4), label rules with verified messages (21.5, 21.6), types incl.
  Java 21 patterns and the preview primitives (21.9 myth), handling all cases (21.7), nesting (21.8), `return`
  (21.10 myth), arrow labels, switch expressions, `yield`, exhaustiveness (21.11 myth), pattern matching with
  guards, record patterns and sealed types. New SVG (switch timeline). Exercises Months (vs `java.time.Month`) /
  Roman / Simplifier (pattern switches over a sealed expression tree; value-preservation properties).
- Checks (local): DAG OK, content check OK, build OK, 34 routes in Chromium OK; widget and diagrams reviewed (ladder
  canvas enlarged).
- **Next:** `loops-and-branching`, checkpoint 2, close Phase 4 and stop (D-024).

---

## 2026-09-26 — Session 4 (cont.): `ternary-instanceof-precedence` · operators done

- **`ternary-instanceof-precedence`:** the ternary as an expression with one type and its verified traps (`char`
  result, wrapper promotion to `1.0`, unboxing NPE) (20.13), `instanceof` with subtypes, `null` and impossible checks,
  pattern matching and flow scoping (20.14), the notes' precedence table completed with associativity and the
  classic grouping traps (20.15), precedence vs evaluation order with an expression-tree SVG and the notes' example
  corrected to 43 (20.16), related topics linked (20.17). Exercises Choose (vs `Integer.signum`/`Math.max`) /
  JsonWriter (type dispatch with patterns) / Parenthesizer (precedence climbing vs **javac**).
- Checks (local): DAG OK, content check OK, build OK, 32 routes in Chromium OK; the three new diagrams reviewed
  (tree legend clipped → moved).
- **Next:** conditionals, switch (with `SwitchFlow`), loops, checkpoint 2.

---

## 2026-09-26 — Session 4: Phase 4 started (approved, stop before Phase 5) · first three operator lessons

- User: "start phase 4 and stop before phase 5" → D-024 recorded (CONTEXT, PLAN, CLAUDE.md stop points).
- **Widgets:** `BitwiseLab` (operand types byte…long, `& | ^ ~ << >> >>>`, promotion shown bit by bit with the
  sign-extension bits highlighted, shift-distance masking, result type) and `SwitchFlow` (the notes' switch with
  `default` in the middle; toggle each `break`, colon vs arrow labels; entry arm, fall-through and output). Logic in
  `src/lib/bitops.mjs` and `src/lib/switchflow.mjs`, checked on every build against the batch-3 JVM outputs plus
  1,000 random `~`/`>>` cases.
- **`operators-arithmetic-relational-logical`:** operators/operands/expressions (20.1), the 9 categories (20.2 ✏️),
  integer division and remainder signs, division by zero, `%` on doubles, `floorMod` (20.3), string `+` order,
  relational operators with promotion, NaN and identity (20.4), short-circuiting corrected (20.5). New SVG
  (short-circuit flow). Exercises Clock (vs `Duration`) / FloorMath (vs `Math`) / Calculator (vs **javac**-compiled
  expressions).
- **`operators-unary-assignment`:** prefix/postfix with the JLS order (new SVG), `i = i++`, unary `+`/`-` promotion,
  assignment as an expression, compound assignment's cast, single evaluation and saved left value, `String +=`
  (20.6, 20.7), the notes' 43 example. Exercises Ops (vs real operators) / Luhn (test numbers + error-detection
  properties) / SideEffects (an interpreter vs **javac**-compiled statements).
- **`bitwise-and-shift-operators`:** `& | ^ ~` with the notes' demo (20.8), `~n = -(n+1)` with the 4-bit example and
  its typo (20.9), shifts and no `<<<` (20.10), promotion before shifting as a myth with a new SVG (20.11), overflow,
  rounding and distance masking (20.12), recipes, HashMap indexes. `BitwiseLab` embedded. Exercises BitFlags (vs
  `BitSet`) / BitTricks (vs `Integer`) / Varint + ZigZag (protobuf-documented bytes).
- Checks (local): DAG OK, content check OK, build OK, 31 routes in Chromium OK (a phone overflow in the lab's inputs
  found and fixed); screenshots reviewed.
- **Next:** `ternary-instanceof-precedence`, then conditionals, switch, loops, checkpoint 2.

---

## 2026-09-24 — Session 3 (cont.): checkpoint 1, floating-point re-check · Phase 3 ✅

- **Checkpoint 1 (Data & Types):** 6 cross-lesson quiz questions (sign extension through `char`, `var` + compound
  assignment, field defaults with `char` arithmetic, `int` overflow before widening, `char += double`, lossy
  `int → float`), the SensorPacket challenge (decode/encode a binary packet: unsigned and signed widths, float bits,
  `BigDecimal` hundredths, UTF-8 name, range checks; tests use `ByteBuffer` as the reference on 5,000 random
  readings), and an 8-question mock interview across all four levels.
- **`floating-point` re-check:** facts still consistent with the new T1 lessons; added cross-links to Type
  Conversion (saturating casts, `long → double` as a lossy widening).
- **Tooling:** the page check now opens every written checkpoint plus one without content; that caught a phone
  overflow in the checkpoint lesson list (grid item `min-w-0`), fixed. `curriculum.py` marks a checkpoint `done` when
  its `tier-N.mdx` exists.
- **Phase 3 complete:** 11 lessons written (T0 5, T1 6), checkpoints 0–1, widgets `IntegerLab`, `CharInspector`,
  `CastExplorer` (plus the pilot's IEEE 754 lab). Checks (local): DAG OK, content check OK, build OK, 28 routes in
  Chromium OK.
- **Next:** Phase 4 (T2 Operators & Control Flow): bitwise/shift explorer and switch fall-through widgets, 7 lessons,
  checkpoint 2.

---

## 2026-09-24 — Session 3 (cont.): `variable-kinds`

- **`variable-kinds` (Kinds of Variables):** the notes' five kinds (audit 4.16) extended to the JLS's eight, with a
  scope/lifetime/default/storage table; the notes' Employee example as a 3-step stack & heap walkthrough
  (`Stepper` + `MemoryDiagram`); scope vs lifetime (new SVG timeline); default values and definite assignment;
  shadowing and `this`; static variables (4.17: one copy, class-name access, `null` access quirk, where HotSpot stores
  them, why mutable static state is risky); effectively final captures. Scenarios: static cart list, missing `else`,
  request data in a static field, captured-counter hack. Exercises Ticket / Scopes (a javac-like symbol table) /
  DefiniteAssignment (**javac** is the oracle on 300 random programs).
- Checks (local): DAG OK, content check OK, build OK, 26 routes in Chromium OK; stepper and timeline screenshots
  reviewed.
- **Next:** floating-point pilot re-check (links to the new T1 lessons), checkpoint 1, close Phase 3.

---

## 2026-09-24 — Session 3 (cont.): `type-conversion`, casting & promotion explorer

- **`type-conversion` (Type Conversion & Casting):** widening with the three lossy cases (audit 4.12), narrowing and
  what a cast does: low bits, truncation toward zero, saturation, NaN → 0, the two-step floating → byte/short/char
  (4.13, terminology corrected), numeric promotion as a compile-time type rule (4.14 myth), mixed expressions (4.15),
  constant narrowing and compound assignment's hidden cast, conversion contexts (assignment vs method call, boxing).
  Scenarios: integer-division average, `(int) (0.29 * 100)`, 64-bit IDs through `double`, casting to silence the
  compiler. SVG widening map. Exercises ManualCast (compared with real casts) / ExactCast (round trips, `BigDecimal`)
  / AssignmentRules (**javac itself** is the oracle via `javax.tools`).
- **Widget `CastExplorer`:** pick a source type and value, see every cast with its kind (widening, lossy widening,
  narrowing) and what happened, plus a promotion calculator. Logic in `src/lib/conversion.mjs` (JLS §5.1, §5.6;
  exact `long → float` rounding), checked on every build against the audit's JVM-verified values, JLS-determined
  cases and 3,000 random nearest-float checks. Phase 3 widgets line complete.
- Checks (local): DAG OK, content check OK, build OK, 25 routes in Chromium OK; screenshots reviewed.
- **Next:** `variable-kinds`, floating-point pilot re-check, checkpoint 1.

---

## 2026-09-24 — Session 3 (cont.): `char-and-boolean`, UTF-16 inspector

- **`char-and-boolean` (char & boolean):** `char` as an unsigned 16-bit UTF-16 code unit with the ASCII myth
  corrected (audit 4.6), literals and escapes, char arithmetic, code points and surrogate pairs (bit-level split of
  U+1F600), the `Character` API, Unicode escapes processed first (JLS §3.3); `boolean` with the default and size myths
  corrected (4.11), no numeric conversions, the `if (done = true)` trap, `parseBoolean` vs `getBoolean`. Scenarios:
  surrogate-safe truncation, Unicode digits, the Turkish i, boolean parameters → enums. New SVG diagram (one string
  as characters, code points, UTF-16 and UTF-8). Exercises Caesar / CodePoints (compared with `codePointCount` and
  `StringBuilder.reverse`) / Utf8 (compared with `getBytes(UTF_8)`).
- **Widget `CharInspector`:** type text, see `length()`, code points, UTF-8 bytes and graphemes, each code point with
  its `charAt` units and surrogate roles, and an ASCII-only Java literal. Browser strings are UTF-16 like Java's; the
  logic (`src/lib/utf16.mjs`) is checked on every build (JVM-verified emoji facts, Unicode encoding forms, and a sweep
  over the code point range against the browser's own encoder).
- LESSON_TEMPLATE component table: `IntegerLab`, `CharInspector`.
- Checks (local): DAG OK, content check OK, build OK, 24 routes in Chromium OK; screenshots reviewed.
- **Next:** `type-conversion` (+ casting & promotion explorer), `variable-kinds`, floating-point re-check, checkpoint 1.

---

## 2026-09-24 — Session 3 (cont.): checkpoint 0, `variables-basics`, `integer-types`, integer lab

- **Checkpoint 0 (Launchpad):** cross-lesson quiz, the DeployCheck challenge (class-file versions, previews, LTS),
  an 8-question mock interview; checkpoint challenges appear in the Practice hub.
- **`variables-basics` (Variables & Typing):** declare/initialise/assign, identifier rules and conventions, keywords
  and contextual keywords, the unnamed variable `_` (JEP 456), static vs strong typing, `var` and its traps, the JLS
  type tree (audit 4.1–4.5). Exercises IdentifierCheck (compared with `SourceVersion.isName`) / NamingStyle /
  VarTypeInference.
- **`integer-types` (Integer Types):** the four types and ranges (4.7, 4.9), two's complement with the notes' ±3
  example and the sign-bit myth corrected (4.8), literals incl. the octal trap and `L` (4.10), silent overflow and
  `Math.*Exact` (4.22), division/remainder and `floorMod`, unsigned helpers, JVM view. Exercises RangeCheck / SafeMath
  (compared with `Math.*Exact`) / UnsignedLongs (compared with `Long`'s unsigned helpers). Google+ reference replaced.
- **Widget `IntegerLab`:** width switch (4-bit toy to `long`), Java-literal input, clickable bits with weights,
  operations (+1, −1, ×2, −x, ~x), unsigned/hex readouts, overflow message and an overflow wheel. Its arithmetic
  (`src/lib/twos.mjs`) is checked on every build against JVM-verified and JLS values plus 2,000 random round trips.
- Checks (local): DAG OK, content check OK, build OK, 23 routes in Chromium OK; lab screenshots reviewed (wheel label
  overlaps fixed).
- **Next:** `char-and-boolean`, `type-conversion` (+ casting & promotion explorer), `variable-kinds`, floating-point
  re-check, checkpoint 1.

---

## 2026-09-24 — Session 3 (cont.): `how-java-runs`, `oop-mindset`, pilot re-check, checkpoint support

- **`how-java-runs` (How Java Runs):** bytecode as a stack machine (`javap -c`), class loading (load, link, initialise;
  when initialisation happens, JLS §12.4.1), runtime data areas, interpreter + tiered JIT (C1/C2), JIT optimisations
  and deoptimisation, warm-up and the AOT cache (JEPs 483, 514, 515, 516), reading `javap` output (audit 2.4, 2.6).
  Two SVG diagrams (JVM pipeline, tiered compilation). Exercises StackMachine / ExpressionCompiler (shunting-yard)
  / TieredSimulator. Review fix: a `System.nanoTime() > 0` example replaced (nanoTime may be negative).
- **`oop-mindset` (The OOP Mindset):** procedural vs OOP (notes table, with corrections 1.3), state/behaviour/identity
  (1.1), classes as blueprints with the notes' `Student` example corrected (1.7), class vs object (1.5), collaborating
  objects (ATM), the four pillars as a map, multi-paradigm Java (1.4). Two SVG diagrams. Exercises BankAccount /
  ShoppingCart / Library.
- **`jdk-jre-jvm` re-check:** all its cross-links now point to written lessons; link labels aligned; facts consistent.
- **Checkpoint support:** `content/checkpoints/tier-N.mdx` + `content/checkpoint-data/tier-N.yaml` render on
  `/checkpoints/N` with a `<CheckpointQuiz />` (the checkpoint's own questions + every quiz of the tier), a coding
  challenge and a mock interview; the index and the content checker validate them.
- Checks (local): DAG OK, content check OK, build OK, 21 routes in Chromium OK.
- **Next:** checkpoint 0 content, then Tier 1.

---

## 2026-09-24 — Session 3 (cont.): Phase 3 started (approved) · `java-landscape`, `first-program`

- User approved Phase 3 ("start phase 3"); PLAN status updated.
- **`java-landscape` (Java in 2026):** what "Java" means, key properties (audit 2.1), SE / Jakarta EE / ME / Android
  (2.10), OpenJDK, JEPs, JCP, TCK and vendors, the six-month train and LTS, version strings, distributions and
  licences, choosing a version in 2026 (2.11). Two SVG diagrams (release timeline, who builds the JDK). 5 myths,
  9 FAQs, 3 puzzles (`Runtime.Version`), exercises LtsCheck / VersionCompare (checked against `Runtime.Version` on
  10,000 random pairs) / ReleaseCalendar; 9 quiz, 11 interview, 10 flashcards.
- **`first-program` (Your First Program):** install and check a JDK, the classic `main` word by word, packages with
  `-d`/`-cp`, source-file mode (JEP 330, 458), shebang scripts, jshell, Java 25 compact source files and instance
  `main` (JEP 512, 511) with a launch-protocol diagram, the first errors table. 4 myths, 9 FAQs, 3 puzzles, exercises
  Greeting / CommandLine / MainFinder (reflection model of the launch protocol); 9 quiz, 10 interview, 10 flashcards.
- Checker fix: generic types inside inline code (`Optional<Integer>`) are no longer mistaken for MDX tags.
- Outputs not run on a JDK are listed in `VERIFY_LATER.md` (12 rows so far).
- Checks (local): DAG OK, content check OK, build OK, 19 routes in Chromium OK.
- **Next:** `how-java-runs`, `oop-mindset`, then the `jdk-jre-jvm` re-check and checkpoint 0.

---

## 2026-09-24 — Session 3: revamp (D-023), Phases 0–2 done → ⏸️ waiting for approval of Phase 3

- **User decision (D-023):** rebuild as a simple, modern static Java prep & practice app in the style of LustyDev's
  "Hot Streak", keep all content and quality, re-plan phases 0–16, do 0–2, then wait; **no JDK/JRE/JVM** anywhere.
- **Phase 0:** `PLAN.md` v4 (phases 0–16 re-planned, per-lesson workflow without a JDK), D-023 in `CONTEXT.md`,
  `CLAUDE.md` environment section (Node only).
- **Phase 1, `app/`:** React 19 + TypeScript 6 + Vite 8 + Tailwind 4, LustyDev's 7 colour schemes × light/dark, fonts,
  UI kit. MDX lessons (GFM, KaTeX, Shiki dual-theme highlighting at build time, heading slugs, fence meta for titles /
  output / captured / verified), curriculum from `curriculum.yaml`, lesson data from YAML (lazy), generated lesson
  index. Pages: Home, Start here, Path (tiers, guides-only filter, **prerequisite graph** ported from v1 with chain
  highlighting), Lesson (guide + TOC, or an outline listing the audited claims it will teach), Checkpoint (mixed quiz
  of the tier), Revision (SRS 1-4-10-21-45 days), Interview (filters, self-rating), Practice, Cheat sheets, Notes audit
  (all 305 items, verdict filters, links to lessons), Glossary / Java versions (growing hubs), Profile (level, XP
  breakdown, streak + freezes, heatmap, 16 badges), Settings (scheme, mode, export/import/reset). ⌘K search over pages,
  lessons and sections; toasts for XP, level-ups and badges. Content components ported with the same props (plus
  MemoryDiagram and Stepper for later lessons). Docker: node:22 → nginx with SPA fallback (image built and served in
  the session: `/`, `/path`, `/lessons/*` → 200). CI: Node + Python only (DAG check, `npm run check`, `check:pages`).
- **Phase 2:** both pilots converted by a one-off script straight from the java-track sources, golden outputs, compile
  cases and exercise files (code shown byte-for-byte as tested on JDK 25 and 27), then diffed against the v1 MDX: the
  only prose changes are 4 sentences that described the old build. Mermaid charts → themed SVG diagrams. The IEEE 754
  lab is still checked against the JVM-recorded fixtures (now in `app/scripts/fixtures/`). `LESSON_TEMPLATE.md` v3,
  `VERIFY_LATER.md`. `website/` and `java-track/` removed (last v1 commit `719dbf3`).
- **Checks (local):** DAG OK; content check OK (schema, DoD minimums, sections, links/anchors, IEEE lab 86 + 1,999
  cases); type-check + build OK; 17 routes in Chromium at 390 px and 1280 px, no errors, no overflow.
- **Next:** ⏸️ ask the user to approve Phase 3 (D-020). Don't start it before they do.

---

## 2026-09-24 — Session 2 (cont.): user paused before Phase 3; lean workflow set up (D-022)

- **User decision:** pause here (Phase 3 later). Future phases must keep the same content and quality but without JDK
  setup and testing inside the session, which costs too many tokens.
- **Done so that quality doesn't drop:** all testing moved to GitHub CI, one workflow `.github/workflows/ci.yml`:
  1. `outputs` (JDK 25): `mvn verify -Dgolden.createMissing=true` records outputs/`expected.txt` of NEW examples and
     compile cases (existing ones are still compared exactly) and commits them back as github-actions[bot];
  2. `java`: `mvn verify` on JDK 25 and 27 on that commit;
  3. `website`: curriculum check, `npm run verify`, and the new `npm run check:pages` (every finished page in Chromium:
     JavaScript/console errors and phone-width overflow).
- Testkit: `Golden` has a `golden.createMissing` mode; `LessonCompileResultsTest` finds cases by their `.java` files
  and writes a missing `expected.txt` only in that mode (tested locally: deleted files come back byte-identical).
- Docs: PLAN.md lean per-lesson workflow, CLAUDE.md (no local setup; `git pull` first), LESSON_TEMPLATE.md DoD
  checks/accuracy rules, CONTEXT D-022, README.
- This push deliberately omits `outputs/track/template/HelloTrack.txt`, so the first CI run proves that recording works.

**Verified:** CI run 36030486726 re-recorded `HelloTrack.txt` ("Hello, Java 25!") as bot commit `45d6b65`, and all four
jobs (outputs, JDK 25, JDK 27, website incl. browser page check) passed on that commit. The lean pipeline works.

**Next session:** `git pull`, then ⏸️ ask the user to approve Phase 3 (D-020); after approval use the lean workflow.

---

## 2026-09-24 — Session 2 (cont.): Phase 2 retro done → ⏸️ waiting for approval (D-020)

- Self-review of both pilots against the DoD: added Mermaid `accTitle`/`accDescr` (screen readers now get a title and a
  description, verified in the rendered SVG); defined which framework warnings are tolerated (CONTEXT §5).
- **`LESSON_TEMPLATE.md` v2** (D-021): section-by-section component guide, java-track conventions (one output per
  program, JDK 25/27-stable goldens, preview-feature tests, exercise layout, snippet line length), website conventions
  (Terminal forms, `needs`, quiz wording, MDX quoting, Mermaid layout, widget + Java-fixture pattern), and a stricter
  DoD (JVM-produced expected values, `--release` check for "since Java N", phone-width overflow check, CI on 25 + 27).
- Final checks: `npm run verify` OK; screenshots of both lessons, showcase, home and roadmap: no page errors, no overflow.

**Next:** ⏸️ ask the user to approve Phase 3 (D-020). After approval: Phase 3 = T0 Launchpad + T1 Data & Types.

---

## 2026-09-24 — Session 2 (cont.): Pilot B `floating-point` done

- **Facts verified on JDK 25** (and the `--release` trick to date APIs): the notes' 4.125f/0.7f bit patterns; exact 0.7f =
  0.699999988079071044921875 (rounded, not truncated); `0.1f + 0.2f == 0.3f` is true; `DoubleStream.sum()` gives 1.0
  where a loop gives 0.9999999999999999; `String.format("%.2f", 1.005)` → 1.01 (Python 1.00); `%.20f` hides binary
  digits; `Float.floatToFloat16` since 20, `Math.fma` since 9; `jdk.incubator.vector.Float16` in 25; primitive patterns
  (JEP 507 preview) behaviour; JDK 19 shortest `toString` (release note JDK-8291475: 2e23, 1e-323 → 9.9E-324).
- **Built:** java-track `track.floating_point` (programs, goldens, preview test, 3 exercises); interactive IEEE 754 lab
  whose JS arithmetic is checked against Java fixtures on every `npm run verify`; `FloatSpacing` SVG; lesson page.
- **Bugs the checks caught:** Java's `toString` tie rule (even digit) and the power-of-two asymmetric rounding
  interval (my first JS version differed on 48 of 1,999 random patterns → reimplemented the JDK spec exactly with
  BigInt); text → double → float double rounding (`1.00000017881393432617187499`); error readout underflowing to 0
  (now formatted from exact digits); an expected value I had typed by hand instead of computing on the JVM.
- **Site-wide fixes:** no code ligatures (`==`, `->` looked like `═`, `→`); quiz fieldsets no longer widen the page on
  phones; `BitLayout` rows wrap; display math scrolls; `scripts/screenshots.mjs` now reports any element wider than a
  phone screen.
- `mvn verify` 169 tests green; `npm run verify` OK (129 pages).

**Next:** Phase 2 retro (tune `LESSON_TEMPLATE.md` from both pilots), then ⏸️ ask the user before Phase 3 (D-020).

---

## 2026-09-24 — Session 2: Pilot A `jdk-jre-jvm` done

- Resumed in the same container. CI on `eedccb6` green (java-track on JDK 25 + 27, incl. `JlinkRuntimeTest`, so
  Temurin 27's jlink works without `jmods/`; website). PR https://github.com/Gaurvendra/Notes/pull/1 tracks the branch.
- **New user decision D-020:** ask for approval before starting Phase 3 (recorded in CONTEXT, PLAN, CLAUDE.md).
- Second screenshot review of `/lessons/jdk-jre-jvm/` and `/dev/showcase/` (dark, light, mobile): LayerDiagram,
  in-order Terminal sessions, exercise run blocks and wrapped code all render well. Fixed: WORA flowchart → top-down
  (phones), cheat-sheet tables stack below 40rem, duplicate "(choose all that apply)" in quiz Q6.
- `jdk-jre-jvm` → `status: done`; curriculum tool OK; `npm run verify` OK.

**Next:** Pilot B `floating-point`, then the Phase 2 template retro, then ⏸️ ask the user before Phase 3 (D-020).

---

## 2026-09-24 — Session 1 (cont.): Phase 1 closed, Pilot A `jdk-jre-jvm` nearly done

- **CI:** first java-track run failed on JDK 27 only: javac 27 words the `@Override` error differently ("fly1() in
  Eagle does not override…" vs "method does not override…"). Expectation relaxed, audit 18.5 records both. Both
  workflows now green on JDK 25 + 27, so Phase 1 is ✅.
- **Pilot A facts verified** (JDK 25.0.4.1, JDK 21): class-file majors 55/61/65/69; `--release 21` output runs on 21;
  exact `UnsupportedClassVersionError` text; `-source/-target` + `IO.println` compiles then fails on 21 with
  `NoClassDefFoundError: java/lang/IO`; jlink java.base = 55 MB vs JDK 330 MB (42 MB with zip-9), bin = java + keytool;
  java.sql pulls java.logging/transaction.xa/xml; jcmd attaches to a java.base-only runtime but JFR fails ("Module
  jdk.jfr not found"); jlink image without CDS starts 79 ms vs 47 ms (`--generate-cds-archive`, +27 MB); preview
  classes have minor 0xFFFF; `Runtime.Version.parse("1.8.0_402")` throws; Temurin enabled JEP 493 from JDK 24.
- **Built:** java-track `track.jdk_jre_jvm` (8 programs + goldens, `JdkJreJvmExamplesTest`, `JlinkRuntimeTest`,
  3 exercises); lesson data YAML; full lesson MDX; components `Terminal`, `FaqItem`, `CheatSheet`, `LayerDiagram`;
  Exercise `needs` prop; Expressive Code soft wrap; parent POM sets `surefire.failIfNoSpecifiedTests=false` so
  `-Dtest=OneTest` works. `mvn verify` 138 tests green; `npm run verify` OK (129 pages, links OK).
- **Lessons for the template (apply in the Phase 2 retro):** keep snippet lines ≲ 75 chars; nested Mermaid subgraphs
  are unreadable (use `LayerDiagram`); terminal output must be real captures (`Terminal session` + `capturedOn`) or
  tested files (`Terminal command` + `outputFile`); T0 exercises need a `needs` note; JPMS is out of scope, don't link it.

**Next:** re-take and review screenshots of `/lessons/jdk-jre-jvm/` and `/dev/showcase/`, then mark `jdk-jre-jvm`
done (see PLAN Phase 2), then Pilot B `floating-point`.

---

## 2026-09-24 — Session 1 (cont.): Phase 1C website foundation done

- Astro 7.3.5 + Starlight 0.42.3 site in `website/`; curriculum-driven sidebar, stubs for all 98 lessons + 20 checkpoints.
- Components: LessonHeader/Progress (auto-injected), Callout, MythVsFact, VersionBadge, JavaExample, CompileResult,
  PredictOutput, Exercise, InterviewQ/InterviewSet, Quiz + Flashcards (Preact islands, lesson-data YAML with zod
  schema), MemoryDiagram (SVG), BitLayout, Stepper, RoadmapDAG (tier-band layout; replaced dagre, which produced a
  6828px-wide graph), TierBoard, NextUp.
- Gotchas found: Astro 7's default Markdown processor is Sätteri, so math needs `unified()`; js-yaml 5 at top level broke
  Starlight's default import, so pinned js-yaml 4.3.2; a javac surprise worth teaching: a missing return type in an
  **interface** gives `<identifier> expected`, in a class `invalid method declaration; return type required`.
- java-track: `Golden` output files (site shows exactly what tests verify), lesson compile-result cases + test.
- Checks: `npm run verify` (stubs, `astro check` 0 errors, build 129 pages, links + anchors OK); screenshots reviewed
  (dark/light/mobile). `mvn verify` green.

**Next:** Phase 1D (CI workflows, local run docs, transcripts 14-15 and 16).

---

## 2026-09-24 — Session 1 (cont.): Phase 1A/1B done (`java-track`)

- Maven multi-module project `java-track/` (testkit, examples, practice, solutions), Java 25 enforced.
- testkit: `ConsoleCapture`, `CompileCheck` (normalises javac API messages to CLI-style simple names; found because 6
  audit compile checks differed only in qualified names), `Snippets`.
- Audit regression suite: all batch 1–4 facts as JUnit tests + 56 compile-check cases (moved into test resources).
- Practice/solutions wiring proven: `mvn verify` runs the shared exercise tests against solutions; `-Dpractice` runs
  them against the learner's stubs (red until solved).
- Fixed a test of my own that read `Init.ran` (which itself initialises the class) before asserting laziness.
- `mvn verify` green on JDK 25.0.4.1: 94 tests.

**Next:** Phase 1C (Astro Starlight site).

---

## 2026-09-24 — Session 1 (cont.): plan approved → v3, Phase 1 started

**User approved** the recalibrated plan and chose: **full in-depth Generics & Collections** and **add a Concurrency
gap-fill tier**. Applied as curriculum **v3**: 98 lessons, 20 tiers, 186 edges (validator OK, 305/305 audit items
mapped). New tiers: T10 Generics (3), T11 Collections Foundations (5), T12 Maps, Queues & Sequenced (4),
T15 Concurrency Foundations (4), T16 Modern Concurrency (4). PLAN phases now 1–16; CONTEXT D-015..D-019 recorded.

**Next:** Phase 1A/1B (repo layout, `java-track`), then 1C (site), 1D (CI).

---

## 2026-09-24 — Session 1 (cont.): Phase 0B, batch 4 (final) + recalibration

**Received (final batch, user: "these are the last pdf"):** 28 Streams, 40 Sequenced Collections, 41 Sealed Classes,
Optional.

**Done**
- Saved PDFs + extracted text; transcript for the image-only Streams note.
- Audited 44 items (305 total). Key corrections: the notes' `mapToInt` example throws `IllegalStateException`
  (filter result discarded); subtraction comparators overflow; 10-element parallel benchmark is warm-up noise;
  `findAny` isn't random; pre-21 `Deque.reversed()` didn't exist and `Collections.reverse` isn't a view; Optional/JSON
  claim contradicted by Jackson 2.22.3 (throws) and 3.2.3 (native support); Optional isn't `Serializable`; `orElse`
  is eager.
- Verification: `source-notes/verification/batch4/` (runtime, sealed compile checks, Jackson check via Maven).
- **Recalibration (Phase 0B step 5):** curriculum v2 → `project-plan/curriculum.yaml` (81 lessons, 16 tiers, 4
  levels, 146 edges) + `tools/curriculum.py` validator/renderer (acyclic, 305/305 audit items mapped, negative-tested)
  → regenerated `CURRICULUM.md`; `PLAN.md` rewritten (phases 1–14, per-lesson workflow, risks); `CONTEXT.md` decisions
  D-015..D-018, environment (Maven 429, Jackson versions, mermaid-cli), open questions; `LESSON_TEMPLATE.md`
  front-matter now defers to the YAML; `CLAUDE.md` resume steps updated. Package versions re-checked (Astro 7.3.5,
  Starlight 0.42.3, MDX 8.0.2, Mermaid 12.0.0).

**Next:** ⏸️ user approval of the recalibrated plan (+ gap-fill depth + concurrency questions) → Phase 1.

---

## 2026-09-24 — Session 1 (cont.): Phase 0B, batch 3 intake

**Received:** 17 Reflection, 18 Annotations, 19 Exception Handling, 20 Operators, 21 Control Flow. Notes 17/18/19/21
are tall image-only pages, so they were sliced and read, and **full transcripts** were written to
`source-notes/transcripts/`. Note 20 is handwritten (text layer + screenshots viewed).

**Done**
- Saved PDFs, extracted text (20), transcripts (17, 18, 19, 21) and READMEs.
- Audited 78 items → `AUDIT.md` batch-3 sections. Key corrections: operator worked example = **43** not 39;
  `>>>` on a byte is promoted to int first (the 8-bit examples don't hold in Java without masking); shift distance
  masking and `>>` rounding on negatives; OOM example works only via int overflow; "compile-time exception" is a
  misnomer; **finally does run on OutOfMemoryError**; "return not possible in switch" applies only to switch
  expressions; switch supports any reference type since Java 21 (long/boolean still preview); arrow vs yield are
  independent; `Class.forName` needs the binary name and initialises; `Class.newInstance()` deprecated;
  `setAccessible` limits (strong encapsulation, static final, records); `@SuppressWarnings` has no `@Target` in
  recent JDKs; default retention is CLASS; `@Inherited` ignores interfaces; `@SafeVarargs` is a promise, and the
  notes' example breaks it (ClassCastException later).
- Executable evidence in `source-notes/verification/batch3/` (85 runtime lines, 29 compile checks) on JDK 25.0.4.1.
- `CONTEXT.md` §2/§3, `PLAN.md` batch table, `CURRICULUM.md` inbox (batch 3) + scope list updated.

**Next:** wait for more notes (or "that's all" → recalibrate).

---

## 2026-09-24 — Session 1 (cont.): Phase 0B, batch 2 intake

**Received:** 09 Memory Management, 12-13 POJO/Enum/Singleton classes, 14-15 Interface, 16 Functional Interface &
Lambda. Notes 14-15 and 16 are tall single-image pages with no text layer, so the images were extracted, sliced
and read strip by strip (tiny regions cropped at full resolution).

**Done**
- Saved PDFs + extracted text; added `source-notes/extracted-text/README.md` (how to read each note).
- Installed **JDK 25.0.4.1** (needed `apt-get update` first; `JAVA_HOME` still points to 21, so documented it).
- Audited 91 items → `AUDIT.md` batch-2 sections. Key corrections: CMS removed in JDK 14 (notes list it as
  current); the weak-reference variable is not nulled (`get()` returns null); mark phase marks *live* objects and
  young GC copies survivors; static fields aren't in Metaspace; eager singleton is created on first use, not at
  program start; the DCL explanation (L1 cache) is not the real mechanism (it's unsafe publication/reordering;
  `volatile` = JMM ordering); the "immutable" class example is mutable through the constructor's list; enum
  ordinal is always the position (custom values don't change it) and enum setters create global mutable state;
  an interface cannot extend a class; a sub-interface *can* implement a parent's method via `default`; static
  interface methods aren't inherited; `@FunctionalInterface` is an annotation.
- Executable evidence saved in `source-notes/verification/` (batch 1 + batch 2: runtime, compile and JVM checks);
  batch-1 checks re-run on JDK 25 with identical output.
- `CONTEXT.md` §3/§5/§7, `PLAN.md` batch table, `CURRICULUM.md` recalibration inbox, `CLAUDE.md` setup updated.

**Next:** wait for more notes (or "that's all" → recalibrate).

---

## 2026-09-24 — Session 1 (cont.): user decisions

**User answered:** framework → **Astro Starlight**; hosting → **local for now**; pilot → **no feedback pause**;
approval → **not yet**: user will share more notes first. After all notes are in, recalibrate the DAG + phases and
get approval before any build work (D-014).

**Done:** recorded decisions in `CONTEXT.md`, added **Phase 0B** (notes intake + recalibration) to `PLAN.md`, switched
Phase 1 tasks to Astro Starlight, removed the pilot stop, updated `CLAUDE.md` resume protocol.

**Next:** wait for the user's next batch of notes → Phase 0B steps 1–4 per batch.

---

## 2026-09-24 — Session 1 (Phase 0: discovery, audit & planning)

**Done**
- Read all 5 notes (39 pages). Text extracted with PyMuPDF; diagrams and code screenshots checked visually.
- Saved PDFs → `source-notes/pdf/`, extracted text → `source-notes/extracted-text/`.
- Wrote `source-notes/AUDIT.md`: claim-by-claim verification. Key corrections found: boolean default is `false`
  (notes: True); `char` is UTF-16, not ASCII; promotion is a compile-time type rule, not "when range crosses";
  wrappers are immutable & Java is pass-by-value (notes: wrappers give pass-by-reference); constructors don't
  implicitly return the class; default constructor doesn't set default values; JRE no longer shipped separately
  since JDK 11; Java 25 flexible constructor bodies change the "super() first" rule; plus typos in demo code.
  Numeric claims verified by running code on JDK 21.
- Researched current state: JDK 25 = LTS; JDK 26 GA 2026-03-17; JDK 27 GA 2026-09-15; tool versions.
- Designed the learning DAG (`CURRICULUM.md`): 39 lessons in 7 tiers + 7 checkpoints + hubs.
- Wrote `PLAN.md` (phases 0–12 + recurring intake), `CONTEXT.md`, `LESSON_TEMPLATE.md`, `CLAUDE.md`.

**Next**
- Wait for user approval + answers (framework, hosting, pilot-first, notes #3/#5).
- Then Phase 1A: install JDK 25, create repo layout.

**Blockers / notes**
- openjdk.org, docs.oracle.com, dev.java are blocked by the environment's network policy (WebSearch works).
