import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

const palette = () => within(screen.getByRole('group', { name: /^Band \d/ }))
const pickColor = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(palette().getByRole('button', { name: new RegExp(`^${name}\\b`) }))

describe('App', () => {
  it('shows the value once every band of a 4-band resistor has a color', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Pick a color for bands 1, 2, 3, 4')).toBeInTheDocument()

    await pickColor(user, 'Yellow')
    await pickColor(user, 'Violet')
    await pickColor(user, 'Red')
    expect(screen.getByText('Pick a color for band 4')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Band 4: Tolerance' })).toBeInTheDocument()

    await pickColor(user, 'Gold')
    expect(screen.getByText('4.7 kΩ')).toBeInTheDocument()
    expect(screen.getByText('±5% tolerance')).toBeInTheDocument()
  })

  it('offers only the colors valid for the selected band', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(palette().queryByRole('button', { name: /^Gold/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: /^Band 3, multiplier/ }))
    expect(palette().getByRole('button', { name: /^Gold/ })).toBeInTheDocument()
    expect(palette().getByRole('button', { name: /^Silver/ })).toBeInTheDocument()
  })

  it('shows a 6-band resistor with its temperature coefficient', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '6 bands' }))
    expect(screen.getAllByRole('button', { name: /^Band \d,/ })).toHaveLength(6)

    for (const color of ['Brown', 'Black', 'Black', 'Red', 'Brown', 'Red']) await pickColor(user, color)
    expect(screen.getByText('10 kΩ')).toBeInTheDocument()
    expect(screen.getByText(/±1% tolerance · 50 ppm\/K/)).toBeInTheDocument()
  })

  it('reads a 3-band resistor as ±20%', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '3 bands' }))
    for (const color of ['Red', 'Red', 'Orange']) await pickColor(user, color)
    expect(screen.getByText('22 kΩ')).toBeInTheDocument()
    expect(screen.getByText('±20% tolerance')).toBeInTheDocument()
  })

  it('clears all bands', async () => {
    const user = userEvent.setup()
    render(<App />)

    await pickColor(user, 'Brown')
    await user.click(screen.getByRole('button', { name: 'Clear all bands' }))
    expect(screen.getByRole('button', { name: 'Band 1, digit: not set' })).toBeInTheDocument()
  })
})
