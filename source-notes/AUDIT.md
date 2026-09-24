# Audit of Source Notes (verification report)

> **Audit dates:** batch 1 and batch 2 on 2026-09-24 · **Baseline:** Java SE 25 (current LTS) · **Latest GA:** JDK 27 (released 2026-09-15)
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

**Notes received:**
- **Batch 1** (5 files, 39 pages): `01_OOPS_Concepts_In_Java`, `02_JDK_JRE_JVM`, `04_Primitive_Variables`,
  `06_NonPrimitive_Variables`, `07_08_Methods_And_Constructor`.
- **Batch 2** (4 files): `09_Memory_Management` (12 pages), `12_13_POJO_Enum_Singleton_Classes` (15 pages),
  `14_15_Interface` (2 very tall pages ≈ 18 screens), `16_Functional_Interface_and_Lambda` (1 tall page ≈ 4 screens).
- **Batch 3** (5 files): `17_Reflection`, `18_Annotations`, `19_Exception_Handling`, `20_Operators`, `21_Control_Flow_Statements`.
- **Batch 4, final** (4 files): `28_Streams`, `40_Sequenced_Collections`, `41_Java17_Sealed_Classes`, `Optional`.

**Totals:** 18 PDF files covering 21 note numbers, **305 audited items**. **Numbering gaps:** notes **#3, #5, #10,
#11, #22–27 (the Collections Framework series, referenced by note 40) and #29–39** were not shared. Related gap topics
are covered as *gap-fill lessons*; if they are shared later they will be merged in and re-audited.

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

## Executed verification: batch 1 (JDK 21.0.10; re-run on JDK 25.0.4.1 with identical output)

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

Source: `source-notes/verification/batch1/Verify.java`. These checks will become permanent JUnit tests in the
companion code project, so the website can never drift from real JVM behaviour.

---

# Batch 2 (received 2026-09-24)

## Note 09 — Java Memory Management (12 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 9.1 | "Java creates 2 types of memory, both managed by the JVM: Stack and Heap" | 🔶 | These are the two most visible areas. The JVM spec defines more **run-time data areas**: pc register and JVM stack (per thread), heap (shared), method area (HotSpot: **Metaspace**), run-time constant pool, and native method stacks. The JVM also uses native memory (code cache, GC structures, direct buffers). |
| 9.2 | Stack stores temporary variables with a separate block (frame) per method | ✅ | |
| 9.3 | "Stack stores primitive data types" | 🔶 | Only **local** primitives. Primitive **fields** live inside their object on the heap (same as audit 6.11). |
| 9.4 | "Stack stores references of heap objects: strong, weak, soft reference" | 🔶 | Stack slots always hold ordinary (strong) references. `WeakReference`/`SoftReference`/`PhantomReference` are **objects on the heap** that the GC treats specially; "weak/soft" describes how an object is *reachable*, not what the stack slot holds. |
| 9.5 | Each thread has its own stack | ✅ | ➕ Size via `-Xss` (default 1 MB on 64-bit Linux; verified `ThreadStackSize = 1024` KB). Virtual threads (Java 21) keep their stacks as heap-allocated chunks. |
| 9.6 | Out-of-scope variables are deleted from the stack in LIFO order | 🔶 | The whole **frame** is popped when the method returns (LIFO across calls). Inside a method, block-scoped slots are just reused, so nothing is "deleted" per variable. |
| 9.7 | Stack full → `java.lang.StackOverflowError` | ✅ | ➕ Heap exhaustion → `OutOfMemoryError: Java heap space`; Metaspace exhaustion → `OutOfMemoryError: Metaspace`. |
| 9.8 | Heap stores objects; "there is no order of allocating the memory" | 🔶 | Allocation is actually very ordered and fast: bump-the-pointer inside per-thread **TLABs** in Eden. What's unordered is object *lifetime* (not LIFO like the stack). |
| 9.9 | GC deletes **unreferenced** objects | 🔶 | GC reclaims **unreachable** objects: those with no path from **GC roots** (thread stacks, static fields, JNI refs…). Two objects that reference each other but are unreachable **are** collected; Java doesn't use reference counting. This is a classic interview trap. |
| 9.10 | Collector types: Serial, Parallel, G1, CMS | ⚠️ | **Outdated:** CMS was deprecated in JDK 9 and **removed in JDK 14** (verified on JDK 25: "Unrecognized VM option 'UseConcMarkSweepGC'"). ➕ Current collectors: Serial, Parallel, **G1** (default), **ZGC** (sub-millisecond pauses; generational only since JDK 24), **Shenandoah**, Epsilon (no-op). |
| 9.11 | Heap is shared by all threads | ✅ | |
| 9.12 | Worked example (p2–4): `main` + `memoryManagementTest` frames, heap objects, String pool, frames removed on return | ✅ | Excellent diagram; it'll be the basis of an animated stepper. 🔶 On p4 the GC also removes the pooled literal `"24"`: string literals referenced by a loaded class's constant pool stay reachable while that class is loaded. At the end of `main` the JVM simply exits, so no collection is needed. |
| 9.13 | GC runs periodically; the JVM decides when; `System.gc()` is not guaranteed | ✅ / 🔶 | GC is mostly triggered by **allocation pressure** (e.g. Eden full → young GC) and occupancy thresholds, not a timer. `System.gc()` is a request: verified it triggers 1 collection by default and **0** with `-XX:+DisableExplicitGC`. |
| 9.14 | "GC frequency is directly proportional to how full the heap is" | 🔶 | Closer: it's proportional to the **allocation rate** relative to young-generation size. |
| 9.15 | Strong reference: object can't be collected while a strong reference exists | ✅ | …more precisely, while it is **strongly reachable** from a GC root. |
| 9.16 | Weak reference: "deleted as soon as GC runs even if some variable references it; **the variable in the stack will get null**" | ⚠️ | A weakly reachable object (no strong path left) is cleared at the next GC. But the **variable is not nulled**: it still points to the `WeakReference` object, and **`weak.get()`** returns `null` (verified). ➕ Uses: `WeakHashMap`, canonicalising maps, listener registries. |
| 9.17 | Soft reference: "a type of weak reference", cleared only when the heap is short of space | ✅ / 🔶 | It's a separate, stronger reachability level. It is guaranteed to be cleared **before** an `OutOfMemoryError`, and survives GCs when memory is plentiful (verified). Soft-reference caches are unpredictable; prefer bounded caches (e.g. Caffeine). ➕ **Phantom references** + `ReferenceQueue` + `Cleaner` (Java 9); `finalize()` is deprecated for removal (JEP 421, Java 18). |
| 9.18 | `obj1 = obj2;` makes the old object eligible for GC | ✅ | If nothing else references it. ➕ Other ways: set to `null`, scope ends, "island of isolation". |
| 9.19 | Heap = Young (Eden, S0, S1) + Old; non-heap Metaspace | ✅ / 🔶 | True for the classic Serial/Parallel layout. **G1 (the default)** splits the heap into equal-sized **regions** whose roles (eden/survivor/old/humongous) change dynamically; generational ZGC is also region-based. |
| 9.20 | "Before Java 7 it is called PermGen" | ✏️ | PermGen existed **up to and including Java 7** and was replaced by Metaspace in **Java 8** (the note is correct on p10: "prior to Java 8"). |
| 9.21 | New objects go to Eden | ✅ | 🔶 Very large objects can go straight to the old generation (G1: humongous regions). |
| 9.22 | Minor-GC walkthrough: mark the unreferenced objects, "delete" them, move survivors to S0/S1 and increment age | ✅ / 🔶 | Great walkthrough. Two precise fixes: (1) the **mark** phase marks **live (reachable)** objects starting from GC roots, not the dead ones; (2) young collections are **copying (evacuating)**: survivors are copied out and Eden plus the "from" survivor space are reclaimed wholesale. Dead objects are never individually deleted, which is why young-GC cost depends on the number of **live** objects, not the amount of garbage. |
| 9.23 | Threshold age example (3) → promotion to old gen | ✅ | ➕ Default `MaxTenuringThreshold = 15` (verified). The age lives in 4 bits of the object header, and the JVM adapts the threshold dynamically. |
| 9.24 | Major GC in old gen runs less often; old-gen objects are "big objects used frequently with many references" | ✅ / 🔶 | Old-gen objects are **long-lived** (they survived N young GCs), not necessarily big or frequently used. ➕ Minor vs major vs full GC terminology. |
| 9.25 | Metaspace stores "class variables, class metadata, constants" | 🔶 | Metaspace stores class **metadata** (class structures, method bytecode, run-time constant pool…). **Static variables live on the heap** with the `java.lang.Class` object (since JDK 7/8), and string literals/interned strings live on the heap (since JDK 7). |
| 9.26 | PermGen was fixed-size (OOM when full); Metaspace is outside the heap and expandable | ✅ | Verified `MaxMetaspaceSize` is unlimited by default. ➕ It can still run out (class-loader leaks) → cap with `-XX:MaxMetaspaceSize`. |
| 9.27 | Mark & Sweep; Mark-Sweep-Compact (with diagram) | ✅ | ➕ Mark-Copy (young gen), the **generational hypothesis** ("most objects die young"), fragmentation, concurrent marking basics. |
| 9.28 | Serial GC: one thread for minor + major; application pauses | ✅ | |
| 9.29 | Parallel GC: multiple GC threads → shorter pauses | ✅ | Still stop-the-world; it's the **throughput** collector. |
| 9.30 | CMS: tries to run concurrently, no compaction | ✅ (historical) | ⚠️ Removed in JDK 14 (see 9.10). |
| 9.31 | G1: "better version of CMS, tries not to pause, supports compaction" | 🔶 | Region-based, generational, **concurrent marking + short stop-the-world evacuation pauses** aiming at a pause-time goal (default 200 ms), compacting incrementally. **Default since JDK 9.** Verified on JDK 25: G1 on this 4-CPU machine, but **Serial** when the JVM sees 1 CPU. **JDK 27 (JEP 523) makes G1 the default in all environments.** |
| 9.32 | "Currently Java 8 is using Parallel GC" | ✅ (for Java 8) | Context: Java 8 dates from 2014. Today's default is G1. |
| 9.33 | "In latest Java versions using CMS & G1, pause time is minimal, thus **increasing throughput and decreasing latency**" | ⚠️ | CMS no longer exists. Throughput and latency are a **trade-off**: low-pause collectors (ZGC, Shenandoah) usually give up some throughput, and Parallel GC still leads on raw throughput. Choose the collector by SLA (latency vs throughput vs footprint). |
| 9.34 | — | ➕ | Missing and related: GC roots & reachability; memory **leaks** in Java (static collections, caches, listeners, `ThreadLocal`, class-loader leaks); OOM types; heap sizing (`-Xms/-Xmx`, container awareness, `MaxRAMPercentage`); GC logging (`-Xlog:gc*`); tools (`jcmd`, `jstat`, JFR/JMC, heap dumps + Eclipse MAT, VisualVM); escape analysis; TLABs; compressed oops & **compact object headers** (default in JDK 27). |

## Note 12–13 — POJO, Enum, Final, Singleton, Immutable & Wrapper classes (15 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 12.1 | POJO: getters/setters, public class, public default constructor, **no annotations**, **must not extend or implement anything** | 🔶 | "POJO" (Fowler, Parsons & MacKenzie, 2000) just means an ordinary object that isn't tied to a framework's base classes or interfaces. Getters/setters + public no-arg constructor are the **JavaBeans** conventions. "No annotations" and "no interfaces" are stricter than common usage: annotated JPA entities are routinely called POJOs, and implementing `Serializable`/`Comparable` doesn't disqualify a class. The lesson will compare **POJO vs JavaBean vs DTO vs Entity vs Value Object vs record**. |
| 12.2 | Example `Student { int name; private int rollNumber; protected String address; … }` | ✏️ / 🔶 | `int name` should be `String name`. Fields are package-private/protected, so they aren't encapsulated; a JavaBean uses `private` fields. |
| 12.3 | Map incoming requests to a POJO so future changes are localised | ✅ | That's a **DTO** at a system boundary. ➕ Modern Java: `record`s (Java 16) as immutable DTOs; validate at the boundary. |
| 12.4 | Enum: constants that can't change; implicitly `static final`; can't extend any class (extends `java.lang.Enum`); can implement interfaces; can have fields/constructors/methods; can't be instantiated (constructor always private, even if you write none); no class can extend an enum; can have abstract methods implemented by every constant | ✅ | All verified: a `public` enum constructor fails with "modifier public not allowed here". 🔶 An enum is implicitly `final`, or implicitly **`sealed`** when constants have bodies (verified on JDK 25). |
| 12.5 | "MONDAY will have 0, TUESDAY **2**"; ordinals are assigned "only if we don't define custom values" | ✏️ / ⚠️ | TUESDAY is **1**. The **ordinal is always the declaration position**; custom field values don't change it (verified: `MONDAY(101).ordinal() == 0`). ➕ Never persist or depend on `ordinal()` (reordering constants silently breaks data); store `name()` or an explicit code. |
| 12.6 | `values()` returns an array of all constants | ✅ | ➕ It returns a **new clone each call** (verified), so cache it in hot loops. |
| 12.7 | `valueOf("FRIDAY")` "iterates over all constants" and returns the exact match | 🔶 | It uses an internal name → constant map. It is exact and **case-sensitive**, throws `IllegalArgumentException` for unknown names and `NullPointerException` for `null` (both verified). |
| 12.8 | `name()` returns the constant's name | ✅ | ➕ vs `toString()`, which can be overridden for display. |
| 12.9 | Enum with custom values: each constant is an object with the fields; the parameterised constructor runs per constant | ✅ | ⚠️ The example adds **setters** (`setValue`, `setComment`). Enum constants are global singletons, so a setter creates **global mutable state** (verified: a change is visible everywhere) and a thread-safety problem. Enum fields should be `final`. |
| 12.10 | "A method for the whole enum must be `static`, otherwise it applies to all constants" | 🔶 | Instance methods run on a specific constant; `static` is for enum-wide operations such as lookups. The `getEnumFromValue` example scans linearly and returns `null`. Better: a `static final Map` built once, returning `Optional` or throwing. |
| 12.11 | Constant-specific method override | ✅ | Verified: such a constant's class is an anonymous subclass (`getClass() != Op.class`); use `getDeclaringClass()` when you need the enum type. |
| 12.12 | Enum with an abstract method implemented by every constant | ✅ | |
| 12.13 | Enum implementing an interface (`toLowerCase()` example) | ✅ | ➕ Use `toLowerCase(Locale.ROOT)` for locale-independent results (the Turkish-locale "I" bug). |
| 12.14 | Enum vs `static final int` constants: readability + control over accepted values | ✅ | ➕ Also: type safety and namespacing, exhaustive `switch` expressions (14+) and pattern `switch` (21), `EnumSet`/`EnumMap` performance, meaningful `toString`, safe serialization, and the enum singleton. |
| 12.15 | Final class cannot be inherited (IDE error shown) | ✅ | ➕ Examples: `String`, wrappers, records (implicitly final). **Sealed** classes (17) are the middle ground. A final class is **not** automatically immutable. |
| 12.16 | Singleton goal; "e.g. a DB connection should be a singleton" | 🔶 | A single shared JDBC `Connection` isn't thread-safe and becomes a bottleneck. Real systems use a **connection pool** (e.g. HikariCP) whose `DataSource` is typically one instance managed by a DI container. Better textbook examples: a config registry, `Runtime.getRuntime()`. |
| 12.17 | Six approaches: eager, lazy, synchronized, double-checked locking (+ volatile), Bill Pugh, enum | ✅ | |
| 12.18 | Eager initialisation: object created "**as soon as the program starts**" | ⚠️ | It's created when the class is **initialised**, i.e. on its **first active use**, not at program start (verified: `main` runs first, and the constructor runs on the first static call). HotSpot loads and initialises classes lazily. |
| 12.19 | Lazy initialisation: race lets two threads create two objects | ✅ | |
| 12.20 | `synchronized` method fixes it, but "is very very slow and generally not used" | 🔶 | Uncontended locking is cheap on modern JVMs. The real cost is that **every** call takes the lock, so the method becomes a contention point under load. |
| 12.21 | Double-checked locking code (with `volatile`); "lock/unlock happens once only" | ✅ / 🔶 | The lock is taken only while the instance is still `null` (the first few calls); after that, the fast path is a single volatile read. |
| 12.22 | Why DCL needs `volatile`: "object created in core-1's L1 cache, not yet synced to memory, so core-2 creates a second object"; "volatile means the object is created in memory instead of cache" | ⚠️ | **Not the real mechanism.** Inside the `synchronized` block, the monitor's *happens-before* guarantee means the second thread *will* see the first thread's write, so no second object is created. The actual bug without `volatile` is **unsafe publication through reordering**: the write of the reference can become visible *before* the constructor's field writes, so a thread on the **unsynchronised first check** may get a non-null reference to a **partially constructed** object. `volatile` (Java Memory Model, Java 5 / JSR-133) forbids that reordering and creates happens-before between the write and later reads. CPU caches are coherent in hardware; `volatile` is about **JMM visibility and ordering**, not "bypassing the cache". |
| 12.23 | "DCL is used majorly" | 🔶 | Today the **holder idiom** or **enum** are preferred; DCL mostly appears in interviews and legacy code. |
| 12.24 | Bill Pugh (holder) solution: nested class isn't loaded at startup, only when referred to | ✅ | Verified: using the outer class doesn't create the instance; `getInstance()` does. ➕ Thread safety comes free from the JLS class-initialisation lock (§12.4.2), with no synchronisation cost per call. |
| 12.25 | Enum singleton: constructors private, one object per JVM | ✅ / 🔶 | More precisely, one per **class loader**. ➕ Its real advantage: it's safe against **reflection** (verified: "Cannot reflectively create enum objects") and **serialization** out of the box. Limits: it can't extend a class, and it's eager. |
| 12.26 | — | ➕ | Breaking classic singletons: reflection (verified: two instances), serialization (needs `readResolve`), cloning. DI "singleton scope" is per container. Senior lens: singletons are global state, which hurts testability; prefer dependency injection. |
| 12.27 | Immutable class rules: final class, private (final) fields, set once in the constructor, no setters, getters return copies; e.g. String, wrappers | ✅ | |
| 12.28 | `MyImmutableClass` example with `List<Object> petNameList`, where the getter returns `new ArrayList<>(petNameList)`, "making it truly final" | ⚠️ | **Not actually immutable:** the constructor stores the caller's list directly, so the caller can still mutate it (verified: prints `[sj, pj, MUTATED-FROM-OUTSIDE]`). Fix: defensive copy **in the constructor** (`List.copyOf`, Java 10) and return an unmodifiable list. Elements must be immutable too (`List<Object>` could hold mutable objects). A getter that returns a fresh `ArrayList` lets `add()` silently "succeed" on a throwaway copy; an unmodifiable list **fails fast** with `UnsupportedOperationException` (verified). Terminology: "truly *immutable*", not "final". |
| 12.29 | — | ➕ | Records (16) as concise immutable carriers (still only **shallowly** immutable, so copy in a compact constructor); why immutability matters (thread safety, safe sharing and caching, hash keys); builders for many fields; "wither"-style copies. |
| 12.30 | Wrapper class → see the Java Variables note | ✅ | Covered by audit items 6.9–6.12. |

## Note 14–15 — Interface in Depth (2 tall pages, typed notes)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 14.1 | An interface lets two systems interact without knowing each other's details; it achieves abstraction | ✅ | |
| 14.2 | Declaration = modifiers, `interface` keyword, name, comma-separated parent interfaces, body | ✅ | |
| 14.3 | "Only `public` and default modifiers are allowed (`protected` and `private` are not)" | ✅ / 🔶 | True for **top-level** interfaces (verified: `protected interface` → error). Interfaces **nested in a class** may be `private`/`protected` (verified). ➕ `sealed`/`non-sealed` (17) are also allowed. |
| 14.4 | "Comma separated list of parent interfaces (**it can extend from Class**)" | ⚠️ | An interface **cannot** extend a class (verified: "interface expected here"). It can only extend interfaces. |
| 14.5 | Why interfaces: "full abstraction: WHAT a class must do, not HOW" | 🔶 | Since Java 8, interfaces can hold implementation (`default`, `static`, and from Java 9 `private` methods), so "100% abstraction" is historical. They still define the contract. |
| 14.6 | Polymorphism: an interface as a data type; the implementation is chosen at runtime | ✅ | |
| 14.7 | Multiple inheritance only via interfaces; diamond problem with classes | ✅ | |
| 14.8 | Interface methods: "all implicitly public"; cannot be `final` | ✅ / 🔶 | `abstract`/`default`/`static` methods are implicitly `public` unless declared `private` (Java 9+). `final` is rejected (verified). |
| 14.9 | Fields implicitly `public static final` (constants); can't be `private`/`protected` | ✅ | Verified with reflection ("public static final") and by compilation error. ➕ The "constant interface" anti-pattern (Effective Java, Item 22). |
| 14.10 | Implementation rules: can't reduce access; concrete class must override **all** methods; abstract classes aren't forced to; a class can implement several interfaces | ✅ / 🔶 | A concrete class must implement all **abstract** methods; `default` methods are optional. Reduced access verified: "fly() in Eagle cannot implement fly() in Bird". |
| 14.11 | Abstract class implementing an interface (Eagle/WhiteEagle example) | ✅ | |
| 14.12 | Nested interfaces: in an interface → must be public; in a class → any access; implementing the outer doesn't require implementing the inner | ✅ | ➕ Nested interfaces are implicitly **`static`**; real-world example: `Map.Entry`. ✏️ The sentence "And nested interface…" is unfinished. |
| 14.13 | Abstract class vs interface table (10 rows) | ✅ mostly | ✏️ Row 3 says `private` methods arrived "from Java 8"; it was **Java 9** (row 6 has it right). ⚠️ Row 8 says an interface "cannot provide implementation of any other interface": a sub-interface **can** implement a super-interface's abstract method with a `default` method (verified). ➕ The deciding factors: abstract classes hold **instance state**, constructors and non-public members; interfaces define capabilities and allow multiple inheritance of type. |
| 14.14 | Default methods (Java 8) exist to evolve legacy interfaces without breaking implementations, e.g. `Collection.stream()` | ✅ | |
| 14.15 | Two interfaces with the same default method → the class must override it | ✅ | Verified: "types A and B are incompatible" until you override, then `Bird.super.canBreathe()` works (verified). ➕ Full resolution rules: class wins, then the more specific interface wins. |
| 14.16 | Extending an interface that has a default method: inherit it, re-declare it abstract, or override it (calling `LivingThing.super.canBreathe()`) | ✅ | Excellent, complete coverage. |
| 14.17 | Static methods (Java 8): implemented in the interface, can't be overridden, called via the interface name, public by default | ✅ / 🔶 | More precisely, static interface methods are **not inherited at all**: `Eagle.canBreathe()` and `this.canBreathe()` don't compile (verified: "cannot find symbol"). A same-named method in the class is unrelated, and `@Override` on it is an error (as the note says). |
| 14.18 | Private and private-static methods (Java 9): share code between defaults; can't be abstract; "from a static method you can call only private static methods" | ✅ / 🔶 | A static method can call **any static** interface method (public or private) but never an instance one (verified: "non-static method helper() cannot be referenced from a static context"). ✏️ The sample declares `void canFly();` twice, which wouldn't compile (it's illustrating an equivalence). |
| 14.19 | — | ➕ | Missing and related: **sealed interfaces** (17) + pattern matching; marker interfaces (`Serializable`, `Cloneable`) vs annotations; everyday interfaces (`Comparable`, `Comparator`, `Iterable`, `AutoCloseable`); interface evolution strategies. |

## Note 16 — Functional Interface & Lambda Expression (1 tall page, typed notes)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 16.1 | Functional interface = exactly 1 abstract method (SAM); "`@FunctionalInterface` **keyword**" is optional | ✅ / ✏️ | It's an **annotation**, not a keyword. It's optional, but when present the compiler enforces the rule (verified: "Unexpected @FunctionalInterface annotation" with 2 abstract methods). |
| 16.2 | A functional interface may also have default methods, static methods, and methods from `Object` (e.g. `toString`) | ✅ | Verified: redeclaring `equals(Object)` and `toString()` keeps it functional, because `Object`'s public methods don't count. |
| 16.3 | A class implementing an interface that declares `String toString()` needn't implement it | ✅ | It's inherited from `Object`. |
| 16.4 | A lambda is a way to implement a functional interface | ✅ / 🔶 | Precisely: a lambda is an expression whose type comes from its **target** functional interface (target typing). It's **not** an anonymous inner class: it's compiled to `invokedynamic` + `LambdaMetafactory` and becomes a **hidden class** at runtime (verified `isHidden() = true`). **`this` in a lambda is the enclosing instance**, while in an anonymous class it's the anonymous object (both verified). |
| 16.5 | Three ways to implement a functional interface: a class, an anonymous class, a lambda | ✅ | |
| 16.6 | `Consumer`, `Supplier`, `Function`, `Predicate` definitions + examples (`java.util.function`) | ✅ | ✏️ The Supplier example is named `isEvenNumber` but returns a `String`. 🔶 The Predicate body `if (…) return true; else return false;` simplifies to `val -> val % 2 == 0`. |
| 16.7 | Functional interface extending other interfaces: (1) extends a non-FI with an abstract method → error; OK if the parent method is `default`; (2) a non-FI extending an FI is fine; (3) FI extends FI with a *different* abstract method → error, with the *same* signature → OK | ✅ | All verified on JDK 25. |
| 16.8 | — | ➕ | Missing and related: lambda syntax forms (typed/untyped params, `var` (11), unnamed `_` (22), expression vs block body); the **effectively final** capture rule (verified error); scope/shadowing rules; **method references** (4 kinds); the rest of `java.util.function` (`Bi*`, `UnaryOperator`, `BinaryOperator`, primitive specialisations that avoid boxing); composition (`andThen`, `compose`, `and`, `or`, `negate`, `identity`); `Runnable`/`Callable`/`Comparator` as FIs; checked exceptions inside lambdas; debugging/stack traces; serializable lambdas (caution). Streams are the natural next topic (awaiting notes). |

## Executed verification: batch 2 (JDK 25.0.4.1, 2026-09-24)

Runtime checks (`source-notes/verification/batch2/Verify2.java`):

```
java 25.0.4.1, GCs = [G1 Young Generation, G1 Concurrent GC, G1 Old Generation]
[enum] MONDAY(101) ordinal = 0, value = 101
[enum] valueOf("monday") -> IllegalArgumentException
[enum] valueOf(null) -> NullPointerException
[enum] values() returns a fresh array each call: true
[enum] plain enum class is final: true; enum with constant body is final: false, sealed: true; PLUS.getClass()==Op.class: false, getDeclaringClass()==Op.class: true
[enum] mutable enum state is global: Mutable.A.comment = changed by someone else
[ref] after GC: weak.get() = null, but the variable 'weak' itself is null? false; soft.get() still present (plenty of heap) = true
[immutable] notes version after caller mutates its own list: [sj, pj, MUTATED-FROM-OUTSIDE]  <-- not immutable!
[immutable] fixed version rejects add() with UnsupportedOperationException
[singleton] main started (EagerSingleton not yet initialised)
[singleton] EagerSingleton constructor runs            <-- on first use, not at program start
[singleton] reflection breaks classic singleton: two instances? true
[singleton] enum singleton resists reflection: Cannot reflectively create enum objects
[singleton] holder idiom: outer class used, instance created yet? false
[interface] field MAX_HEIGHT_IN_FEET modifiers = public static final
[interface] diamond resolved via Bird.super: true
[interface] default method can implement a super-interface's abstract method: yes
[lambda] 'this' inside lambda is the enclosing object: true
[lambda] 'this' inside anonymous class is the anonymous object: true (Verify2$1)
[lambda] lambda class is hidden: true, name like Verify2$$Lambda/0x...
[lambda] FI that also redeclares equals(Object)/toString() is still functional: true
```

Compile checks (`source-notes/verification/batch2/compile-checks/`, run with `run.sh`):

```
c01_iface_extends_class                  interface expected here
c02_static_iface_via_class               cannot find symbol
c03_static_iface_via_instance            cannot find symbol
c04_enum_public_ctor                     modifier public not allowed here
c05_default_diamond_no_override          types A and B are incompatible;
c06_fi_two_abstract                      Unexpected @FunctionalInterface annotation
c07_fi_extends_fi_new_abstract           Unexpected @FunctionalInterface annotation
c08_weaker_access                        fly() in Eagle cannot implement fly() in Bird
c09_final_iface_method                   modifier final not allowed here
c10_private_iface_field                  modifier private not allowed here
c11_lambda_non_effectively_final         local variables referenced from a lambda expression must be final or effectively final
c12_iface_protected_toplevel             modifier protected not allowed here
c13_static_calls_private_instance        non-static method helper() cannot be referenced from a static context
k01_fi_same_signature_ok                 COMPILES OK
k02_nested_iface_in_class_protected_ok   COMPILES OK
k03_static_iface_via_iface_name_ok       COMPILES OK
```

JVM / GC checks (JDK 25.0.4.1, 4 CPUs, 16 GB):

```
default GC                                  -XX:+UseG1GC
default GC with -XX:ActiveProcessorCount=1  -XX:+UseSerialGC      (JDK 27 / JEP 523 changes this to G1)
-XX:+UseConcMarkSweepGC                     Unrecognized VM option (CMS removed in JDK 14)
MaxTenuringThreshold = 15 · ThreadStackSize = 1024 KB · UseCompactObjectHeaders = false (default true in JDK 27)
MaxMetaspaceSize = unlimited
System.gc() → 1 collection; with -XX:+DisableExplicitGC → 0 collections
-XX:+UseZGC -XX:-ZGenerational             "Ignoring option ZGenerational; support was removed in 24.0"
-XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational   runs without experimental unlock on JDK 25
```

JVM checks script: `source-notes/verification/batch2/jvm-checks.sh`.

---

# Batch 3 (received 2026-09-24)

Notes 17, 18, 19 and 21 are typed "Concept && Coding" video notes exported as tall images with no text layer. Faithful
transcripts are in `source-notes/transcripts/`. Note 20 is handwritten with IDE screenshots.

## Note 17 — Reflection (1 tall page)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 17.1 | Reflection examines classes, methods, fields and interfaces at runtime, "and can also change the behaviour of the class" | ✅ / 🔶 | Reflection can **inspect** structure, **read/write** fields, **invoke** methods and **create** instances. It cannot change a loaded class's code; that needs bytecode instrumentation (`java.lang.instrument`, agents, ByteBuddy). Dynamic proxies (`java.lang.reflect.Proxy`) create **new** classes (verified). |
| 17.2 | An instance of `Class` represents a class at runtime; the JVM creates one `Class` object per loaded class holding its metadata | ✅ / 🔶 | One per class **per class loader**. `Class` objects also exist for interfaces, enums, records, arrays and even primitives and `void` (`int.class`, `void.class`, `int[].class` = `[I`, verified). |
| 17.3 | 3 ways: `Class.forName("Bird")`, `Bird.class`, `obj.getClass()` | ✅ / ⚠️ | All three return the **same** `Class` object (verified). ⚠️ `forName` needs the **fully qualified binary name** (`"com.app.Bird"`, nested classes use `$`): `forName("Eagle")` → `ClassNotFoundException` unless the class is in the default package (verified). ➕ `forName` **initialises** the class (runs static blocks); `.class` does not (verified). Use `Class<?>` instead of the raw `Class` type. |
| 17.4 | "Methods available in Class object, all are get, not set methods" | 🔶 | The point is right: you can't restructure a class through `Class`. But it has non-getters too: `isInstance`, `cast`, `asSubclass`, `isRecord`, `isSealed`, `getPermittedSubclasses` (17), `getRecordComponents` (16) (last two verified). |
| 17.5 | `getMethods()` = all public methods; `getDeclaredMethods()` = public + private methods of this class only | ✅ / 🔶 | `getMethods()` includes **inherited** public methods (e.g. 9 from `Object`: 10 in total for `Eagle`, verified). `getDeclaredMethods()` excludes inherited ones. ➕ The returned **order is unspecified**, so never depend on it. Same pattern for `getFields()` / `getDeclaredFields()` (verified). |
| 17.6 | Invoking a method: `eagleClass.newInstance()` then `getMethod("fly", int.class, boolean.class, String.class).invoke(obj, 1, true, "hello")` | ✅ / ⚠️ | Output verified. ⚠️ `Class.newInstance()` has been **deprecated since Java 9** (verified `@Deprecated`): it can rethrow the constructor's checked exceptions undeclared. Use `getDeclaredConstructor().newInstance()`. ➕ Exceptions thrown **inside** the invoked method arrive wrapped in `InvocationTargetException` (verified); static methods use `invoke(null, …)`. |
| 17.7 | Setting a public field with `field.set(obj, value)` | ✅ | |
| 17.8 | Setting a private field without `setAccessible` → `IllegalAccessException` ("Class Main can not access a member … private") | ✅ | Modern message: `class Verify3 cannot access a member of class … with modifiers "private"`. |
| 17.9 | `setAccessible(true)` then `set` → private field changed | ✅ / ⚠️ | Works for **your own** classes (verified). ⚠️ Limits in modern Java: (1) **strong encapsulation (JDK 16/17, JEP 396/403)**: `setAccessible` on JDK internals, e.g. `String.value`, throws `InaccessibleObjectException` (verified) unless the module opens the package (`--add-opens`); (2) **`static final` fields can't be set** even with `setAccessible` (verified); (3) **record fields can't be set** (verified); (4) JDK 26's **JEP 500** starts warning when reflection mutates `final` fields ("make final mean final"). |
| 17.10 | Constructor reflection: `getDeclaredConstructors()` + `setAccessible(true)` + `newInstance()` creates an object through a **private** constructor | ✅ | Verified. ➕ This is exactly how reflection **breaks a classic singleton** (links to audit 12.26); enum singletons are protected. |
| 17.11 | — | ➕ | Missing and related: where reflection is used in practice (Spring DI, Jackson, JUnit, Hibernate); **reading annotations** (the bridge to note 18); **dynamic proxies** (AOP, mocking; verified); `MethodHandle`/`VarHandle` as the modern, faster, access-checked-once alternative (core reflection itself was reimplemented on method handles in **JDK 18, JEP 416**); performance & JIT cost; security/encapsulation and `--add-opens`; `Array.newInstance`; generics erasure via `getGenericType`; parameter names need `javac -parameters`. |

## Note 18 — Annotations (1 tall page)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 18.1 | An annotation adds **metadata** to code; its "usage is OPTIONAL" | ✅ / 🔶 | Annotations don't change what code does by themselves; a **tool** has to read them. Consumers are the compiler (`@Override`, `@FunctionalInterface`), **annotation processors** at compile time (Lombok, MapStruct, Dagger), bytecode tools, and frameworks at runtime via reflection. "Optional" means passive, not unimportant: frameworks depend on them. |
| 18.2 | Metadata can be used at runtime, read via reflection | 🔶 | Only annotations with `@Retention(RUNTIME)` are visible at runtime (see 18.9). |
| 18.3 | Types diagram: meta-annotations (`@Target`, `@Retention`, `@Documented`, `@Inherited`, `@Repeatable` (Java 8)); on code (`@Deprecated`, `@Override`, `@SuppressWarnings`, `@FunctionalInterface`, `@SafeVarargs`); custom | ✅ | ✏️ Spelling: `@SuppressWarnings` (double "p"). ➕ `@Native` also exists (rare). |
| 18.4 | `@Deprecated`: compile-time warning; use the new alternative; targets: constructor, field, local variable, method, package, parameter, type | ✅ | Verified target list on JDK 25 also includes **MODULE** (Java 9). ➕ Java 9 added `@Deprecated(since = "…", forRemoval = true)`, which gives a stronger "removal" warning. Pair it with the `@deprecated` Javadoc tag that names the replacement. Retention RUNTIME (verified). |
| 18.5 | `@Override`: checked at compile time; error if it doesn't match a parent method; methods only | ✅ | Verified: "method does not override or implement a method from a supertype". It also works for methods **implementing interface** methods (Java 6+). Retention SOURCE, target METHOD (verified). |
| 18.6 | `@SuppressWarnings`: ignore compile-time warnings; "use safely, could lead to runtime exceptions if a valid warning is ignored"; targets: field, method, parameter, constructor, local variable, type | ✅ / 🔶 | Good warning. 🔶 Recent JDKs **removed `@Target`** from `@SuppressWarnings` (JDK-8280745), so it's allowed in **all declaration contexts**, including `package-info.java` (verified on JDK 25). ➕ javac's keys are its `-Xlint` categories (`unchecked`, `deprecation`, `removal`, `rawtypes`, `serial`, …). Keys such as `"unused"` and `"all"` in the screenshots are **IDE** inspections (IntelliJ/Eclipse); javac ignores unknown keys. Keep the scope as narrow as possible (one local variable, not the whole class). |
| 18.7 | `@FunctionalInterface`: at most one abstract method; compile error otherwise; "can be used over: Type (class, interface or enum)" | ✅ / 🔶 | `@Target(TYPE)` is syntactically broad, but the compiler **rejects it on anything that isn't a functional interface**, e.g. on a class: "Unexpected @FunctionalInterface annotation" (verified). |
| 18.8 | `@SafeVarargs`: suppresses the heap-pollution warning; on varargs methods/constructors; method must be static or final; private allowed since Java 9 | ✅ | All verified: a non-final, non-private instance method gives "Invalid SafeVarargs annotation"; `private` compiles. ⚠️ It's a **promise**, not a fix: the notes' own example *breaks* the promise, and the pollution surfaces later as `ClassCastException` (verified: `class java.lang.String cannot be cast to class java.lang.Integer`). Only annotate methods that don't store into or expose the varargs array. |
| 18.9 | Heap pollution = "object of one type storing the reference of another type" | 🔶 | Precisely: a variable of a **parameterized type** (e.g. `List<Integer>`) refers to an object that isn't of that type (a `List<String>`), which is possible because of type **erasure**. Detected late, at the point of use. |
| 18.10 | `@Target` + `ElementType` list incl. `TYPE_PARAMETER`, `TYPE_USE` (Java 8) | ✅ | ➕ Also `MODULE` (9) and `RECORD_COMPONENT` (16). Without `@Target`, an annotation is applicable in all **declaration** contexts. |
| 18.11 | `@Retention`: SOURCE (discarded by compiler), CLASS (in `.class`, ignored by JVM at runtime), RUNTIME (reflectively available); examples show `@Override` absent from the decompiled class and a custom annotation without RUNTIME read as `null` | ✅ | ➕ The key fact behind example (4): **the default retention is CLASS** (verified: `null` at runtime). Verified retentions: `@Override`/`@SuppressWarnings` SOURCE; `@Deprecated`/`@FunctionalInterface`/`@SafeVarargs` RUNTIME. |
| 18.12 | `@Documented`: annotation appears in generated Javadoc | ✅ | |
| 18.13 | `@Inherited`: a class annotation becomes visible on subclasses; no effect on non-class targets | ✅ | Verified. ➕ It is **not** inherited from **interfaces** a class implements (verified `null`), and never applies to methods or fields. |
| 18.14 | `@Repeatable` (Java 8): container annotation `Categories { Category[] value(); }`; `getAnnotationsByType` → Bird, LivingThing, carnivorous | ✅ | Verified. Without `@Repeatable` → "Category is not a repeatable annotation interface" (verified). ➕ The compiler stores repeats **inside the container**, so `getAnnotation(Category.class)` returns `null` while `getAnnotation(Categories.class)` works (verified): use `getAnnotationsByType`. |
| 18.15 | Custom annotations: `@interface`; elements have no params/body; return types limited to primitive, `Class`, `String`, enum, annotation, arrays thereof; `default` values; "default can't be null" | ✅ | Verified: `default null` → "element value must be a constant expression"; an `Integer` element → "invalid type for annotation interface element". ➕ An element named `value` allows the shorthand `@A("x")`. Practice project: a mini validation framework (`@NotBlank`, `@Range`) processed via reflection, plus a brief intro to annotation processors. |

## Note 19 — Exception Handling (2 tall pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 19.1 | An exception is an event during execution that disrupts normal flow; creates an exception object (type, message, stack trace) | ✅ | |
| 19.2 | "The runtime system uses this exception object and finds the **class** which can handle it" | 🔶 | It searches the **call stack**, frame by frame, for a matching **handler** (a `catch` clause whose type matches); see the notes' own diagram. |
| 19.3 | If nobody handles it, "the runtime system terminates the program abruptly and prints the stack trace" | 🔶 | The **thread** dies; its uncaught-exception handler prints the trace. The JVM exits only when no non-daemon threads remain (verified: a worker thread died while `main` continued). |
| 19.4 | Hierarchy: `Object → Throwable → Error / Exception`; runtime (unchecked) vs checked with examples | ✅ / ✏️ | Correct structure. ✏️ Names: `IndexOutOfBoundsException`, `ArrayIndexOutOfBoundsException`, `StringIndexOutOfBoundsException` (with "s"). ➕ Rule: **checked = `Throwable` and subclasses except `RuntimeException`, `Error` and their subclasses**. `Error` is unchecked too (verified) and normally shouldn't be caught. More everyday types: `IllegalStateException`, `UnsupportedOperationException`, `ConcurrentModificationException`, `UncheckedIOException`, `DateTimeException`. |
| 19.5 | OOM example `new String[900000000*900000000*900000000]` → `OutOfMemoryError: Java heap space` | 🔶 | The output is reproducible (verified), but for a hidden reason: the product **overflows `int`** to 2,030,043,136, which happens to be positive and too big for the heap. Different numbers could give `NegativeArraySizeException`. Better demo: `new long[Integer.MAX_VALUE - 8]`, or growing a list. |
| 19.6 | Unchecked = occur at runtime and the compiler doesn't force handling; checked = "compile-time exceptions" verified by the compiler | ⚠️ | "Compile-time exception" is a misnomer: **all exceptions are thrown at runtime**. The difference is only whether the **compiler checks** that checked ones are caught or declared (verified: "unreported exception ClassNotFoundException; must be caught or declared to be thrown"). |
| 19.7 | Example messages (CCE, AIOOBE "3", SIOOBE "String index out of range: 5", NPE without a message, NFE) | 🔶 | Those are Java 8-era messages. On JDK 25 (verified): CCE `class java.lang.Integer cannot be cast to class java.lang.String (… module java.base …)`; AIOOBE `Index 3 out of bounds for length 2`; SIOOBE `Index 5 out of bounds for length 5`; NPE is now **helpful** (JEP 358, default since JDK 15): `Cannot invoke "String.charAt(int)" because "val" is null` (the variable name appears when compiled with `-g`, else `"<local1>"`, both verified). |
| 19.8 | `throws` tells callers the method *might* throw; callers must handle or declare | ✅ | ➕ Overriding rule: an override can't declare **broader** checked exceptions (links to 1.19). |
| 19.9 | try must be followed by catch or finally | ✅ / ➕ | ➕ **try-with-resources** (Java 7) can stand alone (verified). |
| 19.10 | "A catch block can only catch exceptions which can be thrown by the try block" | 🔶 | True only for **checked** exceptions ("exception FileNotFoundException is never thrown in body of corresponding try statement", verified). Unchecked exceptions, `Exception` and `Throwable` can always be caught (verified). |
| 19.11 | Catch subclass before superclass; the reverse → "already caught" | ✅ | Verified: "exception ClassNotFoundException has already been caught". |
| 19.12 | Multi-catch `catch (A \| B e)` | ✅ | ➕ Alternatives can't be related by subclassing, and the parameter is implicitly **final** (both verified). |
| 19.13 | finally always runs after return in try or catch; at most one finally; used for cleanup/logs | ✅ | ➕ Gotchas (all verified): `return` in finally **overrides** the try's return; `return` in finally **swallows** an exception; changing a local in finally doesn't change an already-evaluated return value. Prefer try-with-resources for cleanup. |
| 19.14 | "If JVM issues like **out of memory**, system shutdown or a forcefully killed process occur, finally is not executed" | ⚠️ | `OutOfMemoryError` is an ordinary `Throwable`: **finally blocks do run** while it propagates (verified). Finally is skipped by `System.exit()`/`Runtime.halt()`, JVM crash, `kill -9`/power loss, a try that never ends (infinite loop, deadlock), and daemon threads at JVM shutdown. |
| 19.15 | `throw` creates or re-throws an exception | ✅ | ➕ **Exception chaining**: `new X("msg", cause)` keeps the root cause (verified). Precise rethrow (Java 7). `throw null` → NPE (verified). |
| 19.16 | Custom exception `MyCustomException extends Exception` with message constructor | ✅ | ➕ Checked vs unchecked custom exceptions (when to extend `RuntimeException`); always offer a `(message, cause)` constructor; name ends in `Exception`; carry domain data (error code, entity id); `serialVersionUID`. |
| 19.17 | Why handle: clean separation, recovery, more debug info, security (hide sensitive information) | ✅ | Good list. ➕ Senior best practices: catch specific types; don't swallow; log **or** rethrow (not both); translate at layer boundaries; never expose stack traces to clients; handle `InterruptedException` by restoring the interrupt flag. |
| 19.18 | "Exception handling is expensive if the stack trace is huge and it's not handled / handled at a parent" | 🔶 | The main cost is **creating** the exception: `fillInStackTrace()` walks the stack, so cost grows with stack depth. It doesn't depend much on where it's caught. Indicative measurement: 100k throws ≈ 132 ms with a stack trace vs ≈ 33 ms without (`writableStackTrace=false`). Timings vary by machine. |
| 19.19 | "Try to avoid exception handling if you can": prefer `if (b == 0) return -1;` over catching `ArithmeticException` | 🔶 | The real principle is **don't use exceptions for expected control flow; validate first**, and the example does that. But returning `-1` is a **magic error code**, the very anti-pattern the note criticises earlier, and here `-1` is also a valid quotient (`-1 / 1`). Better: throw `IllegalArgumentException`, or return `OptionalInt`/a result type. |
| 19.20 | — | ➕ | Missing and related: **try-with-resources** + `AutoCloseable` + **suppressed exceptions** (resources close in reverse order, verified) + Java 9 effectively-final resources; reading stack traces ("Caused by"); exceptions in lambdas/streams; `Optional` as an alternative to null/exceptions; `Error`s you should never catch; global handlers (`Thread.setDefaultUncaughtExceptionHandler`, Spring `@ControllerAdvice` as a pointer). |

## Note 20 — Operators (11 pages, handwritten + IDE screenshots)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 20.1 | Operator = action; operand = what it acts on; expression = 1+ operands and 0+ operators | ✅ | |
| 20.2 | "There are **7** categories of operators" | ✏️ | The note then lists **9** (arithmetic, relational, logical, unary, assignment, bitwise, shift, ternary, type comparison). |
| 20.3 | Arithmetic `+ - * / %`; demo `5/2=2`, `5%2=1` | ✅ / ➕ | ➕ Integer division **truncates toward zero** (`-5/2 = -2`); `%` takes the **sign of the dividend** (`-5 % 2 = -1`, `5 % -2 = 1`); use `Math.floorMod` for a mathematical modulo; `int / 0` → `ArithmeticException` but `5.0/0 = Infinity` and `0.0/0 = NaN`; `%` works on doubles (`5.5 % 2 = 1.5`); `+` also concatenates strings, left to right (`1 + 2 + "3" = "33"`, `"1" + 2 + 3 = "123"`). All verified. Overflow → audit 4.14. |
| 20.4 | Relational `== != > < >= <=` (demo a=4, b=7) | ✅ | ➕ `==` on references compares identity (audit 6.5, 6.12); comparing floating point (`NaN != NaN`). |
| 20.5 | Logical `&&`/`\|\|`; "if one condition is false, `&&` won't evaluate further conditions" | 🔶 | Short-circuiting is **left to right**: `&&` stops when the **left** side is false, `\|\|` stops when the left side is **true**. That's why the null-check idiom `x != null && x.isValid()` works. ➕ Non-short-circuit `&`, `\|`, `^` on booleans evaluate **both** sides (verified: `&` triggered the division by zero that `&&` avoided). |
| 20.6 | Unary `++ -- + - !`; prefix vs postfix semantics; demo a=5 → 5, 7, 7, 5, false, -5, 5 | ✅ | Verified. ➕ Classic trap: `i = i++;` leaves `i` unchanged (verified `5`). |
| 20.7 | Assignment `= += -= *= /= %=`; demo 5, 5, 2, 10, 2 | ✅ / ➕ | ➕ Compound assignment includes an **implicit narrowing cast**: `byte b = 10; b += 300;` compiles and gives **54** (verified), while `b = b + 300` doesn't compile. More compound operators: `&= \|= ^= <<= >>= >>>=`. |
| 20.8 | Bitwise `& \| ^ ~` "work on bits and are very fast"; truth tables; demo 4&6=4, 4\|6=6, 4^6=2, ~4=-5 | ✅ / 🔶 | Verified. "Very fast" is true but rarely matters: the JIT optimises ordinary arithmetic too. Use bitwise operators for **flags/masks**, hashing and low-level work (`EnumSet`/`BitSet` are often clearer). |
| 20.9 | `~n = -(n+1)`; 4-bit worked example `~0100 = 1011 = -8+0+2+1 = -5` | ✅ / ✏️ | Correct (the MSB weight is **−2³** in 4 bits, same idea as audit 4.8; `int` uses 32 bits). ✏️ "So for **4** i.e. 0101" should read "for **5** i.e. 0101". |
| 20.10 | Shift operators `<< >> >>>`; no `<<<` | ✅ | |
| 20.11 | `>>` fills MSB with the sign; `>>>` fills with 0 (8-bit examples `11000110`) | ✅ / ⚠️ | Correct as bit patterns, but ⚠️ in Java, `byte`/`short` operands are **promoted to `int` first** (sign-extended). So `(byte)0b11000110 >>> 1` is **2147483619** (`0x7fffffe3`), not `01100011` (99). You must mask first: `(b & 0xFF) >>> 1 = 99` (both verified). |
| 20.12 | "Left shift once doubles, right shift once halves"; demo 4<<1=8, 4<<2=16, 4>>1=2, 4>>2=1 | ✅ / 🔶 | Demo verified. 🔶 Doubling breaks on **overflow** (`1 << 31` is negative); `>>` on negatives rounds toward **−∞** (`-5 >> 1 = -3`, but `-5 / 2 = -2`); the **shift distance is masked** to 5 bits for `int` (6 for `long`), so `1 << 32 == 1` and `1L << 64 == 1`. All verified. |
| 20.13 | Ternary `(cond) ? e1 : e2`; demo max = 5 | ✅ / ➕ | ➕ Type-resolution traps (all verified): `true ? 1 : 'a'` has type **`char`** (prints an invisible `\u0001`); `true ? Integer.valueOf(1) : Double.valueOf(2)` prints **1.0** (numeric promotion); `flag ? (Integer) null : 0` throws **NPE** (unboxing). Don't nest ternaries deeply. |
| 20.14 | `instanceof` type check; true for a parent type; demo outputs true/false/true/true/false | ✅ | Verified semantics. ➕ `null instanceof X` is `false` (verified); inconvertible types don't compile (verified: "incompatible types: String cannot be converted to Integer"); **pattern matching** `if (o instanceof String s && …)` (Java 16, verified). |
| 20.15 | Precedence table (parentheses → postfix → prefix → multiplicative → additive → shift → relational → equality → & → ^ → \| → && → \|\| → ?: → assignment) with associativity | ✅ / ✏️ | Correct order. ✏️ `instanceof` (lower-case). ➕ Casting `(type)` sits with the prefix unary operators; lambda `->` is lowest; precedence decides **grouping**, while **operands are always evaluated left to right** (JLS 15.7). |
| 20.16 | Worked example: `a = 4; a = a + a++ + ++a * --a + a--;` → "4 + 4 + 6*5 + 5 = **39**" | ⚠️ | The substitution (4, 4, 6, 5, 5) is right, but the arithmetic isn't: 4 + 4 + 30 + 5 = **43**. Running it gives **43** (verified). The final `a--` side effect is overwritten by the assignment. |
| 20.17 | — | ➕ | Missing and related: `instanceof` patterns, the string `+` operator & `StringBuilder`, overflow-safe `Math.addExact`, equality of floating point, bit-manipulation recipes (check/set/clear a bit, power of two, `Integer.bitCount`), operator puzzles as practice. |

## Note 21 — Control Flow Statements (2 tall pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 21.1 | Categories: decision (if, if-else, if-else-if ladder, nested if, switch statement, switch expression), iterative (for, while, do-while, for-each), branching (break, continue) | ✅ / ➕ | ➕ Branching also includes **`return`**, **labeled `break`/`continue`**, **`yield`** (switch expressions) and `throw`. |
| 21.2 | if / if-else / ladder / nested-if definitions + outputs | ✅ | ✏️ Nested-if output says "greater than 8 but **else** than 15" (should be "less"). ➕ Dangling-else and why you should always use braces; guard clauses / early returns instead of deep nesting (senior lens). |
| 21.3 | Switch statement syntax, flow diagram, `break` optional in `default` | ✅ | |
| 21.4 | Fall-through without `break`; `default` in the middle; `b = 9` case → "10" then "a+b is 2" | ✅ | Verified exactly: `10\|a+b is 2\|`. |
| 21.5 | String switch with stacked `case` labels and `case "January", "February", "March":` | ✅ | ➕ The comma form arrived with **Java 14** (JEP 361). A String switch uses `hashCode` + `equals`; a `null` selector throws **NPE** in a classic switch (verified) unless you add `case null` (Java 21, verified). |
| 21.6 | Rules: no duplicate cases; case constants of the same type as the selector; case must be a literal or constant (`final int` ✓) | ✅ / 🔶 | Verified: "duplicate case label", "constant expression required", `final` local OK. 🔶 "Same type" is really "**assignable** to the selector type": `case 'a':` compiles in an `int` switch (verified), while `case 200:` in a `byte` switch fails as a lossy conversion (verified). Enum constants and (Java 21) **patterns** are also valid labels. |
| 21.7 | "All use cases need not be handled" (enum switch statement without FRIDAY → output 0) | ✅ / 🔶 | True for classic switch **statements**. **Switch expressions** must be exhaustive (see 21.11), and since Java 21, switch **statements that use patterns or `case null`** must also be exhaustive. |
| 21.8 | Nested switch possible | ✅ | Prefer extracting a method for readability. |
| 21.9 | "Supported types: `int, short, byte, char`, their wrappers, `Enum`, `String`" | ⚠️ | True up to Java 20. Since **Java 21 (JEP 441, pattern matching for switch)** the selector can be **any reference type**, with type patterns, record patterns, guards (`when`) and `case null` (verified with a sealed interface). `long`, `float`, `double` and `boolean` selectors are still **preview only** (JDK 25: "primitive patterns are a preview feature", verified; JEP 532 is the 5th preview in JDK 27). |
| 21.10 | "Return is not possible within switch case" | ⚠️ | Too broad. `return` is fine inside a switch **statement** (verified). It's only illegal inside a switch **expression** (verified: "attempt to return out of a switch expression"), which must produce a value with `->` or `yield`. |
| 21.11 | Switch expression: two ways, `case N ->` and `yield`; all cases must be handled; "with `->` we cannot have a block; for a block use `yield`" | 🔶 | These are two **independent** features: arrow labels (no fall-through, usable in statements too, verified) and `yield` (produces a value; also works with **colon** labels, verified: `case 1: yield "One";`). An arrow **can** take a block `-> { …; yield v; }`; inside a switch expression the block must end in `yield` or `throw` (verified: "switch rule completes without providing a value"). Exhaustiveness verified: "the switch expression does not cover all possible input values". An exhaustive **enum** switch expression needs **no `default`** (verified). Switch expressions: standard since **Java 14** (JEP 361). |
| 21.12 | for, nested for, while, do-while, for-each syntax + outputs | ✅ | ➕ do-while runs **at least once** (verified); the for-each variable is a **copy** (reassigning it doesn't change the array, verified); for-each works on arrays and any `Iterable`; removing from a list inside for-each → `ConcurrentModificationException` (verified), except the quirk where removing the second-to-last element **silently ends the loop early** (verified). Use `removeIf` or `Iterator.remove()`. `for (;;)` infinite loop; `var` in loops. |
| 21.13 | `break` exits the loop; in nested loops `break` exits only the inner loop (output 1,1 … 5,1) | ✅ | ➕ **Labeled `break`/`continue`** (`outer:`) to exit or continue an outer loop (verified); unreachable code after `break` is a compile error (verified). |
| 21.14 | `continue` skips the rest of the iteration (1, 2, 4, …, 10) | ✅ | ➕ Pitfall: `continue` in a `while` loop before the increment → infinite loop. |
| 21.15 | — | ➕ | Missing and related: pattern-matching `switch` with sealed types and records (data-oriented programming), guards (`case Circle c when c.r() > 10`), early returns and guard clauses, loop invariants & off-by-one errors, streams as the declarative alternative (future notes). |

## Executed verification: batch 3 (JDK 25.0.4.1, 2026-09-24)

- Runtime checks: `source-notes/verification/batch3/Verify3.java`, output saved in `verify3-output.txt` (85 lines; the
  exception-cost timings vary by machine).
- Compile checks: `source-notes/verification/batch3/compile-checks/run.sh`

```
c01_switch_duplicate_case                duplicate case label
c02_switch_non_constant_case             constant expression required
c03_switch_on_long                       primitive patterns are a preview feature and are disabled by default.
c04_switch_on_boolean                    primitive patterns are a preview feature and are disabled by default.
c05_switch_expr_not_exhaustive           the switch expression does not cover all possible input values
c06_return_inside_switch_expression      attempt to return out of a switch expression
c07_arrow_block_without_yield            switch rule completes without providing a value
c08_byte_case_out_of_range               incompatible types: possible lossy conversion from int to byte
c09_catch_checked_never_thrown           exception FileNotFoundException is never thrown in body of corresponding try statement
c10_catch_order_super_before_sub         exception ClassNotFoundException has already been caught
c11_multicatch_related_types             Alternatives in a multi-catch statement cannot be related by subclassing
c12_unreported_checked                   unreported exception ClassNotFoundException; must be caught or declared to be thrown
c13_multicatch_param_final               multi-catch parameter e may not be assigned
c14_unreachable_after_break              unreachable statement
c15_functional_interface_on_class        Unexpected @FunctionalInterface annotation
c16_safevarargs_on_overridable           Invalid SafeVarargs annotation. Instance method m(List<String>...) is neither final nor private.
c17_annotation_default_null              element value must be a constant expression
c18_annotation_wrapper_element           invalid type for annotation interface element
c19_repeat_without_repeatable            Category is not a repeatable annotation interface
c20_override_mismatch                    method does not override or implement a method from a supertype
c21_instanceof_inconvertible             incompatible types: String cannot be converted to Integer
k01_try_with_resources_alone             COMPILES OK
k02_catch_unchecked_never_thrown_ok      COMPILES OK
k03_switch_char_case_on_int_ok           COMPILES OK
k04_yield_with_colon_labels_ok           COMPILES OK
k05_enum_switch_expr_no_default_ok       COMPILES OK
k06_final_local_as_case_ok               COMPILES OK
k07_safevarargs_private_instance_ok      COMPILES OK
k08_suppresswarnings_on_package_ok       COMPILES OK
```

Key runtime lines (excerpt):

```
[ops] a=4; a = a + a++ + ++a * --a + a--  ->  43   (notes: 39)
[ops] byte 11000110 >>> 1 = 2147483619 = 0x7fffffe3 (promoted to int first, NOT 01100011=99); (b & 0xFF)>>>1 = 99
[ops] shift distance is masked: 1<<32=1, 1<<33=2, 1L<<64=1
[exc] notes' OOM example: 900000000*900000000*900000000 as int = 2030043136 (int overflow!)
[exc] finally DOES run while an OutOfMemoryError propagates
[exc] helpful NPE message: Cannot invoke "String.charAt(int)" because "<local1>" is null   ("val" when compiled with -g)
[refl] ^ Class.forName initialised the class; '.class' did not
[refl] strong encapsulation (JDK 17+): String.value -> InaccessibleObjectException
[refl] static final field cannot be set even with setAccessible
[anno] default retention is CLASS -> not visible at runtime: null; RUNTIME -> true
[anno] @SuppressWarnings retention=SOURCE target=any        (no @Target on JDK 25)
[anno] heap pollution surfaces later as ClassCastException
```

---

# Batch 4, final (received 2026-09-24)

Note 28 is image-only, so a full transcript is in `source-notes/transcripts/28_Streams.md`. Notes 40, 41 and Optional are
OneNote/PDF exports with a text layer plus screenshots.

## Note 28 — Streams (Java 8) (1 tall page)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 28.1 | A stream is a pipeline the collection's elements pass through; operations like sorting and filtering; good for bulk processing, can be parallel | ✅ | ➕ A stream **stores no data** and doesn't modify its source; it's consumed once; it can be infinite (`iterate`/`generate` + `limit`). |
| 28.2 | 3 steps: create → intermediate (lazy, return a new stream) → terminal (triggers processing; nothing after it) | ✅ | ➕ Intermediate ops are **stateless** (`filter`, `map`) or **stateful** (`sorted`, `distinct`); some ops are **short-circuiting** (`limit`, `findFirst`, `anyMatch`, `takeWhile`). |
| 28.3 | Salary example: count > 3000 = 3 | ✅ | Verified. |
| 28.4 | 5 ways to create: collection, array, `Stream.of`, builder, `Stream.iterate(seed, f).limit(n)` | ✅ | Verified. ➕ Also `IntStream.range/rangeClosed`, `Stream.generate`, `Stream.iterate(seed, hasNext, next)` (9), `Stream.ofNullable` (9), `String.chars()`, `Files.lines`, `Pattern.splitAsStream`, `Stream.concat`. |
| 28.5 | `filter`, `map`, `flatMap`, `distinct`, `sorted`, `limit`, `skip` examples | ✅ | All outputs verified. `distinct` keeps **first-encounter order**. |
| 28.6 | `sorted((v1, v2) -> v2 - v1)` for descending order | 🔶 | The output is right for these values, but a **subtraction comparator overflows** with large or negative values and silently mis-sorts (verified: `[1, MAX_VALUE, MIN_VALUE]`). Use `Comparator.reverseOrder()`, `Integer::compare`, or `Comparator.comparing(...).reversed()`. The same applies to the `min`/`max` examples. |
| 28.7 | `peek` shows intermediate results ("prints 3, 4, 6") | ✅ / 🔶 | Verified. 🔶 Use `peek` for **debugging** only: since Java 9 the pipeline may skip elements or even the whole pipeline, e.g. `list.stream().peek(print).count()` prints **nothing** (verified), because `count()` can be computed from the source size. |
| 28.8 | `mapToInt` example 2: `numbersStream.filter(val -> val > 2); int[] filteredArray = numbersStream.toArray(); // 4, 7` | ⚠️ | **Bug:** `filter` returns a *new* stream and the result is discarded; calling `toArray()` on the original then throws **`IllegalStateException: stream has already been operated upon or closed`** (verified). Correct: `int[] a = Arrays.stream(arr).filter(v -> v > 2).toArray();`. ➕ `mapToLong`/`mapToDouble` "try it out" items become exercises; also `sum`, `average` (returns `OptionalDouble`), `summaryStatistics`, `boxed`. |
| 28.9 | Laziness demo: nothing printed without a terminal op; with `count()` prints 4, 7, 10 | ✅ / 🔶 | Verified (the `filter` forces evaluation). 🔶 Caveat in 28.7: `count()` without a size-changing op may skip `peek`. |
| 28.10 | Sequence of operations: elements flow one by one (vertical), `sorted` needs all elements first; "if you need a number > 3, processing stops at 4" | ✅ | Verified output `F4 N-4 F7 N-7 F10 N-10 S-10 S-7 S-4`, and `findFirst` visits only `2 1 4`. |
| 28.11 | Terminal ops: `forEach`, `toArray` (+ generator), `reduce` (24), `collect(toList())`, `min`/`max`, `count`, `anyMatch`, `findFirst` | ✅ | All verified. The "try it out" answers (verified): `max(v1-v2) = 10`, `max(v2-v1) = 4`; `allMatch`/`noneMatch` return **true on an empty stream** (vacuous truth). ➕ `reduce(identity, op)` returns `T`, not `Optional`; the accumulator must be **associative**, or parallel results differ (verified: subtraction gives -5050 sequential vs 0 parallel). ➕ `Stream.toList()` (Java 16) returns an **unmodifiable** list, while `Collectors.toList()` makes no guarantee (verified). |
| 28.12 | `findAny()` "finds any **random** element" | 🔶 | Not random: **non-deterministic**. Sequential streams usually return the first element (verified `2`); in parallel it returns whichever element is found first, which allows better performance. |
| 28.13 | A stream can't be reused after a terminal operation → `IllegalStateException` | ✅ | Verified message. Use a `Supplier<Stream<T>>` to recreate it. |
| 28.14 | Parallel streams: spliterator splits the data, the Fork-Join pool processes chunks | ✅ | ➕ They use the **common** ForkJoinPool (shared across the JVM); `forEach` output is unordered (matches the notes' output); use `forEachOrdered` if order matters. |
| 28.15 | Timing: sequential 64 ms vs parallel 5 ms for 10 elements | ⚠️ | **Misleading benchmark.** With 10 elements and `println`, the difference comes from **JVM warm-up** (whichever runs first pays for lambda bootstrap and class loading); swapping the order flips the result (verified: parallel run first = 667 µs vs sequential 226 µs). Parallel pays off only for **large, CPU-bound, easily splittable** workloads (arrays/`ArrayList`, not `LinkedList`/I/O). Measure with **JMH**. ⚠️ Never mutate shared state from a parallel stream (verified: adding to an `ArrayList` lost elements, size 4859 of 10000). |
| 28.16 | — | ➕ | Missing and related: **Collectors** (`groupingBy`, `partitioningBy`, `joining`, `toMap` with a merge function (the duplicate key throws, verified), `counting`, `mapping`, `teeing` (12)), `takeWhile`/`dropWhile` (9, verified), `mapMulti` (16), **Stream Gatherers (JDK 24, JEP 485, final; `Gatherers.windowFixed` verified)**, primitive streams, method references, non-interference & statelessness rules, exceptions in lambdas, streams vs loops (readability, performance, debugging). |

## Note 40 — SequencedCollection, SequencedSet, SequencedMap (Java 21) (7 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 40.1 | New interfaces added to the existing hierarchy (Java 21) | ✅ | JEP 431 (JDK 21). Hierarchy diagram verified: `List`, `Deque` → `SequencedCollection`; `SequencedSet` extends `SequencedCollection` + `Set`; `SortedSet` → `SequencedSet`; `LinkedHashSet` implements `SequencedSet`; `SortedMap` → `SequencedMap`; `LinkedHashMap` implements `SequencedMap`. ➕ Also concurrent ones: `ConcurrentSkipListSet`, `CopyOnWriteArrayList` (verified). ✏️ `Hashtable` (lower-case "t"). |
| 40.2 | Criteria: predictable iteration (insertion or sorted order), first/last access & manipulation, reversible view; this is why `Queue`/`PriorityQueue`/`HashSet`/`HashMap` are excluded | ✅ | Verified with `instanceof`: `PriorityQueue`, `HashSet`, `HashMap` are not sequenced; `ArrayDeque` and `LinkedList` are. |
| 40.3 | "Existing" (pre-21) table: List reverse via `Collections.reverse(list)`; Deque reverse via `deque.reversed()` | ⚠️ | `Collections.reverse` **mutates the list in place** (verified); it isn't a view. `Deque.reversed()` **didn't exist before Java 21**: pre-21 you had `descendingIterator()`. |
| 40.4 | Queue "follows insertion order", FIFO; no first/last API | 🔶 | Plain `Queue` only guarantees *some* head-removal order (`PriorityQueue` is also a `Queue`); FIFO is typical but not part of the `Queue` contract. |
| 40.5 | Gap filled: a common API for get/add/remove first/last + reversed view | ✅ | |
| 40.6 | Method lists for `SequencedCollection` / `SequencedSet` / `SequencedMap` | ✅ | ➕ Most are **default methods** (the interface evolution trick from note 14-15); `reversed()` returns a **live view** that writes through (verified: `reversed.addFirst("X")` appended X to the original). |
| 40.7 | List/Deque examples (A, B, C, D, Z …) | ✅ | Verified. ➕ `getFirst()` on an empty list → `NoSuchElementException` (vs `get(0)` → `IndexOutOfBoundsException`), and immutable lists → `UnsupportedOperationException` (both verified). |
| 40.8 | `LinkedHashSet.addFirst("C")` moves the existing element: C, A, B, D, Z | ✅ | Verified: re-adding **repositions** the element. |
| 40.9 | `TreeSet.addFirst/addLast` and `TreeMap.putFirst/putLast` → `UnsupportedOperationException` | ✅ | Verified. Explains why `SortedSet` is *sequenced* but position-agnostic. |
| 40.10 | `LinkedHashMap` `putFirst`/`putLast`/`pollFirstEntry`/`reversed` examples | ✅ | Verified. |
| 40.11 | — | ➕ | Missing and related: `Collections.unmodifiableSequencedCollection/Set/Map` (verified); `sequencedKeySet()`/`sequencedValues()`/`sequencedEntrySet()`; migration notes (some third-party libraries and Kotlin had name clashes with `getFirst`/`removeFirst`). Because the notes cite earlier "Collections Framework" videos that weren't shared, the lesson gives a compact **collections primer** (List/Set/Map/Queue/Deque, when to use which) as prerequisite context. |

## Note 41 — Java 17 Sealed Classes and Interfaces (6 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| 41.1 | Problem: no control over who joins a hierarchy (e.g. `RotatingCircle`), which forces a defensive `else`/`default` branch | ✅ | Good motivation. ➕ Before Java 17, the options were `final` (nobody) or package-private constructors (tricky). |
| 41.2 | `sealed … permits` = only listed types may extend; `final` = no further subclassing; `non-sealed` = open again | ✅ | JEP 409, final in **Java 17** (preview in 15 and 16). Verified: an unlisted subclass → "class is not allowed to extend sealed class: Shape (as it is not listed in its 'permits' clause)". |
| 41.3 | Permitted types must be **direct** subtypes | ✅ | Verified: "invalid permits clause". |
| 41.4 | Permitted types must be `final`, `sealed` or `non-sealed` | ✅ | Verified: "sealed, non-sealed or final modifiers expected". ➕ **Records** (implicitly final) and **enums** need no extra modifier (verified). |
| 41.5 | All permitted types must exist (future classes not considered) | ✅ / ➕ | ➕ They must be in the **same module**, or, in the unnamed module (classpath), the **same package** (verified: "cannot extend a sealed class in a different package"). `permits` may be **omitted** when all subclasses are in the same source file (verified). |
| 41.6 | Hierarchy exercise (Shape → Circle final, Polygon non-sealed → Hexagon, AbstractShape sealed → Rectangle final, Triangle non-sealed → EquilateralTriangle) | ✅ | The notes' code compiles and behaves as described (verified). |
| 41.7 | — | ➕ | The biggest payoff is missing: **exhaustive `switch` without `default`** over sealed types (Java 21 pattern matching; verified, plus a compile error when a case is missing) and **record patterns** → algebraic data types / data-oriented programming (verified an expression evaluator); `Class.isSealed()`/`getPermittedSubclasses()`; API design guidance (sealed for closed domain models, not for extension points). |

## Note — Optional (18 pages)

| # | Claim in notes | Verdict | Precise statement / what the lesson will teach |
|---|---|---|---|
| O.1 | Problem: `null` returns + forgotten null checks → NPE; `Optional<T>` (Java 8) expresses "may be absent" in the API | ✅ | Matches the API note: Optional is "primarily intended for use as a method return type where there is a clear need to represent 'no result'". |
| O.2 | "Compiler forces us to handle the Optional return type" (`u.getName()` doesn't compile) | ✅ / 🔶 | Verified the compile error. 🔶 The compiler forces you to **unwrap**, not to handle **correctly**: `opt.get()` still compiles and throws `NoSuchElementException` when empty. Prefer `orElse*`, `map`, `ifPresent*`. |
| O.3 | Simplified JDK source: `EMPTY` singleton, private constructor, `of` throws NPE "Value must not be null", `ofNullable`, `empty()` | ✅ / 🔶 | Close. The real `of` uses `Objects.requireNonNull` → NPE with **no message** (verified). `Optional.empty() == Optional.empty()` is `true` today (verified), but the Javadoc says **don't rely on `==`**: it's a **value-based class** (no identity-sensitive ops, no `synchronized`), relevant for Project Valhalla. |
| O.4 | Method catalogue with versions: `isEmpty` (11), `orElseThrow()` (10), `ifPresentOrElse`/`or`/`stream` (9) | ✅ | All versions correct. ➕ `orElseThrow()` was added in 10 as the **preferred** alternative to `get()`. |
| O.5 | `get()`, `orElse`, `orElseGet` ("when the default needs computation"), `orElseThrow(Supplier)` | ✅ / ➕ | ➕ The key gotcha: **`orElse(x)` evaluates `x` eagerly even when a value is present**; `orElseGet` is lazy (both verified). Use `orElseGet` for anything expensive or with side effects (DB calls, object creation). |
| O.6 | `map` / `flatMap` / `filter` like Stream's (0..1 element); nested `Optional<Optional<Integer>>` → use `flatMap` | ✅ | Verified (`Optional[Optional[9]]` vs `Optional[9]`; "Shrayansh".length() = 9; the filters give false/true). ➕ `map` wraps with `ofNullable`, so a mapper returning `null` gives `Optional.empty` (verified). |
| O.7 | `ifPresent`, `ifPresentOrElse`, `or` (cache → DB → backup chain), `stream()` with `flatMap(Optional::stream)` | ✅ | All verified; the `or` chain is a great real-world example. |
| O.8 | Don't use Optional for fields; don't use it for parameters (`createUser(null)`); JSON: "we may get `{ "name": { "present": true, "value": "A" } }`" | ✅ / ⚠️ | Field/parameter guidance ✅. ✏️ Section headings repeat ("2. Class variable", "4. Serializable class"); they're really **method parameters** and **DAO layer**. ⚠️ The JSON claim doesn't match current Jackson: **Jackson 2.22.3 throws** `InvalidDefinitionException: Java 8 optional type … not supported by default: add Module "jackson-datatype-jdk8"`; **Jackson 3.2.3 serializes it natively** as `{"name":"A"}` / `null` (both verified). ➕ The real reason not to use it in `Serializable` classes: **`Optional` is not `Serializable`** → `NotSerializableException` (verified). |
| O.9 | Don't return Optional from the DAO layer; "best place is the service layer" | 🔶 | Opinion. Mainstream practice (and Spring Data's `Optional<T> findById(ID)`) uses Optional as a return type **at any layer where "no result" is a normal outcome**, including repositories. The real rules: no Optional **fields, parameters, collections or `Optional<List>`** (return an empty list instead), and no Optional on hot paths where allocation matters. ✏️ The DAO sample calls `rs.getString(...)` without `rs.next()`. |
| O.10 | — | ➕ | Missing and related: `OptionalInt/Long/Double` (no boxing; verified `OptionalInt[9]`); `equals`/`hashCode` by value (verified); anti-patterns (`isPresent()` + `get()`, `Optional.of(maybeNull)`, `Optional` as a field, `Optional<Optional<T>>`); stream terminal ops that return Optional (`findFirst`, `min`, `max`, `reduce`); null-handling alternatives (`Objects.requireNonNullElse` (9), annotations like JSpecify `@Nullable`). |

## Executed verification: batch 4 (JDK 25.0.4.1, 2026-09-24)

- Runtime checks: `source-notes/verification/batch4/Verify4.java`, output in `verify4-output.txt` (timings and the
  parallel-race size vary).
- Compile checks: `batch4/compile-checks/run.sh`:

```
c01_sealed_unlisted_subclass             class is not allowed to extend sealed class: Shape (as it is not listed in its 'permits' clause)
c02_permitted_missing_modifier           sealed, non-sealed or final modifiers expected
c03_permitted_not_direct_subtype         invalid permits clause
c04_extend_final_permitted               cannot inherit from final Circle
c05_sealed_switch_missing_case           the switch expression does not cover all possible input values
c06_optional_no_direct_member_access     cannot find symbol
c08_sealed_cross_package                 class Shape in unnamed module cannot extend a sealed class in a different package
k01_record_implicitly_final_permitted    COMPILES OK
k02_permits_omitted_same_file            COMPILES OK
k03_enum_implements_sealed               COMPILES OK
k04_sealed_switch_exhaustive_no_default  COMPILES OK
```

- Jackson check: `batch4/jackson-check/run.sh` (jars from Maven Central):

```
[jackson2] InvalidDefinitionException: Java 8 optional type `java.util.Optional<java.lang.String>` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jdk8" to enable handling …
[jackson3] {"email":null,"name":"A"}
```

Key runtime lines (excerpt):

```
[stream] notes' mapToInt example (filter result ignored, then toArray on original) -> IllegalStateException: stream has already been operated upon or closed
[stream] Java 9+: count() WITHOUT filter may skip the pipeline, peek prints: [] (count=5)
[stream] vertical processing, sorted() is a barrier: F4 N-4 F7 N-7 F10 N-10 S-10 S-7 S-4
[stream] non-associative reduce (subtraction) seq vs parallel: -5050 vs 0
[stream] 10 elements, PARALLEL run first: parallel=667us, sequential=226us -> first run pays warm-up; not a fair benchmark
[seq] reversed() is a live VIEW: reversed.addFirst("X") -> original=[B, C, D, X]
[seq] LinkedHashSet addFirst(dup) repositions: [C, A, B, D, Z]
[sealed] exhaustive switch over sealed records + record patterns, no default: eval(1 + (2 + 3)) = 6
[opt] orElse is EAGER even when a value is present: [computed orElse] -> Shrayansh
[opt] Optional field in a Serializable class -> NotSerializableException: java.util.Optional
```
