import { createContext, useContext } from 'react'
import type { LessonData, QuizQuestion } from '../lib/lessonData'

export interface LessonContextValue {
  lessonId: string
  data: LessonData | undefined
  /** On a checkpoint page: the mixed quiz (the checkpoint's own questions + the tier's lesson quizzes). */
  checkpointQuiz?: QuizQuestion[]
}

export const LessonContext = createContext<LessonContextValue | null>(null)

export function useLesson(): LessonContextValue {
  const ctx = useContext(LessonContext)
  if (!ctx) throw new Error('This component can only be used inside a lesson')
  return ctx
}
