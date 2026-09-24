# Audit of Source Notes (verification report)

> **Audit date:** 2026-09-24 · **Baseline:** Java SE 25 (current LTS) · **Latest GA:** JDK 27 (released 2026-09-15)
> **Method:** claim-by-claim review against the JLS/JVMS as I know them, JEP history, and **executable checks on a
> real JDK** (see "Executed verification" at the bottom). Every correction here will be reflected in the website
> lessons (usually as a "Myth vs Fact" or "Precise version" callout). Nothing is silently dropped.

**Legend**

| Mark | Meaning |
|---|---|
| ✅ | Correct as written |
| 🔶 | Correct in spirit but oversimplified / imprecise; the lesson will give the precise version |
| ⚠️ | Incorrect or outdated; the lesson will correct it explicitly |
| ✏️ | Typo / code that would not compile as written |
| ➕ | Missing, related topic that will be added |

**Notes received (5 files, 39 pages):** `01_OOPS_Concepts_In_Java`, `02_JDK_JRE_JVM`, `04_Primitive_Variables`,
`06_NonPrimitive_Variables`, `07_08_Methods_And_Constructor`.
**Numbering gaps:** notes **#3** and **#5** were not uploaded. Related gap topics (e.g. "first program / `main`
method") are covered as *gap-fill lessons*; if you share #3/#5 later they will be merged in and re-audited.

---

## Note 01 — OOPS Concepts in Java (11 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 1.1 | OOP = programming around objects (real-world entities like Car, ATM) | ✅ | Add: an object has **state, behaviour and identity** (notes list only state + behaviour). Identity is why `==` vs `equals` matters later. |
| 1.2 | Procedural vs OOP table (functions vs objects, data hiding, importance to data) | ✅ | |
| 1.3 | "Overloading / inheritance not possible in procedural" | 🔶 | These are *language* features, not strictly *paradigm* features (C has no overloading; but procedural code in C++ can overload). Teach as "typical of", not "impossible in". |
| 1.4 | Examples: Pascal, C, FORTRAN vs Java, C#, Python, C++ | ✅ | Add: Java/C++/Python are **multi-paradigm**; modern Java also has functional features (lambdas, streams) and data-oriented features (records, sealed types, pattern matching). |
| 1.5 | "Dog is an object", "Car is an object" | 🔶 | `Dog`/`Car` are **classes** (types). *A particular dog* (`Dog tommy = new Dog()`) is the object. This class-vs-object slip is a very common interview trap, so the lesson calls it out. |
| 1.6 | Class = blueprint/template; one class → many objects; keyword `class` | ✅ | |
| 1.7 | `Class Student { int age; string name; ... }` | ✏️ | Java is case-sensitive: `class` (lower-case) and `String` (capital S). |
| 1.8 | Abstraction hides implementation, shows essential functionality; via interfaces & abstract classes | ✅ | ➕ Abstraction also exists at method, module and API level (every well-named method is an abstraction). ➕ Abstract class vs interface comparison, incl. Java 8 `default`/`static` and Java 9 `private` interface methods. |
| 1.9 | "Advantage of abstraction: increases security & confidentiality" | 🔶 | The primary benefits are **reduced complexity and decoupling**: callers depend on a contract, so the implementation can change freely. Abstraction is not a security mechanism; access control and encapsulation are what restrict access. |
| 1.10 | Demo: `interface Car { public applyBrake(); ... }` | ✏️ | Missing return type → does not compile. Must be `void applyBrake();`. `public` is redundant (interface methods are implicitly `public abstract`). The implementing class must implement **all** abstract methods (or be `abstract`). |
| 1.11 | Encapsulation bundles data + code into one unit; "also known as data hiding" | 🔶 | Related but not identical: **data hiding** (making state `private`) is the main *technique* used to achieve encapsulation. |
| 1.12 | Steps: private fields + public getters/setters | 🔶 | Getters/setters alone are not encapsulation: a public setter for every field just exposes the state indirectly. Real encapsulation **protects invariants** (validation in setters/constructors, no setter when the field must not change, defensive copies, immutability, `record`s). |
| 1.13 | Demo `private string Dog;` … `lab.getColor` | ✏️ | Should be `private String colour;` and `lab.getColour()`. |
| 1.14 | Inheritance: child inherits functions & variables; `extends` or via interface | 🔶 | Only **accessible** (non-private) members are inherited; **private fields exist inside the child object but are not accessible**; constructors are **never** inherited. Interfaces give inheritance of *type* (and of behaviour via `default` methods), never of instance state. |
| 1.15 | Types: single, multilevel, hierarchical, multiple (not supported due to diamond problem; solved via interfaces) | 🔶 | ➕ **Hybrid** inheritance is missing. Precisely: Java supports multiple inheritance of **type** (interfaces), and since Java 8 of **behaviour** (`default` methods), but never of **state**. Default methods bring back a *diamond* at method level; the JLS resolves it: (1) class methods win, (2) the more specific interface wins, (3) otherwise compile error, and you must override and optionally call `A.super.m()`. |
| 1.16 | Demo Vehicle/Car; `vehicle.getCarType()` "should not work" | ✅ | It is a **compile-time** error: members are looked up on the *static (declared) type*. |
| 1.17 | Polymorphism = many forms; compile-time (overloading) vs run-time (overriding) | ✅ | ➕ Upcasting/downcasting, `instanceof` pattern matching (Java 16), `switch` pattern matching (Java 21), `ClassCastException`. |
| 1.18 | Overriding demo `B obj = new B(); obj.getEngine(); // 2 — decided at runtime` | 🔶 | This example doesn't actually show runtime dispatch: the reference type and object type are the same. The classic demo is `A obj = new B(); obj.getEngine(); // 2`. |
| 1.19 | "In overriding everything (arguments, return type, name) is same" | 🔶 | Name + parameter types must match. Return type may be **covariant** (a subtype) since Java 5; access **cannot be narrower**; **checked exceptions cannot be broader**; `static`, `private`, `final` methods cannot be overridden (static ones are *hidden*). Use `@Override`. |
| 1.20 | IS-A (inheritance) vs HAS-A (object used in another class); 1-1, 1-many, many-many | ✅ | |
| 1.21 | Association; Aggregation (independent lifetimes) vs Composition (dependent lifetime) | ✅ | ➕ UML notation (hollow vs filled diamond), code shapes of each, and "favour composition over inheritance", explained with trade-offs. |
| 1.22 | — | ➕ | Missing and related: `java.lang.Object` as the root class (`equals`/`hashCode`/`toString` contracts), `this`/`super` keywords, abstract class vs interface, records, sealed classes (Java 17), enums as objects. |

## Note 02 — JDK, JRE, JVM (3 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 2.1 | Java: platform independent, OOP, portable (WORA) | ✅ | ➕ Also statically & strongly typed, garbage-collected, multithreaded, strong backward compatibility, huge ecosystem. Caveat: WORA breaks with native code (JNI/FFM), OS-specific paths etc. |
| 2.2 | JDK ⊃ JRE ⊃ JVM | ✅ (historically) | ⚠️ **Outdated packaging:** since **JDK 11**, Oracle/OpenJDK no longer ship a separate JRE. You run on a full JDK or build a **custom runtime image with `jlink`** (JDK 9+). Some vendors (e.g. Eclipse Temurin) still publish JRE-only builds. The concept "runtime = JVM + class libraries" remains correct. |
| 2.3 | "JVM is an abstract machine that doesn't exist physically" | 🔶 | The JVM is a **specification** (JVMS). **Implementations** such as HotSpot (OpenJDK), Eclipse OpenJ9 and GraalVM are real software, and a running JVM is an OS process. |
| 2.4 | Program → compiler → bytecode → JVM → machine code → CPU | 🔶 | The JVM first **loads, links and verifies** classes, then **interprets** bytecode and **JIT-compiles only hot code** (tiered: interpreter → C1 → C2). ➕ Class loaders, runtime data areas (heap, stacks, metaspace, PC register), GC, and the modern **AOT cache** work (Project Leyden). |
| 2.5 | JVM is platform dependent; bytecode is platform independent | ✅ | |
| 2.6 | JIT converts bytecode into machine code | ✅ | Plus: why the interpreter still exists (start-up), warm-up, deoptimisation (intro level). |
| 2.7 | JRE = JVM + class libraries; can run but not compile | ✅ | Class libraries = Java SE API modules (`java.base`, …). |
| 2.8 | JDK = JRE + compiler (`javac`) + debugger | 🔶 | ➕ Many more tools: `java`, `javac`, `jar`, `javadoc`, `javap`, `jshell` (9), `jlink` (9), `jpackage` (16), `jdeps`, `jcmd`, `jfr`, `jstack`, `jmap`, `jconsole`, `keytool`, `jdb`. |
| 2.9 | JVM, JRE, JDK are platform dependent | ✅ | |
| 2.10 | JSE / JEE (Jakarta) / JME | 🔶 | ⚠️ Java EE moved to the Eclipse Foundation and was renamed **Jakarta EE**; since Jakarta EE 9 the packages are `jakarta.*` (not `javax.*`). Current major line: **Jakarta EE 11**. Java ME is niche/legacy. **Android is not Java ME** (a common doubt). |
| 2.11 | — | ➕ | Missing and related: release cadence (6-monthly; LTS every 2 years: 8, 11, 17, 21, **25**; next LTS 29 in Sept 2027), OpenJDK vs Oracle JDK vs vendor builds (Temurin, Corretto, Zulu, Liberica, Microsoft, GraalVM), `javac`/`java`, single-file (11) and multi-file (22) source launch, **compact source files & instance `main` methods (final in JDK 25, JEP 512)**, anatomy of `public static void main(String[] args)`, `.class` files and `javap`. |

## Note 04 — Variables & Primitive Data Types (10 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 4.1 | Variable = container holding a value; `type name = value;` | ✅ | |
| 4.2 | Java is statically typed | ✅ | ➕ `var` (Java 10) is still static typing (inferred at compile time), and it works only for locals. |
| 4.3 | Java is strongly typed | ✅ | |
| 4.4 | Naming: case-sensitive; letters/digits; may start with `$`, `_` or a letter; no reserved keywords; camelCase; constants in capitals | ✅ / 🔶 | ⚠️ `_` **alone** has been a keyword since Java 9 and is the **unnamed variable** since Java 22. `$` is legal but reserved by convention for generated code. ➕ Contextual keywords (`var`, `record`, `sealed`, `permits`, `yield`…), and `true/false/null` are literals, not keywords. |
| 4.5 | Types tree: primitive (char, byte, short, int, long = integral; float, double = fractional; boolean) and reference (class, interface, array, string, enum) | ✅ / 🔶 | JLS terms: **integral** (`byte short int long char`) + **floating-point** (`float double`) = numeric; `boolean` separate. `String` is a class, not a separate kind of type. |
| 4.6 | `char`: 2 bytes; "character representation of **ASCII** values"; 0..65535; default `'\u0000'` | ⚠️ | `char` is an **unsigned 16-bit UTF-16 code unit** (Unicode, not ASCII). Characters outside the BMP (e.g. emoji 😀) need **two** `char`s (a surrogate pair), so `"😀".length() == 2`. Verified below. |
| 4.7 | `byte`: 8-bit signed two's complement, -128..127, default 0 | ✅ | |
| 4.8 | Two's complement worked example (+3 = 0011, -3 = 1101, sum = 0) | ✅ | Nice example; will be an interactive bit-flipper widget. Note: "7 bits represent the number, 1 bit the sign" is 🔶. In two's complement the MSB has weight **−2⁷**, not a pure sign flag, which is why the range is asymmetric (−128..127). |
| 4.9 | `short` 16-bit, `int` 32-bit (−2³¹..2³¹−1), `long` 64-bit (−2⁶³..2⁶³−1), defaults 0 | ✅ | |
| 4.10 | `long var = 100l;` | 🔶 | Legal, but use **upper-case `L`** (`100L`): lower-case `l` looks like `1`. |
| 4.11 | `boolean`: "1 bit"; "**default value is True**" | ⚠️ | Default is **`false`** (verified). Size is **not defined** by the spec: HotSpot uses 1 byte per boolean field/array element, and booleans are handled as `int` on the operand stack. |
| 4.12 | Widening: byte → short → int → long automatic | ✅ / ➕ | Full chain: `byte → short → int → long → float → double`, and `char → int`. ⚠️ Widening **can lose precision**: `int → float`, `long → float`, `long → double` (verified: 123456789123456789L → 123456790519087104). |
| 4.13 | Narrowing ("downcasting") needs explicit cast; `(byte)128 = −128`, `(byte)148 = −108` | ✅ / 🔶 | Values verified. Terminology: for primitives it is **narrowing primitive conversion** ("downcasting" is the term for reference types). Mechanism: keep the low 8 bits. ➕ `double → int` truncates toward zero, **saturates** at `Integer.MAX/MIN_VALUE`, and `NaN → 0` (verified). |
| 4.14 | Promotion: "as soon as the value of the expression **crosses the range**, promotion happens"; `byte sum = a + b;` fails "since range is crossing" | ⚠️ | Promotion is a **compile-time type rule** and has nothing to do with the runtime value: in `a + b`, `byte/short/char` operands are **always** promoted to `int`, so `byte + byte` is an `int` even for `1 + 2`. ➕ Exception: if both operands are compile-time constants (`final byte a = 1, b = 2;`) then `byte s = a + b;` compiles (verified). ➕ `b += 1` compiles because compound assignment includes an implicit cast. ➕ `int + int` that overflows **stays `int` and silently wraps** (`MAX_VALUE + 1 == MIN_VALUE`, verified); use `Math.addExact` etc. |
| 4.15 | Mixed expression promotes to the wider type; `int sum = a + doubleVar;` error | ✅ | Error message: "possible lossy conversion from double to int". |
| 4.16 | Kinds of variables: instance, local, static, method params, constructor params | ✅ | ➕ **Local variables get no default value**: they must be definitely assigned before use (compile error otherwise). Defaults apply only to fields and array elements. ➕ Scope/lifetime/storage table; exception-handler & lambda parameters. |
| 4.17 | "Only one copy of static variable; accessed via class name" | ✅ | ➕ Where it lives (with the `Class` object on the heap since Java 8; class metadata in Metaspace), and why static mutable state is risky (tests, concurrency). |
| 4.18 | float = 1 sign + 8 exponent + 23 mantissa; 4.125 worked example (exponent 129, mantissa 00001…) | ✅ | Verified: `4.125f` bits = `0 10000001 00001000…`. |
| 4.19 | 0.7f worked example: exponent 126, mantissa `0110011…`, reconverted ≈ **0.699707031** | 🔶 | The conclusion (0.7 is not exactly representable) is right, but the hand calculation truncated the mantissa. The stored value is **0.699999988079071044921875** (verified), and the last bit is **rounded** (round-half-to-even), not just cut off. |
| 4.20 | "Same for double, just 64 bits" | ✅ / ➕ | double = 1 + 11 + 52, bias 1023. ➕ Special values (±0.0, ±Infinity, NaN, subnormals), `0.1 + 0.2 = 0.30000000000000004` (verified), `NaN != NaN`, precision (~7 vs ~15–17 significant digits). `strictfp` is obsolete since Java 17 (JEP 306). |
| 4.21 | "So we generally use BigDecimal instead of float" | 🔶 | For **money/exact decimals**, yes. Create it with `new BigDecimal("0.7")` or `BigDecimal.valueOf(0.7)`, **never** `new BigDecimal(0.7)` (which captures the binary error, verified). Mind `equals` vs `compareTo` (scale), and always pass a `RoundingMode`. For scientific/graphics work, `double` is correct. |
| 4.22 | — | ➕ | Literals (`0b1010`, `0x1F`, `017` octal trap, `1_000_000`, `f`/`d`/`L` suffixes, char escapes), `Integer.MAX_VALUE`, unsigned helpers (`Integer.toUnsignedString`, `Byte.toUnsignedInt`), and primitive patterns in `switch`/`instanceof` (**preview only**: JEP 532, fifth preview in JDK 27). |

## Note 06 — Non-Primitive (Reference) Data Types (6 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 6.1 | "Mainly 4 reference types: Class, String, Interface, Array" | 🔶 | JLS kinds: **class types, interface types, array types, type variables** (plus the special null type). `String` is a class (with special language support: literals and `+`). **Enums** and **records** are special classes; annotations are special interfaces. |
| 6.2 | `new` allocates a memory block; the variable holds a reference; diagram (variable → heap object) | ✅ | 🔶 A reference is **not necessarily a raw address** (compressed oops; objects move during GC). ➕ Local reference *variables* live in the stack frame; the *objects* live in the heap (the JIT may scalar-replace non-escaping objects: escape analysis). |
| 6.3 | "Everything is pass by value" | ✅ | Key lesson with memory diagrams: the **reference is copied**, so a method can mutate the caller's object but can never re-point the caller's variable (the classic `swap` fails). |
| 6.4 | "…so with reference variables we achieve the functionality of pointers in C++" | 🔶 | Similar in that both let you share access to an object; different in that Java has no pointer arithmetic, no address-of, no dereference of arbitrary memory, and references are always either `null` or valid. |
| 6.5 | Strings immutable; String Constant Pool inside heap; `s1 = "hello"`, `s2 = "hello"` share one literal | ✅ | SCP is in the heap **since Java 7** (it was in PermGen before; PermGen was removed in Java 8). ➕ Why immutable (security, pooling, cached `hashCode`, thread-safety). ➕ `==` vs `equals`, compile-time constant concatenation is pooled but runtime concatenation isn't, `intern()` (all verified). |
| 6.6 | `new String("hello")` → normal heap object | ✅ | ➕ Classic interview Q: "how many objects?" (up to two: the pooled literal and the new object). ➕ `StringBuilder` vs `StringBuffer`, text blocks (15), compact strings (9), `invokedynamic` concatenation (9), handy APIs (`strip`, `isBlank`, `repeat`, `lines`: Java 11; `formatted`: 15). |
| 6.7 | Interface example (`Person`, `Teacher`, `Engineer`); parent reference can hold child object; cannot `new Person()` | ✅ | ➕ Common doubt: `new Person() { … }` *does* compile, because it creates an object of an **anonymous class** that implements `Person`. Lambdas for functional interfaces likewise. |
| 6.8 | Array = sequence of memory storing same type; `int[] arr = new int[5];` diagram | ✅ | ➕ Arrays are **objects** on the heap with a `length` field; default element values; `int[] a` vs `int a[]`; array initialisers; 2-D arrays are *arrays of arrays* (jagged); `ArrayIndexOutOfBoundsException`; array covariance + `ArrayStoreException`; `Arrays` utilities; object arrays hold **references**, not objects. |
| 6.9 | Wrapper classes list (int→Integer, char→Character, …) | ✅ | |
| 6.10 | "Why wrappers: we get the advantages of **passing by reference**; if we change an `Integer` later it changes in memory" | ⚠️ | **Incorrect.** Wrappers are **immutable** and Java is **always pass-by-value**. `x = x + 1` inside a method creates a *new* `Integer`; the caller still sees the old value (verified: stays 10). The real reasons: generics/collections need objects, `null` can mean "absent", utility methods and constants (`parseInt`, `MAX_VALUE`), and use where `Object` is expected. |
| 6.11 | "Primitives are stored in stack, not heap" | 🔶 | Only **local** primitives live in stack frames. Primitive **fields** live inside their object on the **heap**; static fields live with the class. |
| 6.12 | Autoboxing / unboxing definitions and examples | ✅ | ➕ **Integer cache** −128..127 makes `==` "work" for small values only (verified: 127 → true, 128 → false). ➕ `NullPointerException` on unboxing `null`, hidden boxing cost in loops, `new Integer(..)` deprecated for removal, and a forward look at Project Valhalla value classes (not in any GA JDK as of JDK 27). |
| 6.13 | Constant: `static final VAR = 10;` | ✏️ / ➕ | Missing type: `static final int VAR = 10;`. ➕ `final` makes the **variable** unassignable, not the **object** immutable (`final List` can still be modified). Compile-time constants are inlined into other classes (a stale-constant gotcha). Naming `UPPER_SNAKE_CASE`. (Context: JDK 26's JEP 500 starts warning on reflective mutation of `final` fields: "making final mean final".) |

## Note 07–08 — Methods & Constructors (9 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 7.1 | Method = set of instructions for a task; readability & reusability | ✅ | |
| 7.2 | Declaration anatomy: access specifier, return type, name, parameters, `throws` | ✅ | ➕ **Method signature = name + parameter types** only (not return type, not `throws`, not modifiers). |
| 7.3 | Four access specifiers: public / private / protected / default | ✅ / 🔶 | JLS term: **access modifiers**; they apply to fields, constructors and nested types too; top-level classes can only be `public` or package-private. ⚠️ `protected` nuance: in a *different package*, a subclass may access it **only through references of its own type (or a subtype)**, not through a parent-type reference. `private` is accessible across the whole top-level class, including nested classes (nest-mates, Java 11). ➕ Visibility matrix. |
| 7.4 | Return type; `void` | ✅ | |
| 7.5 | Name = verb, camelCase | ✅ | |
| 7.6 | Body ends at `return` or end; `return;` allowed in void | ✅ | ➕ …or when an exception is thrown. |
| 7.7 | "System-defined methods (Math.sqrt)" vs user-defined | 🔶 | Standard term: **Java SE API / library methods**. |
| 7.8 | Overloading: same name, different arguments; return type not considered | ✅ | ➕ **Overload resolution** in three phases (exact/widening → boxing → varargs), ambiguity with `null` and with boxing, overloading across inheritance. |
| 7.9 | Overriding: subclass has same method as parent | 🔶 | See rule list in audit item 1.19. |
| 7.10 | Static methods: belong to class; can't access instance members; can't be overridden | ✅ / 🔶 | "can't access instance members" means *directly* (without an object reference). Static methods are **hidden**, not overridden; calling one through an instance compiles but binds by the **static** type. |
| 7.11 | When to make static: doesn't modify object state; utility methods; "Example: **Factory design pattern**" | 🔶 | That's a **static factory method** (`List.of`, `Integer.valueOf`). The GoF **Factory Method** pattern is actually based on *overridable instance* methods, so the two often get confused. |
| 7.12 | Final methods can't be overridden | ✅ | ➕ `final` classes; `private` methods are effectively non-overridable. |
| 7.13 | Abstract method "defined only in abstract class" | 🔶 | Also in **interfaces** (implicitly `abstract`), and enum constants can implement an enum's abstract method. An abstract class may have **zero** abstract methods. |
| 7.14 | Varargs: variable inputs; only one; must be last; example `sum(int a, int... variable)` | ✅ | ➕ Varargs **is an array** (`sum(3)` gets an empty array, not `null`); overload ambiguity; `@SafeVarargs` and heap pollution with generic varargs. |
| 8.1 | Constructor initialises the instance; name = class name; no return type | ✅ | ➕ `new` **allocates and zero-initialises** memory, *then* the constructor runs. Per JLS a constructor is **not a method** and **not a member** (never inherited). |
| 8.2 | "No return type **because implicitly Java adds class as return type**" | ⚠️ | Myth. Constructors have **no** return type. In bytecode a constructor is `<init>` with a **`void`** descriptor; the *`new` expression* is what produces the reference (`new` → `dup` → `invokespecial <init>`). If you add a return type it becomes an ordinary method that happens to have the class's name. |
| 8.3 | Cannot be `static`, `final`, `abstract`, `synchronized` (with reasons) | ✅ | Reasons are sound. ➕ also not `native`; allowed modifiers: `public`, `protected`, `private` (or none). |
| 8.4 | No constructor in an interface | ✅ | ➕ Interview favourite: **abstract classes do have constructors** (run via `super(...)` from subclasses). |
| 8.5 | Default constructor: added only when none is declared; "**also sets default values for all instance variables**" | ⚠️ | Fields get their default values **at allocation, before any constructor runs**, whether or not a default constructor exists. The default constructor has the **same access as the class** and only calls `super()`. ➕ Gotcha: adding a parameterised constructor **removes** the implicit no-arg one, which breaks `new X()` and subclasses relying on implicit `super()`. |
| 8.6 | No-arg, parameterised, overloaded constructors | ✅ | ➕ Copy constructors; records' canonical and **compact** constructors; enum constructors (implicitly `private`). |
| 8.7 | Private constructor → Singleton; static method to obtain instance | ✅ | ➕ Also utility classes (`Math`), static factories, preventing subclassing. Singleton variants (eager, lazy, holder idiom, double-checked locking with `volatile`, **enum singleton**) and their trade-offs. |
| 8.8 | Constructor chaining with `this()` (same class) and `super()` (parent); Java inserts `super()` implicitly | ✅ | ⚠️ **Updated in Java 25 (JEP 513, Flexible Constructor Bodies, final):** statements may now appear **before** `this(...)`/`super(...)` (a *prologue*) as long as they don't use the instance being built (assigning its fields is allowed). Before Java 25 the call had to be the first statement. ➕ Can't call both `this()` and `super()`; recursive constructor invocation is a compile error. |
| 8.9 | Parent constructor runs first, then child | ✅ | ➕ Full **object initialisation order**: static init (once, at class initialisation) → `super(...)` chain → instance field initialisers and instance initializer blocks (textual order) → constructor body. ➕ Danger: calling overridable methods from a constructor (the subclass sees uninitialised fields); `this`-escape. |
| 8.10 | If parent has a parameterised constructor you must pass args to `super(...)` | 🔶 | Only if the parent has **no accessible no-arg constructor**. |

---

## Executed verification (JDK 21.0.10, 2026-09-24; will be re-run on JDK 25 in CI)

```
boolean default field = false
char default = 0
(byte)128 = -128, (byte)148 = -108
4.125f bits = 0 10000001 00001000000000000000000
0.7f bits   = 0 01111110 01100110011001100110011
exact 0.7f = 0.699999988079071044921875
exact 0.7d = 0.6999999999999999555910790149937383830547332763671875
0.1+0.2 = 0.30000000000000004
final byte const sum compiles = 3
MAX+1 = -2147483648
long->float = 123456790519087104 (lost precision)
(int)3.99e10 = 2147483647, (int)NaN = 0, (int)-7.9 = -7
127==127: true, 128==128: false
wrapper after change(): 10
literal==constConcat: true, literal==runtimeConcat: false, intern: true
emoji length = 2, codePoints = 1
```

These checks will become permanent JUnit tests in the companion code project, so the website can never drift from
real JVM behaviour.
