import { render } from 'vike/abort'
import { agentPages, agentHtml } from '../../../src/agentPages.js'

export async function data (pageContext) {
  const page = (await agentPages()).find(p => p.slug === pageContext.routeParams.slug)
  if (!page) throw render(404)
  // Only what the title, description and footer read: the rest of pages.json is in the HTML already.
  return { title: page.title, description: page.description, route: `/with-your-agent/${page.slug}`, html: await agentHtml(page) }
}
