# Verify later (claims written without running Java)

Since D-023 there is no JDK in the sessions or in CI. Lessons still show code and, when the specification fully
determines it, the output. Every such output or behaviour is listed here, so that anyone with a JDK 25 can run it and
tick it off (or correct the lesson).

**How to verify an entry:** paste the lesson's program into a file, run `java File.java` on JDK 25 (and the latest GA
if the claim mentions it), compare with the lesson, then tick the box and add the date and JDK build. If it differs,
fix the lesson and the lesson data first.

The two pilot lessons (`jdk-jre-jvm`, `floating-point`) need no entries: every program, output, compile result and
exercise in them was compiled, run and tested on JDK 25 and 27 by the old `java-track` CI (commit `719dbf3`), and the
IEEE 754 lab is still checked on every build against answers recorded from the JVM.

| ✓ | Lesson | Block (title) | Claim / expected output | Why it should hold (primary source) | Verified on |
|---|---|---|---|---|---|
| | java-landscape | Predict: "Version numbers are not strings" | prints `true`, `false`, `12` | `String.compareTo` is lexicographic (JLS/API); `Runtime.Version.compareTo` compares version numbers numerically (API docs) | |
| | java-landscape | Predict: "The four numbers of a version" | `25.0.4.1+1-LTS` → `25 0 4 1`, build `1`, optional `LTS` | `Runtime.Version` API docs: `$VNUM(-$PRE)?\+$BUILD(-$OPT)?` | |
| | java-landscape | Predict: "Old-style version strings" | `17` and `17.0.1` parse (feature 17); `1.8.0_402` and `17.0.0` throw `IllegalArgumentException` | `Runtime.Version` API docs / JEP 223: `$VNUM` regex `[1-9][0-9]*((\.0)*\.[1-9][0-9]*)*`, no trailing zeros | |
| | java-landscape | Exercises (LtsCheck, VersionCompare, ReleaseCalendar) | reference solutions pass their tests | run the three tests with JUnit 5 + AssertJ on JDK 25 | |
| | first-program | Hello / package / source-file / multi-file terminal blocks | `Hello, World!`, `Hello from a package`, `Hello, team!` (Java 22+) | program semantics; JEP 330, JEP 458 | |
| | first-program | jshell session (example) | `$1 ==> 3`, `x ==> 42`, `$3 ==> "Java 42"` | jshell feedback mode "normal" (jshell tool guide) | |
| | first-program | Step 6 error table | javac/java messages as quoted (`class Hello is public, should be declared in a file named Hello.java`, `Could not find or load main class Hello.class`) | standard javac/launcher messages | |
| | first-program | Edge case "Which main wins?" and Predict "Two mains" | `static main with args`; `B` | JEP 512 launch protocol: `main(String[])` preferred over `main()` | |
| | first-program | Predict "Counting arguments" | `2`, `[Ada]`, `[Grace Hopper]` | shell word splitting + `String[] args` | |
| | first-program | Predict "A compact source file with state" | `count = 2`, `5` | JEP 512 (fields of the implicit class, implicit `import module java.base`) | |
| | first-program | Scenario "a one-file tool" (Largest.java) | compiles and runs as a compact source file | JEP 512 implicit imports; `this::size` in an instance method | |
| | first-program | Exercises (Greeting, CommandLine, MainFinder) | reference solutions pass their tests | run the tests with JUnit 5 + AssertJ on JDK 25 | |
