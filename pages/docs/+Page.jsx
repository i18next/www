// One docs page: the section's SUMMARY as sidebar, the converted Markdown with its tools, previous and next,
// and "On this page" in G's third column (on narrower screens folded above the text).
import { Fragment, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useData } from 'vike-react/useData'
import { YouTubeEmbed } from '../../src/YouTubeEmbed.jsx'
import { CopyPage } from '../../src/CopyPage.jsx'
import { StaticHtml } from '../../src/StaticHtml.jsx'
import { Toc } from '../../src/Toc.jsx'
import { GitHubLink } from '../../src/GitHubLink.jsx'

export default function Page () {
  const { title, route, md, section, prev, next, toc, edit } = useData()
  const content = useRef(null)

  // The page HTML is a string; each <div data-youtube> in it gets the consent-gated player.
  useEffect(() => {
    const roots = [...content.current.querySelectorAll('[data-youtube]')].map(el => {
      const root = createRoot(el)
      root.render(<YouTubeEmbed id={el.dataset.youtube} start={Number(el.dataset.start)} url={el.querySelector('a')?.href} />)
      return root
    })
    return () => roots.forEach(r => setTimeout(() => r.unmount()))
  }, [])

  // A section of one page shows no menu: one entry adds nothing. The text keeps its column.
  const single = section.groups.flatMap(g => g.items).length === 1
  return (
    <div className={single ? 'wrap docs single' : 'wrap docs'}>
      {!single && (
        <aside className='sidebar'>
          <details open>
            <summary>{section.title} · {title}</summary>
            <div className='side-inner'>
              {section.github && <GitHubLink className='side-repo' href={section.github} label={`${section.title} on GitHub`} />}
              {section.groups.map((g, n) => (
                <Fragment key={n}>
                  {g.title && <h5>{g.title}</h5>}
                  <ul>
                    {g.items.map(i => <li key={i.href}><a href={i.href} aria-current={i.href === route ? 'page' : undefined}>{i.title}</a></li>)}
                  </ul>
                </Fragment>
              ))}
            </div>
          </details>
        </aside>
      )}
      <article className='doc'>
        <div className='page-tools'>
          <a href={md} rel='external'>View as Markdown</a>
          <CopyPage md={md} />
        </div>
        {toc.length > 2 && <details className='toc-inline'><summary>On this page</summary><Toc toc={toc} /></details>}
        <StaticHtml ref={content} data-pagefind-body />
        <nav className='pager' aria-label='Previous and next'>
          {prev ? <a href={prev.route}><small>Previous</small>{prev.title}</a> : <span />}
          {next && <a className='next' href={next.route}><small>Next</small>{next.title}</a>}
        </nav>
        <div className='edit'><a href={edit}>Edit this page</a></div>
      </article>
      {toc.length > 2 && <aside className='toc'><h5>On this page</h5><Toc toc={toc} /></aside>}
    </div>
  )
}
