// Full-text search with Pagefind, as on locize.com's docs. The index is written by `pagefind --site dist/client`
// after the build; `npm start` serves the index of the last build, if there is one. Used by the search field and
// the 404 page.
const PAGEFIND_URL = '/pagefind/pagefind.js'
let pagefind
const loadPagefind = () => (pagefind ??= import(/* @vite-ignore */ PAGEFIND_URL).catch(() => { pagefind = undefined; return null }))

// The first hits for a query, or null without an index (no build yet). Also used by the 404 page.
export async function searchPages (query, limit = 8, debounced = false) {
  const pf = await loadPagefind()
  if (!pf) return null
  const search = await (debounced ? pf.debouncedSearch(query) : pf.search(query))
  if (!search) return undefined // superseded by a newer keystroke
  const data = await Promise.all(search.results.slice(0, limit).map(r => r.data()))
  // Pagefind URLs end in a slash (/overview/api/); the site serves them without.
  return data.map(d => ({ href: d.url.replace(/(.)\/$/, '$1'), title: d.meta.title, description: d.meta.description, excerpt: d.excerpt }))
}
