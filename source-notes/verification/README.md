# Verification code for AUDIT.md

Executable evidence for the claims in `../AUDIT.md`. Run with JDK 25. The scripts use `$JDK25_HOME` (default `/usr/lib/jvm/java-25-openjdk-amd64`), not `$JAVA_HOME`, because the container presets `JAVA_HOME` to JDK 21:

| Batch | Command | What it checks |
|---|---|---|
| 1 | `java batch1/Verify.java` | primitives, casting, floating point, wrappers/cache, strings/pool, Unicode |
| 2 | `java batch2/Verify2.java` | enums, weak/soft refs, immutable class bug, singletons, interfaces, lambdas |
| 2 | `batch2/compile-checks/run.sh` | rules that must fail (or pass) compilation: interfaces, enums, lambdas |
| 2 | `batch2/jvm-checks.sh` | GC defaults, removed CMS, tenuring threshold, stack size, `System.gc()` |
| 3 | `java batch3/Verify3.java` | operators, control flow & switch, exceptions, reflection, annotations (output in `batch3/verify3-output.txt`) |
| 3 | `batch3/compile-checks/run.sh` | switch rules, exception rules, annotation rules that must fail (or pass) compilation |
| 4 | `java batch4/Verify4.java` | streams, sequenced collections, sealed hierarchies, Optional (output in `batch4/verify4-output.txt`) |
| 4 | `batch4/compile-checks/run.sh` | sealed rules, exhaustive switch, Optional access |
| 4 | `batch4/jackson-check/run.sh` | Optional + JSON with Jackson 2.22.3 vs 3.2.3 (needs jars in `~/.m2`) |

In Phase 1 these became JUnit tests in `java-track/` (removed by D-023; see commit `719dbf3`).
