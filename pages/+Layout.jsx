// The shell with G's class names: top bar, section bar (docs pages only), page, footer.
// Docs data comes from pages/docs/+data.js.
import { useEffect, useRef } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { SECTIONS, MORE, sectionOf } from '../src/sections.js'
import { GitHubLink } from '../src/GitHubLink.jsx'
import { Search } from '../src/Search.jsx'
import { useCookieConsent } from '../src/cookieConsent.js'

// The Markdown copy of the page on screen: docs pages and blog posts carry it in their data, G's pages have fixed
// ones (scripts/postbuild.js). The 404 page has none.
const mdOf = (path, data) => data?.md ??
  ((path.startsWith('/blog/') || path.startsWith('/with-your-agent')) && data?.route ? `${data.route}.md` : path === '/' ? '/index.md' : path === '/blog' || path === '/privacy' ? `${path}.md` : undefined)

export default function Layout ({ children }) {
  const { urlPathname = '/', data } = usePageContext()
  const docs = Boolean(data?.section) // docs pages only
  const more = urlPathname === MORE.href
  const current = docs && !more ? sectionOf(urlPathname) : null
  const blog = urlPathname.startsWith('/blog')
  const agent = urlPathname.startsWith('/with-your-agent')
  const consent = useCookieConsent()
  const sectionHref = s => s.readme ?? s.base
  const md = mdOf(urlPathname, data)
  // Phones: the section bar scrolls sideways; bring the current section into view.
  const bar = useRef(null)
  useEffect(() => {
    const a = bar.current?.querySelector('[aria-current]')
    if (a) bar.current.scrollLeft += a.getBoundingClientRect().left - bar.current.getBoundingClientRect().left - (bar.current.clientWidth - a.offsetWidth) / 2
  }, [current])
  return (
    <>
      <header className='topbar'>
        <div className='wrap'>
          <a className='brand' href='/' aria-label='i18next home'>
            {/* Phones: the flask alone, so G's menu fits beside the icons (logo-mark.svg is logo.svg cropped to the flask). */}
            <picture><source media='(max-width: 560px)' srcSet='/assets/logo-mark.svg' /><img src='/assets/logo.svg' alt='i18next' /></picture>
          </a>
          <nav className='nav' aria-label='Main'>
            <a href='/introduction' aria-current={docs ? 'page' : undefined}>Docs</a>
            <a href='/with-your-agent' aria-current={agent ? 'page' : undefined}>With your agent</a>
            <a href='/blog' aria-current={blog ? 'page' : undefined}>Blog</a>
          </nav>
          <div className='tools'>
            <Search />
            <button className='icon-btn' data-theme-toggle aria-label='Switch light and dark'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z' /></svg>
            </button>
            <GitHubLink href='https://github.com/i18next' label='i18next on GitHub' />
          </div>
        </div>
      </header>
      {docs && (
        <nav className='modbar' aria-label='Docs sections'>
          <div className='wrap' ref={bar}>
            {SECTIONS.map(s => <a key={s.id} href={sectionHref(s)} aria-current={s === current ? 'true' : undefined}>{s.title}</a>)}
            <a href={MORE.href} aria-current={more ? 'true' : undefined}>{MORE.title}</a>
          </div>
        </nav>
      )}
      <main id='page-content'>{children}</main>
      {/* G's footer, with the pages built so far. */}
      <footer className='footer'>
        <div className='wrap cols'>
          <div className='footer-brand'><img src='/assets/logo.svg' alt='i18next' /><p>MIT licensed. Maintained since 2011.</p></div>
          <div><h4>With your agent</h4><ul><li><a href='/with-your-agent'>The conversation</a></li><li><a href='/with-your-agent/build-multilingual-site'>Build a multilingual site</a></li><li><a href='/with-your-agent/add-a-second-language'>Add a second language</a></li><li><a href='/with-your-agent/client-changes-texts'>Client changes texts</a></li><li><a href='/with-your-agent/keep-languages-current'>Keep languages current</a></li><li><a href='/with-your-agent/findable-languages'>Findable languages</a></li><li><a href='/how-to/ai-coding-agents'>AI coding agents (docs)</a></li></ul></div>
          <div><h4>Docs</h4><ul>{SECTIONS.map(s => <li key={s.id}><a href={sectionHref(s)}>{s.title}</a></li>)}<li><a href='/blog'>Blog</a></li></ul></div>
          <div><h4>For agents</h4><ul><li><a href='/llms.txt' rel='external'>llms.txt</a></li>{md && <li><a href={md} rel='external'>This page as .md</a></li>}<li><a href='https://github.com/i18next/i18next-cli/tree/main/skills/i18next-localization'>Agent skill</a></li><li><a href='https://github.com/i18next'>GitHub</a></li></ul></div>
        </div>
        <div className='wrap shell-legal'>
          <a href='/privacy'>Privacy</a>
          <button type='button' onClick={() => consent?.showPreferences()}>Cookie settings</button>
        </div>
      </footer>
    </>
  )
}
