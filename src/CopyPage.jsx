// "Copy page for your agent" (G's page tools): copies the page's Markdown copy to the clipboard.
// The ClipboardItem takes the fetch as a promise, so Safari keeps the click's permission while it loads.
import { useState } from 'react'

const LABEL = 'Copy page for your agent'

export function CopyPage ({ md }) {
  const [label, setLabel] = useState(LABEL)
  const copy = async () => {
    const text = fetch(md).then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
    try {
      if (window.ClipboardItem) await navigator.clipboard.write([new window.ClipboardItem({ 'text/plain': text.then(t => new Blob([t], { type: 'text/plain' })) })])
      else await navigator.clipboard.writeText(await text)
      setLabel('Copied')
    } catch {
      setLabel('Copy failed: open the Markdown instead')
    }
    setTimeout(() => setLabel(LABEL), 2000)
  }
  return <button type='button' onClick={copy}>{label}</button>
}
