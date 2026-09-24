# Master Plan: Java Mastery Track

> **Status:** Phase 0 complete. ⏸️ **Waiting for user approval** before Phase 1.
> **Last updated:** 2026-09-24
>
> **Phases are internal work packages for task management only.** They never appear on the website; the website
> is organised by the learning DAG in `CURRICULUM.md`.
>
> **How to resume:** find the first phase that isn't ✅ and the first unchecked `[ ]` task in it. Each task is small
> enough to finish, commit and push in one sitting. Always update this file + `PROGRESS_LOG.md` in the same commit.

## Phase overview

| Phase | Name | Output | Status |
|---|---|---|---|
| 0 | Discovery, audit & planning | Notes saved, audit, plan/context/curriculum/template | ✅ done (awaiting approval) |
| 1 | Foundations (site + code project + CI) | Working Docusaurus site with all learning components; `java-track` Maven project; CI | ⏳ not started |
| 2 | Pilot lessons + feedback stop | 2 lessons at full quality → **user review** → template adjusted | ⏳ |
| 3 | Content batch: Tier 0 (Launchpad) | 5 lessons + Checkpoint 0 | ⏳ |
| 4 | Content batch: Tier 1 (Data Foundations) | 6 lessons + interactive widgets + Checkpoint 1 | ⏳ |
| 5 | Content batch: Tier 2 (Methods Essentials) | 4 lessons + Checkpoint 2 | ⏳ |
| 6 | Content batch: Tier 3 (References & Memory) | 7 lessons + memory diagrams + Checkpoint 3 | ⏳ |
| 7 | Content batch: Tier 4 (Methods Adv. & Constructors) | 5 lessons + Checkpoint 4 | ⏳ |
| 8 | Content batch: Tier 5 (OOP Mastery) | 8 lessons + Checkpoint 5 | ⏳ |
| 9 | Content batch: Tier 6 (Under the Hood) | 4 lessons + Checkpoint 6 | ⏳ |
| 10 | Hubs | Interview Prep hub, Practice hub, cheat sheets, glossary, versions timeline, notes-audit page | ⏳ |
| 11 | Quality assurance & polish | Full technical re-review, tests, a11y, mobile, performance, proofreading | ⏳ |
| 12 | Release & handover | Deployed site, README, maintenance guide | ⏳ |
| ∞ | Future notes intake (repeatable) | New notes → audit → new DAG nodes → lessons → QA → deploy | recurring |

Order rationale: Phase 1 builds every reusable piece once. Phase 2 validates quality with the user before
producing ~40 lessons. Phases 3–9 follow the DAG's topological order so each lesson can link to lessons that
already exist. Hubs (10) aggregate content, so they come after the content. QA (11) re-checks everything as a whole.

---

## Phase 0 — Discovery, audit & planning ✅

- [x] Read all 5 notes (39 pages): text extraction + visual check of diagrams and code screenshots
- [x] Save original PDFs + extracted text to `source-notes/`
- [x] Verify notes claim-by-claim; run executable checks on a real JDK → `source-notes/AUDIT.md`
- [x] Research current Java state (JDK 25 LTS, JDK 26, JDK 27 GA 2026-09-15) and tooling versions
- [x] Design learning DAG → `CURRICULUM.md` (39 lessons, 7 tiers, 7 checkpoints)
- [x] Define lesson anatomy + Definition of Done → `LESSON_TEMPLATE.md`
- [x] Record goals, decisions, environment, facts → `CONTEXT.md`; resume protocol → `CLAUDE.md`
- [ ] **User approval + answers to open questions (CONTEXT.md §7)**, then record them in the decisions log

## Phase 1 — Foundations

**1A. Environment & repo layout**
- [ ] Install JDK 25 (`apt-get install -y openjdk-25-jdk-headless`), set `JAVA_HOME`; confirm `java -version`
- [ ] Repo layout: `website/`, `java-track/`, `project-plan/`, `source-notes/`; root `README.md`, `.gitignore`, `.editorconfig`

**1B. Companion code project `java-track/` (Maven, `release 25`)**
- [ ] Parent POM + modules `examples`, `practice`, `solutions`; JUnit 6.x, AssertJ, JOL; surefire config
- [ ] Output-capture test helper (assert what `main` prints) so every displayed output is verified
- [ ] Snippet regions convention (`// @snippet:start name` / `// @snippet:end`) for partial code on the site
- [ ] Port the audit's executable checks into `examples/.../audit/NotesAuditTest.java`
- [ ] `mvn verify` green

**1C. Website `website/` (Docusaurus 3.10.x, TypeScript)**
- [ ] Scaffold (classic preset, TS), site metadata, clean URLs, sidebar generated from curriculum data
- [ ] Design system: typography, colour tokens, light/dark themes, tier colours, responsive layout, favicon/logo
- [ ] Plugins: Mermaid theme, KaTeX (remark-math + rehype-katex), local search, sitemap, ideal-image (if needed)
- [ ] Curriculum data file (`website/curriculum/graph.json`) generated/validated from `CURRICULUM.md` fields: ids, tiers, prereqs; build-time check for cycles & dangling edges
- [ ] Code-inclusion plugin/component `<JavaExample file=… snippet=… showOutput />` reading from `java-track`
- [ ] MDX components:
  - [ ] `<LessonHeader>` (tier, time, difficulty, verified-on, prerequisites → unlocks)
  - [ ] `<Callout type="tldr|myth|fact|doubt|senior|pitfall|version|deep-dive">`
  - [ ] `<Tabs>` scenarios (built-in) styling
  - [ ] `<Quiz>` (MCQ, per-option explanations, score)
  - [ ] `<PredictOutput>` (code → reveal output + explanation)
  - [ ] `<Exercise>` (difficulty, statement, hints, hidden solution, link to test file)
  - [ ] `<InterviewQ>` (level, model answer, follow-ups, red flags, "what's being tested"); also exports data for the hub
  - [ ] `<Flashcards>` (flip cards, shuffle, "again/good" local tracking)
  - [ ] `<VersionBadge since="25" status="final|preview">`
  - [ ] `<RoadmapDAG>` (interactive graph from curriculum data, progress from localStorage, click-through)
  - [ ] `<MarkComplete>` + "Next up" (unlocked nodes)
  - [ ] Diagram primitives: `<MemoryDiagram>` (stack frames / heap objects / arrows), `<BitLayout>` (sign/exponent/mantissa)
- [ ] Pages: Home (what/why/how to use, paths), Roadmap, "How to use this track", Setup guide stub
- [ ] Component showcase page (dev only) to visually test every component in light/dark and mobile widths

**1D. CI & deploy**
- [ ] GitHub Actions: `site.yml` (npm ci, typecheck, build, link check), `java.yml` (JDK 25 + 27 matrix, `mvn verify`)
- [ ] Deploy workflow per decision D-007
- [ ] Transcribe notes to `source-notes/transcripts/*.md` (including code from screenshots) for cheap future reference

**Exit criteria:** site builds without warnings; showcase page renders every component; `mvn verify` green;
CI green on the branch.

## Phase 2 — Pilot lessons + feedback stop

- [ ] Pilot A: `jdk-jre-jvm` (concept + diagram heavy) at full Definition of Done
- [ ] Pilot B: `floating-point` (deep technical + IEEE-754 interactive visualiser) at full Definition of Done
- [ ] Self-review both against `LESSON_TEMPLATE.md` checklist; fix gaps
- [ ] ⏸️ **Stop and ask the user** for feedback on depth, length, tone, visuals, practice & interview format
- [ ] Apply feedback to the pilots and update `LESSON_TEMPLATE.md` (record changes in CONTEXT decisions log)

## Phase 3 — Tier 0 · Launchpad

- [ ] `java-landscape`
- [ ] `jdk-jre-jvm` (done in pilot; re-check after feedback)
- [ ] `first-program`
- [ ] `how-java-runs`
- [ ] `oop-mindset`
- [ ] Checkpoint 0 (quiz + coding challenge + mock interview round)

## Phase 4 — Tier 1 · Data Foundations

- [ ] Widget: two's-complement bit flipper / overflow wheel
- [ ] Widget: casting & promotion explorer
- [ ] `variables-basics`
- [ ] `integer-types`
- [ ] `char-and-boolean`
- [ ] `floating-point` (done in pilot; re-check)
- [ ] `type-conversion`
- [ ] `variable-kinds`
- [ ] Checkpoint 1

## Phase 5 — Tier 2 · Methods Essentials

- [ ] Widget: animated call-stack stepper
- [ ] `methods-basics`
- [ ] `call-stack`
- [ ] `packages-access-modifiers`
- [ ] `static-vs-instance`
- [ ] Checkpoint 2

## Phase 6 — Tier 3 · References & Memory

- [ ] Widget: stack/heap memory stepper (used by pass-by-value, strings, arrays)
- [ ] `stack-heap-references`
- [ ] `pass-by-value`
- [ ] `reference-types`
- [ ] `strings`
- [ ] `arrays`
- [ ] `wrappers-boxing`
- [ ] `final-and-constants`
- [ ] Checkpoint 3

## Phase 7 — Tier 4 · Methods Advanced & Constructors

- [ ] `overloading-resolution`
- [ ] `varargs`
- [ ] `constructors-basics`
- [ ] `constructor-chaining-init-order` (incl. Java 25 flexible constructor bodies)
- [ ] `private-constructors-singleton`
- [ ] Checkpoint 4

## Phase 8 — Tier 5 · OOP Mastery

- [ ] `classes-objects-deep`
- [ ] `encapsulation`
- [ ] `inheritance`
- [ ] `polymorphism`
- [ ] `abstraction-interfaces`
- [ ] `relationships`
- [ ] `modern-oop-records-sealed-patterns`
- [ ] `enums`
- [ ] Checkpoint 5

## Phase 9 — Tier 6 · Under the Hood

- [ ] `jvm-architecture`
- [ ] `object-memory-layout` (JOL measurements in `java-track`)
- [ ] `bytecode-and-dispatch` (`javap` outputs generated from real classes)
- [ ] `numbers-in-production`
- [ ] Checkpoint 6

## Phase 10 — Hubs

- [ ] Interview Prep hub: aggregated question bank with filters (topic, level, type), rapid-fire mode, 3+ timed mock sets, senior/manager "how to answer" frameworks
- [ ] Practice hub: exercise index with difficulty & status, predict-output bank, 3+ mini-projects spanning tiers (with tests)
- [ ] Cheat sheets per tier (print-friendly)
- [ ] Glossary
- [ ] Java versions timeline (8 → 27) for covered topics
- [ ] Notes-audit page (from `source-notes/AUDIT.md`)

## Phase 11 — Quality assurance & polish

- [ ] Technical accuracy pass: every lesson re-read against its audit items + references; spot-check claims by running code
- [ ] All `java-track` tests green on JDK 25 (and 27 in CI)
- [ ] Link check, broken anchors, sidebar/DAG consistency (no orphan or unreachable nodes)
- [ ] Accessibility: contrast, alt text, keyboard navigation for widgets, heading order
- [ ] Mobile & dark-mode visual check of every page (Playwright screenshots)
- [ ] Performance: bundle size, Lighthouse ≥ 90
- [ ] Proofreading & consistency (terminology from glossary, tone, formatting)

## Phase 12 — Release & handover

- [ ] Deploy (per D-007) and verify live site
- [ ] Root `README.md`: what it is, how to run locally (`npm start`, `mvn test`), how to practise
- [ ] Maintenance guide: updating for new JDK releases, adding lessons, adding interview questions

## Phase ∞ — Future notes intake (repeat for every new batch of notes)

1. [ ] Save PDFs to `source-notes/pdf/`, extract text, transcribe (incl. screenshots)
2. [ ] Audit → append to `source-notes/AUDIT.md`
3. [ ] Extend DAG in `CURRICULUM.md` + `website/curriculum` (new nodes, edges; update "out of scope" list)
4. [ ] Add a new content-batch phase to this file with one checkbox per lesson
5. [ ] Author lessons (Definition of Done), update hubs, QA, deploy

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Session/token loss mid-work | Small tasks; commit + push after every lesson; this file + `PROGRESS_LOG.md` always current; `CLAUDE.md` resume protocol |
| Factual drift / errors | Code-backed claims (tests), primary references, audit mapping per lesson, QA phase |
| Doc sites blocked by network policy | Verify by executing code; WebSearch; user may allow `openjdk.org`, `docs.oracle.com` in environment settings |
| Scope creep beyond the notes | `CURRICULUM.md` scope list; out-of-scope topics wait for future notes |
| Java moves on (JDK 28 in March 2027) | `lastVerified` per lesson; maintenance guide; versions timeline page |
| Private repo vs hosting | Decision D-007 before Phase 1D |
