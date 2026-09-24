# Transcript: 17 Reflection

> Source: `source-notes/pdf/17_Reflection.pdf` ("Concept && Coding" YT video notes, typed with handwritten tick
> marks; 1 tall image page, no text layer). Transcribed 2026-09-24. Audit: `AUDIT.md` → Note 17.

## 1. What is reflection?
"This is used to examine the classes, methods, fields, interfaces at runtime and also possible to change the
behaviour of the class too." For example:
- What methods are present in the class.
- What fields are present in the class.
- What is the return type of a method.
- What is the modifier of the class.
- What interfaces the class has implemented.
- Change the value of the public and private fields of the class, etc.

## 2. How to do reflection of classes?
"To reflect the class, we first need to get an object of **Class**."

**What is this class `Class`?**
- An instance of the class `Class` represents classes during runtime.
- The JVM creates one `Class` object for each and every class which is loaded during run time.
- This `Class` object has metadata information about the particular class, like its methods, fields, constructors etc.

**How to get a particular class's `Class` object? 3 ways:**
1. `Class birdClass = Class.forName("Bird");`
2. `Class birdClass = Bird.class;`
3. `Bird birdObj = new Bird(); Class birdClass = birdObj.getClass();`

**Reflection of classes:** `Eagle { public String breed; private boolean canSwim; public void fly(); public void eat(); }`
```java
Class eagleClass = Eagle.class;
System.out.println(eagleClass.getName());                              // Eagle
System.out.println(Modifier.toString(eagleClass.getModifiers()));     // public
```
"Methods available in Class object, all are **get, not set** methods" (IDE list: `getClassLoader`, `asSubclass`,
`cast`, `getClass`, `getName`, `desiredAssertionStatus`, `getAnnotatedInterfaces`, `getAnnotation(s)`,
`getCanonicalName`, `getClasses`, `getComponentType`, `getConstructor(s)`, `getDeclaredAnnotations`,
`getDeclaredClasses`, `getDeclaredConstructor(s)`, `getDeclaredField(s)`, `getDeclaredMethod(s)`,
`getDeclaringClass`, `getEnclosingClass/Constructor/Method`, `getEnumConstants`, `getField(s)`,
`getGenericInterfaces`, `getGenericSuperclass`, `getInterfaces`, `getMethod(s)`, `getModifiers`, `getPackage`,
`getProtectionDomain`, `getResource(AsStream)`, `getSigners`, `getSimpleName`, `getSuperclass`; ticked:
getConstructors, getDeclaredFields, getFields, getInterfaces, getMethods, getModifiers, getPackage).

"The package `java.lang.reflect` provides classes that can be used to access and manipulate values like fields,
methods, constructors etc. And these classes are generally returned by the above listed get methods only."

## Reflection of methods
`Eagle { public String breed; private boolean canSwim; public void fly(); private void eat(); }`
- `eagleClass.getMethods()` → "All public methods it will return" (handwritten: "Eagle class" + an arrow; the loop
  prints `Method name`, `Return Type` (`getReturnType()`), `Class Name` (`getDeclaringClass()`)). Output starts
  `MethodName: fly / ReturnType: void …` (handwritten "+ all methods of Object").
- `eagleClass.getDeclaredMethods()` → "All public and private methods it will return within Eagle class only" →
  `MethodName: fly`, `MethodName: eat`.
- `Method` API list (IDE): `getName`, `equals`, `getReturnType`, `getDeclaringClass`, `getDefaultValue`,
  `getAnnotatedReturnType`, `getAnnotation`, `getDeclaredAnnotations`, `getExceptionTypes`, `getGenericExceptionTypes`,
  `getGenericParameterTypes`, `getGenericReturnType`, `getModifiers`, `getParameterAnnotations`, `getParameterCount`,
  `getParameterTypes`, `getTypeParameters`, `hashCode`, `invoke(Object obj, Object... args)`, `isBridge`, `isDefault`,
  `isSynthetic`, `isVarArgs`, `toGenericString`, `toString`, `getAnnotatedExceptionTypes`, …

## Invoking a method using reflection
```java
public class Eagle {
    Eagle() {}
    public void fly(int intParam, boolean boolParam, String strParm) {
        System.out.println("fly intParam: " + intParam + " boolParam: " + boolParam + " strParm: " + strParm);
    }
}
// main(...) throws InstantiationException, IllegalAccessException, ClassNotFoundException (…)
Class eagleClass = Class.forName("Eagle");                     // (1)
Object eagleObject = eagleClass.newInstance();                 // (1)
Method flyMethod = eagleClass.getMethod("fly", int.class, boolean.class, String.class);   // (2)
flyMethod.invoke(eagleObject, 1, true, "hello");               // (3)
```
Output: `fly intParam: 1 boolParam: true strParm: hello`.

## Reflection of fields
`Eagle { public String breed; private boolean canSwim; public void fly(); private void eat(); }`
- `eagleClass.getFields()` ("Get public fields with this") → `FieldName: breed`, `Type: class java.lang.String`,
  `Modifier: public`.
- `eagleClass.getDeclaredFields()` ("Get both public and private fields with this") → breed/String/public and
  `FieldName: canSwim`, `Type: boolean`, `Modifier: private`.
- `Field` "get methods supported": `get(Object)`, `getName`, `getModifiers`, `getType`, `getAnnotation(s)`,
  `getAnnotatedType`, `getAnnotationsByType`, `getBoolean/Byte/Char/Double/Float/Int/Long/Short(Object)`,
  `getDeclaredAnnotation(s)`, `getDeclaringClass`, `getGenericType`, `getDeclaredAnnotationsByType`, `getClass`.
- **Setting the value of a public field:** `Field field = eagleClass.getDeclaredField("breed"); field.set(eagleObj,
  "eagleBrownBreed"); System.out.println(eagleObj.breed);` → `eagleBrownBreed`.
- **Setting the value of a private field (incorrect way):** `getDeclaredField("canSwim"); field.set(eagleObj, true);` →
  `java.lang.IllegalAccessException: Class Main can not access a member of class Eagle with modifiers "private"`
  (stack: `AccessibleObject.slowCheckMemberAccess` → `checkAccess` → `Field.set`).
- **Setting the value of a private field (correct):**
  ```java
  Field field = eagleClass.getDeclaredField("canSwim");
  field.setAccessible(true);
  field.set(eagleObj, true);
  if (field.getBoolean(eagleObj)) System.out.println("value is set to true");
  ```
  Output: `value is set to true`.

## Reflection of constructors
```java
public class Eagle {
    private Eagle() { /* private constructor */ }
    public void fly() { System.out.println("fly"); }
}
// main(...) throws InvocationTargetException, InstantiationException, IllegalAccessException
Class eagleClass = Eagle.class;
// to access private constructor too
Constructor[] eagleConstructorList = eagleClass.getDeclaredConstructors();
for (Constructor eagleConstructor : eagleConstructorList) {
    System.out.println("Modifier: " + Modifier.toString(eagleConstructor.getModifiers()));
    eagleConstructor.setAccessible(true);
    Eagle eagleObject = (Eagle) eagleConstructor.newInstance();
    eagleObject.fly();
}
```
`Constructor` API list (IDE): `getAnnotation`, `getName`, `getDeclaringClass`, `getModifiers`,
`getAnnotatedReceiverType`, `getAnnotatedReturnType`, `getDeclaredAnnotation(s)`, `getExceptionTypes`,
`getGenericExceptionTypes`, `getGenericParameterTypes`, `getParameterAnnotations`, `getParameterCount`,
`getParameterTypes`, `getTypeParameters`, `getAnnotatedExceptionTypes`, `getAnnotatedParameterTypes`,
`getAnnotations`, `getAnnotationsByType`, `getDeclaredAnnotationsByType`, `getParameters`, `getClass`, `toGenericString`.
(Handwritten note beside the private-constructor demo: "new Eagle()" crossed out, i.e. reflection bypasses the
private constructor, relevant to singletons.)
