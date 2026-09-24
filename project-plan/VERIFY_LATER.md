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
| | how-java-runs | Step 1 `javap -c Calc` and step 7 `javap -c Hello` | `iload_0 iload_1 iadd ireturn`; Hello's bytecode (constant-pool numbers labelled as varying) | JVMS ch. 6; javac code generation | |
| | how-java-runs | Scenario "When does a static initialiser run?" | `timeout 30`, `Config initialised`, `loaded? true` | JLS §12.4.1 (constant variables don't trigger initialisation), §13.1 | |
| | how-java-runs | Predict "Constant or not?" | `start`, `42`, `between`, `Lazy initialised`, `0` | JLS §12.4.1 | |
| | how-java-runs | Predict "Static method through a subclass" | `main`, `Parent init`, `Parent.hello`, `Child init`, `1` | JLS §12.4.1; JVMS §5.5 (invokestatic initialises the declaring class) | |
| | how-java-runs | Predict "Declared, but not used" | `declared`, `array of 3`, `Heavy initialised`, `done` | JLS §12.4.1 (array creation isn't an active use) | |
| | how-java-runs | AOT cache commands | `-XX:AOTCacheOutput` / `-XX:AOTCache` work on JDK 25 | JEP 514, JEP 483 | |
| | how-java-runs | Exercises (StackMachine, ExpressionCompiler, TieredSimulator) | reference solutions pass their tests | run the tests with JUnit 5 + AssertJ on JDK 25 | |
| | oop-mindset | Scenario "Equal state, different objects" | `false`, `false`, `false`, `true` | JLS §15.21.3; `Object.equals` is identity; records' `equals` compares components (JEP 395) | |
| | oop-mindset | Predict "Two dogs and a nickname" | `false`, `true`, `Max` | reference assignment copies the reference (JLS §4.3.1) | |
| | oop-mindset | Predict "Default state" | `0 null false 0.0` | JLS §4.12.5 default values; string conversion of `null` (§5.1.11) | |
| | oop-mindset | Predict "One class, shared counter" | `1 2 3`, `3` | static fields have one copy per class (JLS §8.3.1.1) | |
| | oop-mindset | Exercises (BankAccount, ShoppingCart, Library) | reference solutions pass their tests | run the tests with JUnit 5 + AssertJ on JDK 25 | |
| | checkpoint 0 | Challenge DeployCheck | reference solution passes its tests | run the test with JUnit 5 + AssertJ on JDK 25 | |
| | variables-basics | Step 6 "Rejected by the compiler" | each line is a compile error, with the quoted messages | JLS §5.2 assignment contexts; javac messages | |
| | variables-basics | Scenario "What var really infers" | `Integer`, `Long`, `Integer`, `Float`, `[text, 42]` | JLS §14.4.1 (inferred type), §5.6 promotion, `AbstractCollection.toString` | |
| | variables-basics | Predicts "Copying a value", "Unusual but legal names", "What did var infer?" | `10 5`; `10`; `A`, `66`, `B` | JLS §3.8 identifiers, §14.4, §5.6, §5.1.3 | |
| | variables-basics | Exercises (IdentifierCheck, NamingStyle, VarTypeInference) | reference solutions pass their tests (IdentifierCheck is compared with `SourceVersion.isName`) | run the tests with JUnit 5 + AssertJ on JDK 25 | |
| | integer-types | Step 4 "Overflow" code | `-2147483648`, `2147483648`, `-1794967296`, `multiplyExact` throws `ArithmeticException: integer overflow` | JLS §4.2.2, §15.18.2; `Math.multiplyExact` docs; the integer lab checks the values on every build | |
| | integer-types | Scenarios BucketIndex, UnsignedByte | `-2147483648`, `-8`, `2`; `-56`, `200`, `200` | `Math.abs` docs (MIN_VALUE), JLS §15.17.3, `Math.floorMod`, `Byte.toUnsignedInt`, §5.6 promotion | |
| | integer-types | Predicts "Microseconds in a day", "The edges of int", "Four ways to write numbers" | `5`; `-2147483648`, `-2147483648`, `true`, `-56`; `36`, `3 -3 -1`, `-4 1` | *Java Puzzlers* 3; JLS §3.10.1, §15.15.4, §15.17.2–3, §5.1.3 | |
| | integer-types | Step 7 utility outputs | `"101010"`, `"ffffffff"`, `255`, `8`, `31` | `Integer` API docs | |
| | integer-types | Exercises (RangeCheck, SafeMath, UnsignedLongs) | reference solutions pass their tests (compared with narrowing round trips, `Math.*Exact`, `Long` unsigned helpers) | run the tests with JUnit 5 + AssertJ on JDK 25 | |
| | integer-types | "Why this matters" incidents and references | YouTube moved view counters to 64-bit (Dec 2014); FAA AD 2015-09-07 on 787 GCUs, 248 days; BBC and Federal Register URLs resolve | BBC News 2014-12-03; Federal Register 2015-10066 (both hosts blocked from the build container) | |
| | integer-types | Interview (staff) tool claim | Error Prone has checks for `Math.abs` of hash codes, `int` math widened to `long`, lower-case `l` suffixes | Error Prone bug-pattern list (MathAbsoluteNegative, IntLongMath, LongLiteralLowerCaseSuffix) | |
| | char-and-boolean | Step 2 CharArithmetic | `66`, `B`, `B`, `7`, `233`, `abcde` | JLS §5.6 promotion, §15.14.2 (`++` narrowing), §4.2.1 | |
| | char-and-boolean | Step 3 table for `"Hi😀"` | 4, `'\uD83D'`, 3, 0x1F600, `72 105 128512`, `{'\uD83D','\uDE00'}`, 2 | `String`/`Character` API docs; audit batch 1 (`"😀".length() == 2`) | |
| | char-and-boolean | Step 4 Character table | `isDigit('٣')` true; `toUpperCase('ß')` = `'ß'`; `getNumericValue('7')` 7; `digit('f', 16)` 15; `getName(0x1F600)` = `"GRINNING FACE"`; `"straße".toUpperCase(Locale.ROOT)` = `"STRASSE"` | `Character` and `String.toUpperCase` docs, Unicode SpecialCasing | |
| | char-and-boolean | Step 5 / FAQ / Predict "A comment that runs" | `'\u000A'`, `'''`, `'\'` don't compile; the program prints `surprise`, `done` | JLS §3.3, §3.10.4 | |
| | char-and-boolean | Step 6 "Rejected by the compiler" | each line is a compile error | JLS §5.1 (no boolean conversions), §14.9 (`if` needs boolean) | |
| | char-and-boolean | Scenarios Truncate, Digits, TurkishI | `11 true 10`; `true 123 false false`; `false true true true` | `String`/`Character`/`Integer.parseInt` docs (Unicode digits via `Character.digit`), `Pattern` docs (`\d` is ASCII by default), Unicode SpecialCasing | |
| | char-and-boolean | Predicts "The last laugh", "Counting an emoji", "True or false?" | `Ha169`; `4 3 55357 1f600`; `assignment, not comparison: true`, `true false false` | JLS §15.18, §15.26; `String.codePointAt`, `Boolean.parseBoolean` docs | |
| | char-and-boolean | Under the hood, Modern Java | HotSpot 1 byte per boolean field; regex `\X` since 9; `BreakIterator` grapheme clusters since 20; `Character.isEmoji` & co. since 21; JEP 254 memory claim | JVMS §2.3.4; JDK 9/20/21 release notes; JEP 254 | |
| | char-and-boolean | Exercises (Caesar, CodePoints, Utf8) | reference solutions pass their tests (compared with `codePointCount`, `StringBuilder.reverse`, `getBytes(UTF_8)` incl. `'?'` for unpaired surrogates) | run the tests with JUnit 5 + AssertJ on JDK 25 | |
| | char-and-boolean | References | *Java Puzzlers* chapter title "Puzzlers with Character"; Unicode FAQ and UAX #29 URLs resolve | the book; unicode.org | |
| | type-conversion | "Why this matters" (Ariane 5) | 4 June 1996; breakup < 40 s after lift-off; 64-bit float → 16-bit signed integer conversion in the inertial reference software; unhandled Ada exception; both SRIs shut down | Inquiry Board report (Lions), 19 July 1996 | |
| | type-conversion | Step 1 lossy widening table | `1.6777216E7`; `1.2345679E17`; `9.007199254740992E15` | JLS §5.1.2; audit batch 1 (long → float value); `Float/Double.toString` (JDK 19+); the cast explorer computes them on every build | |
| | type-conversion | Step 2 narrowing table | `(short) 70_000 == 4464`, `(int) 3_000_000_000L == -1294967296`, `(char) -1`, `(byte) 300.7 == 44`, `(byte) 1e10 == -1`, `(float) 1e40` = Infinity | JLS §5.1.3; checked by the cast explorer | |
| | type-conversion | Steps 3–5 compile errors and messages | `byte sum = a + b;`, `int wrong = n + d;`, `byte tooBig = 200;`, `int fromLong = big;`, `b = b + 1;`, `takesByte(10);`, `Long boxed = 10;` rejected with the quoted messages; `b *= 30` gives 74 | JLS §5.2, §5.3, §5.6, §15.26.2; javac messages | |
| | type-conversion | Scenarios Average, Percent, IdPrecision, anti-pattern | `3.0 3.5 3.0`; `28.999999999999996`, `28`, `29`; `9007199254740992`, `false`; `-1294967296`, `Math.toIntExact` message `integer overflow` | JLS §15.17, §5.1.2; `Math` docs | |
| | type-conversion | Predicts "Dos Equis", "The hidden cast", "Equal, but not the same number" | `X88`; `-31072 3 44`; `9.223372036854776E18`, `true`, `true` | JLS §15.25, §15.26.2, §5.1.3, §5.6 | |
| | type-conversion | Under the hood | bytecode for `b += 1` (`iadd`, `i2b`); constant folding to `iconst_3`; x86 `cvttsd2si` returns `0x80000000` for NaN/out of range | JVMS §2.11.4, §6.5 `d2i`; Intel SDM | |
| | type-conversion | FAQ rounding | `Math.round(2.5) == 3`, `Math.round(-2.5) == -2`; `(int) Double.POSITIVE_INFINITY` = MAX; `(long) Double.NEGATIVE_INFINITY` = MIN | `Math.round` docs, JLS §5.1.3 | |
| | type-conversion | Exercises (ManualCast, ExactCast, AssignmentRules) | reference solutions pass (compared with real casts, `BigDecimal`, and javac via `javax.tools`; includes javac accepting a `final byte` constant assigned to `char` when it fits) | run the tests with JUnit 5 + AssertJ on JDK 25 | |
