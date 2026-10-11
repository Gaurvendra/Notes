/** Diagrams for the "Constructor Chaining & Init Order" lesson. */
import { Figure } from '../mdx/diagrams'
import { PAL, Txt } from '../svg'

const SIZE = 10.5
const ROW = 24

/** A numbered step: a small circle with the number, then the text. */
function Step({ x, y, n, text, color = PAL.ink }: { x: number; y: number; n: number; text: string; color?: string }) {
  return (
    <g>
      <circle cx={x + 8} cy={y - 3.5} r={8} fill="none" stroke={color} strokeWidth={1.2} />
      <Txt x={x + 8} y={y} size={9.5} color={color} anchor="middle" weight={700}>
        {n}
      </Txt>
      <Txt x={x + 24} y={y} size={SIZE} color={color}>
        {text}
      </Txt>
    </g>
  )
}

/** The order of `new Manager("Ann", 3)`: constructor calls nest, initialisers run right after each super call returns. */
export function ConstructorNesting() {
  const top = 34
  const managerY = top + 2 * (ROW + 14)
  const employeeY = managerY + 26 + ROW
  const employeeH = 26 + 3 * ROW + 6
  const afterEmployee = employeeY + employeeH + 22
  const managerH = afterEmployee + ROW + 8 - managerY
  const lastY = managerY + managerH + 12
  const height = lastY + 30 + 8
  return (
    <Figure caption={`new Manager("Ann", 3), in order. Constructor calls nest: Manager's constructor can't do its own work until Employee's has finished, and Employee's waits for Object's. Each class's field initialisers and instance blocks run right after its super(...) call returns, then the rest of its constructor. Since Java 25 a constructor may run a prologue before its super(...) call (step 3): checks and preparation that don't touch the object. Prologues run from the subclass towards Object, bodies from Object back down to the subclass.`}>
      <svg viewBox={`0 0 400 ${height}`} width="100%" style={{ minWidth: 320, maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-labelledby="ctor-nesting-title">
        <title id="ctor-nesting-title">
          Creating new Manager("Ann", 3) runs nine steps. 1: the first new initialises the classes, Employee's statics then
          Manager's. 2: memory is allocated and every field starts at 0, false or null. 3: Manager's prologue (Java 25)
          checks the arguments. 4: super(name) runs Employee's constructor, which first calls Object(). 5: Employee's field
          initialisers and instance blocks run. 6: the rest of Employee's constructor runs. 7: Manager's field initialisers
          and instance blocks run. 8: the rest of Manager's constructor runs. 9: new yields the reference.
        </title>
        <Txt x={200} y={20} size={12} color={PAL.cyan} anchor="middle" weight={700}>
          {'new Manager("Ann", 3)'}
        </Txt>

        <rect x={8} y={top} width={384} height={ROW + 6} rx={7} fill={PAL.surface} stroke={PAL.border} strokeWidth={1} />
        <Step x={16} y={top + 20} n={1} text="first new only: Employee statics, then Manager's" color={PAL.amber} />
        <rect x={8} y={top + ROW + 14} width={384} height={ROW + 6} rx={7} fill={PAL.surface} stroke={PAL.border} strokeWidth={1} />
        <Step x={16} y={top + ROW + 34} n={2} text="allocate: every field is 0, false or null" color={PAL.muted} />

        <rect x={8} y={managerY} width={384} height={managerH} rx={9} fill={PAL.surface} stroke={PAL.magenta} strokeWidth={1.4} />
        <Txt x={20} y={managerY + 18} size={11.5} color={PAL.magenta} weight={700}>
          Manager(String name, int reports)
        </Txt>
        <Step x={20} y={managerY + 26 + 15} n={3} text="prologue (Java 25): check reports" color={PAL.mint} />

        <rect x={30} y={employeeY} width={350} height={employeeH} rx={8} fill={PAL.void} stroke={PAL.cyan} strokeWidth={1.3} />
        <Txt x={42} y={employeeY + 18} size={11} color={PAL.cyan} weight={700}>
          super(name): Employee(String name)
        </Txt>
        <Step x={42} y={employeeY + 26 + 15} n={4} text="its super() runs Object()" />
        <Step x={42} y={employeeY + 26 + 15 + ROW} n={5} text="Employee's initialisers, top to bottom" />
        <Step x={42} y={employeeY + 26 + 15 + 2 * ROW} n={6} text="the rest of Employee(...)" />

        <Step x={20} y={afterEmployee} n={7} text="Manager's initialisers, top to bottom" />
        <Step x={20} y={afterEmployee + ROW} n={8} text="the rest of Manager(...)" />

        <rect x={8} y={lastY} width={384} height={30} rx={7} fill={PAL.surface} stroke={PAL.mint} strokeWidth={1.2} />
        <Step x={16} y={lastY + 20} n={9} text="new yields the reference" color={PAL.mint} />
      </svg>
    </Figure>
  )
}
