/**
 * The decorative "share your progress" card: a single PNG, drawn entirely with the Canvas 2D API (no image-export
 * library, no network request — everything it draws comes from data already in this browser). Built for pasting into
 * a LinkedIn post or a portfolio: one self-contained image with identity, level, streak, curriculum progress and
 * badges. `buildSummaryText` renders the same data as a short paste-ready caption.
 *
 * Kept deliberately independent of the active site theme (see `themes.ts`): a card meant to be shown outside the app
 * should look the same regardless of which of the seven schemes the learner happens to have picked.
 */
import type { Identity } from './identity'
import { displayName, initials, prettyUrl } from './identity'

export const CARD_WIDTH = 1600
/** The card's height adapts to its content (badge and skill-chip counts vary a lot); this is only the floor. */
export const MIN_CARD_HEIGHT = 760
const FOOTER_RESERVE = 96 // space kept below the last content row for the footer and the bottom accent bar
const RENDER_SCALE = 2 // draws at 2x for a crisp image on high-DPI screens and when scaled up

const COLOR = {
  void: '#05070f',
  surface: '#0b1120',
  surface2: '#121a2e',
  surface3: '#182444',
  border: '#1e2a45',
  borderStrong: '#2c3e63',
  ink: '#f2f6ff',
  inkMuted: '#8ea0c7',
  inkDim: '#56658a',
  cyan: '#22d3ee',
  magenta: '#e879f9',
  mint: '#34d399',
  amber: '#fbbf24',
} as const

export const LEVEL_TONE_COLOR: Record<'success' | 'primary' | 'secondary' | 'warning', string> = {
  success: COLOR.mint,
  primary: COLOR.cyan,
  secondary: COLOR.magenta,
  warning: COLOR.amber,
}

const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif'
const DISPLAY = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'

export interface ShareCardData {
  identity: Identity
  level: number
  levelTitle: string
  xp: number
  xpIntoLevel: number
  xpForNext: number
  currentStreak: number
  longestStreak: number
  lessonsDone: number
  lessonsTotal: number
  exercisesDone: number
  quizCorrect: number
  studyTimeLabel: string
  skills: { name: string; emoji: string; done: number; total: number; color: string }[]
  masteredTiers: string[]
  badges: { icon: string; name: string }[]
  generatedOn: string
}

/* ------------------------------------------------------------------- drawing primitives */

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Truncates to fit `maxWidth`, appending an ellipsis — binary search so it works for any font/width. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (ctx.measureText(text.slice(0, mid).trimEnd() + '…').width <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return lo === 0 ? '…' : text.slice(0, lo).trimEnd() + '…'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('could not decode the photo'))
    img.src = src
  })
}

/** Requests every face/weight the card uses, so canvas text doesn't silently fall back to a system font. */
async function ensureFontsReady(): Promise<void> {
  const specs = [
    `600 16px ${DISPLAY}`,
    `700 16px ${DISPLAY}`,
    `400 16px ${SANS}`,
    `500 16px ${SANS}`,
    `600 16px ${SANS}`,
    `400 16px ${MONO}`,
    `500 16px ${MONO}`,
  ]
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s)))
    await document.fonts.ready
  } catch {
    // fonts not ready is not fatal — canvas falls back to the generic families above
  }
}

function drawAvatar(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, cx: number, cy: number, r: number, name: string) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (img) {
    const scale = Math.max((r * 2) / img.width, (r * 2) / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h)
  } else {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
    grad.addColorStop(0, COLOR.cyan)
    grad.addColorStop(1, COLOR.magenta)
    ctx.fillStyle = grad
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    ctx.fillStyle = COLOR.void
    ctx.font = `700 ${Math.round(r * 0.8)}px ${DISPLAY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials(name), cx, cy + r * 0.06)
  }
  ctx.restore()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'
  ctx.lineWidth = 3
  ctx.stroke()
}

function drawRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, strokeWidth: number, fraction: number) {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = strokeWidth
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  grad.addColorStop(0, COLOR.cyan)
  grad.addColorStop(1, COLOR.magenta)
  ctx.strokeStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, fraction)))
  ctx.stroke()
  ctx.restore()
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fraction: number, color: string) {
  roundRectPath(ctx, x, y, w, h, h / 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.fill()
  const clamped = Math.max(0, Math.min(1, fraction))
  if (clamped <= 0) return // no false "a little progress" nub at exactly 0
  const fw = Math.max(h, w * clamped)
  roundRectPath(ctx, x, y, fw, h, h / 2)
  ctx.fillStyle = color
  ctx.fill()
}

interface Chip {
  text: string
  fg: string
  bg: string
  border: string
}

/** Flows chips left to right, wrapping to a new row inside `maxWidth`. Returns the y just below the last row. */
function drawChips(ctx: CanvasRenderingContext2D, chips: Chip[], x: number, y: number, maxWidth: number, font: string): number {
  const height = 34
  const padX = 14
  const gapX = 10
  const gapY = 10
  let cx = x
  let cy = y
  ctx.font = font
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (const chip of chips) {
    const textWidth = ctx.measureText(chip.text).width
    const chipWidth = textWidth + padX * 2
    if (cx > x && cx + chipWidth > x + maxWidth) {
      cx = x
      cy += height + gapY
    }
    roundRectPath(ctx, cx, cy, chipWidth, height, height / 2)
    ctx.fillStyle = chip.bg
    ctx.fill()
    ctx.strokeStyle = chip.border
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = chip.fg
    ctx.fillText(chip.text, cx + padX, cy + height / 2 + 1)
    cx += chipWidth + gapX
  }
  return chips.length === 0 ? y : cy + height
}

/* ---------------------------------------------------------------------------- the card */

const M = 56 // outer margin
const W = CARD_WIDTH

/**
 * Draws the card at a given height and returns the y just below the last content row (before the footer) — the
 * number `renderShareCard` uses to size the real canvas. Every content position is computed top-down from `M`, so
 * it comes out identical whichever `height` is passed in; only the background, border and footer (anchored to the
 * bottom edge) actually depend on it.
 */
function paint(ctx: CanvasRenderingContext2D, data: ShareCardData, avatarImg: HTMLImageElement | null, height: number): number {
  const H = height

  /* background */
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, COLOR.surface)
  bg.addColorStop(1, COLOR.void)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  roundRectPath(ctx, 0, 0, W, H, 28)
  ctx.clip()
  const glowCyan = ctx.createRadialGradient(W - 80, 60, 20, W - 80, 60, 420)
  glowCyan.addColorStop(0, 'rgba(34, 211, 238, 0.16)')
  glowCyan.addColorStop(1, 'rgba(34, 211, 238, 0)')
  ctx.fillStyle = glowCyan
  ctx.fillRect(0, 0, W, H)
  const glowMagenta = ctx.createRadialGradient(60, H - 40, 20, 60, H - 40, 460)
  glowMagenta.addColorStop(0, 'rgba(232, 121, 249, 0.14)')
  glowMagenta.addColorStop(1, 'rgba(232, 121, 249, 0)')
  ctx.fillStyle = glowMagenta
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  roundRectPath(ctx, 2, 2, W - 4, H - 4, 27)
  const border = ctx.createLinearGradient(0, 0, W, H)
  border.addColorStop(0, 'rgba(34, 211, 238, 0.55)')
  border.addColorStop(1, 'rgba(232, 121, 249, 0.4)')
  ctx.strokeStyle = border
  ctx.lineWidth = 2
  ctx.stroke()

  /* header: avatar, name, headline, meta — level ring on the right */
  const avatarR = 68
  const avatarCx = M + avatarR
  const avatarCy = M + avatarR + 6
  drawAvatar(ctx, avatarImg, avatarCx, avatarCy, avatarR, displayName(data.identity))

  const textX = avatarCx + avatarR + 34
  const ringCx = W - M - 74
  const textMaxWidth = ringCx - 100 - textX

  ctx.textAlign = 'left'
  ctx.fillStyle = COLOR.ink
  ctx.font = `700 42px ${DISPLAY}`
  ctx.fillText(fitText(ctx, displayName(data.identity), textMaxWidth), textX, M + 34)

  ctx.font = `500 22px ${SANS}`
  ctx.fillStyle = COLOR.cyan
  const headline = data.identity.headline.trim() || 'Learning Java, one lesson at a time'
  ctx.fillText(fitText(ctx, headline, textMaxWidth), textX, M + 70)

  const metaParts = [
    data.identity.location.trim(),
    data.identity.links.linkedin && prettyUrl(data.identity.links.linkedin),
    data.identity.links.github && prettyUrl(data.identity.links.github),
    data.identity.links.website && prettyUrl(data.identity.links.website),
  ].filter((s): s is string => Boolean(s))
  if (metaParts.length > 0) {
    ctx.font = `400 16px ${SANS}`
    ctx.fillStyle = COLOR.inkMuted
    ctx.fillText(fitText(ctx, metaParts.join('   ·   '), textMaxWidth), textX, M + 100)
  }

  const ringCy = M + 70
  const ringR = 56
  const fraction = data.xpForNext > 0 ? data.xpIntoLevel / data.xpForNext : 0
  drawRing(ctx, ringCx, ringCy, ringR, 9, fraction)
  ctx.textAlign = 'center'
  ctx.fillStyle = COLOR.ink
  ctx.font = `700 26px ${DISPLAY}`
  ctx.fillText(`Lv ${data.level}`, ringCx, ringCy - 1)
  ctx.font = `500 13px ${MONO}`
  ctx.fillStyle = COLOR.inkMuted
  ctx.fillText(`${data.xp.toLocaleString()} XP`, ringCx, ringCy + 20)
  ctx.font = `600 15px ${SANS}`
  ctx.fillStyle = COLOR.cyan
  ctx.fillText(fitText(ctx, data.levelTitle, 180), ringCx, ringCy + ringR + 26)

  /* divider */
  const dividerY = M + 156
  ctx.strokeStyle = COLOR.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(M, dividerY)
  ctx.lineTo(W - M, dividerY)
  ctx.stroke()

  /* stat tiles */
  const stats: { icon: string; value: string; label: string }[] = [
    { icon: '📘', value: `${data.lessonsDone}/${data.lessonsTotal}`, label: 'lessons complete' },
    { icon: '🔥', value: String(data.currentStreak), label: 'day streak' },
    { icon: '🏆', value: String(data.longestStreak), label: 'longest streak' },
    { icon: '🧩', value: String(data.exercisesDone), label: 'exercises solved' },
    { icon: '⏱️', value: data.studyTimeLabel, label: 'studied' },
  ]
  const tilesY = dividerY + 24
  const tileH = 92
  const tileGap = 16
  const tileW = (W - M * 2 - tileGap * (stats.length - 1)) / stats.length
  stats.forEach((s, i) => {
    const x = M + i * (tileW + tileGap)
    roundRectPath(ctx, x, tilesY, tileW, tileH, 14)
    ctx.fillStyle = COLOR.surface2
    ctx.fill()
    ctx.strokeStyle = COLOR.border
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.font = '26px sans-serif'
    ctx.fillText(s.icon, x + 16, tilesY + 40)
    ctx.font = `600 26px ${MONO}`
    ctx.fillStyle = COLOR.ink
    ctx.fillText(fitText(ctx, s.value, tileW - 60), x + 52, tilesY + 40)
    ctx.font = `400 14px ${SANS}`
    ctx.fillStyle = COLOR.inkDim
    ctx.fillText(fitText(ctx, s.label, tileW - 28), x + 16, tilesY + 70)
  })

  /* curriculum progress (skills) */
  let y = tilesY + tileH + 40
  ctx.font = `600 13px ${SANS}`
  ctx.fillStyle = COLOR.inkDim
  ctx.textAlign = 'left'
  ctx.fillText('CURRICULUM PROGRESS', M, y)
  y += 22

  const skillColW = (W - M * 2 - 40) / 2
  data.skills.forEach((skill, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (skillColW + 40)
    const rowY = y + row * 46
    ctx.font = `500 16px ${SANS}`
    ctx.fillStyle = COLOR.ink
    ctx.textAlign = 'left'
    ctx.fillText(`${skill.emoji} ${skill.name}`, x, rowY)
    ctx.font = `500 14px ${MONO}`
    ctx.fillStyle = COLOR.inkMuted
    ctx.textAlign = 'right'
    ctx.fillText(`${skill.done}/${skill.total}`, x + skillColW, rowY)
    drawBar(ctx, x, rowY + 10, skillColW, 8, skill.total > 0 ? skill.done / skill.total : 0, skill.color)
  })
  y += Math.ceil(data.skills.length / 2) * 46 + 30

  /* mastered tiers */
  ctx.textAlign = 'left'
  ctx.font = `600 13px ${SANS}`
  ctx.fillStyle = COLOR.inkDim
  ctx.fillText('SKILLS MASTERED', M, y)
  y += 20
  const tierChips: Chip[] =
    data.masteredTiers.length > 0
      ? data.masteredTiers.map((name) => ({ text: name, fg: COLOR.mint, bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.35)' }))
      : [{ text: 'Just getting started', fg: COLOR.inkMuted, bg: COLOR.surface2, border: COLOR.border }]
  y = drawChips(ctx, tierChips, M, y, W - M * 2, `500 15px ${SANS}`) + 26

  /* badges */
  ctx.font = `600 13px ${SANS}`
  ctx.fillStyle = COLOR.inkDim
  ctx.fillText(`BADGES EARNED · ${data.badges.length}`, M, y)
  y += 20
  const badgeChips: Chip[] =
    data.badges.length > 0
      ? data.badges.map((b) => ({ text: `${b.icon} ${b.name}`, fg: COLOR.amber, bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.35)' }))
      : [{ text: 'The first badge is one lesson away', fg: COLOR.inkMuted, bg: COLOR.surface2, border: COLOR.border }]
  const contentBottom = drawChips(ctx, badgeChips, M, y, W - M * 2, `500 15px ${SANS}`)

  /* footer */
  const footerY = H - 42
  ctx.textAlign = 'left'
  ctx.font = `600 14px ${MONO}`
  ctx.fillStyle = COLOR.inkMuted
  ctx.fillText('JAVA MASTERY TRACK', M, footerY)
  ctx.font = `400 13px ${SANS}`
  ctx.fillStyle = COLOR.inkDim
  ctx.fillText('Verified Java · Java 25 LTS baseline', M, footerY + 18)

  ctx.textAlign = 'right'
  ctx.font = `400 13px ${MONO}`
  ctx.fillStyle = COLOR.inkDim
  ctx.fillText(`Generated ${data.generatedOn}`, W - M, footerY + 9)

  const barY = H - 8
  const spectrum = ctx.createLinearGradient(M, 0, W - M, 0)
  spectrum.addColorStop(0, COLOR.cyan)
  spectrum.addColorStop(0.5, COLOR.magenta)
  spectrum.addColorStop(1, COLOR.mint)
  roundRectPath(ctx, M, barY, W - M * 2, 4, 2)
  ctx.fillStyle = spectrum
  ctx.fill()

  return contentBottom
}

/** Draws the whole card onto `canvas` (resized to fit its content) and resolves once every asset has loaded. */
export async function renderShareCard(canvas: HTMLCanvasElement, data: ShareCardData): Promise<void> {
  const [avatarImg] = await Promise.all([
    data.identity.avatar ? loadImage(data.identity.avatar).catch(() => null) : Promise.resolve(null),
    ensureFontsReady(),
  ])

  // Pass 1 — measure: paint onto a tall, throwaway canvas just to learn where the content ends. Every element is
  // positioned top-down from the same margin regardless of canvas height, so this yields the real content height.
  const scratch = document.createElement('canvas')
  scratch.width = CARD_WIDTH * RENDER_SCALE
  scratch.height = 3000 * RENDER_SCALE
  const scratchCtx = scratch.getContext('2d')
  if (!scratchCtx) throw new Error('canvas 2D context is not available')
  scratchCtx.scale(RENDER_SCALE, RENDER_SCALE)
  const contentBottom = paint(scratchCtx, data, avatarImg, 3000)

  // Pass 2 — the real card, sized to fit that content plus the footer, never shorter than the floor.
  const height = Math.max(MIN_CARD_HEIGHT, Math.round(contentBottom + FOOTER_RESERVE))
  canvas.width = CARD_WIDTH * RENDER_SCALE
  canvas.height = height * RENDER_SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2D context is not available')
  ctx.scale(RENDER_SCALE, RENDER_SCALE)
  paint(ctx, data, avatarImg, height)
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('could not encode the image'))), 'image/png')
  })
}

/** A slug for the downloaded file name: "ada-lovelace-java-mastery-track-2026-09-26.png". */
export function shareCardFileName(name: string, dateISO: string): string {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'my'
  return `${slug}-java-mastery-track-${dateISO}.png`
}

/** A short, paste-ready caption for a LinkedIn post or "About" section — the text twin of the image card. */
export function buildSummaryText(data: ShareCardData): string {
  const lines: string[] = []
  lines.push('🚀 Java Mastery Track — progress update')
  lines.push('')
  const who = [displayName(data.identity), data.identity.headline.trim()].filter(Boolean).join(' · ')
  lines.push(who)
  lines.push(`Level ${data.level} — ${data.levelTitle} · ${data.xp.toLocaleString()} XP`)
  lines.push(
    `📘 ${data.lessonsDone}/${data.lessonsTotal} lessons · 🔥 ${data.currentStreak}-day streak (longest ${data.longestStreak}) · 🧩 ${data.exercisesDone} exercises · ✅ ${data.quizCorrect} quiz answers correct`,
  )
  if (data.masteredTiers.length > 0) {
    lines.push('')
    lines.push(`Skills mastered: ${data.masteredTiers.join(', ')}`)
  }
  if (data.badges.length > 0) {
    lines.push('')
    const names = data.badges.slice(0, 6).map((b) => b.name)
    const more = data.badges.length > names.length ? ` +${data.badges.length - names.length} more` : ''
    lines.push(`🏅 ${data.badges.length} badges earned, including: ${names.join(', ')}${more}`)
  }
  lines.push('')
  lines.push('#Java #LearningInPublic #JavaMasteryTrack')
  return lines.join('\n')
}
