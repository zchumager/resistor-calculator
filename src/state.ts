import {
  BAND_COUNTS,
  bandRoles,
  calculate,
  isColorName,
  isValidFor,
  type BandCount,
  type BandRole,
  type ColorName,
  type Resistance,
} from './lib/resistor'

/**
 * Picks are stored by role, not by band position, so switching the band count keeps them:
 * a 4-band resistor uses the first two digits, a 5- or 6-band one uses all three.
 */
export interface Picks {
  digits: [ColorName | null, ColorName | null, ColorName | null]
  multiplier: ColorName | null
  tolerance: ColorName | null
  tempco: ColorName | null
}

export interface State {
  count: BandCount
  picks: Picks
  /** Index of the band the palette edits. */
  selected: number
}

export const EMPTY_PICKS: Picks = { digits: [null, null, null], multiplier: null, tolerance: null, tempco: null }

export const INITIAL_STATE: State = { count: 4, picks: EMPTY_PICKS, selected: 0 }

export interface Band {
  index: number
  role: BandRole
  color: ColorName | null
}

/** The visible bands, in order, for the current band count. */
export function bandsOf(state: Pick<State, 'count' | 'picks'>): Band[] {
  let digit = 0
  return bandRoles(state.count).map((role, index) => {
    const color = role === 'digit' ? state.picks.digits[digit++] : state.picks[role]
    return { index, role, color }
  })
}

export function resultOf(state: Pick<State, 'count' | 'picks'>): Resistance | null {
  return calculate(
    state.count,
    bandsOf(state).map((b) => b.color),
  )
}

export type Action =
  | { type: 'setCount'; count: BandCount }
  | { type: 'select'; index: number }
  | { type: 'pick'; color: ColorName }
  | { type: 'clear' }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setCount': {
      if (action.count === state.count) return state
      const next = { ...state, count: action.count }
      return { ...next, selected: firstEmpty(next) }
    }
    case 'select':
      if (action.index < 0 || action.index >= state.count) return state
      return { ...state, selected: action.index }
    case 'pick': {
      const bands = bandsOf(state)
      const band = bands[state.selected]
      if (!band || !isValidFor(band.role, action.color)) return state
      const picks = setPick(state, band.index, action.color)
      // Move on to the next band so a resistor can be entered in one pass.
      const selected = Math.min(band.index + 1, state.count - 1)
      return { ...state, picks, selected }
    }
    case 'clear':
      return { ...state, picks: EMPTY_PICKS, selected: 0 }
  }
}

function setPick(state: State, index: number, color: ColorName): Picks {
  const roles = bandRoles(state.count)
  const role = roles[index]
  if (role === 'digit') {
    const digit = roles.slice(0, index).filter((r) => r === 'digit').length
    const digits = [...state.picks.digits] as Picks['digits']
    digits[digit] = color
    return { ...state.picks, digits }
  }
  return { ...state.picks, [role]: color }
}

function firstEmpty(state: State): number {
  const empty = bandsOf(state).find((b) => b.color === null)
  return empty ? empty.index : 0
}

/** Rebuilds a state from untrusted saved data; anything invalid falls back to the defaults. */
export function restoreState(saved: unknown): State {
  if (typeof saved !== 'object' || saved === null) return INITIAL_STATE
  const s = saved as Record<string, unknown>
  const count = BAND_COUNTS.find((c) => c === s.count) ?? INITIAL_STATE.count
  const p = (typeof s.picks === 'object' && s.picks !== null ? s.picks : {}) as Record<string, unknown>

  const valid = (role: BandRole, value: unknown): ColorName | null =>
    isColorName(value) && isValidFor(role, value) ? value : null
  const rawDigits = Array.isArray(p.digits) ? p.digits : []

  const picks: Picks = {
    digits: [valid('digit', rawDigits[0]), valid('digit', rawDigits[1]), valid('digit', rawDigits[2])],
    multiplier: valid('multiplier', p.multiplier),
    tolerance: valid('tolerance', p.tolerance),
    tempco: valid('tempco', p.tempco),
  }
  const state = { count, picks, selected: 0 }
  return { ...state, selected: firstEmpty(state) }
}
