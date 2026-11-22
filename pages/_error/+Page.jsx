// 404 and errors, in G's look. For a missing page it searches the last part of the address, so an old or
// mistyped link still leads somewhere, and offers the usual ways in.
import { useEffect, useState } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { searchPages } from '../../src/searchPages.js'

const WAYS = [
  ['/introduction', 'i18next', 'The core: t(), plurals, interpolation, namespaces'],
  ['/react', 'React', 'useTranslation, Trans, Suspense'],
  ['/next', 'Next', 'App Router and Pages Router, next-i18next v16'],
  ['/astro', 'Astro', 'Plain i18next at build time'],
  ['/cli', 'CLI', 'extract, status, types'],
  ['/with-your-agent', 'With your agent', 'Prompts for building with an agent'],
  ['/blog', 'Blog', 'Guides and data']
]

export default function Page () {
  const { is404 } = usePageContext()
  const [hits, setHits] = useState([])
  useEffect(() => {
    if (!is404) return
    const words = decodeURIComponent(location.pathname).split('/').filter(Boolean).pop()?.replace(/\.(md|html)$/, '').replace(/[-_]+/g, ' ')
    if (words) searchPages(words, 5).then(found => setHits(found ?? []))
  }, [is404])

  return (
    <div className='wrap not-found'>
      <h1>{is404 ? 'This page does not exist' : 'Something went wrong'}</h1>
      <p className='lead'>
        {is404
          ? 'It may have moved when the docs left GitBook. The search at the top finds every page.'
          : 'Please try again in a moment.'}
      </p>
      {hits.length > 0 && (
        <>
          <h2 className='h-title'>Maybe one of these</h2>
          <ul className='h-docs'>{hits.map(h => <li key={h.href}><a href={h.href}><b>{h.title}</b>{h.description ? <span>{h.description}</span> : <span dangerouslySetInnerHTML={{ __html: h.excerpt }} />}</a></li>)}</ul>
        </>
      )}
      <h2 className='h-title'>Or start here</h2>
      <ul className='h-docs'>{WAYS.map(([href, title, text]) => <li key={href}><a href={href}><b>{title}</b><span>{text}</span></a></li>)}</ul>
      <p className='muted'>For agents: <a href='/llms.txt' rel='external'>llms.txt</a> lists every page, each also as Markdown.</p>
    </div>
  )
}
