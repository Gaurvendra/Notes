/**
 * The learner's editable identity (name, headline, bio, avatar, links) — separate from `Progress`, which is earned,
 * not written. Same rules as `progress.ts`: pure functions, no React, nothing that isn't JSON-serialisable, so the
 * whole thing round-trips through `localStorage` and through export/import untouched.
 */
import { curriculum, LEVEL_STYLE, type LevelName } from './curriculum'
import type { BadgeDef, Progress } from './progress'

export interface IdentityLinks {
  linkedin?: string
  github?: string
  website?: string
}

export interface Identity {
  version: 1
  name: string
  headline: string
  bio: string
  location: string
  /** A small square photo as a data URL (JPEG), already resized client-side; '' means "no photo, use initials". */
  avatar: string
  links: IdentityLinks
}

export const EMPTY_IDENTITY: Identity = {
  version: 1,
  name: '',
  headline: '',
  bio: '',
  location: '',
  avatar: '',
  links: {},
}

/** Character limits, enforced on both the form (maxLength) and normalise (defence for imported files). */
export const IDENTITY_LIMITS = {
  name: 60,
  headline: 90,
  bio: 280,
  location: 60,
  link: 200,
} as const

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function clamp(v: unknown, max: number): string {
  return str(v).trim().slice(0, max)
}

function clampLink(v: unknown): string | undefined {
  const s = clamp(v, IDENTITY_LIMITS.link)
  return s || undefined
}

export function normaliseIdentity(value: unknown): Identity {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<Identity>
  const links = (v.links && typeof v.links === 'object' ? v.links : {}) as IdentityLinks
  return {
    version: 1,
    name: clamp(v.name, IDENTITY_LIMITS.name),
    headline: clamp(v.headline, IDENTITY_LIMITS.headline),
    bio: clamp(v.bio, IDENTITY_LIMITS.bio),
    location: clamp(v.location, IDENTITY_LIMITS.location),
    avatar: typeof v.avatar === 'string' && v.avatar.startsWith('data:image/') ? v.avatar : '',
    links: {
      linkedin: clampLink(links.linkedin),
      github: clampLink(links.github),
      website: clampLink(links.website),
    },
  }
}

export const DEFAULT_DISPLAY_NAME = 'Java Learner'

/** What to show when the learner hasn't set a name yet — never a blank heading. */
export function displayName(identity: Identity): string {
  return identity.name.trim() || DEFAULT_DISPLAY_NAME
}

/** Up to two letters for the avatar fallback: both initials for "Ada Lovelace", one for a single name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'JL'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** A link's text without its scheme, for compact display ("linkedin.com/in/ada", not "https://linkedin.com/in/ada"). */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Adds https:// to a link the learner typed without a scheme, so plain "github.com/ada" still works as a link. */
export function normaliseUrl(input: string): string {
  const s = input.trim()
  if (!s) return ''
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

/* --------------------------------------------------------- derived from progress */

export interface SkillLevel {
  name: LevelName
  emoji: string
  done: number
  total: number
}

/** Lessons completed vs. the curriculum's total, per level (Beginner…Expert) — the "skills" breakdown. */
export function levelSkills(progress: Progress): SkillLevel[] {
  return curriculum.levels.map((lv) => {
    const lessons = lv.tiers.flatMap((t) => t.lessons)
    const done = lessons.filter((l) => progress.completed[l.id]).length
    return { name: lv.name, emoji: LEVEL_STYLE[lv.name].emoji, done, total: lessons.length }
  })
}

/** Tier names where every lesson is complete — concrete, nameable skills for a resume or a share card. */
export function masteredTiers(progress: Progress): string[] {
  return curriculum.tiers
    .filter((t) => t.lessons.length > 0 && t.lessons.every((l) => progress.completed[l.id]))
    .map((t) => t.name)
}

/** Earned badges in a stable, presentable order (most impressive — streaks and level clears — first). */
export function earnedBadgeList(all: BadgeDef[], earned: ReadonlySet<string>): BadgeDef[] {
  const order = ['level-', 'streak-', 'reviews-', 'interview-', 'ten-', 'perfect-', 'puzzle-', 'five-', 'first-']
  const rank = (b: BadgeDef) => order.findIndex((p) => b.id.startsWith(p))
  return all.filter((b) => earned.has(b.id)).sort((a, b) => rank(a) - rank(b))
}
