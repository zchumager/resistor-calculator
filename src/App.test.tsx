import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './storage'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('copies the result to the clipboard', async () => {
    const user = userEvent.setup() // installs a clipboard stub
    render(<App />)

    for (const color of ['Yellow', 'Violet', 'Red', 'Gold']) await pickColor(user, color)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(await navigator.clipboard.readText()).toBe('4.7 kΩ ±5%')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Copied 4.7 kΩ ±5%')
  })

  it('says so when copying fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'))
    render(<App />)

    for (const color of ['Yellow', 'Violet', 'Red', 'Gold']) await pickColor(user, color)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed')
  })

  it('keeps keyboard focus in the palette when the picked color is not offered for the next band', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Band 3, multiplier/ }))
    palette().getByRole('button', { name: /^Black,/ }).focus()
    await user.keyboard('{Enter}') // black isn't a tolerance color, so its button goes away

    expect(screen.getByRole('heading', { name: 'Band 4: Tolerance' })).toBeInTheDocument()
    expect(palette().getByRole('button', { name: /^Brown,/ })).toHaveFocus() // first swatch
  })

  it('moves focus to the chosen color when the next band already has one', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const color of ['Yellow', 'Violet', 'Red', 'Gold']) await pickColor(user, color)
    await user.click(screen.getByRole('button', { name: /^Band 3, multiplier/ }))
    palette().getByRole('button', { name: /^Black,/ }).focus()
    await user.keyboard('{Enter}')

    expect(palette().getByRole('button', { name: /^Gold,/ })).toHaveFocus()
  })

  it('leaves focus on a resistor band when the user selects it', async () => {
    const user = userEvent.setup()
    render(<App />)

    const band = screen.getByRole('button', { name: /^Band 2, digit/ })
    await user.click(band)
    expect(band).toHaveFocus()
  })

  it('remembers the last band count and colors', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: '5 bands' }))
    for (const color of ['Brown', 'Black', 'Green', 'Brown', 'Brown']) await pickColor(user, color)
    unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: '5 bands' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1.05 kΩ')).toBeInTheDocument()
  })

  it('starts empty when the saved data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    render(<App />)
    expect(screen.getByText('Pick a color for bands 1, 2, 3, 4')).toBeInTheDocument()
  })

  it('clears all bands', async () => {
    const user = userEvent.setup()
    render(<App />)

    await pickColor(user, 'Brown')
    await user.click(screen.getByRole('button', { name: 'Clear all bands' }))
    expect(screen.getByRole('button', { name: 'Band 1, digit: not set' })).toBeInTheDocument()
  })
})
