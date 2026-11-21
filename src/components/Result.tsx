import { formatOhms, formatTempco, formatTolerance, type Resistance } from '../lib/resistor'
import type { Band } from '../state'

interface Props {
  result: Resistance | null
  bands: Band[]
}

export function Result({ result, bands }: Props) {
  const missing = bands.filter((b) => b.color === null).map((b) => b.index + 1)
  return (
    <section className="result" aria-live="polite">
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
    </section>
  )
}
