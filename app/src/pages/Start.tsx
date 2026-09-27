import { Link } from 'react-router-dom'
import { Card, PageHeader, SectionLabel } from '../components/ui'
import { CodeBlockStatic } from '../components/CodeBlockStatic'

const STEPS = [
  {
    title: 'Pick your path.',
    body: (
      <>
        New to Java? Follow the full <Link to="/path" className="text-cyan hover:underline">learning path</Link> from Tier 0.
        Already experienced? Use the fast-track: skim each lesson's TL;DR, Myths vs Facts, Senior lens and Interview corner,
        then take the tier checkpoint.
      </>
    ),
  },
  {
    title: 'Read, then run.',
    body: 'Type the examples into your own editor or jshell, run them, then change them. Seeing a result you predicted is how the model sticks.',
  },
  {
    title: 'Practise.',
    body: 'Each lesson has predict-the-output puzzles and three exercises (warm-up, core, challenge) with the tests they must pass and a reference solution.',
  },
  {
    title: 'Check yourself.',
    body: "Do each lesson's quiz and flashcards, then the tier checkpoint. Flashcards come back in Revision at growing intervals.",
  },
  {
    title: 'Mark lessons complete.',
    body: 'Your progress, XP, streak and badges are kept in this browser only. Export them from Settings to move them to another device.',
  },
]

const ANATOMY = [
  'Why this matters',
  'TL;DR',
  'Mental model',
  'Concept step by step',
  'Scenarios',
  'Under the hood',
  'Myths vs Facts',
  'Doubts cleared',
  'Pitfalls & best practices',
  'Senior lens',
  'Modern Java',
  'Practice',
  'Quiz',
  'Interview corner',
  'Cheat sheet & flashcards',
  'References',
]

export function Start() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Start here"
        lead={'How the Java Mastery Track works, how to use it, and how to set up your machine. It takes you from "what is the JVM?" to JVM internals and interview-ready answers, organised as a graph of lessons: each lesson lists what you should know first and what it unlocks.'}
      />

      <SectionLabel>How to use it</SectionLabel>
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-xl border border-cyber-border bg-surface p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan/15 font-mono text-sm font-semibold text-cyan">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-ink-muted">
              <strong className="text-ink">{s.title}</strong> {s.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <SectionLabel>Anatomy of a lesson</SectionLabel>
        <p className="text-sm text-ink-muted">Each lesson has the same sections, so you always know where to look:</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ANATOMY.map((a, i) => (
            <span key={a} className="rounded-full border border-cyber-border bg-surface px-2.5 py-1 text-xs text-ink-muted">
              <span className="mr-1 font-mono text-ink-dim">{i + 1}</span>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Set up your machine</SectionLabel>
        <p className="text-sm text-ink-muted">
          To run the examples you need <strong className="text-ink">JDK 25</strong> (the current long-term-support release). For
          the exercises, any project with JUnit 5 works: an IDE project, Maven 3.9+ or Gradle.
        </p>
        <CodeBlockStatic lang="Terminal" code={'java -version        # should print 25.x\njshell               # try one-liners interactively\njava Hello.java      # run a single source file, no javac step needed'} />
        <Card className="mt-3 border-mint/30 bg-mint/5 p-4 text-sm text-ink-muted">
          <strong className="text-mint">Tip:</strong> any JDK 25 distribution works (Eclipse Temurin, Amazon Corretto, Oracle,
          Azul Zulu, Microsoft…). On macOS and Linux, <a className="text-cyan hover:underline" href="https://sdkman.io" target="_blank" rel="noreferrer">SDKMAN!</a>{' '}
          makes switching versions easy: <code className="font-mono text-ink">sdk install java 25-tem</code>.
        </Card>
      </div>
    </div>
  )
}
