# Java Mastery Track

A simple, modern study-and-practice app for learning Java **from scratch to expert**, built from my own study notes
after verifying every claim in them. It has a level-up path (98 lessons in 20 tiers, connected as a prerequisite graph),
long-form lessons with diagrams and examples, predict-the-output puzzles and exercises, quizzes, an interview bank from
fresher to staff level, spaced-repetition flashcards, and XP / levels / streaks / badges. Baseline: **Java 25 LTS**.

Everything runs in the browser: no backend, no account. Progress is kept in the browser (export/import in Settings).

| Folder | What's inside |
|---|---|
| `app/` | The app (React + TypeScript + Vite + Tailwind). Lessons: `src/content/lessons/<id>.mdx`; quiz, interview questions and flashcards: `src/content/lesson-data/<id>.yaml` |
| `project-plan/` | Plan & context, the learning DAG (`curriculum.yaml` → generated `CURRICULUM.md`), lesson template, progress log, `tools/` |
| `source-notes/` | Original notes (PDF), extracted text, transcripts, `AUDIT.md` (verification of every claim), `verification/` |
| `Dockerfile`, `docker-compose.yml`, `docker/` | Serve the app with nginx on http://localhost:8080 |

## Run it locally

Requirements: **Node 20+** (22 recommended). Python 3 with PyYAML only for the curriculum tool. No JDK needed.

```bash
cd app
npm ci
npm run dev            # http://localhost:5173 with live reload
npm run check          # content checks, type check and production build
npm run preview        # serve the production build

# after editing project-plan/curriculum.yaml
python3 project-plan/tools/curriculum.py   # validate + regenerate CURRICULUM.md
```

CI (`.github/workflows/ci.yml`) runs on every push: it validates the learning graph, checks every lesson's content
(data schema, Definition of Done minimums, links and anchors, the IEEE 754 lab against answers recorded from the JVM),
type-checks and builds the app, and opens every page in a browser (errors, phone-width overflow).

**Resuming work in a new Claude Code session:** see `CLAUDE.md` (resume protocol) → `project-plan/PLAN.md`.

## Run it with Docker Desktop

The app is on branch **`claude/eloquent-sagan-5kmlsx`** (the default branch `main` only has the first commit, so it
has no Docker files yet). In a terminal (PowerShell, Terminal or Git Bash):

```bash
git clone -b claude/eloquent-sagan-5kmlsx https://github.com/Gaurvendra/Notes.git
cd Notes                        # the folder that contains docker-compose.yml
docker compose up -d --build    # first build takes 1-3 minutes (downloads Node packages)
```

Then open **http://localhost:8080** (http, not https). Already cloned? `git fetch`, then
`git checkout claude/eloquent-sagan-5kmlsx`, `git pull`, and run the `docker compose` line again.

| Symptom | Fix |
|---|---|
| `no configuration file provided: not found` | You're in the wrong folder or on `main`: `cd` into `Notes` and check out the branch above |
| Build stops at `npm ci` | A network hiccup or proxy: run `docker compose build --no-cache` again |
| `port is already allocated` | Change `"8080:80"` to e.g. `"3000:80"` in `docker-compose.yml`, open http://localhost:3000 |
| Browser says "can't connect" | `docker compose ps` must show the container `Up (healthy)`; if not, `docker compose logs` |
| Old content after new lessons | `git pull`, then `docker compose up -d --build` |

Stop it with `docker compose down`. Your progress lives in the browser, so rebuilding the container keeps it.
