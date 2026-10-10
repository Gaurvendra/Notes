/**
 * Object initialisation order for the InitOrderLab widget. Each program is a few small classes described as data
 * (fields, static and instance blocks, constructors with an optional Java 25 prologue and an explicit or implicit
 * this(...)/super(...) call, instance methods). The engine renders the Java source from that model, then runs it the
 * way the JLS specifies:
 *
 *  - class initialisation (JLS §12.4.1, §12.4.2): just before the first `new`, superclass first, static field
 *    initialisers and static blocks in textual order, once per class;
 *  - instance creation (JLS §12.5): memory for every field of the object (inherited ones too) set to default values,
 *    then the constructor: its prologue (Java 25, JEP 513), the explicit or implicit this(...)/super(...) call
 *    processed recursively, then (only after a super(...) call) the class's instance initialisers and field
 *    initialisers in textual order, then the rest of the body;
 *  - dynamic dispatch for instance methods, including calls made from a superclass constructor (JLS §15.12.4.4).
 *
 * Pure functions, checked in scripts/check-content.mjs against hand-derived outputs. The engine also rejects a model
 * that wouldn't compile (reading the object or calling its methods in a prologue, assigning a field that has an
 * initialiser there, reading a superclass's private field), so a program can't silently drift from Java.
 */

const S = (text) => ({ str: text })
const N = (n) => ({ num: n })
const V = (name) => ({ ref: name })
const CAT = (...parts) => ({ cat: parts })

/* ------------------------------------------------------------------ programs */

const BLOCKS = {
  classes: [
    {
      name: 'Animal',
      members: [
        { kind: 'block', static: true, body: [{ print: S('Animal static block') }] },
        { kind: 'block', body: [{ print: S('Animal instance block') }] },
        { kind: 'ctor', params: [], body: [{ print: S('Animal constructor') }] },
      ],
    },
    {
      name: 'Dog',
      extends: 'Animal',
      members: [
        { kind: 'field', access: 'private', type: 'int', name: 'legs', init: N(4) },
        { kind: 'block', static: true, body: [{ print: S('Dog static block') }] },
        { kind: 'block', body: [{ print: CAT(S('Dog instance block, legs = '), V('legs')) }] },
        { kind: 'ctor', params: [], body: [{ print: S('Dog constructor') }] },
      ],
    },
  ],
  main: [{ print: S('main starts') }, { new: 'Dog', args: [] }, { print: S('second dog:') }, { new: 'Dog', args: [] }],
}

function overrideProgram(java25) {
  const assignStock = { set: 'stock', self: true, value: V('stock') }
  const printCtor = { print: S('Product constructor') }
  return {
    classes: [
      {
        name: 'Base',
        members: [
          { kind: 'ctor', params: [], body: [{ print: S('Base constructor') }, { invoke: 'describe' }] },
          { kind: 'method', returns: 'void', name: 'describe', body: [{ print: S('Base.describe') }] },
        ],
      },
      {
        name: 'Product',
        extends: 'Base',
        members: [
          { kind: 'field', access: 'private', type: 'String', name: 'name', init: S('pen') },
          { kind: 'field', access: 'private', final: true, type: 'int', name: 'stock' },
          {
            kind: 'ctor',
            params: [{ type: 'int', name: 'stock' }],
            prologue: java25 ? [{ ...assignStock, comment: 'Java 25: before super()' }] : [],
            call: { kind: 'super', args: [] },
            body: java25 ? [printCtor] : [assignStock, printCtor],
          },
          {
            kind: 'method',
            override: true,
            returns: 'void',
            name: 'describe',
            body: [{ print: CAT(S('name = '), V('name'), S(', stock = '), V('stock')) }],
          },
        ],
      },
    ],
    main: [{ new: 'Product', args: [N(5)], then: 'describe' }],
  }
}

const CHAINING = {
  classes: [
    {
      name: 'Pizza',
      members: [
        { kind: 'field', access: 'private', final: true, type: 'String', name: 'name' },
        { kind: 'field', access: 'private', final: true, type: 'int', name: 'size' },
        { kind: 'block', body: [{ print: S('instance block') }] },
        { kind: 'ctor', params: [], call: { kind: 'this', args: [S('Margherita')] }, body: [{ print: S('Pizza()') }] },
        {
          kind: 'ctor',
          params: [{ type: 'String', name: 'name' }],
          call: { kind: 'this', args: [V('name'), N(30)] },
          body: [{ print: S('Pizza(String)') }],
        },
        {
          kind: 'ctor',
          params: [
            { type: 'String', name: 'name' },
            { type: 'int', name: 'size' },
          ],
          body: [
            { set: 'name', self: true, value: V('name') },
            { set: 'size', self: true, value: V('size') },
            { print: CAT(S('Pizza(String, int): '), V('name'), S(', '), V('size')) },
          ],
        },
      ],
    },
  ],
  main: [
    { new: 'Pizza', args: [] },
    { new: 'Pizza', args: [S('Diavola')] },
  ],
}

const MODELS = {
  blocks: BLOCKS,
  override: overrideProgram(false),
  override25: overrideProgram(true),
  chaining: CHAINING,
}

/** The programs the widget offers. `override25` is the Java 25 variant of `override`, shown as a toggle. */
export const INIT_PROGRAMS = {
  blocks: { label: 'Static & instance blocks', summary: 'Two objects of a subclass: static code runs once, parent parts are built first.' },
  override: { label: 'Override called too early', summary: 'A superclass constructor calls a method the subclass overrides.' },
  override25: {
    label: 'Override called too early (Java 25)',
    summary: 'The same classes, with the field assigned in a prologue before super().',
    variantOf: 'override',
  },
  chaining: { label: 'this(...) chaining', summary: 'Constructors delegating to each other with this(...).' },
}

/* ------------------------------------------------------------------ source */

const javaString = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

function exprText(e) {
  if ('str' in e) return javaString(e.str)
  if ('num' in e) return String(e.num)
  if ('ref' in e) return e.self ? `this.${e.ref}` : e.ref
  if ('cat' in e) return e.cat.map(exprText).join(' + ')
  throw new Error(`unknown expression ${JSON.stringify(e)}`)
}

function stmtText(st) {
  let text
  if (st.print) text = `System.out.println(${exprText(st.print)});`
  else if (st.set) text = `${st.self ? 'this.' : ''}${st.set} = ${exprText(st.value)};`
  else if (st.invoke) text = `${st.invoke}();`
  else throw new Error(`unknown statement ${JSON.stringify(st)}`)
  return st.comment ? `${text}   // ${st.comment}` : text
}

const ctorLabel = (c, ctor) => `${c.name}(${ctor.params.map((p) => p.type).join(', ')})`

/** Renders the model as Java and records the line number of every member, statement and call. */
function render(model) {
  const lines = []
  const emit = (text) => lines.push(text)
  model.classes.forEach((c, ci) => {
    if (ci > 0) emit('')
    c.line = emit(`class ${c.name}${c.extends ? ` extends ${c.extends}` : ''} {`)
    c.members.forEach((m, mi) => {
      if (mi > 0 && !(m.kind === 'field' && c.members[mi - 1].kind === 'field')) emit('')
      if (m.kind === 'field') {
        const mods = [m.access, m.static && 'static', m.final && 'final'].filter(Boolean).join(' ')
        m.line = emit(`    ${mods ? `${mods} ` : ''}${m.type} ${m.name}${m.init ? ` = ${exprText(m.init)}` : ''};`)
      } else if (m.kind === 'block') {
        m.line = emit(`    ${m.static ? 'static ' : ''}{`)
        for (const st of m.body) st.line = emit(`        ${stmtText(st)}`)
        m.endLine = emit('    }')
      } else if (m.kind === 'ctor') {
        m.line = emit(`    ${c.name}(${m.params.map((p) => `${p.type} ${p.name}`).join(', ')}) {`)
        for (const st of m.prologue ?? []) st.line = emit(`        ${stmtText(st)}`)
        m.callLine = m.call
          ? emit(`        ${m.call.kind}(${m.call.args.map(exprText).join(', ')});`)
          : emit('        // super(); inserted by the compiler')
        for (const st of m.body) st.line = emit(`        ${stmtText(st)}`)
        m.endLine = emit('    }')
      } else if (m.kind === 'method') {
        if (m.override) emit('    @Override')
        m.line = emit(`    ${m.returns} ${m.name}() {`)
        for (const st of m.body) st.line = emit(`        ${stmtText(st)}`)
        m.endLine = emit('    }')
      } else throw new Error(`unknown member ${m.kind}`)
    })
    if (!c.members.some((m) => m.kind === 'ctor')) {
      const ctor = { kind: 'ctor', params: [], body: [], implicitDefault: true }
      emit('')
      ctor.line = ctor.callLine = emit(`    // default constructor: ${c.name}() { super(); }`)
      c.members.push(ctor)
    }
    c.endLine = emit('}')
  })
  emit('')
  emit('public class Main {')
  model.mainLine = emit('    public static void main(String[] args) {')
  for (const st of model.main) {
    st.line = st.new
      ? emit(`        new ${st.new}(${st.args.map(exprText).join(', ')})${st.then ? `.${st.then}()` : ''};`)
      : emit(`        ${stmtText(st)}`)
  }
  model.mainEnd = emit('    }')
  emit('}')
  return lines
}

/* --------------------------------------------------------------- execution */

const DEFAULTS = { int: 0, long: 0, short: 0, byte: 0, boolean: false }
const defaultOf = (type) => (type in DEFAULTS ? DEFAULTS[type] : null)
const show = (v) => (v === null ? 'null' : typeof v === 'string' ? javaString(v) : String(v))
const text = (v) => (v === null ? 'null' : String(v))
const list = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`)

class Machine {
  constructor(model) {
    this.m = model
    this.cls = new Map(model.classes.map((c) => [c.name, c]))
    this.state = new Map(model.classes.map((c) => [c.name, 'uninitialised']))
    this.statics = new Map()
    this.objects = []
    this.frames = []
    this.out = []
    this.steps = []
    this.changed = new Set()
    this.pending = ''
    this.active = null
    this.explainedStatic = false
  }

  sup(c) {
    return c.extends ? this.cls.get(c.extends) : undefined
  }

  /** User classes from the top of the hierarchy down to `name` (Object itself is implicit). */
  chain(name) {
    const out = []
    for (let c = this.cls.get(name); c; c = this.sup(c)) out.unshift(c)
    return out
  }

  isSubclass(a, b) {
    for (let c = this.cls.get(a); c; c = this.sup(c)) if (c.name === b) return true
    return false
  }

  snap(kind, line, note) {
    const top = this.frames[this.frames.length - 1]
    if (top) top.line = line
    this.steps.push({
      kind,
      line,
      note: this.pending + note,
      out: [...this.out],
      classes: this.m.classes.map((c) => ({
        name: c.name,
        superName: c.extends ?? 'Object',
        state: this.state.get(c.name),
        statics:
          this.state.get(c.name) === 'uninitialised'
            ? []
            : c.members
                .filter((x) => x.kind === 'field' && x.static)
                .map((f) => ({
                  name: f.name,
                  type: f.type,
                  value: show(this.statics.get(`${c.name}.${f.name}`)),
                  changed: this.changed.has(`S:${c.name}.${f.name}`),
                })),
      })),
      objects: this.objects.map((o) => ({
        id: o.id,
        cls: o.cls,
        done: o.done,
        active: o === this.active,
        fields: o.layout.map((f) => ({
          owner: f.owner,
          name: f.name,
          type: f.type,
          final: f.final,
          value: show(o.values.get(f.key)),
          assigned: o.assigned.has(f.key),
          changed: this.changed.has(`O${o.id}:${f.key}`),
        })),
      })),
      frames: this.frames.map((f) => ({ label: f.label, kind: f.kind, line: f.line, detail: f.detail })).reverse(),
    })
    this.pending = ''
    this.changed = new Set()
    if (this.steps.length > 400) throw new Error('trace too long')
  }

  /** The field `name` as seen from code declared in class `from`: its own fields first, then inherited ones. */
  field(from, name) {
    for (let c = this.cls.get(from); c; c = this.sup(c)) {
      const f = c.members.find((x) => x.kind === 'field' && x.name === name)
      if (f) {
        if (c.name !== from && f.access === 'private') throw new Error(`${from} can't use ${c.name}'s private field ${name}`)
        return { owner: c.name, decl: f, key: `${c.name}.${name}` }
      }
    }
    throw new Error(`no field ${name} visible from ${from}`)
  }

  method(from, name) {
    for (let c = this.cls.get(from); c; c = this.sup(c)) {
      const m = c.members.find((x) => x.kind === 'method' && x.name === name)
      if (m) return { owner: c.name, decl: m }
    }
    throw new Error(`no method ${name}() visible from ${from}`)
  }

  ctorFor(c, arity) {
    const found = c.members.filter((x) => x.kind === 'ctor' && x.params.length === arity)
    if (found.length !== 1) throw new Error(`${c.name}: expected exactly one constructor with ${arity} parameter(s)`)
    return found[0]
  }

  /** Evaluates an expression; `defaults` collects the names of fields read before anything assigned them. */
  read(ctx, e, defaults) {
    if ('str' in e) return e.str
    if ('num' in e) return e.num
    if ('cat' in e) {
      let acc = this.read(ctx, e.cat[0], defaults)
      for (const part of e.cat.slice(1)) {
        const v = this.read(ctx, part, defaults)
        acc = typeof acc === 'string' || typeof v === 'string' || acc === null || v === null ? text(acc) + text(v) : acc + v
      }
      return acc
    }
    if ('ref' in e) {
      if (!e.self && ctx.locals.has(e.ref)) return ctx.locals.get(e.ref)
      const f = this.field(ctx.cls, e.ref)
      if (f.decl.static) return this.statics.get(f.key)
      if (ctx.early) throw new Error(`${ctx.cls}: reading the field ${e.ref} before super() doesn't compile`)
      if (!ctx.obj.assigned.has(f.key)) defaults.add(e.ref)
      return ctx.obj.values.get(f.key)
    }
    throw new Error(`unknown expression ${JSON.stringify(e)}`)
  }

  /** Assigns a field; returns the "x = value" text for the note. */
  assign(ctx, st) {
    const target = !st.self && ctx.locals.has(st.set) ? null : this.field(ctx.cls, st.set)
    if (!target) throw new Error(`${ctx.cls}: assigning the parameter ${st.set} isn't modelled`)
    const value = this.read(ctx, st.value, new Set())
    if (target.decl.static) {
      this.statics.set(target.key, value)
      this.changed.add(`S:${target.key}`)
    } else {
      if (ctx.early && (target.owner !== ctx.cls || target.decl.init)) {
        throw new Error(`${ctx.cls}: only fields of this class without an initialiser may be assigned before super()`)
      }
      ctx.obj.values.set(target.key, value)
      ctx.obj.assigned.add(target.key)
      this.changed.add(`O${ctx.obj.id}:${target.key}`)
    }
    return `${st.self ? 'this.' : ''}${st.set} = ${show(value)}`
  }

  printed(ctx, st) {
    const defaults = new Set()
    const value = text(this.read(ctx, st.print, defaults))
    this.out.push(value)
    return { value, defaults: [...defaults] }
  }

  /* ---------------------------------------------------------- class init */

  /** JLS §12.4.2: mark C in progress, initialise its superclass, then run C's static initialisers in textual order. */
  initClass(c) {
    if (this.state.get(c.name) !== 'uninitialised') return
    this.state.set(c.name, 'initialising')
    const parent = this.sup(c)
    if (parent && this.state.get(parent.name) === 'uninitialised') {
      this.initClass(parent)
      if (this.hasStaticCode(parent) && this.hasStaticCode(c)) this.pending += `${parent.name} is initialised. `
    }
    for (const f of c.members.filter((x) => x.kind === 'field' && x.static)) this.statics.set(`${c.name}.${f.name}`, defaultOf(f.type))
    const statics = c.members.filter((x) => x.static && (x.kind === 'block' || (x.kind === 'field' && x.init)))
    if (statics.length) this.frames.push({ label: `${c.name} static init`, kind: 'clinit', detail: 'runs once per class' })
    for (const m of statics) {
      const ctx = { cls: c.name, obj: null, locals: new Map(), early: false }
      const general = this.explainedStatic ? '' : ' Static initialisers run once per class, in textual order, while the class is initialised.'
      this.explainedStatic = true
      if (m.kind === 'field') {
        const v = this.read(ctx, m.init, new Set())
        this.statics.set(`${c.name}.${m.name}`, v)
        this.changed.add(`S:${c.name}.${m.name}`)
        this.snap('static', m.line, `${c.name}.${m.name} = ${show(v)}: a static field initialiser.${general}`)
      } else {
        for (const st of m.body) {
          if (st.print) {
            const { value } = this.printed(ctx, st)
            this.snap('static', st.line, `${c.name}'s static block prints "${value}".${general}`)
          } else if (st.set) {
            this.snap('static', st.line, `${c.name}'s static block: ${this.assign(ctx, st)}.${general}`)
          } else throw new Error('static blocks may only print or assign here')
        }
      }
    }
    if (statics.length) this.frames.pop()
    this.state.set(c.name, 'initialised')
  }

  hasStaticCode(c) {
    return c.members.some((x) => x.static && (x.kind === 'block' || (x.kind === 'field' && x.init)))
  }

  /* -------------------------------------------------------- construction */

  create(st) {
    const chain = this.chain(st.new)
    const pending = chain.filter((c) => this.state.get(c.name) === 'uninitialised')
    const leaf = chain[chain.length - 1]
    let classNote
    if (pending.length && pending.some((c) => this.hasStaticCode(c))) {
      for (const c of pending) this.state.set(c.name, 'initialising')
      this.snap(
        'clinit',
        st.line,
        `First use of ${leaf.name}: before the object can be created, the JVM initialises the class. ` +
          (pending.length > 1
            ? `A superclass is initialised first, so ${leaf.name} waits while ${list(pending.slice(0, -1).map((c) => c.name))} ${pending.length > 2 ? 'are' : 'is'} initialised.`
            : `Its superclass, ${leaf.extends ?? 'Object'}, is already initialised.`),
      )
      for (const c of pending) this.state.set(c.name, 'uninitialised')
      this.initClass(leaf)
      classNote = `${leaf.name} is initialised${pending.length > 1 ? ', too' : ''}. `
    } else if (pending.length) {
      this.initClass(leaf)
      classNote = `First use of ${leaf.name}: the JVM initialises ${list(pending.map((c) => c.name))} (${pending.length > 1 ? 'they have' : 'it has'} no static code to run). `
    } else {
      classNote = `${leaf.name} is already initialised, so no static code runs this time. `
    }

    const layout = chain.flatMap((c) =>
      c.members
        .filter((x) => x.kind === 'field' && !x.static)
        .map((f) => ({ owner: c.name, name: f.name, type: f.type, final: !!f.final, key: `${c.name}.${f.name}` })),
    )
    const obj = { id: this.objects.length + 1, cls: st.new, layout, values: new Map(layout.map((f) => [f.key, defaultOf(f.type)])), assigned: new Set(), done: false }
    this.objects.push(obj)
    const previous = this.active
    this.active = obj
    this.snap(
      'alloc',
      st.line,
      layout.length
        ? `${classNote}Memory for the new ${st.new} is allocated, and every field of the object${new Set(layout.map((f) => f.owner)).size > 1 ? ', including the ones declared in superclasses,' : ''} starts at its default value: ${list(layout.map((f) => `${f.owner === st.new ? '' : `${f.owner}.`}${f.name} = ${show(defaultOf(f.type))}`))}.`
        : `${classNote}Memory for the new ${st.new} is allocated. It has no fields, so there are no default values to set.`,
    )

    const mainCtx = { cls: 'Main', obj: null, locals: new Map(), early: false }
    const args = st.args.map((e) => this.read(mainCtx, e, new Set()))
    this.construct(obj, this.cls.get(st.new), args, 'new')
    obj.done = true
    this.active = previous
    this.snap(
      'done',
      st.line,
      `new ${st.new}(${st.args.map(exprText).join(', ')}) is complete: every constructor in the chain has finished, and the expression's value is a reference to the fully initialised ${st.new} #${obj.id}.`,
    )
    if (st.then) this.invoke({ cls: 'Main', obj, locals: new Map(), early: false }, st.then, st.line, 'main')
  }

  /** JLS §12.5 steps 1–5 for one constructor of class `c`. */
  construct(obj, c, args, via) {
    const ctor = this.ctorFor(c, args.length)
    const label = ctorLabel(c, ctor)
    const locals = new Map(ctor.params.map((p, i) => [p.name, args[i]]))
    const argText = list(ctor.params.map((p, i) => `${p.name} = ${show(args[i])}`))
    this.frames.push({ label, kind: 'ctor', detail: `this → ${obj.cls} #${obj.id}${argText ? ` · ${argText}` : ''}` })
    const opening = via === 'new' ? `${label} is invoked on the new object${argText ? ` with ${argText}` : ''}. ` : `${label} starts${argText ? ` with ${argText}` : ''}. `

    // Prologue (Java 25): statements before this(...)/super(...) that don't use the object, except to assign fields.
    const early = { cls: c.name, obj, locals, early: true }
    const prologue = ctor.prologue ?? []
    prologue.forEach((st, i) => {
      if (!st.set) throw new Error('only assignments are modelled in a prologue')
      const effect = this.assign(early, st)
      this.snap(
        'prologue',
        st.line,
        i === 0
          ? `${opening}Its first statement comes before super(): a prologue, allowed since Java 25 (JEP 513). Code here can't use the object being built, except to assign fields of this class that have no initialiser: ${effect}.`
          : `The prologue continues: ${effect}.`,
      )
    })

    const call = ctor.call ?? { kind: 'super', args: [], implicit: true }
    const callArgs = call.args.map((e) => this.read(early, e, new Set()))
    const parent = this.sup(c)
    const intro = prologue.length ? 'The prologue is done. ' : opening
    let target = 'Object()'
    if (call.kind === 'this') {
      target = ctorLabel(c, this.ctorFor(c, callArgs.length))
      this.snap(
        'ctor',
        ctor.callLine,
        `${intro}Its first statement, this(${call.args.map(exprText).join(', ')}), hands over to ${target} in the same class, which must finish before the rest of ${label} runs.`,
      )
      this.construct(obj, c, callArgs, 'this')
      this.pending += `${target} has returned to ${label}. `
    } else {
      if (parent) {
        target = ctorLabel(parent, this.ctorFor(parent, callArgs.length))
        const how = call.implicit
          ? `The compiler inserted super() as its first statement, so ${target} runs`
          : `${prologue.length ? 'Now ' : ''}super(${call.args.map(exprText).join(', ')}) runs ${target}`
        this.snap('ctor', ctor.callLine, `${intro}${how} before the rest of ${label}: a superclass part is always initialised before its subclass part.`)
        this.construct(obj, parent, callArgs, 'super')
        this.pending += `${target} has returned to ${label}. `
      } else {
        const how = call.implicit || ctor.implicitDefault ? 'The compiler inserted super() as its first statement, and it' : 'Its super() call'
        this.snap('ctor', ctor.callLine, `${intro}${how} runs Object(), which does nothing visible and returns at once.`)
      }
      this.instanceInit(obj, c, via === 'this')
    }

    const ctx = { cls: c.name, obj, locals, early: false }
    ctor.body.forEach((st, i) => {
      const lead = i === 0 ? `Now the rest of ${label}'s body runs: ` : ''
      if (st.print) {
        const { value } = this.printed(ctx, st)
        this.snap('body', st.line, `${lead}${lead ? 'it prints' : 'It prints'} "${value}".`)
      } else if (st.set) {
        const effect = this.assign(ctx, st)
        this.snap('body', st.line, lead ? `${lead}${effect}.` : `Then ${effect}.`)
      } else if (st.invoke) {
        this.invoke(ctx, st.invoke, st.line, label)
      }
    })
    this.frames.pop()
  }

  /** JLS §12.5 step 4: instance initialisers and instance field initialisers of `c`, in textual order. */
  instanceInit(obj, c, chained) {
    const inits = c.members.filter((x) => !x.static && ((x.kind === 'field' && x.init) || x.kind === 'block'))
    const ctx = { cls: c.name, obj, locals: new Map(), early: false }
    const opening = `Now ${c.name}'s instance initialisers run, in textual order${chained ? ' (here, in the constructor that calls super(), so once per object however many constructors are chained)' : ''}: `
    let first = true
    for (const m of inits) {
      const lead = first ? opening : 'Then '
      if (m.kind === 'field') {
        const effect = this.assign(ctx, { set: m.name, value: m.init })
        this.snap('init', m.line, `${lead}${effect} (a field initialiser).`)
        first = false
      } else {
        for (const st of m.body) {
          const lead2 = first ? opening : 'Then '
          if (st.print) {
            const { value } = this.printed(ctx, st)
            this.snap('init', st.line, `${lead2}the instance block prints "${value}".`)
          } else if (st.set) {
            this.snap('init', st.line, `${lead2}the instance block assigns ${this.assign(ctx, st)}.`)
          } else throw new Error('instance blocks may only print or assign here')
          first = false
        }
      }
    }
  }

  /** A call to an instance method on `ctx.obj`: compile-time lookup from the calling code's class, dynamic dispatch. */
  invoke(ctx, name, line, caller) {
    if (ctx.early) throw new Error(`${ctx.cls}: calling ${name}() before super() doesn't compile`)
    if (ctx.cls !== 'Main') this.method(ctx.cls, name)
    const obj = ctx.obj
    let impl
    for (let c = this.cls.get(obj.cls); c && !impl; c = this.sup(c)) {
      if (c.members.some((x) => x.kind === 'method' && x.name === name)) impl = c
    }
    if (!impl) throw new Error(`${obj.cls} has no ${name}()`)
    const early = !obj.done && ctx.cls !== 'Main' && impl.name !== ctx.cls && this.isSubclass(impl.name, ctx.cls)
    const who = caller === 'main' ? `${name}() is called on the finished ${obj.cls}` : `${caller} calls ${name}() on the object being built`
    this.snap(
      'call',
      line,
      `${who}. The object is a ${obj.cls}, so dynamic dispatch picks ${impl.name}.${name}()${early ? `, even though ${impl.name}'s part of the object hasn't been initialised yet` : ''}.`,
    )
    const decl = impl.members.find((x) => x.kind === 'method' && x.name === name)
    const label = `${impl.name}.${name}()`
    this.frames.push({ label, kind: 'method', detail: `this → ${obj.cls} #${obj.id}` })
    const mctx = { cls: impl.name, obj, locals: new Map(), early: false }
    for (const st of decl.body) {
      if (!st.print) throw new Error('methods may only print here')
      const { value, defaults } = this.printed(mctx, st)
      const why = defaults.length
        ? `: ${list(defaults)} ${defaults.length > 1 ? 'are' : 'is'} still at the default value, because ${defaults.length > 1 ? 'their initialisers or assignments haven\'t' : 'its initialiser or assignment hasn\'t'} run yet`
        : ''
      this.snap('method', st.line, `${label} prints "${value}"${why}.`)
    }
    this.frames.pop()
    this.pending += `${label} has returned. `
  }

  /* ---------------------------------------------------------------- main */

  run() {
    const names = this.m.classes.map((c) => c.name)
    this.frames.push({ label: 'main', kind: 'main', detail: 'String[] args' })
    this.snap(
      'start',
      this.m.mainLine,
      `The JVM initialises Main (it has no static code) and calls main. ${list(names)} ${names.length > 1 ? "aren't" : "isn't"} initialised yet: a class is initialised just before its first use, such as new.`,
    )
    const ctx = { cls: 'Main', obj: null, locals: new Map(), early: false }
    for (const st of this.m.main) {
      if (st.new) this.create(st)
      else if (st.print) {
        const { value } = this.printed(ctx, st)
        this.snap('print', st.line, `main prints "${value}".`)
      } else throw new Error('main may only print or create objects here')
    }
    this.frames.pop()
    this.snap('end', this.m.mainEnd, 'main returns, and the program ends.')
  }
}

/** The program's Java source, its step-by-step trace and its complete output. */
export function initTrace(id) {
  const model = structuredClone(MODELS[id])
  if (!model) throw new Error(`unknown program ${id}`)
  const source = render(model)
  const machine = new Machine(model)
  machine.run()
  return { source, steps: machine.steps, output: machine.out }
}
