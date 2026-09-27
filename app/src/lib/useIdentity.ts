import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY_IDENTITY, normaliseIdentity, type Identity } from './identity'
import { readJSON, removeKey, writeJSON } from './storage'

const STORAGE_KEY = 'jmt:identity:v1'

export interface UseIdentity {
  identity: Identity
  /** Merges a partial update in and saves it — the usual way to save the edit form. */
  update: (patch: Partial<Identity>) => void
  /** Replaces the whole thing (used by JSON import). */
  replace: (next: Identity) => void
  exportJSON: () => string
  /** Throws with a readable message if `json` isn't a version-1 identity export. */
  importJSON: (json: string) => void
  reset: () => void
}

/**
 * The editable profile (name, headline, bio, avatar, links), stored under its own key so it can be exported,
 * imported and reset independently of earned `Progress`. Same storage adapter, same "no database" rule.
 */
export function useIdentity(): UseIdentity {
  const [identity, setIdentity] = useState<Identity>(() => normaliseIdentity(readJSON(STORAGE_KEY, EMPTY_IDENTITY)))

  useEffect(() => writeJSON(STORAGE_KEY, identity), [identity])

  const update = useCallback((patch: Partial<Identity>) => {
    setIdentity((prev) => normaliseIdentity({ ...prev, ...patch }))
  }, [])

  const replace = useCallback((next: Identity) => setIdentity(normaliseIdentity(next)), [])

  const exportJSON = useCallback(() => JSON.stringify(identity, null, 2), [identity])

  const importJSON = useCallback((json: string) => {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object' || (parsed as Identity).version !== 1) {
      throw new Error('This file is not a Java Mastery Track profile export (version 1).')
    }
    setIdentity(normaliseIdentity(parsed))
  }, [])

  const reset = useCallback(() => {
    removeKey(STORAGE_KEY)
    setIdentity(EMPTY_IDENTITY)
  }, [])

  return useMemo(
    () => ({ identity, update, replace, exportJSON, importJSON, reset }),
    [identity, update, replace, exportJSON, importJSON, reset],
  )
}
