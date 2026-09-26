import { Download, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Button, Card, PageHeader, SectionLabel, SegmentedControl } from '../components/ui'
import { useProgress } from '../context/ProgressContext'
import { IDLE_CHOICES, useStudy } from '../context/StudyContext'
import { useTheme } from '../context/ThemeContext'
import { THEMES } from '../lib/themes'
import { today } from '../lib/progress'

export function Settings() {
  const { theme, mode, setTheme, setMode } = useTheme()
  const { exportJSON, importJSON, reset } = useProgress()
  const { prefs, setPrefs } = useStudy()
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

      <SectionLabel>Lesson timer and focus mode</SectionLabel>
      <Card className="mb-8 divide-y divide-cyber-border">
        <SettingRow
          title="Start the timer when I open a lesson"
          hint="Only on written lessons you haven't completed. You can always start or pause it yourself (shortcut T)."
        >
          <SegmentedControl<'on' | 'off'>
            label="Start the timer automatically"
            size="sm"
            value={prefs.timerAutoStart ? 'on' : 'off'}
            onChange={(v) => setPrefs({ timerAutoStart: v === 'on' })}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </SettingRow>
        <SettingRow title="Pause while the tab is in the background" hint="It resumes when you come back to the tab.">
          <SegmentedControl<'on' | 'off'>
            label="Pause while the tab is hidden"
            size="sm"
            value={prefs.timerPauseWhenHidden ? 'on' : 'off'}
            onChange={(v) => setPrefs({ timerPauseWhenHidden: v === 'on' })}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </SettingRow>
        <SettingRow
          title="Pause when I stop for"
          hint="No scrolling, clicking or typing for this long pauses the timer; it counts up to a minute after your last input."
        >
          <SegmentedControl<string>
            label="Pause after inactivity"
            size="sm"
            value={String(prefs.timerIdleMinutes)}
            onChange={(v) => setPrefs({ timerIdleMinutes: Number(v) })}
            options={IDLE_CHOICES.map((m) => ({ value: String(m), label: m === 0 ? 'Never' : `${m} min` }))}
          />
        </SettingRow>
        <p className="px-4 py-3 text-xs leading-relaxed text-ink-muted">
          <strong className="text-ink">Focus mode</strong> hides the navigation, the sidebar and everything around the lesson,
          leaving the text, the timer and a reading-progress line. Press <Kbd>F</Kbd> on a lesson or checkpoint (or use the
          Focus mode button), <Kbd>Esc</Kbd> to leave, and <Kbd>T</Kbd> to start or pause the timer.
        </p>
      </Card>

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

function SettingRow({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 basis-60">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs leading-relaxed text-ink-muted">{hint}</p>
      </div>
      {children}
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-cyber-border bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-ink">{children}</kbd>
}
