/**
 * Sovereign Storage Migration Helper (Maqar)
 * Seamless zero-downtime migration of client localStorage keys from `sanad_*` to `maqar_*`.
 */

export function getMigratedItem(maqarKey: string, legacySanadKey: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const modern = window.localStorage.getItem(maqarKey)
    if (modern !== null) return modern

    const legacy = window.localStorage.getItem(legacySanadKey)
    if (legacy !== null) {
      // Migrate forward seamlessly
      window.localStorage.setItem(maqarKey, legacy)
      return legacy
    }
    return null
  } catch {
    return null
  }
}

export function setMigratedItem(maqarKey: string, legacySanadKey: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(maqarKey, value)
    // Mirror to legacy key so rollback / older tabs don't lose data
    window.localStorage.setItem(legacySanadKey, value)
  } catch {
    // quota exceeded or private mode
  }
}
