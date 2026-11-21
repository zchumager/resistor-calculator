import { useLayoutEffect, useRef } from 'react'
import {
  colorsFor,
  formatTempco,
  formatTolerance,
  ROLE_LABELS,
  type BandColor,
  type BandRole,
  type ColorName,
} from '../lib/resistor'

interface Props {
  bandIndex: number
  role: BandRole
  value: ColorName | null
  onPick: (color: ColorName) => void
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function meaning(role: BandRole, color: BandColor): string {
  switch (role) {
    case 'digit':
      return String(color.digit)
    case 'multiplier': {
      const e = color.exponent!
      if (e < 0) return `×${10 ** e}` // ×0.1, ×0.01
      return e <= 3 ? `×${10 ** e}` : `×10${SUPERSCRIPT[e]}`
    }
    case 'tolerance':
      return formatTolerance(color.tolerance!)
    case 'tempco':
      return formatTempco(color.tempco!)
  }
}

export function ColorPalette({ bandIndex, role, value, onPick }: Props) {
  const group = useRef<HTMLDivElement>(null)
  // Set when a swatch is picked. A pick moves on to the next band, whose palette may not
  // include the swatch that had focus; without this, keyboard focus would fall back to <body>.
  const refocus = useRef(false)

  useLayoutEffect(() => {
    if (!refocus.current) return
    refocus.current = false
    const target =
      group.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
      group.current?.querySelector<HTMLButtonElement>('button')
    target?.focus()
  }, [bandIndex])

  const pick = (color: ColorName) => {
    refocus.current = true
    onPick(color)
  }

  const heading = `Band ${bandIndex + 1}: ${ROLE_LABELS[role]}`
  return (
    <section className="palette">
      <h2 id="palette-heading">{heading}</h2>
      <div className="swatches" role="group" aria-labelledby="palette-heading" ref={group}>
        {colorsFor(role).map((color) => {
          const text = meaning(role, color)
          return (
            <button
              key={color.name}
              type="button"
              className="swatch"
              aria-label={`${color.label}, ${text}`}
              aria-pressed={color.name === value}
              onClick={() => pick(color.name)}
            >
              <span className="chip" style={{ background: color.hex }} aria-hidden="true" />
              <span className="swatch-name">{color.label}</span>
              <span className="swatch-meaning">{text}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
