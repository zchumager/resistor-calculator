import { BAND_COUNTS, type BandCount } from '../lib/resistor'

interface Props {
  value: BandCount
  onChange: (count: BandCount) => void
}

export function BandCountSelector({ value, onChange }: Props) {
  return (
    <div className="segmented" role="group" aria-label="Number of bands">
      {BAND_COUNTS.map((count) => (
        <button
          key={count}
          type="button"
          aria-pressed={count === value}
          onClick={() => onChange(count)}
        >
          {count} bands
        </button>
      ))}
    </div>
  )
}
