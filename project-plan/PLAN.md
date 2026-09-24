# Master Plan: Java Mastery Track (v4, the Hot Streak–style revamp)

> **Status:** 🔄 **Revamp in progress** (D-023, 2026-09-24): the site is rebuilt as a simple, modern static app in the
> style of the user's LustyDev "Hot Streak" study tracker, with **no JDK/JRE/JVM** in the build or the workflow, and
> without reducing any content. Phases 0–2 of this plan are done in this revamp; then ⏸️ **wait for the user's
> approval before Phase 3** (D-020).
>
> **Phases are internal work packages.** They never appear on the website; the site is organised by the learning DAG
> in `curriculum.yaml` (levels → tiers → lessons).
>
> **How to resume:** find the first phase that isn't ✅ and its first unchecked `[ ]` task. Update this file and
> `PROGRESS_LOG.md` (+ lesson `status` in `curriculum.yaml`, then `python3 project-plan/tools/curriculum.py`) in the
> same commit.

## What the product is

A static study-and-practice app for Java, for a senior developer / engineering manager preparing for interviews:
- **Path**: 4 levels → 20 tiers → 98 lessons (+ 20 level-up checkpoints); lessons unlock as prerequisites are done.
- **Lessons**: long-form guides (why it matters, TL;DR, mental model, concepts, scenarios, under the hood, myths vs
  facts, doubts, pitfalls, senior lens, modern Java, practice, quiz, interview questions, cheat sheet, flashcards).
- **Practice & prep**: interview bank, practice (predict-the-output, exercises), spaced-repetition revision of
  flashcards, XP / levels / streaks / badges, activity heatmap, ⌘K search, 7 colour schemes in light and dark.
- **Everything in the browser**: no backend, no account; progress in local storage with export/import.
- **Runs anywhere**: `npm run dev`, or Docker (`docker compose up -d --build` → http://localhost:8080).

## Phase overview

| Phase | Work package | Status |
|---|---|---|
| 0 | Discovery, notes audit (done in v1) and the revamp plan | ✅ |
| 1 | New app foundation: shell, themes, path, lesson page, game layer, content components, Docker, CI | 🔄 |
| 2 | Pilot lessons ported without losing content (`jdk-jre-jvm`, `floating-point`) + authoring guide v3 | |
| ⏸️ | **User approval before Phase 3** (D-020) | waiting |
| 3 | T0 Launchpad + T1 Data & Types (+ checkpoints 0–1) | |
| 4 | T2 Operators & Control Flow | |
| 5 | T3 Methods Essentials + T4 References & Memory Basics | |
| 6 | T5 Methods Advanced & Constructors + T6 OOP Core | |
| 7 | T7 Special Classes & Patterns + T8 Interfaces & Modern Type Design | |
| 8 | T9 Exceptions + T10 Generics | |
| 9 | T11 Collections Foundations + T12 Maps, Queues & Sequenced Collections | |
| 10 | T13 Functional Java + T14 Streams & Optional | |
| 11 | T15 Concurrency Foundations + T16 Modern Concurrency | |
| 12 | T17 Reflection & Annotations | |
| 13 | T18 JVM Memory & GC + T19 Expert Deep Dives | |
| 14 | Hubs: interview bank, practice & mini-projects, cheat sheets, glossary, Java versions, notes audit | |
| 15 | Quality & polish: accuracy pass, offline (PWA), accessibility, performance | |
| 16 | Release: hosting (ask the user) | |

**Per-lesson workflow (Phases 3–13), no JDK/JRE/JVM anywhere (D-023):**
1. `git pull`. Read only what the lesson needs: its `curriculum.yaml` entry, its audit items in
   `source-notes/AUDIT.md` (grep the ids), the mapped note pages/transcripts, and the pilot lessons as models.
2. Write `app/src/content/lessons/<id>.mdx` following `LESSON_TEMPLATE.md` (all sections, all components) and
   `app/src/content/lesson-data/<id>.yaml` (quiz ≥ 8, interview ≥ 10, flashcards ≥ 8).
3. **Accuracy without a JDK:** facts come from `AUDIT.md` and `source-notes/verification/` (already verified by
   execution), the pilots, and primary sources (JLS, JVMS, JEPs, API docs). Outputs shown in a lesson must be fully
   determined by the spec or already evidenced; anything else goes into `project-plan/VERIFY_LATER.md`.
4. Set `status: done`, tick the box here, add a short `PROGRESS_LOG.md` entry, commit, push (2–4 lessons per push).
5. Check the CI result once (one `mcp__github__actions_list` call): it type-checks, validates the curriculum and the
   lesson data, and builds the site. Fix if red.

---

## Phase 0 — Discovery, notes audit & plan ✅

- [x] v1 (2026-09-24): all 21 notes read, transcribed where image-only, audited claim by claim with executable
      evidence → `source-notes/AUDIT.md` (305 items) and `source-notes/verification/`
- [x] Notes intake batches:

| Batch | Date | Notes | Result |
|---|---|---|---|
| 1 | 2026-09-24 | 01, 02, 04, 06, 07-08 | ✅ 92 items |
| 2 | 2026-09-24 | 09, 12-13, 14-15, 16 | ✅ 91 items (11 ⚠️), verified on JDK 25.0.4.1 |
| 3 | 2026-09-24 | 17, 18, 19, 20, 21 | ✅ 78 items (10 ⚠️), transcripts for 17/18/19/21 |
| 4 (final) | 2026-09-24 | 28, 40, 41, Optional | ✅ 44 items (4 ⚠️), transcript for 28, Jackson 2/3 check |

- [x] Learning DAG v3 approved by the user: 98 lessons, 20 tiers, 4 levels, 186 edges (`curriculum.yaml`, D-015..D-019)
- [x] v1 built an Astro site + a Maven `java-track` and two pilot lessons (see PROGRESS_LOG, git tag `v1-astro-java-track`)
- [x] **Revamp decision (D-023):** rebuild as a Hot Streak–style React app (reference: `Gaurvendra/LustyDev`,
      `apps/forge`), keep every piece of content, drop the JDK/JRE/JVM toolchain, re-plan all phases (this file)

## Phase 1 — New app foundation

- [ ] `app/`: React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router + lucide icons; fonts Space Grotesk /
      Inter / JetBrains Mono; the 7 LustyDev colour schemes (light + dark) and theme switcher
- [ ] Content pipeline: MDX lessons (GFM tables, KaTeX maths, build-time Shiki syntax highlighting, front-matter),
      curriculum read from `project-plan/curriculum.yaml`, lesson data (quiz/interview/flashcards) from YAML
- [ ] Shell: top bar (search ⌘K, theme, XP/level/streak), sidebar, mobile drawer
- [ ] Pages: Home (today / continue / stats), Path (levels → tiers → lessons, unlocks, checkpoints), Lesson (header
      chips, prerequisites → unlocks, guide or outline, mark complete, next up), Revision (spaced-repetition
      flashcards), Interview (all questions, filters), Practice (puzzles & exercises), Profile (XP, level, streak,
      badges, heatmap), Settings (theme, export/import/reset)
- [ ] Game layer: XP for lessons, quizzes and reviews; levels; streak; badges; activity heatmap
- [ ] Content components: callouts, myth vs fact, FAQ, tabs, code + output, terminal, exercise, predict-the-output,
      quiz, interview set, flashcards, cheat sheet, version badge, bit layout, layer diagram, SVG diagram kit
- [ ] Docker (Node build → nginx, SPA fallback) + `docker compose` on port 8080; CI: curriculum check, content check,
      type-check and build (no JDK)

## Phase 2 — Pilot lessons ported → ⏸️ approval

- [ ] `jdk-jre-jvm`: every section, diagram, example, output, puzzle, exercise, quiz, interview question, flashcard
- [ ] `floating-point`: same, plus the interactive IEEE 754 lab (still checked against the JVM-generated fixtures)
- [ ] `LESSON_TEMPLATE.md` v3 (MDX authoring guide + Definition of Done without a JDK)
- [ ] Old `website/` (Astro) and `java-track/` (Maven) removed; recoverable from tag `v1-astro-java-track`
- [ ] ⏸️ **Ask the user to approve Phase 3** (D-020)

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

- [ ] Interview hub: ≥ 1,000 questions with filters (topic, level, type), rapid-fire mode, ≥ 5 timed mock sets,
      "how to answer" frameworks for senior and manager roles
- [ ] Practice hub: exercise index with status, predict-the-output bank, debugging challenges, 8 mini-projects
      (money ledger, library system, expression evaluator, employee analytics, mini validation/DI framework,
      memory-leak lab, LRU cache, concurrent crawler/job runner)
- [ ] Cheat sheets per lesson and per tier (print-friendly); glossary; Java versions timeline (8 → 27)
- [ ] Notes-audit page (from `source-notes/AUDIT.md`)

## Phase 15 — Quality & polish

- [ ] Accuracy pass: every lesson vs its audit items and references; clear `VERIFY_LATER.md`
- [ ] Offline support (PWA, like Hot Streak), accessibility (contrast, keyboard, alt text), performance budget
- [ ] Proofreading and consistency; re-check Java facts if JDK 28 (Mar 2027) is out

## Phase 16 — Release

- [ ] Production build + Docker verified; README and maintenance guide (new JDK releases, adding lessons/notes)
- [ ] Ask the user for the hosting target (D-007) and deploy if they want it

## Phase ∞ — Future notes intake (repeat for every new batch of notes)

1. [ ] Save PDFs, extract text / transcribe, audit (`AUDIT.md`)
2. [ ] Update `curriculum.yaml` (new ids, edges, audit mapping) → run the curriculum tool (must print `OK`)
3. [ ] Add a content phase here with one checkbox per lesson; author lessons; update hubs

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Session/token loss mid-work | Small tasks; commit + push after every 2–4 lessons; this file + `PROGRESS_LOG.md` always current |
| Factual errors without a JDK | Facts from the executed audit evidence and primary sources; outputs only when spec-determined; `VERIFY_LATER.md` for anything else, cleared in Phase 15 |
| Scale (98 lessons + 20 checkpoints + hubs) | Components built once; pilots are the model; per-lesson workflow |
| Scope creep beyond the notes | Scope + gap-fill table in `CURRICULUM.md`; out-of-scope topics only as "just enough" callouts |
| Java moves on (JDK 28 in Mar 2027) | `lastVerified` per lesson; versions timeline; maintenance guide |
| Hosting undecided | Local (dev server or Docker) for now (D-007); decide in Phase 16 |
