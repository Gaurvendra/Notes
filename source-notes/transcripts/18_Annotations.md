# Transcript: 18 Annotations

> Source: `source-notes/pdf/18_Annotations.pdf` ("Concept && Coding" YT video notes, typed; 1 tall image page, no
> text layer). Transcribed 2026-09-24. Audit: `AUDIT.md` → Note 18.

## What is an annotation?
- It is a kind of adding **META DATA** to the Java code.
- Means its usage is **OPTIONAL**.
- We can use this metadata information at **runtime** and can add certain logic in our code if wanted.
- How to read metadata information? Using **Reflection**, as discussed in the previous video.
- Annotations can be applied anywhere: classes, methods, interfaces, fields, parameters, etc.

Example: `interface Bird { boolean fly(); }` → `class Eagle implements Bird { @Override public boolean fly() {...} }`
("Annotation (denoted using @)").

## Types of annotations (diagram)
- **Pre-defined annotations**
  - Used on annotations (called **meta-annotations**): `@Target`, `@Retention`, `@Documented`, `@Inherited`,
    `@Repeatable` (Java 8 feature)
  - Used on Java code (classes, methods etc.): `@Deprecated`, `@Override`, `@SuppressWarnings`,
    `@FunctionalInterface`, `@SafeVarargs`
- **Custom / user-defined annotations:** `@{Our custom name}`

## Annotations used on Java code

### @Deprecated
- Usage of a deprecated class, method or field shows a compile-time **WARNING**.
- Deprecation means no further improvement is happening on this; use the new alternative method or field instead.
- Can be used over: **Constructor, Field, Local Variable, Method, Package, Parameter, Type** (class, interface, enum).
- Screenshot: `Mobile.dummyMethod()` `@Deprecated`; calling it in `Main` shows the IDE inspection
  "Deprecated API usage".

### @Override
- During compile time, it checks that the method is overridden.
- Throws a compile-time error if it does not match the parent method.
- Can be used over: **METHODS**.
- Screenshot: `Eagle implements Bird` with `@Override public boolean fly1()` → error (red underline).

### @SuppressWarnings
- Tells the compiler to **IGNORE** any compile-time **WARNING**.
- Use it safely: it could lead to a **run-time exception** if any valid warning is ignored.
- Can be used over: **Field, Method, Parameter, Constructor, Local Variable, Type** (class or interface or enum).

## @SuppressWarnings examples (screenshots)
- `Mobile.dummyMethod()` marked `@Deprecated`; `mobileObj.dummyMethod()` in `Main` shows a warning (IDE bulb).
- An unused method `unusedMethod()` shows a warning; `@SuppressWarnings("unused")` on class `Main` silences it.
- `@SuppressWarnings("deprecation")` on `main`, **or** on the class `Main`, **or** `@SuppressWarnings("all")` on
  `main` removes the deprecation warning.

## @FunctionalInterface
- Restricts an interface to have only 1 abstract method.
- Throws a compilation error if more than 1 abstract method is found.
- "Can be used over: **Type** (Class or interface or enum)" (with "enum" underlined).
- Example: `@FunctionalInterface public interface Bird { boolean fly(); void eat(); }` → error (red underline).

## @SafeVarargs
- Used to suppress the "Heap pollution warning".
- Used over methods and constructors which have **variable arguments** as parameter.
- The method should be either static or final (i.e. methods which cannot be overridden).
- In **Java 9**, we can also use it on private methods.

**What is heap pollution?** "Object of one type (example String), storing the reference of another type object
(example Integer)."
```java
public static void printLogValues(List<Integer>... logNumbersList) {
    Object[] objectList = logNumbersList;
    List<String> stringValuesList = new ArrayList<>();
    stringValuesList.add("Hello");
    objectList[0] = stringValuesList;   // IDE: "Possible heap pollution from parameterized vararg type"
}
```
Same method with `@SafeVarargs` → warning gone.

## Meta-annotations (annotations used over other annotations)

### @Target
- Restricts where the annotation can be used: method, constructor, fields, etc.
- `@Target(ElementType.METHOD) public @interface Override {}`;
  `@Target({ElementType.CONSTRUCTOR, ElementType.METHOD}) public @interface SafeVarargs {}`.
- **ElementType:** TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE, ANNOTATION_TYPE, PACKAGE,
  TYPE_PARAMETER ("allows you to apply on generic types `<T>`"), TYPE_USE ("Java 8 feature, allows you to use an
  annotation at all places where a type can be declared, like `List<@annotation String>`").

### @Retention
"This meta-annotation tells how the annotation will be stored in Java."
- `RetentionPolicy.SOURCE`: discarded by the compiler itself; not recorded in the .class file.
- `RetentionPolicy.CLASS`: recorded in the .class file but ignored by the JVM at run time.
- `RetentionPolicy.RUNTIME`: recorded in the .class file + available at run time; reflection can be used.

Examples (small screenshots): (1) `@Override` is `@Target(METHOD) @Retention(SOURCE)` → the compiled `Eagle.class`
(decompiled) has no `@Override`. (2) `@SafeVarargs` is `@Retention(RUNTIME)` → the annotation is still present in
the decompiled class. (3) `@Target(TYPE) @Retention(RUNTIME) @interface MyCustomAnnotationWithInherited` on
`TestClass`; `new TestClass().getClass().getAnnotation(...)` prints `@MyCustomAnnotationWithInherited()`.
(4) Same annotation **without** `@Retention(RUNTIME)` → prints `null`.

### @Documented
- By default, annotations are ignored when Java documentation is generated.
- With this meta-annotation, even annotations will come in Java docs.
- Screenshots: `@Override` (not documented) → Javadoc of `Eagle.fly()` shows no annotation; `@Documented
  @Retention(RUNTIME) @Target({CONSTRUCTOR, METHOD}) @interface SafeVarargs` → Javadoc of `Log.printLogValues`
  shows `@SafeVarargs`.

### @Inherited
- By default, annotations applied on a parent class are not available to child classes.
- But they are after this meta-annotation.
- This meta-annotation has no effect if the annotation is used on anything other than a class.
- Screenshots: `@Inherited @Target(TYPE) @Retention(RUNTIME) @interface MyCustomAnnotationWithInherited` on
  `ParentClass`; `ChildClass extends ParentClass`; `new ChildClass().getClass().getAnnotation(...)` →
  `@MyCustomAnnotationWithInherited()`. Without `@Inherited` → `null`.

### @Repeatable
- Allows us to use the same annotation more than once at the same place.
- "We can not do this before JAVA 8": `@Deprecated @Deprecated class Eagle` → error; `@Category(name="Bird")
  @Category(name="LivingThing") class Eagle` (with `@Target(TYPE) @Retention(RUNTIME) @interface Category { String name(); }`) → error.
- "We need to use @Repeatable meta-annotation":
  ```java
  @Repeatable(Categories.class)
  @interface Category { String name(); }

  @Retention(RetentionPolicy.RUNTIME)
  @interface Categories { Category[] value(); }

  @Category(name = "Bird") @Category(name = "LivingThing") @Category(name = "carnivorous")
  public class Eagle { public void fly() {} }

  Category[] arr = new Eagle().getClass().getAnnotationsByType(Category.class);
  for (Category a : arr) System.out.println(a.name());   // Bird, LivingThing, carnivorous
  ```
  (Note: the screenshot's `Category` shows only `@Repeatable`; its `@Retention(RUNTIME)` is not visible.)

## User-defined / custom annotations
- Created with the keyword **`@interface`**.
- **Empty body:** `public @interface MyCustomAnnotation {}` → `@MyCustomAnnotation public class Eagle {...}`.
- **With a method ("it's more like a field"):** no parameters, no body; return type restricted to primitive, Class,
  String, enums, annotations, and arrays of these. `String name();` → `@MyCustomAnnotation(name = "testing")`.
- **With default values:** `String name() default "hello";` → `@MyCustomAnnotation` (no argument needed).
  "Default value can not be null."
