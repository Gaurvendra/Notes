import { Brain } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlashcardDeck, type DeckCard } from '../components/study/FlashcardDeck'
import { Badge, EmptyState, PageHeader, SegmentedControl, Stat } from '../components/ui'
import { buttonStyles } from '../components/ui/Button'
import { useProgress } from '../context/ProgressContext'
import { useAllLessonData } from '../hooks'
import { curriculum } from '../lib/curriculum'
import { cardKey } from '../lib/lessonData'
import { isDue, reviewsDone, SRS_INTERVALS } from '../lib/progress'

type Scope = 'due' | 'all'

/** Spaced repetition over the flashcards of completed lessons (or every written lesson, on request). */
export function Revision() {
  const all = useAllLessonData()
  const { progress, completedSet } = useProgress()
  const [scope, setScope] = useState<Scope>('due')
  // The deck is fixed when the page opens (or the scope changes), so rating a card doesn't reshuffle the session.
  const [session, setSession] = useState(0)

  const { deck, dueCount, known } = useMemo(() => {
    const cards: (DeckCard & { due: boolean })[] = []
    for (const lesson of curriculum.lessons) {
      const data = all?.get(lesson.id)
      if (!data) continue
      if (scope === 'due' && !completedSet.has(lesson.id)) continue
      data.flashcards.forEach((c, i) => {
        const key = cardKey(lesson.id, i)
        cards.push({ key, front: c.front, back: c.back, source: lesson.label, due: isDue(progress.cards[key]) })
      })
    }
    const deck = scope === 'due' ? cards.filter((c) => c.due) : cards
    return { deck, dueCount: cards.filter((c) => c.due).length, known: cards.length - cards.filter((c) => c.due).length }
  }, [all, scope, session, completedSet])

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Revision"
        lead={`Flashcards from the lessons you've completed come back at growing intervals (${SRS_INTERVALS.join(', ')} days). "Got it" moves a card to the next interval; "Again" starts it over.`}
        meta={<Badge tone="secondary" mono>spaced repetition</Badge>}
      />
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="due now" value={all ? dueCount : '…'} tone="text-magenta" />
        <Stat label="scheduled later" value={all ? known : '…'} tone="text-mint" />
        <Stat label="reviews done" value={reviewsDone(progress)} tone="text-ink-muted" />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedControl<Scope>
          label="Cards"
          value={scope}
          onChange={(s) => {
            setScope(s)
            setSession((n) => n + 1)
          }}
          options={[
            { value: 'due', label: 'Due from completed lessons' },
            { value: 'all', label: 'Every written lesson' },
          ]}
        />
      </div>
      {!all ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : deck.length === 0 ? (
        <EmptyState
          icon={<Brain size={28} aria-hidden="true" />}
          title={completedSet.size === 0 ? 'Complete a lesson to start revising' : 'Nothing due right now'}
          action={
            <Link to="/path" className={buttonStyles('primary')}>
              Open the learning path
            </Link>
          }
        >
          {completedSet.size === 0
            ? "Cards join your revision queue when you mark their lesson complete. You can also switch to 'Every written lesson'."
            : 'Come back tomorrow, or switch to every written lesson for extra practice.'}
        </EmptyState>
      ) : (
        <FlashcardDeck key={`${scope}-${session}`} cards={deck} emptyText="All due cards reviewed." />
      )}
    </div>
  )
}
