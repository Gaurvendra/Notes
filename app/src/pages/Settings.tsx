import { Download, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Card, PageHeader, SectionLabel } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { useTheme } from '../context/ThemeContext'
import { THEMES } from '../lib/themes'
import { today } from '../lib/progress'

export function Settings() {
  const { theme, mode, setTheme, setMode } = useTheme()
  const { exportJSON, importJSON, reset } = useProgress()
  const [message, setMessage] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  function download() {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `java-mastery-track-progress-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Progress exported.')
  }

  async function upload(file: File | undefined) {
    if (!file) return
    try {
      importJSON(await file.text())
      setMessage('Progress imported.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" lead="Appearance and your progress data. Everything is stored in this browser only; nothing is sent anywhere." />

      <SectionLabel>Mode</SectionLabel>
      <div className="mb-8 flex gap-2">
        <Button variant={mode === 'dark' ? 'primary' : 'secondary'} icon={<Moon size={14} aria-hidden="true" />} onClick={() => setMode('dark')}>
          Dark
        </Button>
        <Button variant={mode === 'light' ? 'primary' : 'secondary'} icon={<Sun size={14} aria-hidden="true" />} onClick={() => setMode('light')}>
          Light
        </Button>
      </div>

      <SectionLabel>Colour scheme</SectionLabel>
      <div className="mb-8 grid gap-2 sm:grid-cols-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={theme === t.id}
            onClick={() => setTheme(t.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${theme === t.id ? 'border-cyan bg-cyan/10' : 'border-cyber-border bg-surface hover:border-cyan/40'}`}
          >
            <span className="block font-display font-semibold text-ink">{t.name}</span>
            <span className="block text-sm text-ink-muted">{t.blurb}</span>
          </button>
        ))}
      </div>

      <SectionLabel>Your progress</SectionLabel>
      <Card className="p-4">
        <p className="text-sm text-ink-muted">
          Completed lessons, quiz scores, flashcard schedules, solved exercises, streak and badges. Export a backup, or import one
          on another device or browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon={<Download size={14} aria-hidden="true" />} onClick={download}>
            Export progress
          </Button>
          <Button icon={<Upload size={14} aria-hidden="true" />} onClick={() => fileRef.current?.click()}>
            Import progress
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <Button
            variant="danger"
            icon={<RotateCcw size={14} aria-hidden="true" />}
            onClick={() => {
              if (window.confirm('Erase all progress in this browser? Export a backup first if you might want it back.')) {
                reset()
                setMessage('Progress reset.')
              }
            }}
          >
            Reset progress
          </Button>
        </div>
        {message && (
          <p className="mt-3 text-sm text-cyan" role="status">
            {message}
          </p>
        )}
      </Card>
    </div>
  )
}
