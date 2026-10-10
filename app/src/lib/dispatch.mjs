/**
 * Dynamic dispatch for the DispatchLab widget. A fixed hierarchy (Object ← Animal ← Dog ← Puppy, Animal ← Cat) and two
 * lines of Java: `Declared ref = new Created();` and an access through `ref` (optionally cast). The engine answers the
 * two questions Java answers at two different times:
 *
 *  - compile time, from the TYPE OF THE EXPRESSION only: is the assignment legal (§5.2), is the cast legal (§5.5), is
 *    there a member with that name in that type or its supertypes (§15.12.1–15.12.3, §15.11.1), and which kind of
 *    access it compiles to (a field read, a static call, a virtual call; the symbolic reference uses that type, §13.1);
 *  - run time, from the OBJECT'S CLASS: the cast check (checkcast), then, for instance methods only, the search from
 *    the object's class up to the first class that declares the method (§15.12.4.4, JVMS §5.4.6). Fields and static
 *    methods never look at the object.
 *
 * Pure functions, checked in scripts/check-content.mjs against hand-derived answers.
 */

export const TYPES = ['Object', 'Animal', 'Dog', 'Puppy', 'Cat']
export const CREATABLE = ['Animal', 'Dog', 'Puppy', 'Cat']
export const PARENT = { Object: null, Animal: 'Object', Dog: 'Animal', Puppy: 'Dog', Cat: 'Animal' }

/** The accesses the widget offers. */
export const MEMBERS = [
  { id: 'speak', label: 'speak()' },
  { id: 'eat', label: 'eat()' },
  { id: 'describe', label: 'describe()' },
  { id: 'fetch', label: 'fetch()' },
  { id: 'breathe', label: 'breathe()' },
  { id: 'info', label: 'info()' },
  { id: 'name', label: 'name' },
]

/**
 * What each class declares, in source order. kind: field | method | final | static. `prints` is the method's own
 * output; `superFirst` means the body starts with super.<same method>().
 */
export const DECLARES = {
  Object: [
    { id: 'toString', text: 'String toString()', kind: 'method' },
    { id: 'equals', text: 'boolean equals(Object o)', kind: 'method' },
    { id: 'hashCode', text: 'int hashCode()', kind: 'method' },
  ],
  Animal: [
    { id: 'name', text: 'String name = "animal"', kind: 'field', value: 'animal' },
    { id: 'speak', text: 'void speak()', kind: 'method', prints: ['...'] },
    { id: 'eat', text: 'void eat()', kind: 'method', prints: ['Animal eats'] },
    { id: 'describe', text: 'void describe()', kind: 'method' },
    { id: 'breathe', text: 'final void breathe()', kind: 'final', prints: ['Animal breathes'] },
    { id: 'info', text: 'static void info()', kind: 'static', prints: ['Animal.info'] },
  ],
  Dog: [
    { id: 'name', text: 'String name = "dog"', kind: 'field', value: 'dog', hides: true },
    { id: 'speak', text: 'void speak()', kind: 'method', prints: ['Woof'], overrides: true },
    { id: 'fetch', text: 'void fetch()', kind: 'method', prints: ['Dog fetches'] },
    { id: 'info', text: 'static void info()', kind: 'static', prints: ['Dog.info'], hides: true },
  ],
  Puppy: [
    { id: 'speak', text: 'void speak()', kind: 'method', prints: ['Yip'], overrides: true },
    { id: 'eat', text: 'void eat()', kind: 'method', prints: ['Puppy wants more'], overrides: true, superFirst: true },
  ],
  Cat: [{ id: 'speak', text: 'void speak()', kind: 'method', prints: ['Meow'], overrides: true }],
}

/** The classes as Java (shown in the widget, and what the outputs above are derived from). */
export const SOURCE = [
  'class Animal {',
  '    String name = "animal";',
  '',
  '    void speak() {',
  '        System.out.println("...");',
  '    }',
  '',
  '    void eat() {',
  '        System.out.println("Animal eats");',
  '    }',
  '',
  '    void describe() {',
  '        System.out.print(name + ": ");',
  '        speak();',
  '    }',
  '',
  '    final void breathe() {',
  '        System.out.println("Animal breathes");',
  '    }',
  '',
  '    static void info() {',
  '        System.out.println("Animal.info");',
  '    }',
  '}',
  '',
  'class Dog extends Animal {',
  '    String name = "dog";              // hides Animal.name',
  '',
  '    @Override',
  '    void speak() {',
  '        System.out.println("Woof");',
  '    }',
  '',
  '    void fetch() {',
  '        System.out.println("Dog fetches");',
  '    }',
  '',
  '    static void info() {              // hides Animal.info()',
  '        System.out.println("Dog.info");',
  '    }',
  '}',
  '',
  'class Puppy extends Dog {',
  '    @Override',
  '    void speak() {',
  '        System.out.println("Yip");',
  '    }',
  '',
  '    @Override',
  '    void eat() {',
  '        super.eat();',
  '        System.out.println("Puppy wants more");',
  '    }',
  '}',
  '',
  'class Cat extends Animal {',
  '    @Override',
  '    void speak() {',
  '        System.out.println("Meow");',
  '    }',
  '}',
]

/** `c` and its superclasses, nearest first (ending with Object). */
export function ancestors(c) {
  const out = []
  for (let x = c; x; x = PARENT[x]) out.push(x)
  return out
}

export const isSubtype = (a, b) => ancestors(a).includes(b)

const article = (word) => (/^[AEIOU]/.test(word) ? `an ${word}` : `a ${word}`)
const Article = (word) => (/^[AEIOU]/.test(word) ? `An ${word}` : `A ${word}`)

/** The nearest declaration of `id` seen from type `from` (the declared member and the class declaring it). */
function lookup(from, id) {
  for (const c of ancestors(from)) {
    const m = DECLARES[c].find((x) => x.id === id)
    if (m) return { cls: c, m }
  }
  return null
}

/** Run-time selection: from the object's class up to the first class that declares the instance method. */
function select(created, id) {
  const path = []
  for (const c of ancestors(created)) {
    path.push(c)
    const m = DECLARES[c].find((x) => x.id === id && x.kind !== 'static' && x.kind !== 'field')
    if (m) return { cls: c, m, path }
  }
  throw new Error(`${created} has no ${id}()`)
}

/** What a call to the instance method `id` prints when the JVM has selected `impl`. */
function runMethod(created, id) {
  const impl = select(created, id)
  if (id === 'describe') {
    // System.out.print(name + ": "); speak();  — `name` is Animal's field; speak() is dispatched on the object.
    const speak = select(created, 'speak')
    return { impl, lines: [`${lookup('Animal', 'name').m.value}: ${speak.m.prints[0]}`], speak }
  }
  if (impl.m.superFirst) {
    const inherited = select(PARENT[impl.cls], id)
    return { impl, lines: [...inherited.m.prints, ...impl.m.prints], inherited }
  }
  return { impl, lines: [...impl.m.prints] }
}

/**
 * Compile-time and run-time answers for `declared ref = new created();` followed by an access to `member`
 * through `ref`, cast to `cast` first when given.
 */
export function resolve({ declared, created, cast, member }) {
  const access = cast ? `((${cast}) ref)` : 'ref'
  const code = [`${declared} ref = new ${created}();`, member === 'name' ? `System.out.println(${access}.name);` : `${access}.${member}();`]
  const what = member === 'name' ? 'name' : `${member}()`

  // 1. The assignment: only a subtype's object fits in a variable (widening reference conversion, JLS §5.1.5).
  if (!isSubtype(created, declared)) {
    return {
      code,
      compile: {
        ok: false,
        line: 1,
        error: `incompatible types: ${created} cannot be converted to ${declared}`,
        note: `${Article(created)} is not ${article(declared)}, so it can't go in ${article(declared)} variable: the assignment doesn't compile. A subclass object fits in a superclass variable (upcasting is automatic); there's no automatic conversion the other way, or between siblings.`,
      },
    }
  }

  // 2. The cast: legal only between related types (JLS §5.5); checked again at run time.
  let type = declared
  const bytecode = []
  if (cast) {
    if (!isSubtype(cast, declared) && !isSubtype(declared, cast)) {
      return {
        code,
        compile: {
          ok: false,
          line: 2,
          error: `incompatible types: ${declared} cannot be converted to ${cast}`,
          note: `${declared} and ${cast} are unrelated classes (neither extends the other), so no object can be both: the compiler rejects the cast.`,
        },
      }
    }
    type = cast
    // javac emits checkcast only for a narrowing (down) cast; an identity or widening cast can't fail.
    if (cast !== declared && isSubtype(cast, declared)) bytecode.push(`checkcast ${cast}`)
  }

  // 3. Member lookup in the type of the expression.
  const found = lookup(type, member)
  if (!found || (member !== 'name' && found.m.kind === 'field')) {
    const hasIt = lookup(created, member)
    return {
      code,
      compile: {
        ok: false,
        line: 2,
        error: `cannot find symbol: ${member === 'name' ? 'variable name' : `method ${member}()`} (in type ${type})`,
        note: `The compiler looks ${what} up in ${type}, the type of the expression, not in the object's class. ${type} has no ${what}, so this doesn't compile${hasIt ? `, even though the object (${article(created)}) has one. A cast would make it visible: ((${hasIt.cls}) ref).${what}` : ''}.`,
      },
    }
  }

  const kind = found.m.kind
  const inherited = found.cls !== type ? `, inherited by ${type}` : ''
  let compileNote
  if (kind === 'field') {
    bytecode.push(`getfield ${type}.name:Ljava/lang/String;`)
    compileNote = `name is a field. Fields are never overridden, only hidden, so the compiler chooses the field right now from the type of the expression, ${type}: it's ${found.cls}.name${inherited}.`
  } else if (kind === 'static') {
    bytecode.push(`invokestatic ${type}.${member}:()V`)
    compileNote = `info() is static, so it belongs to a class, not to an object. The compiler binds the call now, from the type of the expression (${type}), to ${found.cls}.info()${inherited}. Calling a static method through a variable compiles (javac -Xlint:static warns about it); write ${found.cls}.info() instead.`
  } else {
    bytecode.push(`invokevirtual ${type}.${member}:()V`)
    compileNote =
      `The compiler only knows that the expression is ${article(type)}. It finds ${found.m.text} in ${found.cls}${inherited}, so the call compiles. ` +
      (kind === 'final'
        ? 'final means no subclass can override it, so only one implementation can ever run.'
        : 'It does not choose which implementation runs: it emits a virtual call, and the JVM picks the implementation from the object at run time.')
  }
  const compile = { ok: true, type, foundIn: found.cls, kind, bytecode, note: compileNote }

  // 4. Run time.
  if (cast && !isSubtype(created, cast)) {
    return {
      code,
      compile,
      runtime: {
        ok: false,
        objectClass: created,
        searched: [],
        output: [],
        exception: `java.lang.ClassCastException: class ${created} cannot be cast to class ${cast}`,
        note: `The cast compiles because ${cast} is a subclass of ${declared}, but the object is ${article(created)}, which is not ${article(cast)}. The check happens at run time (checkcast), and it fails: ClassCastException, before ${what} is reached.`,
      },
    }
  }
  let castNote = ''
  if (cast && cast !== declared) {
    castNote = isSubtype(cast, declared)
      ? `The cast is checked at run time (checkcast): ${article(created)} is ${article(cast)}, so it succeeds. `
      : `(${cast}) is an upcast, which can't fail, so nothing is checked at run time. `
  }
  if (kind === 'field') {
    const shadow = ancestors(created).find((c) => DECLARES[c].some((x) => x.id === 'name'))
    return {
      code,
      compile,
      runtime: {
        ok: true,
        objectClass: created,
        searched: [],
        selected: found.cls,
        output: [found.m.value],
        note: `${castNote}No dispatch happens for fields: the read uses the field the compiler chose, ${found.cls}.name${shadow !== found.cls ? `, although the object (${article(created)}) also has ${shadow}'s name field, which hides it` : ''}.`,
      },
    }
  }
  if (kind === 'static') {
    return {
      code,
      compile,
      runtime: {
        ok: true,
        objectClass: created,
        searched: [],
        selected: found.cls,
        output: [...found.m.prints],
        note: `${castNote}No object is consulted: the call was bound to ${found.cls}.info() at compile time. That the object is ${article(created)} makes no difference.`,
      },
    }
  }
  const run = runMethod(created, member)
  const { impl } = run
  let note = `${castNote}The object is ${article(created)}. The JVM looks for ${what} starting at ${created} and moving up: ${impl.path.join(' → ')}. `
  note += impl.cls === created ? `${created} declares it, so ${impl.cls}.${what} runs.` : `The first class that declares it is ${impl.cls}, so ${impl.cls}.${what} runs.`
  if (kind === 'final') note = `${castNote}The object is ${article(created)}. breathe() is final in Animal, so no subclass has its own version: Animal.breathe() runs.`
  if (member === 'describe') {
    note += ` Inside it, name means Animal's field (fields are chosen at compile time), but speak() is a virtual call on this, so the object's own version runs: ${run.speak.cls}.speak().`
  }
  if (run.inherited) {
    note += ` Its first statement, super.eat(), is not dynamically dispatched: it calls the eat() that ${impl.cls} inherits from ${PARENT[impl.cls]}, which is ${run.inherited.cls}.eat().`
  }
  return {
    code,
    compile,
    runtime: { ok: true, objectClass: created, searched: impl.path, selected: impl.cls, speakFrom: run.speak?.cls, output: run.lines, note },
  }
}

/**
 * The object's method table, the way HotSpot lays out a vtable: one slot per overridable method, the parent's slots
 * first; an override replaces the slot's target. final, static and private methods need no slot.
 */
export function methodTable(created) {
  const slots = []
  for (const c of ancestors(created).reverse()) {
    for (const m of DECLARES[c]) {
      if (m.kind !== 'method') continue
      const slot = slots.find((s) => s.id === m.id)
      if (slot) slot.impl = c
      else slots.push({ id: m.id, text: m.text, introducedBy: c, impl: c })
    }
  }
  return slots
}
