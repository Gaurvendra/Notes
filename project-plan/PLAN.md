# Master Plan: Java Mastery Track

> **Status:** Plan **v3 approved by the user on 2026-09-24** (with full Generics & Collections and a Concurrency
> track). 🔄 **Phase 1 (Foundations) in progress.**
> **Last updated:** 2026-09-24
>
> **Phases are internal work packages for task management only.** They never appear on the website; the website
> is organised by the learning DAG in `CURRICULUM.md` (source: `curriculum.yaml`).
>
> **How to resume:** find the first phase that isn't ✅ and the first unchecked `[ ]` task in it. Each task is small
> enough to finish, commit and push in one sitting. Always update this file + `PROGRESS_LOG.md` (+ lesson `status` in
> `curriculum.yaml`, then run `python3 project-plan/tools/curriculum.py`) in the same commit.

## Phase overview

| Phase | Name | Output | Size | Status |
|---|---|---|---|---|
| 0 | Discovery, audit & planning (batch 1) | Notes saved, audit, plan/context/curriculum/template | – | ✅ done |
| 0B | Notes intake (batches 2–4) + recalibration | 18 PDFs / 21 notes audited (305 items); DAG v3 (98 lessons, 20 tiers); phases rewritten; **approved** | – | ✅ done |
| 1 | Foundations | Astro Starlight site with all learning components + widgets framework; `java-track` Maven project; CI | L | 🔄 in progress |
| 2 | Pilot lessons (internal quality gate) | `jdk-jre-jvm` + `floating-point` at full quality, self-reviewed; template tuned (no user stop, D-009) | M | ⏳ |
| 3 | Content: T0 Launchpad + T1 Data & Types | 11 lessons (incl. pilots) + 2 checkpoints + widgets: two's complement, IEEE-754, casting explorer | L | ⏳ |
| 4 | Content: T2 Operators & Control Flow | 7 lessons + checkpoint + widgets: bit/shift explorer, switch flow | M | ⏳ |
| 5 | Content: T3 Methods Essentials + T4 References & Memory Basics | 11 lessons + 2 checkpoints + widgets: call-stack stepper, stack/heap memory stepper | L | ⏳ |
| 6 | Content: T5 Methods Advanced & Constructors + T6 OOP Core | 13 lessons + 2 checkpoints + widgets: init-order stepper, dispatch visualiser | XL | ⏳ |
| 7 | Content: T7 Special Classes + T8 Interfaces & Modern Types | 9 lessons + 2 checkpoints | L | ⏳ |
| 8 | Content: T9 Exceptions + T10 Generics | 7 lessons + 2 checkpoints + widget: exception propagation | M | ⏳ |
| 9 | Content: T11 Collections Foundations + T12 Maps, Queues & Sequenced | 9 lessons + 2 checkpoints + widgets: ArrayList growth, HashMap bucket visualiser, binary-heap (PriorityQueue) | L | ⏳ |
| 10 | Content: T13 Functional Java + T14 Streams & Optional | 9 lessons + 2 checkpoints + widget: stream pipeline visualiser | L | ⏳ |
| 11 | Content: T15 Concurrency Foundations + T16 Modern Concurrency | 8 lessons + 2 checkpoints + widgets: thread interleaving / race visualiser, happens-before explorer | L | ⏳ |
| 12 | Content: T17 Reflection & Annotations | 5 lessons + checkpoint | M | ⏳ |
| 13 | Content: T18 JVM Memory & GC + T19 Expert Deep Dives | 9 lessons + 2 checkpoints + widget: generational GC simulator | L | ⏳ |
| 14 | Hubs | Interview Prep hub (≥ 1,000 Qs, mock sets), Practice hub (+ 8 mini-projects), cheat sheets, glossary, versions timeline, notes-audit page | L | ⏳ |
| 15 | Quality assurance & polish | Full technical re-review, tests on JDK 25 + 27, a11y, mobile/dark screenshots, performance, proofreading | L | ⏳ |
| 16 | Release & handover | Local production build + README + maintenance guide; ask the user about the hosting target (D-007) | S | ⏳ |
| ∞ | Future notes intake (repeatable) | New notes → audit → DAG update → lessons → QA | – | recurring |

Order rationale: Phase 1 builds every reusable piece once. Phase 2 proves the lesson format on two very different
lessons before mass production. Phases 3–13 follow the DAG's topological order (tier by tier), so every lesson can link
to lessons that already exist. Hubs (14) aggregate content, so they come after it. QA (15) re-checks everything as a
whole. Sizes: S < M < L < XL (relative effort).

**Per-lesson workflow (Phases 2–13), repeated for each lesson in build order:**
1. Re-read the lesson's audit items (`AUDIT.md`), source-note pages/transcripts and prerequisites.
2. Write the examples, exercises (+ tests) and solutions in `java-track/`; `mvn verify` green on JDK 25.
3. Write the MDX page following `LESSON_TEMPLATE.md` (all sections), pulling code from `java-track`.
4. Self-review against the Definition of Done; build the site; check light/dark/mobile screenshots.
5. Set `status: done` in `curriculum.yaml`, run the curriculum tool, tick the box here, log in `PROGRESS_LOG.md`,
   commit + push.

---

## Phase 0 — Discovery, audit & planning ✅

- [x] Read all 5 batch-1 notes (39 pages); save PDFs + extracted text to `source-notes/`
- [x] Verify notes claim-by-claim with executable checks → `source-notes/AUDIT.md`
- [x] Research current Java state (JDK 25 LTS, JDK 26, JDK 27 GA 2026-09-15) and tooling versions
- [x] Design learning DAG v1, lesson template + Definition of Done, context/decisions, resume protocol
- [x] Ask user for approval + decisions → D-001 Astro Starlight, D-007 local hosting for now, D-009 no pilot pause,
      D-014 share more notes first, then recalibrate

## Phase 0B — Notes intake + recalibration ✅

| Batch | Date | Notes | Result |
|---|---|---|---|
| 1 | 2026-09-24 | 01, 02, 04, 06, 07-08 | ✅ 92 items |
| 2 | 2026-09-24 | 09, 12-13, 14-15, 16 | ✅ 91 items (11 ⚠️), verified on JDK 25.0.4.1 |
| 3 | 2026-09-24 | 17, 18, 19, 20, 21 | ✅ 78 items (10 ⚠️), transcripts for 17/18/19/21 |
| 4 (final) | 2026-09-24 | 28, 40, 41, Optional | ✅ 44 items (4 ⚠️), transcript for 28, Jackson 2/3 check |

- [x] 1–4. Intake, transcripts, audit and executable verification for every batch (`source-notes/verification/`)
- [x] 5. Recalibrate: DAG v2 in `curriculum.yaml`, validator/renderer `tools/curriculum.py`, `CURRICULUM.md`
      regenerated, phases rewritten, facts & versions re-checked in `CONTEXT.md`
- [x] 6. **User approved (2026-09-24)** with two changes → DAG v3 (98 lessons, 20 tiers, 186 edges; full Generics &
      Collections, Concurrency track); decisions D-015..D-019 recorded in `CONTEXT.md`

## Phase 1 — Foundations

**1A. Environment & repo layout**
- [x] JDK 25: `sudo apt-get update && sudo apt-get install -y openjdk-25-jdk-headless`; `export JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64`
- [x] Repo layout: `java-track/` (done), `website/` (1C), root `.gitignore`, `.editorconfig`

**1B. Companion code project `java-track/` (Maven, `maven.compiler.release=25`)**
- [x] Parent POM + modules `testkit`, `examples`, `practice`, `solutions`; JUnit 6.1.3, AssertJ 3.27.7, JOL 0.17; plugins pinned; enforcer requires Java 25
- [x] Package convention: one package per lesson id (`floating-point` → `track.floating_point`), documented in `java-track/README.md`
- [x] `ConsoleCapture` (classic + Java 25 instance `main`), tested
- [x] `Snippets` regions + `SourceConventionsTest` (balanced markers across modules)
- [x] `CompileCheck` (real `javac`, English messages with simple type names like the CLI), tested
- [x] Audit regression suite `track.audit` (batches 1–4 facts + 56 compile checks); practice↔solutions wiring proven with `track.template`
- [x] `mvn verify` green on JDK 25.0.4.1 (94 tests: testkit 6, examples 81, solutions 7)

**1C. Website `website/` (Astro + Starlight, TypeScript), per D-001**
- [ ] Scaffold with the latest stable Astro/Starlight (re-check versions), site metadata, clean URLs
- [ ] Read `project-plan/curriculum.yaml` at build time → sidebar (levels → tiers → lessons), prev/next in DAG order,
      prerequisites/unlocks; fail the build on an invalid graph (reuse the validator logic)
- [ ] Design system: typography, colour tokens (Starlight CSS custom properties), light/dark, tier/level colours,
      responsive layout, favicon/logo
- [ ] Integrations: MDX, Mermaid (a maintained integration; build-time SVG preferred, Chromium is available), KaTeX
      (remark-math + rehype-katex), Pagefind search (built in), sitemap; UI framework for islands (React or Preact)
- [ ] `<JavaExample file=… snippet=… showOutput />` on Starlight's `<Code>` (Expressive Code), reading `java-track` at build time
- [ ] Components (Astro components + interactive islands):
  - [ ] `<LessonHeader>` (tier, level, time full/fast-track, difficulty, "verified on Java 25", prerequisites → unlocks)
  - [ ] `<Callout type="tldr|myth|fact|doubt|senior|pitfall|version|deep-dive">`
  - [ ] Scenario `<Tabs>` styling (Starlight built-in)
  - [ ] `<Quiz>` (MCQ, per-option explanations, score)
  - [ ] `<PredictOutput>` (code → reveal output + explanation)
  - [ ] `<Exercise>` (difficulty, statement, hints, hidden solution, link to the test file)
  - [ ] `<InterviewQ>` (level, model answer, follow-ups, red flags, "what's being tested"); data exported for the hub
  - [ ] `<Flashcards>` (flip, shuffle, local "again/good" tracking)
  - [ ] `<VersionBadge since="25" status="final|preview">`
  - [ ] `<RoadmapDAG>` (interactive graph from curriculum data, progress from localStorage, click-through)
  - [ ] `<MarkComplete>` + "Next up" (unlocked lessons); `<Checkpoint>` page layout
  - [ ] Diagram primitives: `<MemoryDiagram>` (frames / heap objects / arrows / pool), `<BitLayout>` (sign/exponent/mantissa)
  - [ ] Widget framework for steppers (step through states with prev/next, used by later interactive widgets)
- [ ] Pages: Home (what/why/levels/paths), Roadmap, "How to use this track", Setup guide stub
- [ ] Component showcase page (dev only) to test every component in light/dark and at mobile width

**1D. CI & local run**
- [ ] GitHub Actions: `site.yml` (npm ci, `astro check`, build, link check, curriculum validation), `java.yml` (JDK 25 +
      27 matrix, `mvn verify`)
- [ ] Local run docs (`npm run dev`, `npm run build && npm run preview`, `mvn verify`); no deploy workflow yet (D-007)
- [ ] Transcribe notes 14-15 and 16 (the only image-only notes without transcripts yet)

**Exit criteria:** site builds without warnings; showcase renders every component; `mvn verify` green; CI green.

## Phase 2 — Pilot lessons (internal quality gate)

- [ ] Pilot A: `jdk-jre-jvm` (concept + diagram heavy) at full Definition of Done
- [ ] Pilot B: `floating-point` (deep technical + IEEE-754 interactive visualiser) at full Definition of Done
- [ ] Self-review both against `LESSON_TEMPLATE.md` (+ light/dark/mobile screenshots); fix gaps
- [ ] Tune `LESSON_TEMPLATE.md` from what the pilots taught; record changes in the CONTEXT decisions log; continue

## Phase 3 — T0 Launchpad + T1 Data & Types

- [ ] Widgets: two's-complement bit flipper / overflow wheel · IEEE-754 visualiser (done in pilot) · casting & promotion explorer
- [ ] T0: `java-landscape` · `jdk-jre-jvm` (pilot; re-check) · `first-program` · `how-java-runs` · `oop-mindset`
- [ ] Checkpoint 0
- [ ] T1: `variables-basics` · `integer-types` · `char-and-boolean` · `floating-point` (pilot; re-check) · `type-conversion` · `variable-kinds`
- [ ] Checkpoint 1

## Phase 4 — T2 Operators & Control Flow

- [ ] Widgets: bitwise/shift explorer (incl. promotion & masking) · switch fall-through flow
- [ ] `operators-arithmetic-relational-logical` · `operators-unary-assignment` · `bitwise-and-shift-operators` · `ternary-instanceof-precedence`
- [ ] `conditionals` · `switch-statements-and-expressions` · `loops-and-branching`
- [ ] Checkpoint 2

## Phase 5 — T3 Methods Essentials + T4 References & Memory Basics

- [ ] Widgets: call-stack stepper · stack/heap memory stepper (reused by pass-by-value, strings, arrays)
- [ ] T3: `methods-basics` · `call-stack` · `packages-access-modifiers` · `static-vs-instance`
- [ ] Checkpoint 3
- [ ] T4: `stack-heap-references` · `pass-by-value` · `reference-types` · `strings` · `arrays` · `wrappers-boxing` · `final-and-constants`
- [ ] Checkpoint 4

## Phase 6 — T5 Methods Advanced & Constructors + T6 OOP Core

- [ ] Widgets: object-initialisation-order stepper · dynamic dispatch visualiser
- [ ] T5: `overloading-resolution` · `varargs` · `constructors-basics` · `constructor-chaining-init-order` · `private-constructors-static-factories`
- [ ] Checkpoint 5
- [ ] T6: `classes-objects-deep` · `object-class-contracts` · `encapsulation` · `inheritance` · `polymorphism` · `abstract-classes` · `relationships` · `nested-and-anonymous-classes`
- [ ] Checkpoint 6

## Phase 7 — T7 Special Classes & Patterns + T8 Interfaces & Modern Type Design

- [ ] T7: `pojo-javabean-dto-records` · `enums` · `immutable-and-final-classes` · `singleton-pattern`
- [ ] Checkpoint 7
- [ ] T8: `interfaces-in-depth` · `interface-evolution-default-static-private` · `abstract-class-vs-interface` · `sealed-classes` · `records-and-pattern-matching`
- [ ] Checkpoint 8

## Phase 8 — T9 Exceptions + T10 Generics

- [ ] Widget: exception propagation through the call stack (reuses call-stack stepper)
- [ ] T9: `exceptions-basics` · `exception-handling-mechanics` · `try-with-resources` · `custom-exceptions-and-best-practices`
- [ ] Checkpoint 9
- [ ] T10: `generics-basics` · `generics-bounds-and-wildcards` · `generics-erasure-and-limitations`
- [ ] Checkpoint 10

## Phase 9 — T11 Collections Foundations + T12 Maps, Queues & Sequenced Collections

- [ ] Widgets: ArrayList growth/amortised cost · HashMap bucket & resize visualiser (incl. treeification) · binary heap for PriorityQueue
- [ ] T11: `collections-framework-overview` · `iterators-and-fail-fast` · `comparable-and-comparator` · `list-implementations` · `set-implementations`
- [ ] Checkpoint 11
- [ ] T12: `hashmap-internals` · `map-implementations` · `queues-and-deques` · `sequenced-collections`
- [ ] Checkpoint 12

## Phase 10 — T13 Functional Java + T14 Streams & Optional

- [ ] Widget: stream pipeline visualiser (vertical processing, laziness, stateful barriers, short-circuiting)
- [ ] T13: `functional-interfaces` · `lambda-expressions` · `built-in-functional-interfaces` · `method-references`
- [ ] Checkpoint 13
- [ ] T14: `streams-fundamentals` · `stream-operations` · `collectors-and-advanced-streams` · `parallel-streams` · `optional`
- [ ] Checkpoint 14

## Phase 11 — T15 Concurrency Foundations + T16 Modern Concurrency

- [ ] Widgets: thread interleaving / race-condition visualiser · happens-before explorer
- [ ] T15: `threads-basics` · `synchronization-and-locks` · `java-memory-model` · `atomics-and-concurrent-collections`
- [ ] Checkpoint 15
- [ ] T16: `synchronizers` · `executors-and-thread-pools` · `completablefuture` · `virtual-threads-and-structured-concurrency`
- [ ] Checkpoint 16

## Phase 12 — T17 Reflection & Annotations

- [ ] `reflection-basics` · `reflection-in-practice` · `annotations-builtin` · `meta-annotations` · `custom-annotations`
- [ ] Checkpoint 17

## Phase 13 — T18 JVM Memory & GC + T19 Expert Deep Dives

- [ ] Widget: generational GC simulator (Eden/S0/S1/Old, ages, promotion; from the note 09 walkthrough)
- [ ] T18: `jvm-architecture` · `jvm-memory-areas` · `garbage-collection-basics` · `gc-collectors` · `java-reference-types` · `memory-leaks-and-diagnostics`
- [ ] Checkpoint 18
- [ ] T19: `object-memory-layout` (JOL measurements) · `bytecode-and-dispatch` (real `javap` output) · `numbers-in-production`
- [ ] Checkpoint 19

## Phase 14 — Hubs

- [ ] Interview Prep hub: aggregated bank (≥ 1,000 Qs) with filters (topic, level, type), rapid-fire mode, ≥ 5 timed
      mock sets (one per level + a senior/manager set), "how to answer" frameworks for senior roles
- [ ] Practice hub: exercise index with difficulty & status, predict-output bank, debugging challenges, 8 mini-projects
      (money ledger, library system, expression evaluator, employee analytics, mini validation/DI framework,
      memory-leak lab, LRU cache, concurrent crawler/job runner)
- [ ] Cheat sheets per lesson and per tier (print-friendly)
- [ ] Glossary
- [ ] Java versions timeline (8 → 27) for covered topics
- [ ] Notes-audit page (from `source-notes/AUDIT.md`)

## Phase 15 — Quality assurance & polish

- [ ] Technical accuracy pass: every lesson vs its audit items + references; re-run claims as code
- [ ] `java-track` green on JDK 25 and 27 (CI)
- [ ] Links, anchors, sidebar/DAG consistency (curriculum tool + link checker)
- [ ] Accessibility: contrast, alt text, keyboard navigation for widgets, heading order
- [ ] Mobile & dark-mode screenshots of every page (Playwright + preinstalled Chromium)
- [ ] Performance: bundle size, Lighthouse ≥ 90
- [ ] Proofreading & consistency (glossary terms, tone, formatting); re-check Java facts if JDK 28 (Mar 2027) is out

## Phase 16 — Release & handover

- [ ] Production build verified locally (`npm run build && npm run preview`)
- [ ] Root `README.md`: what it is, how to run locally, how to practise
- [ ] Maintenance guide: new JDK releases, adding lessons/notes, adding interview questions
- [ ] Ask the user for the hosting target (D-007) and deploy if they want it

## Phase ∞ — Future notes intake (repeat for every new batch of notes)

1. [ ] Save PDFs, extract text / transcribe, audit (`AUDIT.md`) with executable verification
2. [ ] Update `curriculum.yaml` (new ids, edges, audit mapping) → run the curriculum tool (must print `OK`)
3. [ ] Add a content phase here with one checkbox per lesson; author lessons; update hubs; QA

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Session/token loss mid-work | Small tasks; commit + push after every lesson; this file + `PROGRESS_LOG.md` always current; `CLAUDE.md` resume protocol |
| Factual drift / errors | Code-backed claims (tests incl. expected-compile-error tests), primary references, audit mapping per lesson (validator enforces coverage), QA phase |
| Scale (98 lessons + 20 checkpoints + hubs) | Reusable components/widgets built once (Phase 1); per-lesson workflow; pilots tune the template before mass production |
| Doc sites blocked by network policy | Verify by executing code; WebSearch; user may allow `openjdk.org`, `docs.oracle.com`, `dev.java` in environment settings |
| Maven Central rate limits (HTTP 429 seen once with curl) | Use Maven (worked); retry with backoff; keep `~/.m2` warm within a session |
| Scope creep beyond the notes | Scope + gap-fill table in `CURRICULUM.md`; out-of-scope topics only as "just enough" callouts |
| Java moves on (JDK 28 in Mar 2027) | `lastVerified` per lesson; versions timeline; maintenance guide; JDK 27 in the CI matrix |
| Hosting undecided | Local-only for now (D-007); decide in Phase 16 |
