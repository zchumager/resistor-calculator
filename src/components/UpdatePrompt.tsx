import { useRegisterSW } from 'virtual:pwa-register/react'

/** Tells the user when the app works offline, and when a new version is ready to load. */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  // The status region stays mounted even when empty: screen readers often skip a live region
  // that appears together with its text.
  return (
    <div role="status">
      {(offlineReady || needRefresh) && (
        <div className="toast">
          <span>{needRefresh ? 'A new version is available.' : 'Ready to work offline.'}</span>
          {needRefresh && (
            <button type="button" className="toast-primary" onClick={() => updateServiceWorker(true)}>
              Reload
            </button>
          )}
          <button type="button" onClick={close}>
            {needRefresh ? 'Later' : 'OK'}
          </button>
        </div>
      )}
    </div>
  )
}
