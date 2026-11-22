import { render } from 'vike/abort'
import { site, mdPath } from '../../src/content.js'

export async function data (pageContext) {
  const page = (await site()).byRoute.get(pageContext.urlPathname)
  if (!page) throw render(404)
  const { section } = page
  return {
    title: page.title,
    description: page.description,
    html: page.html,
    route: page.route,
    md: mdPath(page.route),
    section: { title: section.title, github: section.github ?? null, groups: section.groups.map(g => ({ title: g.title, items: g.items.map(i => ({ title: i.title, href: i.href })) })) },
    prev: page.prev ?? null,
    next: page.next ?? null,
    toc: page.toc,
    edit: `${section.repo}/${page.file}` // where the page's Markdown lives (this repository)
  }
}
