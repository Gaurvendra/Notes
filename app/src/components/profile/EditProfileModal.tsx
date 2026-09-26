import { Camera, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../ui'
import { IDENTITY_LIMITS, initials, normaliseIdentity, normaliseUrl, type Identity } from '../../lib/identity'

const AVATAR_SIZE = 320 // stored square photo, in pixels
const MAX_PHOTO_BYTES = 15 * 1024 * 1024

/** Reads a File into a centre-cropped, resized square JPEG data URL — small enough to live comfortably in localStorage. */
async function fileToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Please choose a photo under 15 MB.')
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Couldn't read that image.")
  })
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Image editing is not available in this browser.')
  const scale = Math.max(AVATAR_SIZE / bitmap.width, AVATAR_SIZE / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (AVATAR_SIZE - w) / 2, (AVATAR_SIZE - h) / 2, w, h)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', 0.86)
}

interface FieldProps {
  label: string
  hint?: string
  children: ReactNode
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block rounded-lg border border-cyber-border bg-surface-2 px-3 py-2 transition-colors focus-within:border-cyan/50">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-dim">{label}</span>
        {hint && <span className="shrink-0 font-mono text-[10px] text-ink-dim">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass = 'mt-0.5 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim'

export function EditProfileModal({
  identity,
  onSave,
  onClose,
}: {
  identity: Identity
  onSave: (next: Identity) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(identity)
  const [photoError, setPhotoError] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onPhoto(file: File | undefined) {
    if (!file) return
    setPhotoError(undefined)
    try {
      const avatar = await fileToAvatar(file)
      setForm((f) => ({ ...f, avatar }))
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Could not use that photo.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function save() {
    onSave(
      normaliseIdentity({
        ...form,
        links: {
          linkedin: normaliseUrl(form.links.linkedin ?? ''),
          github: normaliseUrl(form.links.github ?? ''),
          website: normaliseUrl(form.links.website ?? ''),
        },
      }),
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-void/70 px-4 py-[6vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-cyber-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
          <h2 id="edit-profile-title" className="font-display text-base font-semibold text-ink">
            Edit profile
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ink-dim hover:bg-surface-2 hover:text-ink">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {form.avatar ? (
                <img src={form.avatar} alt="" className="h-20 w-20 rounded-full border border-cyber-border object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyber-border bg-gradient-to-br from-cyan/60 to-magenta/60 font-display text-lg font-bold text-void">
                  {initials(form.name)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <Button type="button" size="sm" icon={<Camera size={13} aria-hidden="true" />} onClick={() => fileRef.current?.click()}>
                  {form.avatar ? 'Change photo' : 'Add photo'}
                </Button>
                {form.avatar && (
                  <Button type="button" size="sm" variant="ghost" icon={<Trash2 size={13} aria-hidden="true" />} onClick={() => setForm((f) => ({ ...f, avatar: '' }))}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-ink-dim">JPG or PNG, cropped to a square. Stays in this browser.</p>
              {photoError && (
                <p className="text-xs text-rose" role="alert">
                  {photoError}
                </p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </div>

          <Field label="Name" hint={`${form.name.length}/${IDENTITY_LIMITS.name}`}>
            <input
              ref={firstFieldRef}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, IDENTITY_LIMITS.name) }))}
              placeholder="Ada Lovelace"
              className={inputClass}
            />
          </Field>

          <Field label="Headline" hint={`${form.headline.length}/${IDENTITY_LIMITS.headline}`}>
            <input
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value.slice(0, IDENTITY_LIMITS.headline) }))}
              placeholder="Backend engineer learning Java"
              className={inputClass}
            />
          </Field>

          <Field label="Location" hint={`${form.location.length}/${IDENTITY_LIMITS.location}`}>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value.slice(0, IDENTITY_LIMITS.location) }))}
              placeholder="Bengaluru, India"
              className={inputClass}
            />
          </Field>

          <Field label="Bio" hint={`${form.bio.length}/${IDENTITY_LIMITS.bio}`}>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, IDENTITY_LIMITS.bio) }))}
              placeholder="A short line about what you're building toward."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="LinkedIn">
              <input
                value={form.links.linkedin ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, links: { ...f.links, linkedin: e.target.value } }))}
                placeholder="linkedin.com/in/…"
                className={inputClass}
              />
            </Field>
            <Field label="GitHub">
              <input
                value={form.links.github ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, links: { ...f.links, github: e.target.value } }))}
                placeholder="github.com/…"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Website">
            <input
              value={form.links.website ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, links: { ...f.links, website: e.target.value } }))}
              placeholder="yoursite.dev"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-cyber-border px-5 py-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save profile
          </Button>
        </div>
      </div>
    </div>
  )
}
