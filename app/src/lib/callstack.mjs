/**
 * Call-stack traces for the CallStackLab widget. Each program is a small recursive Java class, mirrored here in
 * JavaScript and run step by step. Every step is a snapshot: the frames (top of the stack first), the current line,
 * the output so far and a note. Pure functions, checked in scripts/check-content.mjs (results, call counts, depths).
 *
 * Java semantics that matter here: every call pushes a new frame with its own copies of the parameters; a frame is
 * popped when its method returns; a thread's stack has a fixed size, so unbounded recursion ends in
 * StackOverflowError (JLS §15.12.4, JVMS §2.5.2). `long` arithmetic wraps at 64 bits.
 */

const OVERFLOW = Symbol('StackOverflowError')

class Tracer {
  constructor(cap, maxSteps = 4000) {
    this.cap = cap
    this.maxSteps = maxSteps
    this.stack = []
    this.steps = []
    this.out = []
    this.calls = 0
    this.maxDepth = 0
  }

  top() {
    return this.stack[this.stack.length - 1]
  }

  snap(kind, line, note) {
    const top = this.top()
    if (top) top.line = line
    this.steps.push({
      kind,
      line,
      note,
      out: [...this.out],
      frames: this.stack.map((f) => ({ method: f.method, args: { ...f.args }, line: f.line, waiting: f.waiting })).reverse(),
      depth: this.stack.length,
      calls: this.calls,
      maxDepth: this.maxDepth,
    })
    if (this.steps.length > this.maxSteps) throw new Error('trace too long')
  }

  at(line, note) {
    this.snap('line', line, note)
  }

  print(line, text, note) {
    this.out.push(text)
    this.snap('print', line, note)
  }

  /** The JVM calls main: the first frame on the thread's stack. */
  enterMain(line, note) {
    this.stack.push({ method: 'main', args: { args: 'String[0]' }, line, waiting: null })
    this.maxDepth = Math.max(this.maxDepth, 1)
    this.snap('call', line, note)
  }

  exitMain(line, note) {
    this.stack.pop()
    this.snap('end', line, note)
  }

  /**
   * A call from the top frame (paused at `line`, waiting on `waiting`) to `method(args)`, whose body starts at
   * `decl`. Pushes a frame, runs `body`, pops the frame and returns the result to the caller.
   */
  call({ method, args, decl, line, waiting, note }, body) {
    const caller = this.top()
    caller.line = line
    caller.waiting = waiting
    if (this.stack.length >= this.cap) {
      this.snap('overflow', line, `${caller.method}(${argText(caller.args)}) calls ${method}(${argText(args)}), but the thread's stack has no room for another frame: the JVM throws StackOverflowError.`)
      throw OVERFLOW
    }
    this.stack.push({ method, args, line: decl, waiting: null })
    this.calls++
    this.maxDepth = Math.max(this.maxDepth, this.stack.length)
    this.snap('call', decl, note)
    const result = body()
    this.stack.pop()
    const back = this.top()
    back.waiting = null
    const value = result === undefined ? '' : ` ${result}`
    this.snap(
      'return',
      line,
      `${method}(${argText(args)}) ${result === undefined ? 'finishes' : `returned${value}`}: its frame is popped, and ${back.method}${back.method === 'main' ? '' : `(${argText(back.args)})`} continues at line ${line}.`,
    )
    return result
  }
}

function argText(args) {
  return Object.entries(args)
    .filter(([k]) => k !== 'args')
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ')
}

/* ------------------------------------------------------------------ programs */

function factorialSource(n) {
  return [
    'public class Factorial {',
    '    static long factorial(int n) {',
    '        if (n <= 1) {',
    '            return 1;',
    '        }',
    '        return n * factorial(n - 1);',
    '    }',
    '',
    '    public static void main(String[] args) {',
    `        System.out.println(factorial(${n}));`,
    '    }',
    '}',
  ]
}

function factorialTrace(n, t) {
  const fact = (k) => {
    t.at(3, `n is ${k}, so n <= 1 is ${k <= 1}${k <= 1 ? ': the base case.' : '.'}`)
    if (k <= 1) {
      t.at(4, 'return 1: this call finishes without calling anything else.')
      return 1n
    }
    const r = t.call(
      {
        method: 'factorial',
        args: { n: k - 1 },
        decl: 2,
        line: 6,
        waiting: `${k} * factorial(${k - 1})`,
        note: `To compute ${k} * factorial(${k - 1}) it must first call factorial(${k - 1}). This frame pauses at line 6, and a new frame with its own n = ${k - 1} is pushed on top.`,
      },
      () => fact(k - 1),
    )
    const exact = BigInt(k) * r
    const v = BigInt.asIntN(64, exact)
    t.at(
      6,
      `factorial(${k - 1}) gave ${r}, so this frame computes ${k} * ${r} = ${v} and returns it.` +
        (v !== exact ? ' The true product needs more than 64 bits, so the long wraps around (overflow, no error).' : ''),
    )
    return v
  }
  t.enterMain(9, `The JVM calls main: its frame is the first one on this thread's stack.`)
  const r = t.call(
    { method: 'factorial', args: { n }, decl: 2, line: 10, waiting: `println(factorial(${n}))`, note: `main calls factorial(${n}): a new frame, with its own parameter n = ${n}, is pushed on top.` },
    () => fact(n),
  )
  t.print(10, String(r), `println prints ${r}.`)
  t.exitMain(11, `main returns: its frame is popped, the stack is empty and the program ends.`)
}

function countDownSource(n) {
  return [
    'public class CountDown {',
    '    static void countDown(int n) {',
    '        if (n == 0) {',
    '            System.out.println("Liftoff!");',
    '            return;',
    '        }',
    '        System.out.println(n);',
    '        countDown(n - 1);',
    '        System.out.println("back in " + n);',
    '    }',
    '',
    '    public static void main(String[] args) {',
    `        countDown(${n});`,
    '    }',
    '}',
  ]
}

function countDownTrace(n, t) {
  const down = (k) => {
    t.at(3, `n is ${k}, so n == 0 is ${k === 0}.`)
    if (k === 0) {
      t.print(4, 'Liftoff!', 'The base case prints Liftoff!')
      t.at(5, 'return: this is the deepest frame, and the first one to finish.')
      return undefined
    }
    t.print(7, String(k), `Prints ${k} on the way down, before the recursive call.`)
    t.call(
      {
        method: 'countDown',
        args: { n: k - 1 },
        decl: 2,
        line: 8,
        waiting: `countDown(${k - 1})`,
        note: `Calls countDown(${k - 1}) and pauses at line 8; line 9 of this frame runs only after that call returns.`,
      },
      () => down(k - 1),
    )
    t.print(9, `back in ${k}`, `Back in the frame with n = ${k}: its n was never changed by the deeper calls (each frame has its own copy).`)
    return undefined
  }
  t.enterMain(12, `The JVM calls main: its frame is the first one on this thread's stack.`)
  t.call(
    { method: 'countDown', args: { n }, decl: 2, line: 13, waiting: `countDown(${n})`, note: `main calls countDown(${n}): a new frame with n = ${n} is pushed.` },
    () => down(n),
  )
  t.exitMain(14, `main returns: the stack is empty and the program ends.`)
}

function fibSource(n) {
  return [
    'public class Fib {',
    '    static int fib(int n) {',
    '        if (n < 2) {',
    '            return n;',
    '        }',
    '        return fib(n - 1) + fib(n - 2);',
    '    }',
    '',
    '    public static void main(String[] args) {',
    `        System.out.println(fib(${n}));`,
    '    }',
    '}',
  ]
}

function fibTrace(n, t) {
  const seen = new Map()
  const fib = (k) => {
    seen.set(k, (seen.get(k) ?? 0) + 1)
    t.at(3, `n is ${k}, so n < 2 is ${k < 2}${k < 2 ? ': the base case.' : '.'}`)
    if (k < 2) {
      t.at(4, `return ${k}.`)
      return k
    }
    const a = t.call(
      {
        method: 'fib',
        args: { n: k - 1 },
        decl: 2,
        line: 6,
        waiting: `fib(${k - 1}) + fib(${k - 2})`,
        note: `The left operand first (Java evaluates left to right): fib(${k - 1}) gets a new frame.`,
      },
      () => fib(k - 1),
    )
    const b = t.call(
      {
        method: 'fib',
        args: { n: k - 2 },
        decl: 2,
        line: 6,
        waiting: `${a} + fib(${k - 2})`,
        note: `The left operand gave ${a}; now the right operand, fib(${k - 2}), gets its own frame.`,
      },
      () => fib(k - 2),
    )
    t.at(6, `${a} + ${b} = ${a + b}: return it.`)
    return a + b
  }
  t.enterMain(9, `The JVM calls main: its frame is the first one on this thread's stack.`)
  const r = t.call(
    { method: 'fib', args: { n }, decl: 2, line: 10, waiting: `println(fib(${n}))`, note: `main calls fib(${n}): a new frame with n = ${n} is pushed.` },
    () => fib(n),
  )
  const repeats = [...seen.entries()].filter(([, c]) => c > 1).sort((x, y) => y[1] - x[1])
  t.print(
    10,
    String(r),
    `println prints ${r}. That took ${t.calls} calls of fib` +
      (repeats.length
        ? `, because the same values were computed again and again (${repeats.map(([k, c]) => `fib(${k}) ${c}×`).join(', ')}): naive recursive fib grows exponentially.`
        : '.'),
  )
  t.exitMain(11, `main returns: the stack is empty and the program ends.`)
}

function overflowSource() {
  return [
    'public class Deep {',
    '    static int depth(int n) {',
    '        return depth(n + 1);   // no base case',
    '    }',
    '',
    '    public static void main(String[] args) {',
    '        depth(1);',
    '    }',
    '}',
  ]
}

function overflowTrace(_cap, t) {
  const depth = (k) => {
    t.at(3, `depth(${k}) calls depth(${k + 1}) straight away: there is no base case to stop it.`)
    return t.call(
      { method: 'depth', args: { n: k + 1 }, decl: 2, line: 3, waiting: `depth(${k + 1})`, note: `Another frame, n = ${k + 1}. Nothing has returned yet, so every frame is still on the stack.` },
      () => depth(k + 1),
    )
  }
  t.enterMain(6, `The JVM calls main: its frame is the first one on this thread's stack.`)
  try {
    t.call({ method: 'depth', args: { n: 1 }, decl: 2, line: 7, waiting: 'depth(1)', note: 'main calls depth(1).' }, () => depth(1))
  } catch (e) {
    if (e !== OVERFLOW) throw e
    t.stack.length = 0
    t.out.push('Exception in thread "main" java.lang.StackOverflowError')
    t.out.push('\tat Deep.depth(Deep.java:3)')
    t.out.push('\tat Deep.depth(Deep.java:3)')
    t.snap('end', 3, 'Nothing catches the error, so every frame is unwound and the thread dies. The stack trace repeats the same line for every frame (shortened here).')
  }
}

/** The programs of the lab: Java source (for an argument), the argument's range, and the tracer. */
export const PROGRAMS = {
  factorial: { label: 'factorial', argLabel: 'n', min: 0, max: 25, initial: 4, source: factorialSource, run: factorialTrace },
  countDown: { label: 'countDown', argLabel: 'n', min: 0, max: 6, initial: 3, source: countDownSource, run: countDownTrace },
  fib: { label: 'fib', argLabel: 'n', min: 0, max: 7, initial: 4, source: fibSource, run: fibTrace },
  overflow: { label: 'no base case', argLabel: 'stack size (frames)', min: 4, max: 14, initial: 8, source: overflowSource, run: overflowTrace },
}

/** Runs a program and returns its source lines and every step. For `overflow` the argument is the stack size. */
export function trace(programId, arg) {
  const p = PROGRAMS[programId]
  if (!p) throw new Error(`unknown program ${programId}`)
  const a = Math.max(p.min, Math.min(p.max, Math.trunc(arg)))
  const t = new Tracer(programId === 'overflow' ? a : 64)
  p.run(a, t)
  return { source: p.source(a), steps: t.steps, arg: a }
}
