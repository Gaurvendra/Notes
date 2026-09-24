# Progress Log

Newest entry on top. One entry per work session (or per lesson). Keep each entry short: what was done, what's
next, any blockers or decisions.

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
