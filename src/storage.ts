import { INITIAL_STATE, restoreState, type State } from './state'

export const STORAGE_KEY = 'resistor-calculator:last'

/** The last band count and colors, or the defaults if nothing valid is saved. */
export function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? INITIAL_STATE : restoreState(JSON.parse(raw))
  } catch {
    // Storage blocked (private mode, disabled site data) or corrupt JSON.
    return INITIAL_STATE
  }
}

export function saveState({ count, picks }: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, picks }))
  } catch {
    // Not being able to remember the bands is fine.
  }
}
