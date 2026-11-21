// Resistor color code, IEC 60062:2016.
// https://en.wikipedia.org/wiki/Electronic_color_code

export type ColorName =
  | 'black'
  | 'brown'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'gray'
  | 'white'
  | 'gold'
  | 'silver'

export interface BandColor {
  name: ColorName
  label: string
  /** Swatch color used to draw the band. */
  hex: string
  /** Significant figure, 0–9. */
  digit?: number
  /** Multiplier as a power of ten, -2 (silver) to 9 (white). */
  exponent?: number
  /** Tolerance in percent (±). */
  tolerance?: number
  /** Temperature coefficient in ppm/K. */
  tempco?: number
}

export const COLORS: readonly BandColor[] = [
  { name: 'black', label: 'Black', hex: '#1a1a1a', digit: 0, exponent: 0, tempco: 250 },
  { name: 'brown', label: 'Brown', hex: '#7b3f00', digit: 1, exponent: 1, tolerance: 1, tempco: 100 },
  { name: 'red', label: 'Red', hex: '#d32f2f', digit: 2, exponent: 2, tolerance: 2, tempco: 50 },
  { name: 'orange', label: 'Orange', hex: '#f57c00', digit: 3, exponent: 3, tolerance: 0.05, tempco: 15 },
  { name: 'yellow', label: 'Yellow', hex: '#fdd835', digit: 4, exponent: 4, tolerance: 0.02, tempco: 25 },
  { name: 'green', label: 'Green', hex: '#388e3c', digit: 5, exponent: 5, tolerance: 0.5, tempco: 20 },
  { name: 'blue', label: 'Blue', hex: '#1976d2', digit: 6, exponent: 6, tolerance: 0.25, tempco: 10 },
  { name: 'violet', label: 'Violet', hex: '#7b1fa2', digit: 7, exponent: 7, tolerance: 0.1, tempco: 5 },
  { name: 'gray', label: 'Gray', hex: '#8e8e8e', digit: 8, exponent: 8, tolerance: 0.01, tempco: 1 },
  { name: 'white', label: 'White', hex: '#f5f5f5', digit: 9, exponent: 9 },
  { name: 'gold', label: 'Gold', hex: '#c9a227', exponent: -1, tolerance: 5 },
  { name: 'silver', label: 'Silver', hex: '#b0b0b0', exponent: -2, tolerance: 10 },
]

const BY_NAME = new Map(COLORS.map((c) => [c.name, c]))

export function colorByName(name: ColorName): BandColor {
  const color = BY_NAME.get(name)
  if (!color) throw new Error(`Unknown color: ${name}`)
  return color
}

export function isColorName(value: unknown): value is ColorName {
  return typeof value === 'string' && BY_NAME.has(value as ColorName)
}

export type BandRole = 'digit' | 'multiplier' | 'tolerance' | 'tempco'

export const BAND_COUNTS = [3, 4, 5, 6] as const
export type BandCount = (typeof BAND_COUNTS)[number]

/** Tolerance of a resistor without a tolerance band (3-band). */
export const NO_BAND_TOLERANCE = 20

const ROLES: Record<BandCount, readonly BandRole[]> = {
  3: ['digit', 'digit', 'multiplier'],
  4: ['digit', 'digit', 'multiplier', 'tolerance'],
  5: ['digit', 'digit', 'digit', 'multiplier', 'tolerance'],
  6: ['digit', 'digit', 'digit', 'multiplier', 'tolerance', 'tempco'],
}

/** What each band means, from the band nearest one end of the resistor. */
export function bandRoles(count: BandCount): readonly BandRole[] {
  return ROLES[count]
}

const ROLE_KEY = {
  digit: 'digit',
  multiplier: 'exponent',
  tolerance: 'tolerance',
  tempco: 'tempco',
} as const satisfies Record<BandRole, keyof BandColor>

/** Colors that are valid for a band with the given role. */
export function colorsFor(role: BandRole): BandColor[] {
  return COLORS.filter((c) => c[ROLE_KEY[role]] !== undefined)
}

export function isValidFor(role: BandRole, name: ColorName): boolean {
  return colorByName(name)[ROLE_KEY[role]] !== undefined
}

export const ROLE_LABELS: Record<BandRole, string> = {
  digit: 'Digit',
  multiplier: 'Multiplier',
  tolerance: 'Tolerance',
  tempco: 'Temperature coefficient',
}

export interface Resistance {
  ohms: number
  /** ± percent */
  tolerance: number
  /** ppm/K, only for 6-band resistors */
  tempco?: number
}

/**
 * Value of a resistor from its band colors, or null while a band is missing or a color isn't
 * valid for its band.
 */
export function calculate(count: BandCount, bands: readonly (ColorName | null)[]): Resistance | null {
  const roles = bandRoles(count)
  if (bands.length < roles.length) return null

  let digits = 0
  let exponent = 0
  let tolerance = NO_BAND_TOLERANCE
  let tempco: number | undefined

  for (const [i, role] of roles.entries()) {
    const name = bands[i]
    if (name == null || !isValidFor(role, name)) return null
    const color = colorByName(name)
    switch (role) {
      case 'digit':
        digits = digits * 10 + color.digit!
        break
      case 'multiplier':
        exponent = color.exponent!
        break
      case 'tolerance':
        tolerance = color.tolerance!
        break
      case 'tempco':
        tempco = color.tempco!
        break
    }
  }

  // Dividing an integer by an exact power of ten rounds correctly (47 / 100 = 0.47), unlike
  // multiplying by 0.01, which gives 0.47000000000000003.
  const ohms = exponent >= 0 ? digits * 10 ** exponent : digits / 10 ** -exponent
  return tempco === undefined ? { ohms, tolerance } : { ohms, tolerance, tempco }
}

const OHM = 'Ω' // Ω

const PREFIXES = [
  { factor: 1e9, prefix: 'G' },
  { factor: 1e6, prefix: 'M' },
  { factor: 1e3, prefix: 'k' },
] as const

/** 4700 → "4.7 kΩ", 0.47 → "0.47 Ω". */
export function formatOhms(ohms: number): string {
  // Round before choosing the prefix, so 999.5 becomes "1 kΩ", not "1000 Ω".
  const rounded = round3(ohms)
  for (const { factor, prefix } of PREFIXES) {
    if (rounded >= factor) return `${round3(rounded / factor)} ${prefix}${OHM}`
  }
  return `${rounded} ${OHM}`
}

/** At most 3 significant figures come from the bands, so this drops only float noise. */
function round3(value: number): number {
  return Number(value.toPrecision(3))
}

export function formatTolerance(percent: number): string {
  return `±${percent}%`
}

export function formatTempco(ppm: number): string {
  return `${ppm} ppm/K`
}

/** One-line summary, e.g. "4.7 kΩ ±5%" or "10 kΩ ±1% 100 ppm/K". */
export function formatResistance(r: Resistance): string {
  const parts = [formatOhms(r.ohms), formatTolerance(r.tolerance)]
  if (r.tempco !== undefined) parts.push(formatTempco(r.tempco))
  return parts.join(' ')
}
