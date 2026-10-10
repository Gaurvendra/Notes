import { useMemo, useState } from 'react'
import { CREATABLE, DECLARES, MEMBERS, PARENT, SOURCE, TYPES, methodTable, resolve, type ClassName, type Creatable, type MemberId } from '../../lib/dispatch.mjs'
import { Arrow, PAL, Txt } from '../svg'
import { CodeView } from './CodeView'

/* -------------------------------------------------------------- hierarchy */

const HEAD = 22
const ROW = 14
const BOX: Record<ClassName, { x: number; y: number; w: number }> = {
  Object: { x: 92, y: 6, w: 160 },
  Animal: { x: 77, y: 96, w: 190 },
  Dog: { x: 4, y: 228, w: 166 },
  Cat: { x: 176, y: 228, w: 164 },
  Puppy: { x: 4, y: 332, w: 166 },
}
const height = (c: ClassName) => HEAD + ROW * DECLARES[c].length + 6

interface Marks {
  staticType?: ClassName
  objectClass?: ClassName
  searched: ClassName[]
  compileRow?: [ClassName, string]
  runRows: [ClassName, string][]
}

function Hierarchy({ marks }: { marks: Marks }) {
  const classes = Object.keys(BOX) as ClassName[]
  const onPath = (child: ClassName) => {
    const i = marks.searched.indexOf(child)
    return i >= 0 && i < marks.searched.length - 1 && marks.searched[i + 1] === PARENT[child]
  }
  return (
    <svg viewBox="0 0 344 394" width="100%" style={{ minWidth: 300 }} role="img" aria-labelledby="dispatch-tree-title">
      <title id="dispatch-tree-title">
        Class hierarchy: Object, Animal extends Object, Dog and Cat extend Animal, Puppy extends Dog. Each box lists what the
        class declares.
      </title>
      {classes
        .filter((c) => PARENT[c])
        .map((c) => {
          const p = PARENT[c] as ClassName
          const b = BOX[c]
          const pb = BOX[p]
          const hot = onPath(c)
          return (
            <Arrow
              key={c}
              x1={b.x + b.w / 2}
              y1={b.y - 2}
              x2={pb.x + pb.w / 2 + (c === 'Dog' ? -30 : c === 'Cat' ? 30 : 0)}
              y2={pb.y + height(p) + 2}
              color={hot ? PAL.amber : PAL.dim}
              dashed={!hot}
            />
          )
        })}
      {classes.map((c) => {
        const b = BOX[c]
        const h = height(c)
        const isType = marks.staticType === c
        const isObject = marks.objectClass === c
        return (
          <g key={c}>
            {isObject && <rect x={b.x - 3.5} y={b.y - 3.5} width={b.w + 7} height={h + 7} rx={9} fill="none" stroke={PAL.magenta} strokeWidth={2} />}
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={h}
              rx={7}
              fill={PAL.surface}
              stroke={isType ? PAL.cyan : marks.searched.includes(c) ? PAL.amber : PAL.border}
              strokeWidth={isType ? 2 : 1.2}
              strokeDasharray={!isType && marks.searched.includes(c) ? '4 3' : undefined}
            />
            <Txt x={b.x + 8} y={b.y + 15} size={10.5} color={PAL.ink} weight={700}>
              {c}
            </Txt>
            {PARENT[c] && (
              <Txt x={b.x + 8 + c.length * 7 + 6} y={b.y + 15} size={8.5} color={PAL.dim}>
                extends {PARENT[c]}
              </Txt>
            )}
            {DECLARES[c].map((m, i) => {
              const y = b.y + HEAD + i * ROW
              const compile = marks.compileRow?.[0] === c && marks.compileRow[1] === m.id
              const runIndex = marks.runRows.findIndex(([rc, rid]) => rc === c && rid === m.id)
              const runs = runIndex >= 0
              return (
                <g key={m.id}>
                  {(compile || runs) && (
                    <rect
                      x={b.x + 3}
                      y={y}
                      width={b.w - 6}
                      height={ROW - 1}
                      rx={3}
                      fill={runs ? PAL.mint : PAL.cyan}
                      fillOpacity={runs && runIndex > 0 ? 0.1 : 0.2}
                      stroke={compile ? PAL.cyan : 'none'}
                      strokeWidth={1}
                    />
                  )}
                  <Txt x={b.x + 8} y={y + 10} size={9.5} color={runs ? PAL.mint : compile ? PAL.cyan : c === 'Object' ? PAL.dim : PAL.muted}>
                    {m.text}
                  </Txt>
                  {(m.overrides || m.hides) && (
                    <Txt x={b.x + b.w - 7} y={y + 10} size={7.5} anchor="end" color={PAL.dim}>
                      {m.overrides ? 'overrides' : 'hides'}
                    </Txt>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------------------------------------------------------------- pickers */

function Picker<T extends string>({
  label,
  options,
  value,
  onChange,
  render = (o) => o,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  render?: (o: T) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[6.5rem] shrink-0 text-xs text-ink-dim">{label}</span>
      <div className="inline-flex flex-wrap rounded-lg border border-cyber-border bg-surface-2 p-0.5" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`rounded-md px-2 py-1 font-mono text-[12px] transition-colors ${value === o ? 'bg-surface-3 text-cyan' : 'text-ink-muted hover:text-ink'}`}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- widget */

const CASTS = ['none', ...TYPES] as const
type CastOption = (typeof CASTS)[number]

/**
 * Dynamic dispatch visualiser: choose the variable's type, the object's class, an optional cast and what to call
 * (an overridden method, an inherited one, a final one, a static one, a field). The widget shows what the compiler
 * decides from the type of the expression (lookup, errors, the bytecode instruction) and what the JVM decides from
 * the object at run time (the search up the hierarchy, ClassCastException), on a picture of the class hierarchy.
 * The rules live in src/lib/dispatch.mjs and are checked on every build.
 */
export function DispatchLab({
  declared: d0 = 'Animal',
  created: c0 = 'Puppy',
  member: m0 = 'speak',
  cast: k0 = 'none',
}: {
  declared?: ClassName
  created?: Creatable
  member?: MemberId
  cast?: CastOption
}) {
  const [declared, setDeclared] = useState<ClassName>(d0)
  const [created, setCreated] = useState<Creatable>(c0)
  const [cast, setCast] = useState<CastOption>(k0)
  const [member, setMember] = useState<MemberId>(m0)
  const r = useMemo(() => resolve({ declared, created, cast: cast === 'none' ? null : cast, member }), [declared, created, cast, member])
  const memberLabel = (id: MemberId) => MEMBERS.find((m) => m.id === id)?.label ?? id

  const marks: Marks = { searched: [], runRows: [] }
  if (r.compile.ok) {
    marks.staticType = r.compile.type
    marks.compileRow = [r.compile.foundIn, member]
  } else if (r.compile.line === 2) {
    marks.staticType = cast === 'none' ? declared : (cast as ClassName)
  }
  if (r.compile.ok || r.compile.line === 2) marks.objectClass = created
  if (r.runtime?.ok) {
    marks.searched = r.runtime.searched
    if (r.runtime.selected) marks.runRows.push([r.runtime.selected, member])
    if (r.runtime.speakFrom) marks.runRows.push([r.runtime.speakFrom, 'speak'])
    if (member === 'eat' && r.runtime.selected === 'Puppy') marks.runRows.push(['Animal', 'eat'])
  }

  const table = methodTable(created)
  const virtualSelected = r.compile.ok && (r.compile.kind === 'method') && r.runtime?.ok

  return (
    <figure className="jx-dispatch my-5 rounded-xl border border-cyan/30 bg-surface p-4">
      <div className="space-y-2">
        <Picker label="Variable type" options={TYPES} value={declared} onChange={setDeclared} />
        <Picker label="Object" options={CREATABLE} value={created} onChange={setCreated} render={(o) => `new ${o}()`} />
        <Picker label="Cast first" options={CASTS} value={cast} onChange={setCast} render={(o) => (o === 'none' ? 'no cast' : `(${o})`)} />
        <Picker label="Use" options={MEMBERS.map((m) => m.id)} value={member} onChange={setMember} render={memberLabel} />
      </div>

      <div className="mt-3">
        <CodeView lines={r.code} current={r.compile.ok ? 2 : r.compile.line} title="in main" maxHeight={90} />
      </div>

      <div className="mt-4">
        <div className="min-w-0">
          <div className="overflow-x-auto rounded-lg border border-cyber-border bg-void/40 p-1.5">
            <div className="mx-auto max-w-[500px]">
              <Hierarchy marks={marks} />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-dim">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-cyan" aria-hidden="true" /> type the compiler uses
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-magenta" aria-hidden="true" /> the object&apos;s class
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-amber" aria-hidden="true" /> run-time search
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-mint/60" aria-hidden="true" /> the code that runs
            </span>
          </div>
        </div>

        <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
          <div className={`min-w-0 rounded-lg border p-3 ${r.compile.ok ? 'border-cyan/40 bg-cyan/5' : 'border-rose/50 bg-rose/5'}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-dim">1 · Compile time</span>
              <span className={`text-xs font-semibold ${r.compile.ok ? 'text-cyan' : 'text-rose'}`}>{r.compile.ok ? '✓ compiles' : '✗ compile error'}</span>
            </div>
            {!r.compile.ok && <p className="!mt-1.5 break-words font-mono text-[12px] text-rose">error: {r.compile.error}</p>}
            <p className="!mt-1.5 text-sm leading-relaxed text-ink" aria-live="polite">
              {r.compile.note}
            </p>
            {r.compile.ok && (
              <pre className="!mb-0 !mt-2 overflow-x-auto rounded-md !border-0 !bg-void/60 !px-2 !py-1.5 font-mono text-[11.5px] leading-relaxed text-ink-muted">
                {r.compile.bytecode.join('\n')}
              </pre>
            )}
          </div>

          <div className={`min-w-0 rounded-lg border p-3 ${!r.runtime ? 'border-cyber-border bg-surface-2 opacity-70' : r.runtime.ok ? 'border-mint/40 bg-mint/5' : 'border-rose/50 bg-rose/5'}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-dim">2 · Run time</span>
              {r.runtime && <span className={`text-xs font-semibold ${r.runtime.ok ? 'text-mint' : 'text-rose'}`}>{r.runtime.ok ? '✓ runs' : '✗ exception'}</span>}
            </div>
            <p className="!mt-1.5 text-sm leading-relaxed text-ink" aria-live="polite">
              {r.runtime ? r.runtime.note : "Nothing runs: a program that doesn't compile never gets this far."}
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-cyber-border bg-void px-3 py-2 md:col-span-2">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-dim">Output</div>
            <pre className="!m-0 min-h-[1.5em] whitespace-pre-wrap break-words !border-0 !bg-transparent !p-0 font-mono text-[12.5px] leading-relaxed">
              {!r.runtime ? (
                <span className="text-ink-dim">(none: it doesn&apos;t compile)</span>
              ) : r.runtime.ok ? (
                <span className="text-ink">{r.runtime.output.join('\n')}</span>
              ) : (
                <span className="text-rose">Exception in thread &quot;main&quot; {r.runtime.exception} (…)</span>
              )}
            </pre>
          </div>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-cyber-border bg-surface-2 px-3 py-2">
        <summary className="cursor-pointer text-sm text-ink-muted">How the JVM makes this fast: {created}&apos;s method table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="!my-0 w-full text-left text-[12.5px]">
            <thead>
              <tr className="text-ink-dim">
                <th className="py-1 pr-3 font-normal">Slot</th>
                <th className="py-1 pr-3 font-normal">Introduced by</th>
                <th className="py-1 font-normal">Implementation for a {created}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((s) => {
                const hot = virtualSelected && s.id === member
                return (
                  <tr key={s.id} className={hot ? 'bg-mint/10' : ''}>
                    <td className="py-0.5 pr-3 font-mono text-ink">{s.text}</td>
                    <td className="py-0.5 pr-3 font-mono text-ink-muted">{s.introducedBy}</td>
                    <td className={`py-0.5 font-mono ${hot ? 'text-mint' : s.impl === s.introducedBy ? 'text-ink-muted' : 'text-cyan'}`}>
                      {s.impl}.{s.id}()
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="!mt-2 text-xs leading-relaxed text-ink-dim">
          Searching up the hierarchy on every call would be slow, so HotSpot gives each class a table of its overridable
          methods (a <em>vtable</em>), built when the class is linked: a subclass starts with a copy of its parent&apos;s slots and
          overwrites the ones it overrides. A virtual call is then one indexed lookup. final, static and private methods
          need no slot: they have exactly one target. This is an implementation technique; the language only defines
          which method is selected.
        </p>
      </details>

      <details className="mt-2 rounded-lg border border-cyber-border bg-surface-2 px-3 py-2">
        <summary className="cursor-pointer text-sm text-ink-muted">The classes</summary>
        <div className="mt-2">
          <CodeView lines={SOURCE} title="Animals.java" maxHeight={320} />
        </div>
      </details>
      <figcaption className="mt-2 text-xs text-ink-dim">
        Compile-time rules: JLS §5.2, §5.5, §15.11.1 and §15.12; run-time selection: JLS §15.12.4.4 and JVMS §5.4.6. Every
        answer is checked on each build against cases worked out from the specification.
      </figcaption>
    </figure>
  )
}
