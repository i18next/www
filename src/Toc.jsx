// "On this page": the h2 and h3 of a page (docs page or blog post), as G's third column shows them.
export function Toc ({ toc }) {
  // The shallowest level is the top level: on a page without h2, its h3 are top entries, not indented.
  const nested = toc.some(h => !h.sub)
  return (
    <ul>
      {toc.map(h => <li key={h.id} className={h.sub && nested ? 'sub' : undefined}><a href={`#${h.id}`}>{h.text}</a></li>)}
    </ul>
  )
}
