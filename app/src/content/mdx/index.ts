import type { MDXComponents } from 'mdx/types'
import { Anchor, Callout, CheatSheet, CodeBlock, FaqItem, FileTree, MythVsFact, Table, TabItem, Tabs, VersionBadge } from './basic'
import { BitLayout, Figure, FloatSpacing, LayerDiagram } from './diagrams'
import { FloatLab } from './FloatLab'
import { MemoryDiagram, Step, Stepper } from './memory'
import { Exercise, Flashcards, InterviewSet, PredictOutput, Quiz, Reveal, Solution, Starter, Tests } from './practice'

/** Every tag a lesson may use without importing it (see LESSON_TEMPLATE.md). */
export const mdxComponents: MDXComponents = {
  pre: CodeBlock as MDXComponents['pre'],
  table: Table,
  a: Anchor,
  Callout,
  MythVsFact,
  VersionBadge,
  FaqItem,
  CheatSheet,
  Tabs,
  TabItem,
  FileTree,
  Figure,
  LayerDiagram,
  BitLayout,
  FloatSpacing,
  FloatLab,
  MemoryDiagram,
  Stepper,
  Step,
  PredictOutput,
  Reveal,
  Exercise,
  Starter,
  Tests,
  Solution,
  Quiz,
  InterviewSet,
  Flashcards,
}
