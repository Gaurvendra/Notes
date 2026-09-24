# java-track: the tested code behind the website

Every code sample, output, exercise and "this doesn't compile" claim on the website comes from here and is checked
by `mvn verify` on **JDK 25** (and JDK 27 in CI).

```bash
export JAVA_HOME=/path/to/jdk-25          # Maven follows JAVA_HOME
cd java-track
mvn verify                                # examples + audit + solutions (must be green)
mvn -pl practice -am test -Dpractice      # YOUR exercises: red until you solve them
```

## Modules

| Module | What | Tests |
|---|---|---|
| `testkit` | Helpers: `ConsoleCapture` (assert printed output), `CompileCheck` (compile with real `javac`, assert errors), `Snippets` (snippet regions) | own unit tests |
| `examples` | Code shown in lessons (`track.<lesson_id>` packages) + `track.audit` regression suite for `source-notes/AUDIT.md` | output, snippet and fact tests |
| `practice` | Exercise stubs (`throw new UnsupportedOperationException("TODO")`) + their tests | skipped unless `-Dpractice` |
| `solutions` | Reference solutions; **runs the practice tests** (shared via `build-helper`) so every exercise is proven solvable | practice tests |

## Conventions

- **Package per lesson:** lesson id with dashes → underscores, e.g. `floating-point` → `track.floating_point`.
- **Snippet regions:** `// @snippet:start name` … `// @snippet:end name` (lower-case, dashes allowed). The website shows
  the de-indented lines between the markers; `SourceConventionsTest` keeps markers balanced.
- **Outputs:** every output shown on the site has a test using `ConsoleCapture`.
- **Compile errors:** claims like "this doesn't compile" use `CompileCheck` and assert the message learners will see
  (simple type names, as printed by the `javac` command line).
- **Exercises:** the same class name/package in `practice` (stub) and `solutions` (answer); tests live only in `practice`.
  Difficulty in the Javadoc: 🟢 warm-up · 🟡 core · 🔴 challenge.
- `track.template` shows one example and one exercise that follow these conventions.
