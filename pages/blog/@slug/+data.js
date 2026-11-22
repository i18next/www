import { render } from 'vike/abort'
import { posts, related } from '../../../src/blog.js'

export async function data (pageContext) {
  const list = await posts()
  const n = list.findIndex(p => p.route === pageContext.urlPathname)
  if (n === -1) throw render(404)
  const { title, description, date, updated, tags, minutes, image, imageAlt, html, route, toc, takeaways } = list[n]
  const more = related(list, list[n]).map(p => ({ title: p.title, route: p.route, date: p.date, image: p.image ?? null }))
  return { title, description: description ?? '', date, updated: updated ?? '', tags, minutes, image: image ?? null, imageAlt: imageAlt ?? '', html, route, toc, takeaways, related: more }
}
