# Lesson Template & Quality Bar

Every lesson in `CURRICULUM.md` follows this anatomy and must meet the **Definition of Done** before its status
becomes `done`. (Component names like `<Quiz>` refer to the MDX components built in Phase 1; adjust here if they
change.)

## Front-matter (machine-readable)

```yaml
---
id: floating-point                 # must match curriculum.yaml; stable slug = URL, never changes
title: Floating-Point Numbers (IEEE 754) in Depth
estimatedMinutes: 60               # full path
fastTrackMinutes: 15               # TL;DR + myths + senior lens + interview
sourcePages: ["04 p7-10"]          # traceability to the user's notes (pages / transcript sections)
javaBaseline: 25                   # code verified on this LTS
lastVerified: 2026-09-24
---
```
Tier, level, prerequisites, unlocks, source notes and audit items are **read from `project-plan/curriculum.yaml`**
at build time. Don't duplicate them in front-matter.

## Page anatomy (in order)

| # | Section | Purpose | Notes |
|---|---|---|---|
| 1 | **Header chips** | Tier, time (full / fast-track), difficulty, "Verified on Java 25", prerequisites → unlocks | Generated from front-matter |
| 2 | **Why this matters** | 2–4 lines, ideally a real-world bug/incident hook | e.g. "a billing system lost 1 paisa per transaction…" |
| 3 | **TL;DR** | 5–7 bullet takeaways | Must be enough for the fast-track reader |
| 4 | **Mental model** | Analogy + one core diagram | Mermaid or custom SVG; must work in dark mode |
| 5 | **Concept, step by step** | Small sections: explain → code → output → diagram | Plain simple English, one idea per paragraph, define every term on first use |
| 6 | **Scenarios** | Multiple examples in tabs: *Basic*, *Real-world*, *Edge case*, *Anti-pattern → Fix* | All code compiled & tested in `java-track/examples` |
| 7 | **Under the hood** (collapsible) | JVM/bytecode/memory/JLS-level explanation | Optional for fast-track |
| 8 | **Myths vs Facts** | Every relevant correction from `AUDIT.md` + common internet myths | Neutral wording: "Common belief / Precise truth / Proof (code)" |
| 9 | **Doubts cleared** | FAQ accordion: every "but what if…?" a learner might ask | Aim to exhaust the topic |
| 10 | **Pitfalls & best practices** | Do / Don't list with reasons | |
| 11 | **Senior lens** | Production impact, design trade-offs, performance, code-review checklist, "how to explain this to your team in 60 seconds" | Written for senior engineers / engineering managers |
| 12 | **Modern Java** | What changed across versions for this topic, with `<VersionBadge>`; preview features clearly marked | Baseline Java 25 LTS; mention JDK 26/27 where relevant |
| 13 | **Practice** | Predict-the-output puzzles; graded exercises (🟢 warm-up, 🟡 core, 🔴 challenge) with hints & hidden solutions; each exercise has JUnit tests in `java-track/practice` | "Make the red tests green" workflow |
| 14 | **Quiz** | MCQs with an explanation for every option | Instant feedback |
| 15 | **Interview corner** | Questions by level (Fresher / Mid / Senior / Staff-Manager): model answer, likely follow-ups, red-flag answers, "what the interviewer is really testing" | Also feeds the Interview Prep hub |
| 16 | **Cheat sheet + flashcards** | One-screen summary; spaced-repetition-style cards | Printable |
| 17 | **References** | JLS/JVMS section numbers, JEPs, API docs | Primary sources only |
| 18 | **Mark complete / Next up** | Progress + links to unlocked nodes | |

## Definition of Done (quality bar per lesson)

- [ ] **Notes coverage:** every point from the mapped source-note pages is included; every mapped audit item is
      addressed (correct → used; 🔶 → precise version; ⚠️ → explicit Myth-vs-Fact; ➕ → added).
- [ ] **Accuracy:** each non-trivial claim is either (a) proven by a runnable example/test, or (b) backed by a
      primary reference (JLS/JVMS/JEP/API). No uncertain claims are stated as fact.
- [ ] **Up to date:** checked against Java 25 LTS and the JDK 26/27 changes listed in `CONTEXT.md`; preview
      features are labelled as preview with their JEP.
- [ ] **Diagrams:** ≥ 1 diagram where it aids understanding (memory, flow, hierarchy, bits); legible in light & dark mode.
- [ ] **Examples:** ≥ 3 scenarios (basic, real-world, edge case), all compiled and tested on JDK 25; displayed code
      is pulled from the compiled source (no hand-copied snippets that can drift).
- [ ] **Doubts:** ≥ 8 FAQ entries (more for big topics).
- [ ] **Practice:** ≥ 3 predict-the-output puzzles + ≥ 3 exercises (easy / medium / hard) with tests & solutions.
- [ ] **Quiz:** ≥ 8 MCQs with per-option explanations.
- [ ] **Interview:** ≥ 10 questions spanning all levels, with model answers & follow-ups.
- [ ] **Senior lens** section present and non-trivial.
- [ ] **Cheat sheet** + ≥ 8 flashcards.
- [ ] **Readability:** short sentences, simple English, every term defined, no wall of text (> 6 lines → split).
- [ ] **Build checks:** site builds with no warnings, `mvn verify` green, no broken links, headings in order,
      images have alt text.
- [ ] `status: done` in `curriculum.yaml` + `python3 project-plan/tools/curriculum.py` (OK), `PLAN.md` checkbox ticked,
      `PROGRESS_LOG.md` entry added, committed & pushed.

## Writing style rules

1. Teach **why** before **how**; show the wrong way only next to the fix.
2. One concept per section; build complexity gradually (the DAG handles cross-lesson order, sections handle
   in-lesson order).
3. Prefer concrete numbers and real output over adjectives ("wraps to −2147483648", not "gives a weird number").
4. Always say what is **guaranteed by the spec** vs what is **HotSpot implementation detail**.
5. Code: Java 25, `final` where natural, meaningful names, no `System.out` spam in "real-world" examples beyond what's
   needed to show output, and no deprecated APIs except to demonstrate why they're deprecated.
6. Neutral tone about the user's notes on the public site ("A common belief is…"); the full audit lives in the
   Notes-audit page.
