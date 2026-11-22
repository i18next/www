// The search field in the top bar; the lookup itself is in searchPages.js.
import { useEffect, useState } from 'react'
import { searchPages } from './searchPages.js'

export function Search () {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState(null) // null: closed, 'none': no index, []: no hits

  useEffect(() => {
    let current = true
    if (!query.trim()) return
    searchPages(query, 8, true).then(found => {
      if (!current || found === undefined) return
      setHits(found ?? 'none')
    })
    return () => { current = false }
  }, [query])

  return (
    <div className='shell-search'>
      <input className='search' type='search' placeholder='Search docs' aria-label='Search the docs' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Escape' && setQuery('')} />
      {query.trim() && hits && (
        <ul className='shell-hits' onClick={e => e.target.closest('a') && setQuery('')}>
          {hits === 'none' && <li>Search is not available right now. (No index yet: run npm run build once.)</li>}
          {Array.isArray(hits) && !hits.length && <li>Nothing found.</li>}
          {Array.isArray(hits) && hits.map(h => (
            <li key={h.href}>
              <a href={h.href}>
                <strong>{h.title}</strong>
                {/* Pagefind's excerpt: our own page text, HTML-escaped, with <mark> around the matches. */}
                <span dangerouslySetInnerHTML={{ __html: h.excerpt }} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
