import 'katex/dist/katex.min.css'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Construction, Zap } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Badge, Button, Card, PageHeader, SectionLabel } from '../components/ui'
import { guideLoader } from '../content/registry'
import { mdxComponents } from '../content/mdx'
import { LessonContext } from '../context/LessonContext'
import { useProgress } from '../context/ProgressContext'
import { loadAudit, VERDICTS, type AuditItem } from '../lib/audit'
import { curriculum, getLesson, LEVEL_STYLE, NOTE_NAMES, type Lesson } from '../lib/curriculum'
import { loadLessonData, type LessonData } from '../lib/lessonData'
import { indexed } from '../lib/lessonIndex'
import { mdInline } from '../lib/markdown'
import { NotFound } from './NotFound'

const guides = new Map<string, ComponentType>()
function guideComponent(id: string): ComponentType | undefined {
  const loader = guideLoader(id)
  if (!loader) return undefined
  if (!guides.has(id)) guides.set(id, lazy(loader))
  return guides.get(id)
}

function LessonLinks({ ids, empty }: { ids: string[]; empty: string }) {
  const { completedSet } = useProgress()
  if (ids.length === 0) return <span className="text-ink-dim">{empty}</span>
  return (
    <>
      {ids.map((id) => {
        const l = curriculum.byId.get(id)!
        return (
          <Link
            key={id}
            to={l.url}
            className={`rounded-full border px-2 py-0.5 text-xs transition-colors hover:border-cyan/50 hover:text-cyan ${completedSet.has(id) ? 'border-mint/40 text-mint' : 'border-cyber-border text-ink-muted'}`}
          >
            {completedSet.has(id) ? '✓ ' : ''}
            {l.label}
          </Link>
        )
      })}
    </>
  )
}

/** When the guide isn't written yet: what it will cover, with the verified audit items it must address. */
function Outline({ lesson }: { lesson: Lesson }) {
  const [audit, setAudit] = useState<Map<string, AuditItem>>()
  useEffect(() => {
    loadAudit().then(setAudit)
  }, [])
  return (
    <div className="max-w-3xl">
      <Card className="border-amber/40 bg-amber/5 p-5">
        <p className="flex items-center gap-2 font-display font-semibold text-amber">
          <Construction size={18} aria-hidden="true" /> This guide is being written
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          It is part of the path and will follow the full lesson format: explanation with diagrams, tested examples, myths vs
          facts, doubts cleared, a senior lens, practice exercises, a quiz, interview questions and a cheat sheet. It will
          cover: <strong className="text-ink">{lesson.title}</strong>.
        </p>
      </Card>
      {lesson.audit.length > 0 && (
        <section className="mt-8">
          <SectionLabel>What your notes say, verified ({lesson.audit.length})</SectionLabel>
          <p className="mb-3 text-sm text-ink-muted">
            These claims from the source notes were checked for this lesson. Each correction will appear in the guide as a
            Myth vs Fact.
          </p>
          {!audit ? (
            <p className="text-sm text-ink-dim">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {lesson.audit.map((id) => {
                const item = audit.get(id)
                if (!item) return null
                return (
                  <li key={id} className="rounded-xl border border-cyber-border bg-surface p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge mono>{id}</Badge>
                      {item.verdicts.map((v) => (
                        <span key={v} className="text-xs text-ink-dim" title={VERDICTS[v]}>
                          {v} {VERDICTS[v]}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-ink" dangerouslySetInnerHTML={{ __html: mdInline(item.claim) }} />
                    {item.precise.trim() && (
                      <p className="mt-1 leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: mdInline(item.precise) }} />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function Guide({ lesson }: { lesson: Lesson }) {
  const Content = guideComponent(lesson.id)!
  const [data, setData] = useState<LessonData>()
  const { hash } = useLocation()
  useEffect(() => {
    let alive = true
    loadLessonData(lesson.id).then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [lesson.id])
  const ctx = useMemo(() => ({ lessonId: lesson.id, data }), [lesson.id, data])
  // Scroll to an anchor once the (lazy) content is in the page.
  useEffect(() => {
    if (!hash) return
    let tries = 0
    const timer = setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el || ++tries > 40) {
        clearInterval(timer)
        el?.scrollIntoView({ block: 'start' })
      }
    }, 50)
    return () => clearInterval(timer)
  }, [hash, lesson.id])
  return (
    <MDXProvider components={mdxComponents}>
      <LessonContext.Provider value={ctx}>
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading the lesson…</p>}>
          <article className="prose-jmt min-w-0">
            <Content />
          </article>
        </Suspense>
      </LessonContext.Provider>
    </MDXProvider>
  )
}

function Toc({ id }: { id: string }) {
  const headings = indexed(id)?.headings ?? []
  if (headings.length === 0) return null
  return (
    <nav aria-label="On this page" className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto xl:block">
      <SectionLabel>On this page</SectionLabel>
      <ul className="space-y-1 border-l border-cyber-border text-sm">
        {headings.map((h) => (
          <li key={h.slug}>
            <a
              href={`#${h.slug}`}
              className={`-ml-px block border-l border-transparent py-0.5 text-ink-muted hover:border-cyan hover:text-cyan ${h.depth === 3 ? 'pl-6 text-xs' : 'pl-3'}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function LessonPage() {
  const { id = '' } = useParams()
  const lesson = getLesson(id)
  const { completedSet, toggleComplete, visitLesson } = useProgress()

  useEffect(() => {
    if (lesson) visitLesson(lesson.id)
  }, [lesson, visitLesson])

  if (!lesson) return <NotFound />

  const info = indexed(lesson.id)
  const fm = info?.frontmatter
  const hasGuide = Boolean(guideLoader(lesson.id))
  const prev = curriculum.lessons[lesson.order - 1]
  const next = curriculum.lessons[lesson.order + 1]
  const complete = completedSet.has(lesson.id)
  const tier = curriculum.tiers.find((t) => t.n === lesson.tier)!

  return (
    <div>
      <nav className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-dim">
        <Link to={`/path#tier-${lesson.tier}`} className="inline-flex items-center gap-1 hover:text-cyan">
          <ArrowLeft size={12} aria-hidden="true" />
          Learning path
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          {prev && (
            <Link to={prev.url} className="inline-flex min-w-0 items-center gap-1 hover:text-cyan">
              <ChevronLeft size={12} aria-hidden="true" />
              <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{prev.label}</span>
            </Link>
          )}
          <span aria-hidden="true">·</span>
          {next && (
            <Link to={next.url} className="inline-flex min-w-0 items-center gap-1 hover:text-cyan">
              <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{next.label}</span>
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          )}
        </div>
      </nav>

      <div className="mt-3">
        <PageHeader
          title={fm?.title ?? lesson.label}
          lead={fm?.description ?? lesson.title}
          meta={
            <>
              <Badge tone={LEVEL_STYLE[lesson.level].tone}>
                {LEVEL_STYLE[lesson.level].emoji} {lesson.level}
              </Badge>
              <Badge mono>
                Tier {lesson.tier} · {tier.name}
              </Badge>
              {fm?.estimatedMinutes && (
                <Badge mono>
                  <Clock size={11} aria-hidden="true" /> {fm.estimatedMinutes} min
                </Badge>
              )}
              {fm?.fastTrackMinutes && (
                <Badge tone="warning" mono>
                  <Zap size={11} aria-hidden="true" /> fast-track {fm.fastTrackMinutes} min
                </Badge>
              )}
              {hasGuide ? (
                <Badge tone="success" mono>
                  ✓ verified on Java {fm?.javaBaseline ?? 25}
                  {fm?.lastVerified ? ` · ${fm.lastVerified}` : ''}
                </Badge>
              ) : (
                <Badge mono>outline</Badge>
              )}
            </>
          }
          actions={
            <Button variant={complete ? 'success' : 'primary'} icon={complete ? <Check size={15} aria-hidden="true" /> : undefined} onClick={() => toggleComplete(lesson.id)}>
              {complete ? 'Completed' : 'Mark complete'}
            </Button>
          }
        />
      </div>

      <div className="mb-6 grid gap-2 text-sm md:grid-cols-[max-content_1fr]">
        <span className="text-ink-dim">Needs first</span>
        <div className="flex flex-wrap gap-1.5">
          <LessonLinks ids={lesson.prereqs} empty="Nothing: a starting point" />
        </div>
        <span className="text-ink-dim">Unlocks</span>
        <div className="flex flex-wrap gap-1.5">
          <LessonLinks ids={lesson.unlocks} empty="The end of this branch" />
        </div>
        <span className="text-ink-dim">From your notes</span>
        <div className="flex flex-wrap gap-1.5 text-ink-muted">
          {lesson.sources.map((s) => (
            <span key={s} className="rounded-full border border-cyber-border px-2 py-0.5 text-xs">
              {s === 'gap' ? NOTE_NAMES.gap : `${s} · ${NOTE_NAMES[s] ?? s}`}
            </span>
          ))}
          {fm?.sourcePages?.map((p) => (
            <span key={p} className="font-mono text-xs text-ink-dim">
              pages {p}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          {hasGuide ? <Guide lesson={lesson} /> : <Outline lesson={lesson} />}

          <section className="mt-12 rounded-2xl border border-cyber-border bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 font-display font-semibold text-ink">
                {complete ? '✓ You completed this lesson' : 'Finished reading and practising?'}
              </p>
              <Button variant={complete ? 'success' : 'primary'} onClick={() => toggleComplete(lesson.id)}>
                {complete ? 'Completed' : 'Mark complete · +100 XP'}
              </Button>
            </div>
            {lesson.unlocks.length > 0 && (
              <div className="mt-4 border-t border-cyber-border pt-4">
                <SectionLabel>Next up</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  <LessonLinks ids={lesson.unlocks} empty="" />
                </div>
              </div>
            )}
          </section>
        </div>
        {hasGuide && <Toc id={lesson.id} />}
      </div>
    </div>
  )
}
