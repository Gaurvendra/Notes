# CLAUDE.md: Java Mastery Track

This repo holds (1) the user's handwritten Java notes and (2) a website that teaches Java from scratch to very
advanced, built from those notes, verified and extended. Audience: a senior manager / senior software developer
who wants deep understanding **and** interview readiness.

## Resume protocol (do this at the start of every new session)

1. Read `project-plan/PLAN.md`: find the first phase not ✅ and its first unchecked `[ ]` task. That's the next task.
2. Read `project-plan/CONTEXT.md`: goals, scope, **decisions log**, environment facts, Java fact snapshot.
3. Read the latest entries in `project-plan/PROGRESS_LOG.md`.
4. For content work, also read `project-plan/CURRICULUM.md` (DAG + node → notes/audit mapping),
   `project-plan/LESSON_TEMPLATE.md` (anatomy + Definition of Done) and the relevant part of `source-notes/AUDIT.md`.
5. Run `git log --oneline -15` and `git status` to confirm the repo matches the plan.
6. `git pull` first.
   If `PLAN.md` says it is waiting for approval, **do not start build work**: ask the user. Otherwise continue with
   the next unchecked task. New notes from the user → follow "Phase ∞" in `PLAN.md`. Uploaded files live only in the
   session that received them, so always copy them into `source-notes/pdf/` and push.
7. The learning DAG lives in `project-plan/curriculum.yaml`. After changing it (or a lesson's `status`), run
   `python3 project-plan/tools/curriculum.py` (must print `OK`); it regenerates the catalogue in `CURRICULUM.md`.

## Environment setup for a fresh container

Only Node.js 20+ is needed (D-023: **no JDK/JRE/JVM**, no Maven). Lessons are written in `app/`:

```bash
cd app && npm ci && npm run dev        # http://localhost:5173
npm run check                          # type-check + content checks + production build (what CI runs)
pip install pyyaml && python3 ../project-plan/tools/curriculum.py --check   # DAG + audit mapping
docker compose up -d --build           # from the repo root → http://localhost:8080
```

## Working rules

- **Scope:** only topics from notes received so far + closely related gaps (see `CURRICULUM.md` "Out of scope").
- **Phases are internal**: never expose them in the site; the site follows the DAG.
- **Quality first:** every lesson meets the Definition of Done in `LESSON_TEMPLATE.md`. Code shown on the site
  is written in the lesson MDX; facts come from `source-notes/AUDIT.md` evidence and primary sources; anything
  not evidenced goes into `project-plan/VERIFY_LATER.md`. Never state an unverified claim as fact.
- **Up to date:** baseline Java 25 LTS; note JDK 26/27 changes; label preview features with their JEP.
- **Small commits, pushed often:** after each task/lesson, update `PLAN.md` checkboxes, lesson status in
  `CURRICULUM.md` and add a `PROGRESS_LOG.md` entry **in the same commit**, then push.
- **Git:** develop on the branch the session designates (Phase 0 used `claude/eloquent-sagan-5kmlsx`); if starting
  on a different branch, first bring in that branch's history. Push with `git push -u origin <branch>`.
- **Stop points:** approval of the recalibrated plan (end of Phase 0B), **user approval before starting Phase 3**, **before Phase 5** (D-024)
  and **before Phase 6** (D-025)
  (D-020, after the pilots and the template retro), hosting target (Phase 16), and any decision in the `CONTEXT.md`
  decisions log that is still "Open". No stop between the two pilots (D-009).
- **Site stack:** React + Vite + Tailwind + MDX in `app/`, styled after LustyDev's Hot Streak (D-023); local or Docker for now (D-007).
- Don't put AI model names/IDs in commits, code, or site content.
