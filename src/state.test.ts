import { describe, expect, it } from 'vitest'
import type { ColorName } from './lib/resistor'
import { bandsOf, INITIAL_STATE, reducer, restoreState, resultOf, type Action, type State } from './state'

const run = (state: State, ...actions: Action[]) => actions.reduce(reducer, state)
const pick = (color: ColorName): Action => ({ type: 'pick', color })

describe('reducer', () => {
  it('starts as an empty 4-band resistor with the first band selected', () => {
    expect(INITIAL_STATE.count).toBe(4)
    expect(bandsOf(INITIAL_STATE).map((b) => b.color)).toEqual([null, null, null, null])
    expect(INITIAL_STATE.selected).toBe(0)
  })

  it('advances to the next band after each pick', () => {
    const s = run(INITIAL_STATE, pick('yellow'), pick('violet'), pick('red'), pick('gold'))
    expect(bandsOf(s).map((b) => b.color)).toEqual(['yellow', 'violet', 'red', 'gold'])
    expect(s.selected).toBe(3)
    expect(resultOf(s)).toEqual({ ohms: 4700, tolerance: 5 })
  })

  it('ignores a color that is not valid for the selected band', () => {
    const s = run(INITIAL_STATE, pick('gold'))
    expect(s).toBe(INITIAL_STATE)
  })

  it('lets the user re-select and change a band', () => {
    const s = run(INITIAL_STATE, pick('yellow'), pick('violet'), { type: 'select', index: 0 }, pick('red'))
    expect(bandsOf(s).map((b) => b.color)).toEqual(['red', 'violet', null, null])
    expect(s.selected).toBe(1)
  })

  it('keeps picks when switching band counts', () => {
    const four = run(INITIAL_STATE, pick('brown'), pick('black'), pick('red'), pick('gold'))
    const five = run(four, { type: 'setCount', count: 5 })
    expect(bandsOf(five).map((b) => b.color)).toEqual(['brown', 'black', null, 'red', 'gold'])
    expect(five.selected).toBe(2)

    const filled = run(five, pick('black'), { type: 'setCount', count: 6 })
    expect(bandsOf(filled).map((b) => b.color)).toEqual(['brown', 'black', 'black', 'red', 'gold', null])
    expect(filled.selected).toBe(5)

    const back = run(filled, { type: 'setCount', count: 4 })
    expect(resultOf(back)).toEqual({ ohms: 1000, tolerance: 5 })

    const three = run(back, { type: 'setCount', count: 3 })
    expect(resultOf(three)).toEqual({ ohms: 1000, tolerance: 20 })
  })

  it('ignores selecting a band outside the current count', () => {
    expect(run(INITIAL_STATE, { type: 'select', index: 4 })).toBe(INITIAL_STATE)
  })

  it('clears all picks', () => {
    const s = run(INITIAL_STATE, pick('brown'), pick('black'), { type: 'clear' })
    expect(bandsOf(s).every((b) => b.color === null)).toBe(true)
    expect(s.selected).toBe(0)
  })
})

describe('restoreState', () => {
  it('restores valid saved data', () => {
    const saved = { count: 6, picks: { digits: ['brown', 'black', 'black'], multiplier: 'red', tolerance: 'brown', tempco: null } }
    const s = restoreState(JSON.parse(JSON.stringify(saved)))
    expect(s.count).toBe(6)
    expect(bandsOf(s).map((b) => b.color)).toEqual(['brown', 'black', 'black', 'red', 'brown', null])
    expect(s.selected).toBe(5)
  })

  it.each([null, undefined, 42, 'x', [], { count: 7 }, { picks: 'nope' }])('falls back to defaults for %j', (bad) => {
    expect(restoreState(bad)).toEqual(INITIAL_STATE)
  })

  it('drops colors that are unknown or invalid for their band', () => {
    const s = restoreState({ count: 4, picks: { digits: ['gold', 'pink', 'red'], multiplier: 'blue', tolerance: 'white' } })
    expect(bandsOf(s).map((b) => b.color)).toEqual([null, null, 'blue', null])
  })
})
