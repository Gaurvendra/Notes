# Verification code for AUDIT.md

Executable evidence for the claims in `../AUDIT.md`. Run with JDK 25. The scripts use `$JDK25_HOME` (default `/usr/lib/jvm/java-25-openjdk-amd64`), not `$JAVA_HOME`, because the container presets `JAVA_HOME` to JDK 21:

| Batch | Command | What it checks |
|---|---|---|
| 1 | `java batch1/Verify.java` | primitives, casting, floating point, wrappers/cache, strings/pool, Unicode |
| 2 | `java batch2/Verify2.java` | enums, weak/soft refs, immutable class bug, singletons, interfaces, lambdas |
| 2 | `batch2/compile-checks/run.sh` | rules that must fail (or pass) compilation: interfaces, enums, lambdas |
| 2 | `batch2/jvm-checks.sh` | GC defaults, removed CMS, tenuring threshold, stack size, `System.gc()` |

In Phase 1 these become JUnit tests in `java-track/`.
