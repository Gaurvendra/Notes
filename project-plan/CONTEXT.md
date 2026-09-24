# Project Context (read this first in any new session)

## 1. Goal (the user's words, distilled)

Build a **high-quality website** to learn **Java from scratch to very advanced**, aimed at a **senior manager /
senior software developer**, with:

- an extensive **learning + practice track**, all required content, **diagrams**, and **multiple examples for
  multiple scenarios**;
- **every possible doubt cleared**;
- an **easy "level-up" / DAG learning structure**;
- **interview prep & questions**;
- the user's own handwritten **notes used extensively, verified, and gaps filled**;
- **up to date as of today** (2026-09-24), with **quality above everything**.

Constraints from the user:

- **Scope (IMPORTANT):** for now cover **only the topics in the 5 shared notes plus related topics missing from
  them**. More notes will be shared later and then the scope grows.
- Work is split into **phases for internal task management only**. Phases are **not** the website's structure.
- **Ask for approval before starting** implementation (Phase 1+).
- Keep plan + context in files so a **new session can resume** if this one is lost.

## 2. Where things live

| Path | What |
|---|---|
| `CLAUDE.md` | Resume protocol & working rules (auto-loaded by Claude Code) |
| `project-plan/PLAN.md` | Phases, task checklists, status (**source of truth for "what next"**) |
| `project-plan/CONTEXT.md` | This file: goals, decisions, environment, fact snapshot |
| `project-plan/CURRICULUM.md` | Website learning DAG: tiers, lessons, prerequisites, note/audit mapping, status |
| `project-plan/LESSON_TEMPLATE.md` | Lesson anatomy + Definition of Done + style rules |
| `project-plan/PROGRESS_LOG.md` | Dated log of every work session |
| `source-notes/pdf/` | The user's original notes (PDF) |
| `source-notes/extracted-text/` | Raw text extraction (handwriting OCR by PDF text layer; code screenshots not included) |
| `source-notes/AUDIT.md` | Claim-by-claim verification of the notes (✅ 🔶 ⚠️ ✏️ ➕) |
| `website/` | *(Phase 1)* Astro Starlight site |
| `java-track/` | *(Phase 1)* Maven project: examples, practice (exercises + tests), solutions |

## 3. Source notes received

| Key | File | Pages | Topics |
|---|---|---|---|
| 01 | `01_OOPS_Concepts_In_Java.pdf` | 11 | Procedural vs OOP, objects & classes, 4 pillars, inheritance types, polymorphism types, IS-A/HAS-A, association/aggregation/composition |
| 02 | `02_JDK_JRE_JVM.pdf` | 3 | What is Java, JDK/JRE/JVM, JIT, platform (in)dependence, SE/EE/ME |
| 04 | `04_Primitive_Variables.pdf` | 10 | Variables, naming, typing, 8 primitives, two's complement, conversions & promotion, kinds of variables, IEEE-754 float storage |
| 06 | `06_NonPrimitive_Variables.pdf` | 6 | Reference types, references & heap, pass-by-value, String & SCP, interface references, arrays, wrappers, autoboxing, constants |
| 07-08 | `07_08_Methods_And_Constructor.pdf` | 9 | Methods anatomy, access specifiers, method types (overloaded, overridden, static, final, abstract, varargs), constructors (rules, whys, types, private, chaining with this/super) |

Notes **#3 and #5 are missing** from the series numbering (not shared). Pages with code **screenshots**:
06 p1, p3 · 07-08 p1, p3, p5, p8 (render PDFs to PNG to read them, see §5).

## 4. Decisions log

| ID | Decision | Status | Rationale |
|---|---|---|---|
| D-001 | **Site framework: Astro Starlight** (Astro 7.x + `@astrojs/starlight` 0.42.x at time of decision; re-check versions in Phase 1) | **Decided (user, 2026-09-24)** | User's choice. Built-in Pagefind search, light/dark themes, sidebar, MDX, Expressive Code blocks, `<Code>` component (good for code pulled from `java-track`), fast static output. Interactive widgets as Astro islands (framework to pick in Phase 1: React or Preact). Mermaid via an Astro/rehype integration; KaTeX via remark-math + rehype-katex. Rejected: Docusaurus (was my first recommendation), Material for MkDocs (in maintenance mode, 2026). |
| D-002 | **Diagrams:** Mermaid for flows/class/sequence; custom SVG/React for memory (stack/heap), bit layouts, JVM architecture | Proposed | Mermaid can't draw memory/bit diagrams well |
| D-003 | **Math:** KaTeX (remark-math/rehype-katex) for IEEE-754 & two's-complement formulas | Proposed | |
| D-004 | **Java baseline: Java SE 25 (LTS)**; mention JDK 26/27 changes with version badges; preview features clearly labelled | Proposed | 25 is the current LTS; 27 is the latest GA (non-LTS) |
| D-005 | **Companion code project `java-track/`** (Maven multi-module: `examples`, `practice`, `solutions`), JUnit 6.x + AssertJ, JOL for memory layout; every snippet shown on the site is pulled from compiled, tested code | Proposed | Guarantees accuracy; gives a real "practice track" (make red tests green) |
| D-006 | **CI:** GitHub Actions: site build + `mvn verify` on JDK 25 (+ JDK 27 if available via setup-java) + link check | Proposed | |
| D-007 | **Hosting: local only for now** (`npm run dev` / `npm run build && npm run preview`); decide deployment target in Phase 12 | **Decided (user, 2026-09-24)** | Repo `Gaurvendra/Notes` is **private**; GitHub Pages would need it public (or a paid plan); Cloudflare Pages/Netlify/Vercel remain options later |
| D-008 | **Progress tracking** in the browser (localStorage), no accounts/back-end in v1 | Proposed | Keeps site static & free to host |
| D-009 | **No pilot pause:** keep building continuously; the first two lessons still act as an *internal* quality gate (self-review against the template) but there is **no stop for user feedback** | **Decided (user, 2026-09-24)** | User's choice |
| D-010 | **Notes corrections on the site** appear as neutral "Myth vs Fact" callouts + a separate "Notes audit" page | Proposed | |
| D-011 | **Language:** simple English; every term defined on first use | Proposed | |
| D-012 | Phases are internal only; the site is structured by the DAG in `CURRICULUM.md` | Decided (user) | |
| D-013 | Scope limited to the notes shared + related gaps; out-of-scope list in `CURRICULUM.md` | Decided (user) | |
| D-014 | **Before any build work:** the user shares more notes → intake + audit each batch → once the user confirms **all** files are shared, **recalibrate** the curriculum DAG, phases and plan → get approval → start Phase 1 | **Decided (user, 2026-09-24)** | User wants the full picture before phases start |

## 5. Environment facts (cloud session, as of 2026-09-24)

- Repo: `Gaurvendra/Notes` (private). Working branch: **`claude/eloquent-sagan-5kmlsx`** (the default branch
  `main` has only the initial commit). If a new session starts on another branch, fetch and merge/rebase this
  branch first.
- Pre-installed: **JDK 21.0.10**, Maven 3.9.11, Node 22.22, npm 10.9, Python 3.11.
- **JDK 25** is installable: `sudo apt-get install -y openjdk-25-jdk-headless` (candidate 25.0.2). JDK 26/27 are
  **not** available via apt here (use CI's `actions/setup-java` for 27 if needed).
- PDF rendering: `pip install pymupdf` (poppler/pdftoppm is **not** installed, so the Read tool cannot render PDFs).
  Render pages with `pymupdf` → PNG, then view the PNGs.
- **Network:** npm registry, Maven Central, apt, PyPI and raw.githubusercontent.com work. **Blocked:** openjdk.org,
  docs.oracle.com, dev.java, inside.java, jdk.java.net, baeldung.com (egress policy). WebSearch works (results
  include snippets from these sites). The user can allow more domains in the environment's network settings.
  Verification strategy therefore = **run code on a real JDK** + WebSearch + primary-source knowledge, recorded in tests.
- Library versions snapshot (2026-09-24): Astro 7.3.5, @astrojs/starlight 0.42.3, Mermaid 12.0.0 (Docusaurus 3.10.2 was the alternative), JUnit Jupiter 6.1.3, JOL 0.17,
  maven-surefire 3.6.0. Re-check with `npm view` / Maven metadata before pinning.

## 6. Java fact snapshot (verify again if a session starts much later)

- **LTS releases:** 8, 11, 17, 21, **25 (Sept 2025)**. Next LTS: **29 (Sept 2027)**. Six-month cadence (March/September).
- **JDK 26** (GA 2026-03-17): JEP 500 Prepare to Make Final Mean Final · 504 Remove the Applet API · 516 AOT Object
  Caching with Any GC · 517 HTTP/3 for the HTTP Client · 522 G1: Improve Throughput by Reducing Synchronization ·
  524 PEM Encodings (2nd preview) · 525 Structured Concurrency (6th preview) · 526 Lazy Constants (2nd preview) ·
  530 Primitive Types in Patterns (4th preview) · 529 Vector API (11th incubator).
- **JDK 27** (GA 2026-09-15): JEP 523 G1 default GC in all environments · 527 Post-Quantum Hybrid Key Exchange for
  TLS 1.3 · 531 Lazy Constants (3rd preview) · 532 Primitive Types in Patterns, instanceof & switch (5th preview) ·
  533 Structured Concurrency (7th preview) · **534 Compact Object Headers by Default** · 536 JFR In-Process Data
  Redaction · 537 Vector API (12th incubator) · 538 PEM Encodings (3rd preview).
- **JDK 25 features relevant to current scope:** JEP 512 Compact Source Files & Instance Main Methods (final; `void
  main()` + `java.lang.IO`) · **JEP 513 Flexible Constructor Bodies (final)** · JEP 511 Module Import Declarations
  (final) · JEP 519 Compact Object Headers (product feature, opt-in) · JEP 506 Scoped Values (final).
- Earlier milestones used in lessons: records (16), sealed (17), `instanceof` patterns (16), `switch` patterns &
  record patterns (21), unnamed variables `_` (22), text blocks (15), compact strings (9), indy string concat (9),
  `var` (10), single-file launcher (11), multi-file launcher (22), JRE no longer shipped separately (11), `jlink` (9),
  always-strict FP / `strictfp` obsolete (17), SCP moved to heap (7), PermGen → Metaspace (8), `new Integer()`
  deprecated for removal (16), Jakarta EE namespace `jakarta.*` (EE 9), current Jakarta EE 11.
- Project Valhalla value classes (JEP 401): **not** in any GA JDK as of JDK 27.

Sources: [Oracle: The Arrival of Java 27](https://blogs.oracle.com/java/the-arrival-of-java-27) ·
[OpenJDK JDK 27](https://openjdk.org/projects/jdk/27/) · [OpenJDK JDK 26](https://openjdk.org/projects/jdk/26/) ·
[InfoQ: JDK 27 & 28 so far](https://www.infoq.com/news/2026/08/java-27-so-far/) ·
[InfoQ: Java 26 released](https://infoq.com/news/2026/03/java26-released) ·
[Material for MkDocs maintenance mode](https://squidfunk.github.io/mkdocs-material/blog/)

## 7. Open questions for the user

Answered on 2026-09-24: framework → **Astro Starlight** (D-001); hosting → **local for now** (D-007); pilot pause →
**no** (D-009); plan approval → **not yet**: user will share more notes first, then plan is recalibrated (D-014).

Still open:
1. Approval of the **recalibrated** plan (after all notes are shared).
2. Will notes #3 and #5 be among the new files? (Until then, gap-fill lessons cover related topics.)
