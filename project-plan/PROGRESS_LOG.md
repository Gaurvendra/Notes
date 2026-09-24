# Progress Log

Newest entry on top. One entry per work session (or per lesson). Keep each entry short: what was done, what's
next, any blockers or decisions.

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
