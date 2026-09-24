import { useEffect, useState } from 'react'
import { loadAllLessonData, type LessonData } from './lib/lessonData'

/** Every lesson's quiz, interview and flashcard data (loaded once, then cached). */
export function useAllLessonData(): Map<string, LessonData> | undefined {
  const [data, setData] = useState<Map<string, LessonData>>()
  useEffect(() => {
    let alive = true
    loadAllLessonData().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [])
  return data
}
