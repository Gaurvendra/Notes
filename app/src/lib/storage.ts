/**
 * The single localStorage adapter (tech_constraints: "every read/write
 * wrapped in try/catch with a safe default"). Every other module that needs
 * to persist state goes through here so storage can be swapped later.
 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // best-effort persistence only — quota exceeded or storage unavailable
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // best-effort
  }
}
