import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { InterviewCard } from '../components/study/InterviewCard'
import { Badge, PageHeader, SectionLabel, SegmentedControl, Stat } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { useAllLessonData } from '../hooks'
import { curriculum } from '../lib/curriculum'
import { INTERVIEW_LEVELS, INTERVIEW_ORDER, type InterviewLevel, type InterviewQuestion } from '../lib/lessonData'
import type { Lesson } from '../lib/curriculum'

type LevelFilter = 'all' | InterviewLevel
type RatingFilter = 'all' | 'unrated' | 'shaky'

/** Every interview question from every written lesson, filterable by level, self-rating and text. */
export function Interview() {
  const all = useAllLessonData()
  const { progress } = useProgress()
  const [level, setLevel] = useState<LevelFilter>('all')
  const [rating, setRating] = useState<RatingFilter>('all')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const out: { q: InterviewQuestion; key: string; lesson: Lesson }[] = []
    for (const lesson of curriculum.lessons) {
      const data = all?.get(lesson.id)
      if (!data) continue
      data.interview.forEach((q, i) => out.push({ q, key: `${lesson.id}#${i}`, lesson }))
    }
    return out.sort((a, b) => INTERVIEW_ORDER.indexOf(a.q.level) - INTERVIEW_ORDER.indexOf(b.q.level) || a.lesson.order - b.lesson.order)
  }, [all])

  const q = query.trim().toLowerCase()
  const shown = items.filter(
    (it) =>
      (level === 'all' || it.q.level === level) &&
      (rating === 'all' || (rating === 'unrated' ? !progress.interview[it.key] : progress.interview[it.key] === 'shaky')) &&
      (!q || `${it.q.q} ${it.q.answer} ${it.lesson.label}`.toLowerCase().includes(q)),
  )
  const confident = items.filter((it) => progress.interview[it.key] === 'confident').length

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Interview prep"
        lead="Questions from every written lesson, from fresher to staff/manager level. Answer out loud first, then open the model answer, the likely follow-ups and the red-flag answers, and rate yourself."
        meta={
          <>
            <Badge tone="warning" mono>
              {items.length} questions
            </Badge>
            <Badge tone="success" mono>
              {confident} nailed
            </Badge>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {INTERVIEW_ORDER.map((lv) => (
          <Stat key={lv} label={INTERVIEW_LEVELS[lv]} value={items.filter((it) => it.q.level === lv).length} />
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SegmentedControl<LevelFilter>
          label="Level"
          size="sm"
          value={level}
          onChange={setLevel}
          options={[{ value: 'all', label: 'All levels' }, ...INTERVIEW_ORDER.map((lv) => ({ value: lv, label: INTERVIEW_LEVELS[lv] }))]}
        />
        <SegmentedControl<RatingFilter>
          label="Rating"
          size="sm"
          value={rating}
          onChange={setRating}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unrated', label: 'Not practised' },
            { value: 'shaky', label: 'Needs work' },
          ]}
        />
        <label className="flex h-8 min-w-48 flex-1 items-center gap-2 rounded-md border border-cyber-border bg-surface-2 px-2">
          <Search size={13} className="text-ink-dim" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search questions"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
          />
        </label>
      </div>
      {!all ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : (
        <>
          <SectionLabel>{shown.length} shown</SectionLabel>
          <div className="space-y-2">
            {shown.map((it) => (
              <InterviewCard key={it.key} q={it.q} qKey={it.key} source={{ label: it.lesson.label, to: `${it.lesson.url}#interview-corner` }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
