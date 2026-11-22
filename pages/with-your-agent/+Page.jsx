// "With your agent": G's page (content/with-your-agent.html). Its previews are G's scripts in
// public/assets/agent/; they start as soon as they run and expect i18next as a global, which they get
// from this site's own i18next (npm), so nothing loads from a CDN. Loaded after render.
import { useEffect } from 'react'
import { StaticHtml } from '../../src/StaticHtml.jsx'

const SCRIPTS = ['/assets/agent/bakery.js', '/assets/agent/story.js']

export default function Page () {
  useEffect(() => {
    let mounted = true
    import('i18next').then(({ default: i18next }) => {
      if (!mounted) return
      window.i18next = i18next
      for (const src of SCRIPTS) {
        const s = document.createElement('script')
        s.src = src
        s.async = false // keep the order
        document.body.append(s)
      }
    })
    return () => { mounted = false }
  }, [])
  return <StaticHtml className='landing' data-pagefind-body />
}
