import { formatOhms, formatResistance, formatTempco, formatTolerance, type Resistance } from '../lib/resistor'
import type { Band } from '../state'
import { CopyButton } from './CopyButton'

interface Props {
  result: Resistance | null
  bands: Band[]
}

export function Result({ result, bands }: Props) {
  const missing = bands.filter((b) => b.color === null).map((b) => b.index + 1)
  return (
    <section className="result">
      <div aria-live="polite">
        {result ? (
          <>
            <p className="value">{formatOhms(result.ohms)}</p>
            <p className="details">
              {formatTolerance(result.tolerance)} tolerance
              {result.tempco !== undefined && <> · {formatTempco(result.tempco)}</>}
            </p>
          </>
        ) : (
          <p className="hint">
            Pick a color for band{missing.length > 1 ? 's' : ''} {missing.join(', ')}
          </p>
        )}
      </div>
      {/* Keyed by value, so "Copied" resets when the value changes. */}
      {result && <CopyButton key={formatResistance(result)} text={formatResistance(result)} />}
    </section>
  )
}
