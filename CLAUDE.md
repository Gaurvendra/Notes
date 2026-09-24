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
6. If `PLAN.md` says Phase 0B is in progress, **do not start build work**. Process any notes the user shares
   (Phase 0B steps 1–4). When the user says all notes are shared, recalibrate (step 5) and ask for approval (step 6).
   Uploaded files live only in the session that received them, so always copy them into `source-notes/pdf/` and push.

## Environment setup for a fresh container

```bash
sudo apt-get install -y openjdk-25-jdk-headless   # baseline JDK (21 is preinstalled; 25 is the target)
pip install pymupdf                                # render/extract source-note PDFs (no poppler here)
cd website && npm ci                               # once the site exists (Phase 1+)
cd java-track && mvn -q verify                     # once the code project exists (Phase 1+)
```

## Working rules

- **Scope:** only topics from notes received so far + closely related gaps (see `CURRICULUM.md` "Out of scope").
- **Phases are internal**: never expose them in the site; the site follows the DAG.
- **Quality first:** every lesson meets the Definition of Done in `LESSON_TEMPLATE.md`. Code shown on the site
  comes from compiled, tested files in `java-track/`. Never state an unverified claim as fact.
- **Up to date:** baseline Java 25 LTS; note JDK 26/27 changes; label preview features with their JEP.
- **Small commits, pushed often:** after each task/lesson, update `PLAN.md` checkboxes, lesson status in
  `CURRICULUM.md` and add a `PROGRESS_LOG.md` entry **in the same commit**, then push.
- **Git:** develop on the branch the session designates (Phase 0 used `claude/eloquent-sagan-5kmlsx`); if starting
  on a different branch, first bring in that branch's history. Push with `git push -u origin <branch>`.
- **Stop points:** approval of the recalibrated plan (end of Phase 0B), hosting target (Phase 12), and any decision
  in the `CONTEXT.md` decisions log that is still "Open". No pilot-feedback stop (user decision D-009).
- **Site stack:** Astro Starlight (D-001), local-only for now (D-007).
- Don't put AI model names/IDs in commits, code, or site content.
