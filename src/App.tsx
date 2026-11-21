import { useEffect, useReducer } from 'react'
import { BandCountSelector } from './components/BandCountSelector'
import { ColorPalette } from './components/ColorPalette'
import { Resistor } from './components/Resistor'
import { Result } from './components/Result'
import { bandsOf, reducer, resultOf } from './state'
import { loadState, saveState } from './storage'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => saveState(state), [state])
  const bands = bandsOf(state)
  const selected = bands[state.selected]

  return (
    <main className="app">
      <header>
        <h1>Resistor Calculator</h1>
        <p className="subtitle">Select a band, then pick its color.</p>
      </header>

      <BandCountSelector value={state.count} onChange={(count) => dispatch({ type: 'setCount', count })} />

      <Resistor
        bands={bands}
        selected={state.selected}
        precision={state.count >= 5}
        onSelect={(index) => dispatch({ type: 'select', index })}
      />

      <Result result={resultOf(state)} bands={bands} />

      <ColorPalette
        bandIndex={selected.index}
        role={selected.role}
        value={selected.color}
        onPick={(color) => dispatch({ type: 'pick', color })}
      />

      <button type="button" className="clear" onClick={() => dispatch({ type: 'clear' })}>
        Clear all bands
      </button>
    </main>
  )
}
