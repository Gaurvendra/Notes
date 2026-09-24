# Lesson Template & Quality Bar (v3, for the React app, no JDK: D-023)

Every lesson in `CURRICULUM.md` follows this anatomy and must meet the **Definition of Done** before its status becomes
`done`. The two pilots are the reference implementations: `app/src/content/lessons/jdk-jre-jvm.mdx` (concept + tooling
heavy) and `app/src/content/lessons/floating-point.mdx` (deep technical + interactive widget). Copy their structure.

A lesson is **two files**:

| File | Holds |
|---|---|
| `app/src/content/lessons/<id>.mdx` | The guide: Markdown + the tags below (no imports needed, except lesson-specific diagrams) |
| `app/src/content/lesson-data/<id>.yaml` | Quiz, interview questions and flashcards (the hubs aggregate them) |

`<id>` is the lesson id from `project-plan/curriculum.yaml`. Then set `status: done` there and run
`python3 project-plan/tools/curriculum.py`.

## Front-matter (machine-readable)

```yaml
---
title: "Floating Point (IEEE 754)"          # = the lesson's `label` in curriculum.yaml (checked)
description: "One or two sentences: what the reader will be able to do/explain."
estimatedMinutes: 70                        # full path
fastTrackMinutes: 15                        # TL;DR + myths + senior lens + interview
sourcePages: ["04 p7-10"]                   # traceability to the user's notes (pages / transcript sections)
javaBaseline: 25                            # Java version the content is written for
lastVerified: 2026-09-24                    # date the facts were last checked
---
```
Tier, level, prerequisites, unlocks and source notes are **read from `curriculum.yaml`** (header chips, "Needs first",
"Unlocks"). Don't duplicate them.

## Page anatomy (in order; `##` for each section)

The checker requires the `##` sections marked ✓.

| # | Section | Purpose | How |
|---|---|---|---|
| 1 | Header | Level, tier, time, verified-on, prerequisites → unlocks, source notes | Automatic |
| 2 | **Why this matters** ✓ | 3–5 lines: a real incident or everyday bug | Cite real incidents with a primary source |
| 3 | **TL;DR** ✓ | 5–7 bullets, enough for the fast-track reader | `<Callout type="tldr">` |
| 4 | **Mental model** ✓ | Analogy (+ where it breaks) and the core diagram | `LayerDiagram`, `BitLayout`, an SVG diagram (below) |
| 5 | **Concept, step by step** | Numbered `###` sub-sections: explain → code → output → diagram | Code fences, tables, KaTeX (`$…$`, `$$…$$`) |
| 5b | *Interactive widget* (optional) | Where a topic benefits from play (bits, memory, dispatch) | React component in `app/src/content/mdx/` + pure logic in `app/src/lib/`, checked against recorded answers |
| 6 | **Scenarios** ✓ | ≥ 3 tabs: *Real world*, *Edge case*, *Anti-pattern → fix* | `<Tabs>` + `<TabItem label="…">` |
| 7 | **Under the hood** | JVM/bytecode/JLS depth, collapsed | `<details><summary>…</summary>…</details>` |
| 8 | **Myths vs facts** ✓ | Every ⚠️/🔶 audit item + common internet myths | `<MythVsFact myth="…" audit="4.19">` (neutral wording) |
| 9 | **Doubts cleared** ✓ | ≥ 8 "but what if…?" questions | `<FaqItem q="…">` |
| 10 | **Pitfalls and best practices** | Do / Don't table | Markdown table |
| 11 | **Senior lens** ✓ | 60-second team explanation, production trade-offs (measured numbers), code-review checklist | `<Callout type="senior">` + tables + `- [ ]` list |
| 12 | **Modern Java** ✓ | What changed, per version; preview/incubator clearly marked | `<VersionBadge since/preview/incubator jep>` |
| 13 | **Practice** ✓ | `### Try it yourself`, `### Predict the output` (≥ 3), `### Exercises` (🟢 🟡 🔴) | Terminal fences, `PredictOutput`, `Exercise` |
| 14 | **Quiz** ✓ | ≥ 8 MCQs, explanation for every option | `<Quiz />` + lesson data |
| 15 | **Interview corner** ✓ | ≥ 10 questions covering fresher, mid, senior, staff/manager | `<InterviewSet />` + lesson data |
| 16 | **Cheat sheet** ✓, then `### Flashcards` | One-screen summary; ≥ 8 cards | `<CheatSheet>` (blank lines around the table), `<Flashcards />` |
| 17 | **References** ✓ | JLS/JVMS sections, JEPs, API docs, release notes | Primary sources |
| 18 | Mark complete / Next up | | Automatic |

## Writing MDX

### Code, output and terminal sessions

Use fenced blocks; the fence meta becomes the block header and footer:

````md
```java title="MoneyMath.java"
BigDecimal total = new BigDecimal("0.10").add(new BigDecimal("0.20"));
System.out.println(total);
```

```text output
0.30
```

```shellsession captured="JDK 25.0.4.1 (Ubuntu build, Linux x64)"
$ java --version
openjdk 25.0.4.1 2026-08-18
```
````

| Meta | Effect |
|---|---|
| `title="…"` | Header text (file name, or what the block shows) |
| `output` | Styled as program output (use language `text`) |
| `captured="…"` | Footer "Captured on …": a real terminal capture (only the pilots have these, or a future session with a JDK) |
| `verified="…"` | Footer "✓ …": only for code/output that was actually run (the pilots: "compiled and run on JDK 25 and 27") |

Every fence needs a language (`java`, `text`, `shellsession`, `yaml`, `xml`, …); the checker enforces it. Keep lines
≲ 75 characters, put long comments on their own line, and use imports instead of fully qualified names unless the
package *is* the point.

### Components (no import needed)

| Tag | Props / children |
|---|---|
| `<Callout type="…" title?>` | `tldr`, `senior`, `pitfall`, `tip`, `doubt`, `deep-dive`, `version`, `myth`, `fact` |
| `<MythVsFact myth="…" audit?="4.19">` | Children: the precise truth |
| `<FaqItem q="…">` | `q` is inline Markdown; use `q={'… "quotes" …'}` when it contains `"` |
| `<VersionBadge since={17} jep={306} />` | Or `preview`, `incubator`, `deprecated`, `removed` |
| `<Tabs>` / `<TabItem label="…">` | Blank lines around Markdown inside |
| `<FileTree>` | A Markdown list: `- name/ comment`; a trailing `/` or a sub-list marks a folder |
| `<LayerDiagram layers={[{ title, note?, items? }]} caption?>` | Nested "A contains B" boxes, outermost first |
| `<BitLayout groups={[{ bits: '0', label: 'sign' }]} weights? signed? caption?>` | Bit fields |
| `<Figure caption="…">` | Frame for any diagram (scrolls sideways on phones) |
| `<MemoryDiagram frames={[{ name, vars: [{ name, value?, ref?, type? }], gone? }]} heap={[{ id, label, fields?, pool?, gc? }]} caption?>` | Stack & heap picture; `ref` points at a heap `id`; `pool` = String Constant Pool; `highlight` on anything |
| `<Stepper title?>` / `<Step title="…">` | Step-through walkthrough (e.g. one `MemoryDiagram` per step); ←/→ keys |
| `<PredictOutput title="…">` | Children: a `java` fence, then `<Reveal>` with a `text output` fence and the explanation |
| `<Exercise id="pkg/Class" difficulty="warmup\|core\|challenge" title="…" needs?="…" hints={["…"]}>` | Children: the statement, then `<Starter>`, `<Tests>`, `<Solution>`, each wrapping one `java` fence |
| `<Quiz />`, `<InterviewSet />`, `<Flashcards />` | Read the lesson's data file |
| `<FloatLab initial="0.7" format="float" />`, `<FloatSpacing caption? />` | Floating-point widgets |
| `<IntegerLab initial="3" width={4} />` | Two's-complement lab: bits, literals, operations, overflow wheel (`width` 4, 8, 16, 32 or 64) |
| `<CharInspector initial="Hi ☕ 😀" />` | UTF-16 inspector: `length()`, code points, surrogate pairs, UTF-8 bytes, graphemes |

**Diagrams** that need more than these: a React component in `app/src/content/diagrams/<id>.tsx`, built with the SVG
kit in `app/src/content/svg.tsx` (`Box`, `Arrow`, `Txt`, `PAL` colours that follow the theme), wrapped in `<Figure>`,
with a `<title>` inside the `<svg>`. Import it at the top of the MDX:
`import { WoraDiagram } from '../diagrams/jdk-jre-jvm'`. Prefer top-down layouts (phones) and short labels.

**Links:** other lessons as `/lessons/<id>/` (only ids in `curriculum.yaml`; JPMS, I/O and JDBC are out of scope, so
explain them in place), anchors as `#section-slug` or `/lessons/<id>/#slug`. Headings get GitHub-style slugs
(`### 4. The JDK = runtime + development tools` → `#4-the-jdk--runtime--development-tools`). Exercises are at
`#exercise-<classname-lowercase>`, puzzles at `#puzzle-<title-slug>`. The checker rejects broken links and anchors.

### Lesson data (`lesson-data/<id>.yaml`)

```yaml
quiz:
  - q: "Which component actually **executes** bytecode?"   # inline Markdown
    options:
      - text: "The JVM"
        correct: true
        why: "Explanation shown after checking (Markdown)."
      - text: "`javac`"
        why: "Every option needs a why, right or wrong."
interview:
  - level: fresher            # fresher | mid | senior | staff
    type: concept             # concept | code | predict-output | design | behavioural
    q: "What is the difference between the JDK and the JRE?"
    answer: |
      Model answer (Markdown).
    followUps: ["…"]
    redFlags: ["…"]
    tests: "What the interviewer is really testing."
flashcards:
  - front: "Question side"
    back: "Answer side"
```
Never write "(choose all that apply)": the quiz adds it for multi-answer questions. **Append** new flashcards and
interview questions at the end: learners' review schedules and ratings are keyed by position.

## Definition of Done

- [ ] **Notes coverage:** every point on the mapped note pages is in the lesson; every mapped audit item is addressed
      (✅ used; 🔶 precise version; ⚠️ explicit Myth vs fact; ➕ added).
- [ ] **Accuracy without a JDK (D-023):** every non-trivial claim comes from an existing verified fact (`AUDIT.md`
      and its executed-verification sections, `source-notes/verification/`, the pilots), a primary source (JLS, JVMS,
      JEPs, API docs, release notes) or a clearly labelled real capture. **Expected outputs are written only when the
      specification fully determines them** (for example `Integer.MAX_VALUE + 1`, string formatting rules,
      `Double.toString` per its spec). Anything that depends on the machine, the JDK build or timing is described, not
      shown as captured output. Every output or behaviour written without running Java is listed in
      `project-plan/VERIFY_LATER.md` (lesson, block title, claim, primary source) so it can be run on a JDK later.
      Never invent measurements; numbers that depend on the machine say where they were measured.
- [ ] **Up to date:** Java 25 baseline; JDK 26/27 changes mentioned; preview features labelled with their JEP.
- [ ] **Diagrams:** ≥ 1; legible in light, dark and at 390 px; SVGs have `<title>`, figures have captions.
- [ ] **Examples:** ≥ 3 scenarios with code. Programs are complete and compilable as shown (imports included), so a
      reader can paste and run them.
- [ ] **Doubts:** ≥ 8 FAQ entries. **Practice:** ≥ 3 puzzles + 3 exercises (starter, JUnit 5 + AssertJ tests,
      reference solution).
- [ ] **Quiz** ≥ 8, **interview** ≥ 10 (all four levels), **flashcards** ≥ 8, **senior lens**, **cheat sheet**.
- [ ] **Readability:** short sentences, every term defined on first use, no paragraph over ~6 lines.
- [ ] **Checks (GitHub CI, not in the session):** `npm run check` (content checker: schema, the minimums above,
      sections, links and anchors, IEEE lab; then type-check and build) and `npm run check:pages` (every route in a
      browser, no errors, nothing wider than a phone). The session checks the CI result once per push and fixes any
      failure.
- [ ] `status: done` in `curriculum.yaml` → `python3 project-plan/tools/curriculum.py` OK → `PLAN.md` ticked →
      `PROGRESS_LOG.md` entry → commit → push → CI green.

## Checkpoints (one per tier)

A checkpoint is `app/src/content/checkpoints/tier-<n>.mdx` plus `app/src/content/checkpoint-data/tier-<n>.yaml`
(same schema as lesson data). The page `/checkpoints/<n>` shows the tier's lessons, then the MDX:

1. `## How this checkpoint works`: the three parts and when you pass (quiz ≥ 80%, challenge tests pass, mock interview
   answered out loud and self-rated). Say that experienced readers can use it to test out of the tier.
2. `## Part 1: Quiz` with `<CheckpointQuiz />`: the data file's own **cross-lesson** questions come first, followed
   automatically by every quiz question of the tier's written lessons.
3. `## Part 2: Coding challenge`: one `<Exercise>` (id `checkpoint_<n>/<Class>`) that combines several lessons.
4. `## Part 3: Mock interview` with `<InterviewSet />`: ≥ 5 integrative questions in the data file, all four levels
   where possible.
5. `## If you got stuck`: a table mapping topics to lessons.

The checker requires `<CheckpointQuiz />`, ≥ 1 exercise and ≥ 5 interview questions.

## Exercise conventions

- Package `track.<lesson_id_with_underscores>`; the class is the exercise id's last part (`floating_point/FloatBits`).
- The starter's Javadoc states the task and ends with "Make `XTest` pass: run it in any Java 25 project with JUnit 5
  and AssertJ." The starter body throws `UnsupportedOperationException("TODO: implement me")`.
- Tests use JUnit 5 + AssertJ. Expected values come from the specification or from `AUDIT.md` facts; a property-style
  test that compares against the JDK itself at run time (for example 10,000 random inputs against
  `new BigDecimal(float)`) is the gold standard for 🔴, because it needs no hand-typed answers.
- `needs="…"` names features a beginner may not have met yet, with a link to the lesson that teaches them.
