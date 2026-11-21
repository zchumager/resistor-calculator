import { useEffect, useState } from 'react'

type Status = 'idle' | 'copied' | 'failed'

const LABELS: Record<Status, string> = { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' }

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <button type="button" className="copy" onClick={copy} aria-label={`Copy ${text}`} data-status={status}>
      {LABELS[status]}
    </button>
  )
}
