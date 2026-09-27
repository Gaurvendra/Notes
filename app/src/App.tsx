import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Path } from './pages/Path'
import { Start } from './pages/Start'

// Lesson pages carry MDX, KaTeX and highlighted code; the hubs load every lesson's data. Split them all.
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })))
const Checkpoint = lazy(() => import('./pages/Checkpoint').then((m) => ({ default: m.Checkpoint })))
const Revision = lazy(() => import('./pages/Revision').then((m) => ({ default: m.Revision })))
const Interview = lazy(() => import('./pages/Interview').then((m) => ({ default: m.Interview })))
const Practice = lazy(() => import('./pages/Practice').then((m) => ({ default: m.Practice })))
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const Cheatsheets = lazy(() => import('./pages/Reference').then((m) => ({ default: m.Cheatsheets })))
const NotesAudit = lazy(() => import('./pages/Reference').then((m) => ({ default: m.NotesAudit })))
const GrowingHub = lazy(() => import('./pages/Reference').then((m) => ({ default: m.GrowingHub })))

function s(node: ReactNode) {
  return <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>{node}</Suspense>
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="start" element={<Start />} />
        <Route path="path" element={<Path />} />
        <Route path="roadmap" element={<Path />} />
        <Route path="lessons/:id" element={s(<LessonPage />)} />
        <Route path="checkpoints/:tier" element={s(<Checkpoint />)} />
        <Route path="revision" element={s(<Revision />)} />
        <Route path="interview" element={s(<Interview />)} />
        <Route path="practice" element={s(<Practice />)} />
        <Route path="cheatsheets" element={s(<Cheatsheets />)} />
        <Route
          path="glossary"
          element={s(<GrowingHub title="Glossary" lead="Every term used in the track, with a one-line definition and a link to its lesson." />)}
        />
        <Route
          path="java-versions"
          element={s(<GrowingHub title="Java versions timeline" lead="What changed in each Java release from 8 to 27 for the topics in this track." />)}
        />
        <Route path="notes-audit" element={s(<NotesAudit />)} />
        <Route path="profile" element={s(<Profile />)} />
        <Route path="settings" element={s(<Settings />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
