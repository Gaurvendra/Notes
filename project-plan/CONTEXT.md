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
| `project-plan/curriculum.yaml` | **Source of truth** for the learning DAG (lessons, tiers, prereqs, sources, audit mapping, status) |
| `project-plan/tools/curriculum.py` | Validates the DAG (acyclic, no dangling/later-tier prereqs, all audit items mapped) and regenerates the catalogue in `CURRICULUM.md` |
| `project-plan/CURRICULUM.md` | Human-readable curriculum: structure, scope & gap-fill rationale, generated catalogue, hubs |
| `project-plan/LESSON_TEMPLATE.md` | Lesson anatomy + Definition of Done + style rules |
| `project-plan/PROGRESS_LOG.md` | Dated log of every work session |
| `source-notes/pdf/` | The user's original notes (PDF) |
| `source-notes/extracted-text/` | Raw text extraction (handwriting OCR by PDF text layer; code screenshots not included) |
| `source-notes/AUDIT.md` | Claim-by-claim verification of the notes (✅ 🔶 ⚠️ ✏️ ➕) |
| `source-notes/verification/` | Executable evidence for the audit (Java programs, compile checks, JVM checks) |
| `source-notes/transcripts/` | Markdown transcripts of image-only notes (text + screenshot code + outputs) |
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
| 09 | `09_Memory_Management.pdf` *(batch 2)* | 12 | Stack vs heap, worked stack/heap/String-pool example, strong/weak/soft references, generational heap (Eden/S0/S1/Old), Metaspace vs PermGen, minor/major GC walkthrough with ages & promotion, mark-sweep(-compact), Serial/Parallel/CMS/G1 |
| 12-13 | `12_13_POJO_Enum_Singleton_Classes.pdf` *(batch 2)* | 15 | POJO; enum (values/ordinal/valueOf/name, custom values, constant-specific methods, abstract methods, interfaces, enum vs constants); final class; singleton (eager, lazy, synchronized, DCL + volatile, Bill Pugh, enum); immutable class; wrapper (pointer to note 06) |
| 14-15 | `14_15_Interface.pdf` *(batch 2)* | 2 tall | Interface definition/declaration, why (abstraction, polymorphism, multiple inheritance), methods & fields rules, implementation rules, nested interfaces, abstract class vs interface table, Java 8 default & static methods, diamond with defaults, extending interfaces with defaults (3 ways), Java 9 private methods |
| 16 | `16_Functional_Interface_and_Lambda.pdf` *(batch 2)* | 1 tall | Functional interface (SAM, `@FunctionalInterface`, Object methods), lambda vs class vs anonymous class, Consumer/Supplier/Function/Predicate, FI inheritance use cases |
| 17 | `17_Reflection.pdf` *(batch 3)* | 1 tall | `Class` object & 3 ways to get it, reflecting classes/methods/fields/constructors, invoking methods, setting private fields, private constructors |
| 18 | `18_Annotations.pdf` *(batch 3)* | 1 tall | Annotation basics, predefined (`@Deprecated`, `@Override`, `@SuppressWarnings`, `@FunctionalInterface`, `@SafeVarargs` + heap pollution), meta-annotations (`@Target`, `@Retention`, `@Documented`, `@Inherited`, `@Repeatable`), custom annotations |
| 19 | `19_Exception_Handling.pdf` *(batch 3)* | 2 tall | What/why, propagation through the call stack, hierarchy, checked vs unchecked with examples, try/catch/finally/throw/throws, multi-catch, custom exceptions, cost & when to avoid |
| 20 | `20_Operators.pdf` *(batch 3)* | 11 | Arithmetic, relational, logical, unary, assignment, bitwise (incl. `~n = -(n+1)`), shifts, ternary, `instanceof`, precedence & associativity, worked expression |
| 21 | `21_Control_Flow_Statements.pdf` *(batch 3)* | 2 tall | if family, switch statement (fall-through, rules, types), switch expression (`->`, `yield`), for/while/do-while/for-each, break/continue |
| 28 | `28_Streams.pdf` *(batch 4)* | 1 tall | Stream pipeline, creation, intermediate & terminal ops catalogue, laziness, processing order, single use, parallel streams & Fork-Join |
| 40 | `40_Sequenced_Collections.pdf` *(batch 4)* | 7 | Collection hierarchy before/after Java 21, sequenced criteria, per-collection table, SequencedCollection/Set/Map APIs with examples |
| 41 | `41_Java17_Sealed_Classes.pdf` *(batch 4)* | 6 | Why sealed, sealed/permits/final/non-sealed, rules, full hierarchy exercise |
| Optional | `Optional.pdf` *(batch 4, final)* | 18 | Why Optional, simplified JDK source, every method with versions, map/flatMap/filter, or/stream, where not to use it |

**All notes are in (user, 2026-09-24: "these are the last pdf").** 18 PDFs / 21 note numbers. Not shared: **#3, #5,
#10, #11, #22–27 (Collections Framework series, referenced by note 40) and #29–39**; related topics are covered by
gap-fill lessons (see `CURRICULUM.md` → Scope). Pages with code
**screenshots**: 06 p1, p3 · 07-08 p1, p3, p5, p8 · 09 p2 · 12-13 every page · 20 p2–6, p9–11. Notes **14-15, 16,
17, 18, 19 and 21 have no text layer** (typed "Concept && Coding" video notes exported as very tall images);
17, 18, 19, 21 and 28 have full transcripts in `source-notes/transcripts/`. See `source-notes/extracted-text/README.md`
and §5 for how to read them.

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
| D-014 | **Before any build work:** the user shares more notes → intake + audit each batch → once the user confirms **all** files are shared, **recalibrate** the curriculum DAG, phases and plan → get approval → start Phase 1 | **Decided (user, 2026-09-24)**; all notes received, recalibration done | User wants the full picture before phases start |
| D-015 | **Curriculum v2**: 81 lessons, 16 tiers, 4 levels (Beginner T0–2, Intermediate T3–6, Advanced T7–12, Expert T13–15), 16 checkpoints | Proposed (awaiting approval) | Covers all 21 notes + needed gap-fills; tiers kept small (3–8 lessons) for a real level-up feel |
| D-016 | **`curriculum.yaml` is the single source of truth** for the DAG; `tools/curriculum.py` validates it and renders `CURRICULUM.md`; the site reads the same YAML | Decided (implementation choice) | One place to edit; validation catches cycles, dangling edges and unmapped audit items |
| D-017 | **Gap-fill depth = essentials** for generics, collections, nested classes, Object contracts, method references; concurrency, I/O, JDBC, JPMS only as "just enough" callouts | Proposed (awaiting approval) | Honours the user's scope rule (notes + related missing topics) |
| D-018 | **Phases 1–14** as in `PLAN.md` (content phases follow the DAG tier order; pilots are an internal gate) | Proposed (awaiting approval) | |

## 5. Environment facts (cloud session, as of 2026-09-24)

- Repo: `Gaurvendra/Notes` (private). Working branch: **`claude/eloquent-sagan-5kmlsx`** (the default branch
  `main` has only the initial commit). If a new session starts on another branch, fetch and merge/rebase this
  branch first.
- Pre-installed: **JDK 21.0.10**, Maven 3.9.11, Node 22.22, npm 10.9, Python 3.11.
- **JDK 25** is installable, but run **`sudo apt-get update` first** (a stale index gave 404s):
  `sudo apt-get update && sudo apt-get install -y openjdk-25-jdk-headless` → installed **25.0.4.1** (2026-08-18).
  Afterwards `java` on the PATH is 25, but **`JAVA_HOME` is still preset to JDK 21**, so for Maven/tools use
  `export JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64`. The verification scripts use `$JDK25_HOME` for this reason.
  JDK 26/27 are **not** available via apt here (use CI's `actions/setup-java` for 27 if needed).
- **Maven Central**: plain `curl` downloads once got **HTTP 429 (rate limit)**, but `mvn dependency:get` worked right
  after. Prefer Maven for artifacts; retry with backoff. Library snapshot (2026-09-24): jackson-databind 2.22.3
  (`com.fasterxml.jackson.core`) and **3.2.3** (`tools.jackson.core`, Jackson 3 supports `Optional` natively).
- Mermaid CLI works via `npx -y @mermaid-js/mermaid-cli` with the preinstalled Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`, `--no-sandbox`), useful for checking diagrams.
- Machine: 4 CPUs, 16 GB RAM, so the default GC on JDK 25 is G1 (Serial if the JVM sees 1 CPU).
- PDF rendering: `pip install pymupdf pillow` (poppler/pdftoppm is **not** installed, so the Read tool cannot render
  PDFs). Render pages with `pymupdf` → PNG (90 dpi for handwriting, 150 dpi for code screenshots), then view the PNGs.
  **Tall-image notes** (14-15, 16): extract the embedded image (`pymupdf.Pixmap(doc, xref)`), slice it into ~1250 px
  strips with Pillow, and crop tiny regions at full resolution.
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
**no** (D-009); approval deferred until all notes were shared (D-014). The user then shared batches 2–4 and said
batch 4 was the last.

Open now (asked when presenting the recalibrated plan):
1. Approve the recalibrated plan: curriculum v2 (D-015) + phases 1–14 (D-018)?
2. Gap-fill depth for Generics & Collections (notes #22–27 not shared): essentials (D-017, recommended) or a full
   in-depth collections track (implementations, HashMap internals, concurrent collections)?
3. Concurrency/multithreading (no notes shared): "just enough" callouts only (recommended) or a gap-fill tier?
