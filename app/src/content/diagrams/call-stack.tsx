/** Diagrams for "The Call Stack" lesson. */
import { Figure } from '../mdx/diagrams'
import { Arrow, Box, PAL, Txt } from '../svg'

/** Two threads, each with its own stack of frames; the top frame of main's stack opened up. */
export function ThreadStacks() {
  const frameH = 30
  const stack = (x: number, bottom: number, frames: { t: string; c: string }[], w = 150) =>
    frames.map((f, i) => (
      <Box key={f.t} x={x} y={bottom - (i + 1) * (frameH + 6)} w={w} h={frameH} title={f.t} color={f.c} />
    ))
  return (
    <Figure caption="Every thread has its own stack. A call pushes a frame on top; a return pops it, so the top frame is always the method running now. A frame holds the method's local variables (parameters first, and this for instance methods), an operand stack for intermediate values, and what's needed to continue in the caller.">
      <svg viewBox="0 0 560 270" width="100%" style={{ minWidth: 480 }} role="img" aria-labelledby="threadstacks-title">
        <title id="threadstacks-title">
          Thread main with frames main, checkout and total (top); thread worker-1 with frames run and process; the total frame
          expanded into local variables, operand stack and return information
        </title>
        <Txt x={20} y={22} size={11} color={PAL.ink} weight={600}>
          thread "main"
        </Txt>
        {stack(20, 250, [
          { t: 'main(args)', c: PAL.border },
          { t: 'checkout(prices)', c: PAL.border },
          { t: 'total(prices)', c: PAL.cyan },
        ])}
        <Txt x={20} y={268} size={8.5} color={PAL.dim}>
          bottom: the first call
        </Txt>
        <Arrow x1={60} y1={48} x2={60} y2={132} color={PAL.mint} />
        <Txt x={84} y={80} size={9} color={PAL.mint}>
          call: push
        </Txt>
        <Arrow x1={72} y1={132} x2={72} y2={48} color={PAL.amber} />
        <Txt x={84} y={108} size={9} color={PAL.amber}>
          return: pop
        </Txt>

        <path d="M170,157 L262,52" stroke={PAL.cyan} strokeWidth={1} strokeDasharray="3 3" fill="none" />
        <path d="M170,172 L262,200" stroke={PAL.cyan} strokeWidth={1} strokeDasharray="3 3" fill="none" />
        <rect x={262} y={40} width={150} height={172} rx={8} fill={PAL.surface} stroke={PAL.cyan} strokeWidth={1.3} />
        <Txt x={272} y={58} size={10.5} color={PAL.ink} weight={600}>
          frame: total(prices)
        </Txt>
        <Txt x={272} y={78} size={9} color={PAL.dim}>
          local variables
        </Txt>
        <Txt x={280} y={94} size={10} color={PAL.mint}>
          [0] prices → array
        </Txt>
        <Txt x={280} y={110} size={10} color={PAL.mint}>
          [1] sum = 0
        </Txt>
        <Txt x={272} y={134} size={9} color={PAL.dim}>
          operand stack
        </Txt>
        <Txt x={280} y={150} size={10} color={PAL.muted}>
          intermediate values
        </Txt>
        <Txt x={272} y={174} size={9} color={PAL.dim}>
          continue in caller
        </Txt>
        <Txt x={280} y={190} size={10} color={PAL.amber}>
          checkout, line 7
        </Txt>

        <Txt x={428} y={22} size={11} color={PAL.ink} weight={600}>
          thread "worker-1"
        </Txt>
        {stack(428, 250, [
          { t: 'run()', c: PAL.border },
          { t: 'process(item)', c: PAL.magenta },
        ], 124)}
        <Txt x={428} y={268} size={8.5} color={PAL.dim}>
          its own frames and locals
        </Txt>
      </svg>
    </Figure>
  )
}
