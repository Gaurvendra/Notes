# Progress Log

Newest entry on top. One entry per work session (or per lesson). Keep each entry short: what was done, what's
next, any blockers or decisions.

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
