/** Diagrams for "The OOP Mindset" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** One class, many objects: each with its own state, the same behaviour, and its own identity. */
export function ClassAndObjects() {
  const dogs = [
    { x: 20, name: 'tommy', breed: 'Labrador', age: 3, colour: 'golden' },
    { x: 230, name: 'rex', breed: 'Beagle', age: 5, colour: 'tricolour' },
    { x: 440, name: 'bella', breed: 'Labrador', age: 3, colour: 'golden' },
  ]
  return (
    <Figure caption="The class Dog is the blueprint: which fields every dog has and what every dog can do. Each new Dog(…) creates an object with its own values for those fields. tommy and bella have equal state, but they are two different objects: each object has its own identity.">
      <svg viewBox="0 0 640 330" width="100%" style={{ minWidth: 540 }} role="img" aria-labelledby="class-objects-title">
        <title id="class-objects-title">The Dog class as a blueprint and three Dog objects created from it</title>
        <Box x={205} y={10} w={230} h={112} color={PAL.magenta} />
        <Txt x={320} y={30} anchor="middle" mono={false} size={12} color={PAL.magenta} weight={600}>
          class Dog
        </Txt>
        <line x1={213} y1={38} x2={427} y2={38} stroke={PAL.magenta} strokeOpacity={0.4} />
        <Txt x={232} y={54} size={9.5}>
          String name · String breed
        </Txt>
        <Txt x={232} y={68} size={9.5}>
          int age · String colour
        </Txt>
        <line x1={213} y1={78} x2={427} y2={78} stroke={PAL.magenta} strokeOpacity={0.4} />
        <Txt x={232} y={94} size={9.5}>
          bark() · sleep() · eat()
        </Txt>
        <Txt x={232} y={110} size={9} color={PAL.dim}>
          fields = state · methods = behaviour
        </Txt>
        {dogs.map((d, i) => (
          <g key={d.name}>
            <Arrow x1={320} y1={122} x2={d.x + 90} y2={178} color={PAL.cyan} label={i === 1 ? 'new Dog(…)' : undefined} labelDy={-6} />
            <Box x={d.x} y={178} w={180} h={112} color={PAL.cyan} />
            <Txt x={d.x + 10} y={196} size={11} mono={false} color={PAL.ink} weight={600}>
              {`object: ${d.name}`}
            </Txt>
            <Txt x={d.x + 10} y={214} size={9.5}>
              {`name = "${d.name[0].toUpperCase()}${d.name.slice(1)}"`}
            </Txt>
            <Txt x={d.x + 10} y={228} size={9.5}>
              {`breed = "${d.breed}"`}
            </Txt>
            <Txt x={d.x + 10} y={242} size={9.5}>
              {`age = ${d.age}`}
            </Txt>
            <Txt x={d.x + 10} y={256} size={9.5}>
              {`colour = "${d.colour}"`}
            </Txt>
            <Txt x={d.x + 10} y={278} size={9} color={PAL.amber}>
              {`identity: object #${i + 1}`}
            </Txt>
          </g>
        ))}
        <Txt x={320} y={316} anchor="middle" size={9.5} color={PAL.dim}>
          same class · same behaviour · own state · own identity
        </Txt>
      </svg>
    </Figure>
  )
}

/** Procedural vs object-oriented: where the data and the rules live. */
export function ProceduralVsOop() {
  return (
    <Figure caption="Procedural style: data is passed around, and any function can change it, so the rules (like 'balance never below zero') must be repeated wherever the data is touched. Object-oriented style: the data sits inside an object, and only the object's own methods change it, so the rule lives in one place.">
      <svg viewBox="0 0 640 220" width="100%" style={{ minWidth: 520 }} role="img" aria-labelledby="pvo-title">
        <title id="pvo-title">Procedural code passes data to functions; object-oriented code keeps data inside objects</title>
        <Txt x={20} y={20} size={11} mono={false} color={PAL.amber} weight={600}>
          Procedural
        </Txt>
        <Box x={20} y={80} w={120} h={46} title="balance: 100" sub="shared data" color={PAL.amber} dashed />
        {['deposit(…)', 'withdraw(…)', 'applyFee(…)', 'report(…)'].map((f, i) => (
          <g key={f}>
            <Box x={170} y={30 + i * 44} w={110} h={34} title={f} color={PAL.muted} />
            <Arrow x1={170} y1={47 + i * 44} x2={142} y2={103} color={PAL.dim} />
          </g>
        ))}
        <Txt x={20} y={205} size={9} color={PAL.dim}>
          every function reads and writes the data
        </Txt>
        <line x1={320} y1={20} x2={320} y2={200} stroke={PAL.border} />
        <Txt x={350} y={20} size={11} mono={false} color={PAL.cyan} weight={600}>
          Object-oriented
        </Txt>
        <Box x={360} y={40} w={250} h={130} color={PAL.cyan} />
        <Txt x={375} y={60} size={11} mono={false} color={PAL.ink} weight={600}>
          Account object
        </Txt>
        <Box x={380} y={72} w={120} h={34} title="balance: 100" sub="private" color={PAL.amber} />
        <Txt x={515} y={88} size={9.5}>
          deposit()
        </Txt>
        <Txt x={515} y={104} size={9.5}>
          withdraw()
        </Txt>
        <Txt x={515} y={120} size={9.5}>
          balance()
        </Txt>
        <Txt x={380} y={150} size={9} color={PAL.dim}>
          rule "never below zero": one place
        </Txt>
        <Txt x={360} y={194} size={9} color={PAL.mint}>
          other code asks: account.withdraw(30)
        </Txt>
      </svg>
    </Figure>
  )
}
