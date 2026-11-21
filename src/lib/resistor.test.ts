import { describe, expect, it } from 'vitest'
import {
  bandRoles,
  calculate,
  colorsFor,
  formatOhms,
  formatResistance,
  type BandCount,
  type ColorName,
} from './resistor'

const value = (count: BandCount, ...bands: ColorName[]) => calculate(count, bands)

describe('calculate', () => {
  it('reads a 4-band resistor', () => {
    expect(value(4, 'yellow', 'violet', 'red', 'gold')).toEqual({ ohms: 4700, tolerance: 5 })
    expect(value(4, 'brown', 'black', 'orange', 'silver')).toEqual({ ohms: 10_000, tolerance: 10 })
  })

  it('reads a 3-band resistor with the implied ±20%', () => {
    expect(value(3, 'red', 'red', 'orange')).toEqual({ ohms: 22_000, tolerance: 20 })
  })

  it('reads a 5-band resistor', () => {
    expect(value(5, 'brown', 'black', 'green', 'brown', 'brown')).toEqual({ ohms: 1050, tolerance: 1 })
  })

  it('reads a 6-band resistor with its temperature coefficient', () => {
    expect(value(6, 'brown', 'black', 'black', 'red', 'brown', 'red')).toEqual({
      ohms: 10_000,
      tolerance: 1,
      tempco: 50,
    })
  })

  it('handles a leading black digit', () => {
    expect(value(4, 'black', 'brown', 'black', 'gold')?.ohms).toBe(1)
  })

  it('divides by gold and silver multipliers without float noise', () => {
    expect(value(4, 'yellow', 'violet', 'silver', 'gold')?.ohms).toBe(0.47)
    expect(value(4, 'yellow', 'violet', 'gold', 'gold')?.ohms).toBe(4.7)
    expect(value(5, 'white', 'white', 'white', 'silver', 'brown')?.ohms).toBe(9.99)
  })

  it('supports gray and white multipliers (missing in the 2013 version)', () => {
    expect(value(4, 'brown', 'black', 'gray', 'gold')?.ohms).toBe(1e9)
    expect(value(4, 'brown', 'black', 'white', 'gold')?.ohms).toBe(1e10)
  })

  it('uses the IEC 60062 tolerances (violet was 0.01% in the 2013 version)', () => {
    const tol = (c: ColorName) => value(4, 'brown', 'black', 'red', c)?.tolerance
    expect(tol('violet')).toBe(0.1)
    expect(tol('gray')).toBe(0.01)
    expect(tol('blue')).toBe(0.25)
    expect(tol('green')).toBe(0.5)
  })

  it('returns null while a band is missing', () => {
    expect(calculate(4, ['brown', 'black', null, 'gold'])).toBeNull()
    expect(calculate(4, ['brown', 'black', 'red'])).toBeNull()
  })

  it('returns null when a color is invalid for its band', () => {
    expect(value(4, 'gold', 'black', 'red', 'gold')).toBeNull() // gold isn't a digit
    expect(value(4, 'brown', 'black', 'red', 'white')).toBeNull() // white has no tolerance
    expect(value(6, 'brown', 'black', 'black', 'red', 'brown', 'gold')).toBeNull()
  })

  it('ignores extra bands kept from a larger band count', () => {
    expect(calculate(3, ['red', 'red', 'orange', 'gold', 'red'])).toEqual({ ohms: 22_000, tolerance: 20 })
  })
})

describe('bandRoles / colorsFor', () => {
  it('describes each band count', () => {
    expect(bandRoles(3)).toEqual(['digit', 'digit', 'multiplier'])
    expect(bandRoles(6)).toEqual(['digit', 'digit', 'digit', 'multiplier', 'tolerance', 'tempco'])
  })

  it('offers only valid colors for each role', () => {
    const names = (role: Parameters<typeof colorsFor>[0]) => colorsFor(role).map((c) => c.name)
    expect(names('digit')).toHaveLength(10)
    expect(names('digit')).not.toContain('gold')
    expect(names('multiplier')).toHaveLength(12)
    expect(names('tolerance')).toEqual(['brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'gold', 'silver'])
    expect(names('tempco')).toEqual(['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray'])
  })
})

describe('formatting', () => {
  it.each([
    [0, '0 Ω'],
    [0.47, '0.47 Ω'],
    [4.7, '4.7 Ω'],
    [470, '470 Ω'],
    [1000, '1 kΩ'],
    [1050, '1.05 kΩ'],
    [4700, '4.7 kΩ'],
    [999_000, '999 kΩ'],
    [1_000_000, '1 MΩ'],
    [2.2e7, '22 MΩ'],
    [1e10, '10 GΩ'],
    [9.99e11, '999 GΩ'], // largest band value: white-white-white ×10⁹
    [0.01, '0.01 Ω'], // smallest non-zero band value
    // Rounding to 3 significant figures can carry into the next prefix.
    [999.5, '1 kΩ'],
    [999_500, '1 MΩ'],
    [999_950, '1 MΩ'],
  ])('formatOhms(%s) = %s', (ohms, text) => {
    expect(formatOhms(ohms)).toBe(text)
  })

  it('formats a full result', () => {
    expect(formatResistance({ ohms: 4700, tolerance: 5 })).toBe('4.7 kΩ ±5%')
    expect(formatResistance({ ohms: 10_000, tolerance: 1, tempco: 50 })).toBe('10 kΩ ±1% 50 ppm/K')
  })
})
