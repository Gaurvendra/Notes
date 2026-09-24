/**
 * The scheme catalogue. Adding one means adding a dark block and a light
 * block in styles/themes.css, plus an entry here — nothing else.
 *
 * `swatch` names the three tokens the picker previews, in the order
 * background / primary / secondary, so a scheme can be recognised at a
 * glance without applying it.
 */
export interface ThemeDef {
  id: ThemeId
  name: string
  blurb: string
}

export type ThemeId = 'cyber' | 'slate' | 'nord' | 'rose' | 'solar' | 'forest' | 'glass'
export type ThemeMode = 'dark' | 'light'

export const THEMES: readonly ThemeDef[] = [
  { id: 'cyber', name: 'Cyber', blurb: 'Deep navy, cyan and magenta neon' },
  { id: 'slate', name: 'Slate', blurb: 'Neutral and professional' },
  { id: 'nord', name: 'Nord', blurb: 'Arctic blue-grey, low contrast' },
  { id: 'rose', name: 'Rosé', blurb: 'Warm plum and rose' },
  { id: 'solar', name: 'Solar', blurb: 'Solarized, balanced lightness' },
  { id: 'forest', name: 'Forest', blurb: 'Deep green, high contrast' },
  { id: 'glass', name: 'Liquid Glass', blurb: 'Apple Liquid Glass — translucent, vibrant, floating' },
] as const

export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id)

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light'
}
