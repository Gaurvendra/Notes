# Java Mastery Track

A website for learning Java **from scratch to expert**, built from my own study notes after verifying every claim in
them. It has a level-up roadmap (98 lessons in 20 tiers, connected as a prerequisite graph), diagrams, examples that
are compiled and tested on **Java 25 LTS**, practice exercises with tests, and interview prep.

| Folder | What's inside |
|---|---|
| `website/` | The site (Astro + Starlight). Lessons live in `src/content/docs/lessons/` |
| `java-track/` | Maven project: every example, output, exercise and solution shown on the site, tested |
| `project-plan/` | Plan & context, the learning DAG (`curriculum.yaml` → generated `CURRICULUM.md`), lesson template, progress log, `tools/` |
| `source-notes/` | Original notes (PDF), extracted text, transcripts, `AUDIT.md` (verification of every claim), `verification/` |

## Run it locally

Requirements: **Node 22+**, **JDK 25**, Maven 3.9+, Python 3 with PyYAML (only for the curriculum tool).

```bash
# the website
cd website
npm ci
npm run dev            # http://localhost:4321 with live reload
npm run verify         # stub pages, type check, production build, internal link check
npm run preview        # serve the production build

# the tested code
cd java-track
mvn verify                                # examples, audit suite, exercise solutions
mvn -pl practice -am test -Dpractice      # your exercise attempts (red until solved)

# the learning DAG (after editing project-plan/curriculum.yaml)
python3 project-plan/tools/curriculum.py  # validate + regenerate CURRICULUM.md
cd website && npm run sync:stubs          # create pages for new lessons
```

CI (`.github/workflows/ci.yml`) runs on every push: it records the outputs of new examples on JDK 25 (and commits
them), runs `mvn verify` on JDK 25 and 27, validates the curriculum, builds and link-checks the website, cross-checks
the IEEE 754 lab against the JVM, and opens every finished page in a browser (errors, phone-width overflow).

**Resuming work in a new Claude Code session:** see `CLAUDE.md` (resume protocol) → `project-plan/PLAN.md`.
