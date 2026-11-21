import { colorByName, ROLE_LABELS } from '../lib/resistor'
import type { Band } from '../state'

interface Props {
  bands: Band[]
  selected: number
  /** 5- and 6-band resistors are usually metal film, drawn with a blue body. */
  precision: boolean
  onSelect: (index: number) => void
}

export function Resistor({ bands, selected, precision, onSelect }: Props) {
  // Real resistors leave a gap before the tolerance band, so it reads from the other end.
  const split = bands.findIndex((b) => b.role === 'tolerance')
  const main = split === -1 ? bands : bands.slice(0, split)
  const tail = split === -1 ? [] : bands.slice(split)

  const renderBand = (band: Band) => {
    const color = band.color ? colorByName(band.color) : null
    const label = `Band ${band.index + 1}, ${ROLE_LABELS[band.role].toLowerCase()}: ${color ? color.label : 'not set'}`
    return (
      <button
        key={band.index}
        type="button"
        className="band"
        data-empty={color === null || undefined}
        aria-label={label}
        aria-pressed={band.index === selected}
        style={color ? { background: color.hex } : undefined}
        onClick={() => onSelect(band.index)}
      >
        {color === null && <span aria-hidden="true">?</span>}
      </button>
    )
  }

  return (
    <div className="resistor" data-precision={precision || undefined}>
      <div className="lead" aria-hidden="true" />
      <div className="body" role="group" aria-label="Resistor bands">
        <div className="band-group">{main.map(renderBand)}</div>
        {tail.length > 0 && <div className="band-group">{tail.map(renderBand)}</div>}
      </div>
      <div className="lead" aria-hidden="true" />
    </div>
  )
}
