import { useRegisterSW } from 'virtual:pwa-register/react'

/** Tells the user when the app works offline, and when a new version is ready to load. */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="toast" role="status">
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
  )
}
