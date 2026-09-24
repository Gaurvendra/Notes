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
| | | | | | |
