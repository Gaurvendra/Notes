import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { useProgress } from '../../context/ProgressContext'
import { SRS_INTERVALS } from '../../lib/progress'
import { Md } from '../Md'
import { Button } from '../ui'

export interface DeckCard {
  key: string
  front: string
  back: string
  source?: string
}

function shuffled<T>(items: T[]): T[] {
  const o = [...items]
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[o[i], o[j]] = [o[j], o[i]]
  }
  return o
}

/**
 * Flip cards feeding the spaced-repetition scheduler: "Got it" moves a card to its next interval
 * (1 → 4 → 10 → 21 → 45 days) and out of this session; "Again" resets it and sends it to the back of the queue.
 */
export function FlashcardDeck({ cards, emptyText = 'Deck done.' }: { cards: DeckCard[]; emptyText?: string }) {
  const { progress, reviewCard } = useProgress()
  const [queue, setQueue] = useState(() => cards.map((c) => c.key))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const byKey = new Map(cards.map((c) => [c.key, c]))

  const restart = (order = cards.map((c) => c.key)) => {
    setQueue(order)
    setPos(0)
    setFlipped(false)
  }

  if (queue.length === 0) {
    return (
      <div className="jx-cards my-5 rounded-xl border border-mint/40 bg-mint/5 p-6 text-center">
        <p className="font-display text-lg font-semibold text-mint">🎉 {emptyText}</p>
        <p className="mt-1 text-sm text-ink-muted">Cards you knew come back later, at growing intervals.</p>
        <Button className="mt-4" size="sm" icon={<RotateCcw size={13} aria-hidden="true" />} onClick={() => restart()}>
          Go through all {cards.length} again
        </Button>
      </div>
    )
  }

  const at = Math.min(pos, queue.length - 1)
  const card = byKey.get(queue[at])!
  const state = progress.cards[card.key]

  function rate(remembered: boolean) {
    reviewCard(card.key, remembered)
    setFlipped(false)
    setQueue((q) => {
      const rest = q.filter((_, i) => i !== at)
      return remembered ? rest : [...rest, card.key]
    })
  }

  return (
    <div className="jx-cards my-5">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show question' : 'Show answer'}
        className={[
          'flex min-h-48 w-full flex-col rounded-xl border p-5 text-left transition-colors',
          flipped ? 'border-magenta/40 bg-magenta/5' : 'border-cyan/40 bg-cyan/5 hover:bg-cyan/10',
        ].join(' ')}
      >
        <span className="flex items-center justify-between font-display text-[11px] font-semibold uppercase tracking-widest">
          <span className={flipped ? 'text-magenta' : 'text-cyan'}>{flipped ? 'Answer' : 'Question'}</span>
          <span className="font-mono normal-case tracking-normal text-ink-dim">
            {card.source ? `${card.source} · ` : ''}
            {state ? `box ${state.box + 1}/${SRS_INTERVALS.length}` : 'new'}
          </span>
        </span>
        <span className="mt-3 flex-1 text-base text-ink">
          <Md text={flipped ? card.back : card.front} />
        </span>
        {!flipped && <span className="mt-3 text-xs text-ink-dim">Tap or press Enter to flip</span>}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="icon" variant="ghost" aria-label="Previous card" onClick={() => { setFlipped(false); setPos((at - 1 + queue.length) % queue.length) }}>
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        <span className="font-mono text-xs text-ink-muted">
          {at + 1} / {queue.length}
        </span>
        <Button size="icon" variant="ghost" aria-label="Next card" onClick={() => { setFlipped(false); setPos((at + 1) % queue.length) }}>
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
        <Button size="sm" variant="ghost" icon={<Shuffle size={13} aria-hidden="true" />} onClick={() => restart(shuffled(queue))}>
          Shuffle
        </Button>
        <span className="flex-1" />
        {flipped && (
          <>
            <Button size="sm" variant="danger" onClick={() => rate(false)}>
              🔁 Again
            </Button>
            <Button size="sm" variant="success" onClick={() => rate(true)}>
              ✅ Got it
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
