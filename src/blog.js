// Blog posts: content/blog/<slug>.md, front matter plus Markdown. Front matter: title and date (required),
// updated (a later revision), description, tags (comma-separated, the first is the topic), image and
// imageAlt (an optional cover). A post can hold parts made from data: <!-- usage:stats --> and its siblings
// (src/usageWidgets.js). Build-time only, like content.js; the list is newest first.
import { readdir, readFile } from 'node:fs/promises'
import { SITE_URL, renderPage } from './content.js'
import { usageHtml, usageMd } from './usageWidgets.js'
import { untilContentChanges } from './contentCache.js'

const PART = /<!-- usage:(\w+) -->/g
const withParts = async (body, render) => {
  if (!body.includes('<!-- usage:')) return body
  const usage = JSON.parse(await readFile('content/usage.json', 'utf8')) // posts() caches the result
  return body.replace(PART, (_, name) => render(name, usage))
}

function frontMatter (src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  const meta = {}
  for (const line of (m?.[1] ?? '').split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1')
  }
  return { meta, body: m ? src.slice(m[0].length) : src }
}

export const posts = untilContentChanges(async () => {
  const files = (await readdir('content/blog').catch(() => [])).filter(f => f.endsWith('.md'))
  const list = await Promise.all(files.map(async file => {
    const { meta, body } = frontMatter(await readFile(`content/blog/${file}`, 'utf8'))
    const route = `/blog/${file.slice(0, -3)}`
    if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) throw new Error(`content/blog/${file}: title and date (YYYY-MM-DD) are required`)
    const cover = meta.image ? `![${meta.imageAlt ?? ''}](${meta.image.startsWith('/') ? SITE_URL + meta.image : meta.image})\n\n` : ''
    const page = await renderPage(await withParts(body, usageHtml), route)
    // A post that opens with "## Key takeaways" and a list gets them as a box at the top, in place of the lead.
    const takeaways = /^<h2 id="key-takeaways">/.test(page.html)
    return {
      ...meta,
      route,
      tags: (meta.tags ?? '').split(',').map(t => t.trim()).filter(Boolean),
      minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)), // reading time at about 220 words a minute
      html: takeaways ? page.html.replace(/^(<h2 id="key-takeaways">[\s\S]*?<\/ul>)/, '<section class="takeaways">$1</section>') : page.html,
      toc: page.toc,
      takeaways,
      markdown: `# ${meta.title}\n\n${meta.date}${meta.updated ? ` (updated ${meta.updated})` : ''}\n\n${meta.description ? `${meta.description}\n\n` : ''}${cover}${(await withParts(body, usageMd)).trim()}\n`
    }
  }))
  return list.sort((a, b) => b.date.localeCompare(a.date))
})

// Up to three other posts, the ones sharing the most tags first, then the newest.
export function related (list, post) {
  const shared = p => p.tags.filter(t => post.tags.includes(t)).length
  return list.filter(p => p !== post).map((p, n) => ({ p, n, s: shared(p) })).sort((a, b) => b.s - a.s || a.n - b.n).slice(0, 3).map(x => x.p)
}
