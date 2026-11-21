import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdatePrompt } from './UpdatePrompt'

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('UpdatePrompt', () => {
  beforeEach(() => {
    sw.offlineReady = false
    sw.needRefresh = false
    vi.clearAllMocks()
  })

  it('shows nothing normally, but keeps its status region mounted', () => {
    render(<UpdatePrompt />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('offers to reload when a new version is waiting', async () => {
    sw.needRefresh = true
    const user = userEvent.setup()
    render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toHaveTextContent('A new version is available.')
    await user.click(screen.getByRole('button', { name: 'Reload' }))
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('can be dismissed', async () => {
    sw.needRefresh = true
    const user = userEvent.setup()
    render(<UpdatePrompt />)

    await user.click(screen.getByRole('button', { name: 'Later' }))
    expect(sw.setNeedRefresh).toHaveBeenCalledWith(false)
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('says when the app is ready offline', () => {
    sw.offlineReady = true
    render(<UpdatePrompt />)
    expect(screen.getByRole('status')).toHaveTextContent('Ready to work offline.')
  })
})
