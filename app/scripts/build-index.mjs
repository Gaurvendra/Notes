#!/usr/bin/env node
// Builds src/generated/lesson-index.json from the MDX lessons and their lesson data: front-matter, section
// headings (for search and the table of contents), exercises and predict-the-output puzzles (for the Practice
// hub) and question counts. Runs before `dev` and `build`; the output is git-ignored.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'
import { load } from 'js-yaml'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LESSONS = path.join(APP, 'src/content/lessons')
const DATA = path.join(APP, 'src/content/lesson-data')
const OUT = path.join(APP, 'src/generated/lesson-index.json')

/** Attributes of a JSX opening tag: name="…", name='…' and name={'…'} (string literals only). */
export function attrs(tag) {
  const out = {}
  for (const m of tag.matchAll(/(\w+)=(?:"([^"]*)"|'([^']*)'|\{'((?:[^'\\]|\\.)*)'\}|\{"((?:[^"\\]|\\.)*)"\})/g)) {
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? m[5]
  }
  return out
}

/** Plain text of a Markdown heading, as rehype-slug sees it (no code ticks, links or emphasis markers). */
export function headingText(md) {
  return md
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim()
}

export function slugOf(text) {
  return new GithubSlugger().slug(text)
}

export function indexLesson(id, source) {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(source)
  const frontmatter = fm ? load(fm[1]) : {}
  for (const [k, v] of Object.entries(frontmatter)) if (v instanceof Date) frontmatter[k] = v.toISOString().slice(0, 10)
  const body = fm ? source.slice(fm[0].length) : source
  const slugger = new GithubSlugger()
  const headings = []
  let inFence = false
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence
    if (inFence) continue
    const h = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (h) {
      const text = headingText(h[2])
      headings.push({ depth: h[1].length, text, slug: slugger.slug(text) })
    }
  }
  const exercises = [...body.matchAll(/<Exercise\s[^>]*>/g)].map((m) => {
    const a = attrs(m[0])
    const cls = a.id.split('/').pop()
    return { key: `${id}/${cls}`, title: a.title, difficulty: a.difficulty, anchor: `exercise-${cls.toLowerCase()}` }
  })
  const puzzles = [...body.matchAll(/<PredictOutput\s[^>]*>/g)].map((m) => {
    const a = attrs(m[0])
    const anchor = `puzzle-${slugOf(a.title)}`
    return { key: `${id}/${anchor}`, title: a.title, anchor }
  })
  return { frontmatter, headings, exercises, puzzles }
}

export function buildIndex() {
  const lessons = {}
  const files = fs.existsSync(LESSONS) ? fs.readdirSync(LESSONS).filter((f) => f.endsWith('.mdx')).sort() : []
  for (const file of files) {
    const id = file.replace(/\.mdx$/, '')
    const info = indexLesson(id, fs.readFileSync(path.join(LESSONS, file), 'utf8'))
    const dataFile = path.join(DATA, `${id}.yaml`)
    const data = fs.existsSync(dataFile) ? load(fs.readFileSync(dataFile, 'utf8')) ?? {} : {}
    info.counts = {
      quiz: data.quiz?.length ?? 0,
      interview: data.interview?.length ?? 0,
      flashcards: data.flashcards?.length ?? 0,
    }
    lessons[id] = info
  }
  return { lessons }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = buildIndex()
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  const json = `${JSON.stringify(index, null, 1)}\n`
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== json) fs.writeFileSync(OUT, json)
  console.log(`lesson index: ${Object.keys(index.lessons).length} written lesson(s)`)
}
