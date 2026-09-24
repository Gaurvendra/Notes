# Lesson Template & Quality Bar (v2, after the two pilot lessons)

Every lesson in `CURRICULUM.md` follows this anatomy and must meet the **Definition of Done** before its status becomes
`done`. The two pilots are the reference implementations: `website/src/content/docs/lessons/jdk-jre-jvm.mdx`
(concept + tooling heavy) and `.../floating-point.mdx` (deep technical + interactive widget). Copy their structure.

## Front-matter (machine-readable)

```yaml
---
title: "Floating Point (IEEE 754)"          # = the lesson's `label` in curriculum.yaml (the sidebar name)
description: "One or two sentences: what the reader will be able to do/explain."
estimatedMinutes: 70                        # full path
fastTrackMinutes: 15                        # TL;DR + myths + senior lens + interview
sourcePages: ["04 p7-10"]                   # traceability to the user's notes (pages / transcript sections)
javaBaseline: 25                            # code verified on this LTS
lastVerified: 2026-09-24
---
```
Tier, level, prerequisites, unlocks, source notes and audit items are **read from `project-plan/curriculum.yaml`**
at build time (header chips + footer). Don't duplicate them in front-matter. Remove `stub: true`.

## Page anatomy (in order; `##` for each section)

| # | Section | Purpose | How (components) |
|---|---|---|---|
| 1 | Header chips | Level, tier, time, verified-on, prerequisites → unlocks, source notes | Automatic (`LessonHeader`) |
| 2 | **Why this matters** | 3–5 lines: a real incident or everyday bug | Cite real incidents with a primary source |
| 3 | **TL;DR** | 5–7 bullets, enough for the fast-track reader | `<Callout type="tldr">` |
| 4 | **Mental model** | Analogy (+ where it breaks) and the core diagram | `LayerDiagram`, Mermaid, build-time SVG, `BitLayout`, `MemoryDiagram` |
| 5 | **Concept, step by step** | Numbered `###` sub-sections: explain → code → output → diagram | `JavaExample`, `CompileResult`, tables, KaTeX |
| 5b | *Interactive widget* (optional) | Where a topic benefits from play (bits, memory, dispatch) | Preact island + pure JS lib checked against Java fixtures |
| 6 | **Scenarios** | ≥ 3 tabs: *Real world*, *Edge case*, *Anti-pattern → fix* (a *Basic* tab if the concept section has no example) | `<Tabs>`; every tab is tested code |
| 7 | **Under the hood** | JVM/bytecode/JLS depth, collapsed | `<details>` |
| 8 | **Myths vs facts** | Every ⚠️/🔶 audit item + common internet myths | `<MythVsFact myth="…" audit="4.19">` (neutral wording) |
| 9 | **Doubts cleared** | ≥ 8 "but what if…?" questions | `<FaqItem q="…">` |
| 10 | **Pitfalls and best practices** | Do / Don't table | Markdown table |
| 11 | **Senior lens** | 60-second team explanation, production trade-offs (measured numbers), code-review checklist | `<Callout type="senior">` + tables + `- [ ]` checklist |
| 12 | **Modern Java** | What changed, per version; preview/incubator clearly marked | `<VersionBadge since/preview/incubator jep>` |
| 13 | **Practice** | `### Try it yourself` (terminal labs), `### Predict the output` (≥ 3), `### Exercises` (🟢 🟡 🔴) | `Terminal`, `PredictOutput`, `Exercise` |
| 14 | **Quiz** | ≥ 8 MCQs, explanation for every option | `<Quiz />` + `lesson-data/<id>.yaml` |
| 15 | **Interview corner** | ≥ 10 questions: fresher, mid, senior, staff/manager | `<InterviewSet />` + lesson data |
| 16 | **Cheat sheet**, then `### Flashcards` | One-screen summary; ≥ 8 cards | `<CheatSheet>` (blank lines around the table), `<Flashcards />` |
| 17 | **References** | JLS/JVMS sections, JEPs, API docs, release notes | Primary sources; links may point to sites blocked here |
| 18 | Mark complete / Next up | | Automatic (`LessonProgress`) |

## Definition of Done

- [ ] **Notes coverage:** every point on the mapped note pages is in the lesson; every mapped audit item is addressed
      (✅ used; 🔶 precise version; ⚠️ explicit Myth vs fact; ➕ added).
- [ ] **Accuracy:** every non-trivial claim is proven by a test/golden file in `java-track`, an existing verified
      fact (`AUDIT.md`, verification outputs, pilots), a real terminal capture (labelled with `capturedOn`), or a
      primary reference. **Every expected value comes from running Java, never typed from memory:** golden files are
      recorded by CI; test assertions use values from `AUDIT.md`/primary sources or compare with the JVM itself
      (e.g. `new BigDecimal(x)`, `Float.intBitsToFloat`). "Since Java N" API claims: a test that compiles with
      `--release N-1` (must fail) and `--release N` (must pass), or the API docs' `@since`.
- [ ] **Up to date:** Java 25 baseline; JDK 26/27 changes mentioned; preview features labelled with their JEP and
      tested (see below).
- [ ] **Diagrams:** ≥ 1; legible in light, dark and at 390 px; Mermaid diagrams have `accTitle` + `accDescr`,
      SVGs have `<title>`.
- [ ] **Examples:** ≥ 3 tested scenarios; displayed code comes from compiled files (snippet regions).
- [ ] **Doubts:** ≥ 8 FAQ entries. **Practice:** ≥ 3 puzzles + 3 exercises (stub, shared tests, solution).
- [ ] **Quiz** ≥ 8, **interview** ≥ 10 (all four levels), **flashcards** ≥ 8, **senior lens**, **cheat sheet**.
- [ ] **Readability:** short sentences, every term defined on first use, no paragraph over ~6 lines.
- [ ] **Checks (run by GitHub CI, not in the session, D-022):** outputs recorded on JDK 25, `mvn verify` green on
      JDK 25 and 27, `npm run verify` green (only the known framework warnings, see CONTEXT §5), `npm run check:pages`
      reports no browser errors and nothing wider than a phone. The session checks the CI result once per push and
      fixes any failure; after CI records outputs, it skims them to confirm the prose matches.
- [ ] `status: done` in `curriculum.yaml` → `python3 project-plan/tools/curriculum.py` OK → `PLAN.md` ticked →
      `PROGRESS_LOG.md` entry → commit → push → CI green on JDK 25 and 27.

## java-track conventions (per lesson package `track.<id_with_underscores>`)

- **One program per output.** `JavaExample … output` shows the program's *whole* golden output. If a program is shown
  as several snippets, don't put `output` on a snippet: show the whole output once, after them, with
  `<Terminal command="java X.java" outputFile="examples/src/test/resources/outputs/track/<pkg>/X.txt" title="…" />`.
  If two parts need their own outputs, make them two programs.
- **Golden outputs must be identical on JDK 25 and 27** (CI runs both): print only version-independent text. When a
  message contains the JVM's own version, print the stable part and assert the rest in a test.
- **Tests per lesson:** `<Lesson>ExamplesTest` (goldens for every program + key facts), extra tests for claims made in
  prose (e.g. `JlinkRuntimeTest`, `PrimitivePatternsPreviewTest`), compile cases in
  `examples/src/test/resources/compile-errors/<pkg>/<case>/` (+ `expected.txt`).
- **Preview features:** keep the source under `examples/src/test/resources/preview/<pkg>/`; a test compiles it with
  `--enable-preview --release <running feature>` and runs it in a separate JVM against a golden file.
- **Exercises:** stub in `practice/` (Javadoc states the task and the run command
  `mvn -pl practice -am test -Dpractice -Dtest=XTest`), shared tests in `practice/src/test`, solution in `solutions/`.
  A property-style test against the JVM (e.g. 10,000 random inputs) is the gold standard for 🔴.
- **Snippet style:** lines ≲ 75 characters (they wrap on the site), comments on their own line when long, imports
  instead of fully qualified names unless the package *is* the point.

## Website conventions learned from the pilots

- `Terminal`: `session={`$ cmd\noutput…`}` + `capturedOn="JDK 25.0.4.1 (Ubuntu build, Linux x64)"` for real captures;
  `command` + `outputFile` for tested output. Commands and outputs appear in order.
- `Exercise needs="…"`: name features a beginner may not have met yet, with a link to the lesson that teaches them.
- Quiz: never write "(choose all that apply)"; the component adds it for multi-answer questions.
- MDX attribute strings can't contain `\"`: use `q={'… "…" …'}`. Only link to lesson ids that exist in
  `curriculum.yaml` (JPMS, I/O, JDBC are out of scope: explain in place instead).
- Mermaid: avoid nested subgraphs (unreadable), prefer top-down for fan-outs (phones), keep labels short.
- Interactive widgets: pure logic in `src/lib/*.mjs` (+ `.d.mts`), a Preact island for the UI, and a check script
  comparing the logic with Java-generated fixtures, wired into `npm run verify` (see `check-float-lib.mjs`).
- Numbers that depend on the machine (sizes, timings) always say where they were measured.
