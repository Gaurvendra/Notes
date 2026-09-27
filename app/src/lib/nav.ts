import {
  BookOpenCheck,
  Brain,
  FileSearch,
  Home,
  ListChecks,
  MessagesSquare,
  Route,
  ScrollText,
  Settings as SettingsIcon,
  Sparkles,
  Swords,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Exact-match only, so a parent route doesn't stay highlighted on its children. */
  end?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** Grouped by what you are doing: learning, practising, reviewing your progress. */
export const NAV: NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/start', label: 'Start here', icon: Sparkles },
      { to: '/path', label: 'Learning path', icon: Route },
    ],
  },
  {
    label: 'Practise',
    items: [
      { to: '/revision', label: 'Revision', icon: Brain },
      { to: '/practice', label: 'Practice', icon: Swords },
      { to: '/interview', label: 'Interview prep', icon: MessagesSquare },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/cheatsheets', label: 'Cheat sheets', icon: ScrollText },
      { to: '/glossary', label: 'Glossary', icon: BookOpenCheck },
      { to: '/java-versions', label: 'Java versions', icon: ListChecks },
      { to: '/notes-audit', label: 'Notes audit', icon: FileSearch },
    ],
  },
  {
    label: 'You',
    items: [
      { to: '/profile', label: 'Profile & badges', icon: UserRound },
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items)

