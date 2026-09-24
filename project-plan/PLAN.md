# Master Plan: Java Mastery Track

> **Status:** Plan **v3 approved by the user on 2026-09-24** (with full Generics & Collections and a Concurrency
> track). ✅ Phase 1 (Foundations) done, CI green on JDK 25 + 27. 🔄 **Phase 2 (pilot lessons) in progress.**
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

## Phase 1 — Foundations ✅

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
- [x] Scaffold Astro 7.3.5 + Starlight 0.42.3 (TypeScript), site metadata, trailing-slash URLs `/lessons/<id>/`, `/checkpoints/tier-<n>/`
- [x] `src/lib/curriculum-core.mjs` reads `curriculum.yaml` → sidebar (levels → tiers → lessons + checkpoint), prev/next
      in DAG order, prerequisites/unlocks; throws (fails the build) on an invalid graph; stub pages generated by
      `scripts/sync-stubs.mjs` (98 lessons + 20 checkpoints; `--check` in CI)
- [x] Design system: Inter + JetBrains Mono (self-hosted), "Java coffee" accent tokens, light/dark, level colours,
      responsive; logo/favicon (`src/styles/theme.css`, `components.css`)
- [x] Integrations: MDX; `markdown.processor: unified()` (Astro 7 default is Sätteri) with remark-math + rehype-katex;
      astro-mermaid 2.1 (client-side, theme-aware); Pagefind + sitemap (built in); Preact islands
- [x] `<JavaExample>` (snippet regions + golden-file output), `<CompileResult>` (verified javac messages), `<PredictOutput>`, `<Exercise>` (practice/solutions/tests)
- [x] Components (Astro components + interactive islands):
  - [x] `<LessonHeader>` (auto-injected via PageTitle override: level, tier, times, verified-on, prerequisites → unlocks, source notes)
  - [x] `<Callout type="tldr|myth|fact|doubt|senior|pitfall|tip|version|deep-dive">` + `<MythVsFact>`
  - [x] Scenario `<Tabs>` (Starlight built-in)
  - [x] `<Quiz>` (Preact island; single/multi answer, per-option explanations, score) from lesson data
  - [x] `<PredictOutput>` (code → reveal verified output + explanation)
  - [x] `<Exercise>` (difficulty, statement, starter, tests, hints, solution from `solutions/`)
  - [x] `<InterviewQ>` + `<InterviewSet>` (from `src/content/lesson-data/<id>.yaml`, zod-validated, aggregatable for the hub)
  - [x] `<Flashcards>` (Preact island: flip, shuffle, review pile in localStorage)
  - [x] `<VersionBadge since|preview|incubator|deprecated|removed jep>`
  - [x] `<RoadmapDAG>` (tier-band SVG layout with barycenter ordering, hover/focus traces prerequisites, progress colours) + `<TierBoard>` + `<NextUp>`
  - [x] Mark complete + "Next up" (auto-injected via Footer override); checkpoint stub layout
  - [x] `<MemoryDiagram>` (build-time SVG: frames, heap, pool, popped/unreachable states), `<BitLayout>` (groups, weights, signed MSB)
  - [x] `<Stepper>`/`<Step>` (custom element, keyboard arrows, no-JS fallback shows all steps)
- [x] Pages: Home (splash), Start here (paths, lesson anatomy, setup), Roadmap, 6 hub placeholders, 404
- [x] `/dev/showcase/` renders every component; screenshots checked in dark, light and mobile (`scripts/screenshots.mjs`); `astro check` 0 errors; `scripts/check-links.mjs` all links + anchors OK

**1D. CI & local run**
- [x] GitHub Actions: `website.yml` (curriculum validation, `npm ci`, `npm run verify`, site artifact) and
      `java-track.yml` (JDK 25 + 27 matrix, `mvn verify`); action majors checked: checkout v7, setup-java v6,
      setup-node v7, setup-python v7, upload-artifact v7; website job simulated on a clean copy
- [x] Local run docs in root `README.md` (dev, verify, preview, mvn, curriculum tool); no deploy workflow yet (D-007)
- [x] ~~Transcribe notes 14-15 and 16~~ → moved to the start of Phase 7 (interfaces) and Phase 10 (functional), where they're used

**Exit criteria:** site builds (only framework-level warnings); showcase renders every component; `mvn verify` green; CI green.

## Phase 2 — Pilot lessons (internal quality gate)

- [x] Pilot A: `jdk-jre-jvm` (concept + diagram heavy) at full Definition of Done ✅ (2026-09-24)
  - [x] Facts verified on real JDK 25 + 21 (transcripts in the page are real captures); java-track `track.jdk_jre_jvm`:
        8 example programs with golden outputs, `JlinkRuntimeTest` (builds a java.base-only runtime on CI),
        3 exercises (ModuleOf, ClassFileVersion, RuntimePlanner) with stubs, shared tests and solutions; `mvn verify` 138 tests green
  - [x] Lesson data `website/src/content/lesson-data/jdk-jre-jvm.yaml` (10 MCQs, 12 interview Qs, 13 flashcards) and
        full MDX page `website/src/content/docs/lessons/jdk-jre-jvm.mdx`; new components `Terminal`, `FaqItem`,
        `CheatSheet`, `LayerDiagram`/`LayerBox`; `Exercise` gained `needs`; code blocks soft-wrap; `npm run verify` OK
  - [x] First screenshot review done; fixes applied (unreadable nested Mermaid → `LayerDiagram`, Terminal shows
        commands and output in order, shorter code lines, exercise run command as a code block, shorter question titles)
  - [x] Second screenshot review (dark/light/mobile): flowchart switched to top-down for phones, cheat-sheet tables
        stack on narrow screens, duplicate "(choose all that apply)" removed; `status: done` set
- [x] Pilot B: `floating-point` (deep technical + IEEE-754 interactive visualiser) at full Definition of Done ✅ (2026-09-24)
  - [x] java-track `track.floating_point`: 11 programs with goldens, a tested preview demo (`FitsInFloat`, compiled with
        `--enable-preview` for the running JDK), 3 exercises (FloatBits, Tolerance, FloatDecoder vs 10,000 random floats)
  - [x] Interactive IEEE 754 lab (`FloatLab` island + `src/lib/ieee754.mjs`) checked against Java-generated fixtures
        (`npm run check:floatlab`: 86 inputs + 1,999 random bit patterns + error readouts), `FloatSpacing` diagram
  - [x] Lesson data (10 MCQs, 12 interview Qs, 12 flashcards), full MDX page, screenshots reviewed (dark/light/mobile)
- [ ] Self-review both against `LESSON_TEMPLATE.md` (+ light/dark/mobile screenshots); fix gaps
- [ ] Tune `LESSON_TEMPLATE.md` from what the pilots taught; record changes in the CONTEXT decisions log; continue

## Phase 3 — T0 Launchpad + T1 Data & Types

- [ ] ⏸️ **Stop point (D-020): ask the user for approval before starting this phase** (show both pilot lessons and the tuned template)
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

- [ ] Transcribe note 14-15 (Interfaces) to `source-notes/transcripts/` first

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

- [ ] Transcribe note 16 (Functional Interfaces & Lambdas) to `source-notes/transcripts/` first

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
