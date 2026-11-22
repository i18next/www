// Loads the docs from content/<section>/ (GitBook SUMMARY.md, or a single
// README.md), converts them with gitbook.js and renders the HTML. Build-time
// only: imported by the Vike data hooks and scripts/postbuild.js.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { convert } from './gitbook.js'
import { SECTIONS, SITE_URL } from './sections.js'
import { untilContentChanges } from './contentCache.js'
import { keepWordsWhole } from './agentPages.js'

export { SECTIONS, SITE_URL }

// GitBook hosts whose links inside the docs now point into this site.
const OLD_HOSTS = { 'www.i18next.com': '', 'i18next.com': '', 'react.i18next.com': '/react' }

export const routeOf = (section, file) => {
  const rest = file.replace(/(^|\/)README\.md$/i, '').replace(/\.md$/, '')
  if (!rest && section.readme) return section.readme
  return (section.base + (rest ? `/${rest}` : '')) || '/'
}
// The Markdown copy sits at the same path plus .md; the root page at /readme.md as on GitBook.
export const mdPath = route => route === '/' ? '/readme.md' : `${route}.md`
export const assetSlug = name => name.replace(/[^\w.-]+/g, '-')

// SUMMARY.md -> [{ title, items: [{ title, target }] }]; '***' starts an untitled group.
export function parseSummary (text) {
  const groups = [{ title: '', items: [] }]
  for (const line of text.split('\n')) {
    const heading = line.match(/^##\s+(.*)/)
    if (heading || /^\*\*\*\s*$/.test(line)) groups.push({ title: heading?.[1].trim() ?? '', items: [] })
    const item = line.match(/^\s*[*-]\s+\[(.*)\]\((.*)\)\s*$/)
    if (item) groups.at(-1).items.push({ title: item[1].replace(/\\(.)/g, '$1'), target: item[2].replace(/\\(.)/g, '$1') })
  }
  return groups.filter(g => g.items.length)
}

// Old GitBook URLs and where they lead now (also the paths GitBook itself redirected).
const oldUrls = JSON.parse(await readFile('redirects/map.json', 'utf8').catch(() => '{}'))

// A link target in a page -> { route, hash } inside the site, { href } elsewhere, or null (leave it).
// `pages` (routes) is passed once known: a relative .md that is no page links to the source repo,
// and an absolute link to an old host that is no page (an image, a file) stays as written.
function resolve (page, target, pages) {
  const url = target.match(/^https?:\/\/([^/?#]+)([^?#]*)[^#]*(#.*)?$/)
  if (url) {
    if (!(url[1] in OLD_HOSTS)) return null
    const path = url[2].replace(/\.(md|html)$/, '').replace(/\/$/, '')
    const route = oldUrls[`https://${url[1]}${path}`] ?? ((OLD_HOSTS[url[1]] + path) || '/')
    if (pages && !pages.has(route)) return null
    return { route, hash: url[3] ?? '' }
  }
  if (/^([a-z]+:|#|\/)/i.test(target)) return null
  const [file, hash] = target.split('#')
  const full = path.posix.normalize(path.posix.join(path.posix.dirname(page.file), file))
  const route = routeOf(page.section, full)
  if (!file.endsWith('.md') || (pages && !pages.has(route))) return { href: `${page.section.repo}/${full}` } // a file in the source repo
  return { route, hash: hash ? `#${hash}` : '' }
}

// Images the GitBook docs load from other hosts are served from our own copy: scripts/import-images.js downloads
// them and writes content/<section>/external.json (URL -> file).
const external = {}
for (const s of SECTIONS) external[s.id] = JSON.parse(await readFile(`content/${s.id}/external.json`, 'utf8').catch(() => '{}'))
const ownImages = (src, section, mode) => Object.entries(external[section.id]).reduce(
  (text, [url, name]) => text.replaceAll(url, `${mode === 'md' ? SITE_URL : ''}/img/${section.id}/${name}`), src)

function convertPage (page, mode, titles, warn) {
  const href = target => {
    const r = resolve(page, target, titles)
    if (!r) return undefined
    if (r.href) return r.href
    return mode === 'md' ? `${SITE_URL}${mdPath(r.route)}${r.hash}` : r.route + r.hash
  }
  return convert(ownImages(page.src, page.section, mode), {
    mode,
    link: href,
    asset: name => `${mode === 'md' ? SITE_URL : ''}/img/${page.section.id}/${assetSlug(name)}`,
    title: target => titles.get(resolve(page, target, titles)?.route),
    warn
  })
}

// The key under which redirects/anchors.json stores GitBook's id for a heading text.
export const headingKey = text => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
const anchors = JSON.parse(await readFile('redirects/anchors.json', 'utf8').catch(() => '{}'))

// Heading ids as on GitBook, so old deep links keep working: an explicit
// <a href="#x" id="x"></a> in the heading (GitBook writes these) wins, then
// the id GitBook served (anchors.json); rehype-slug fills in the rest.
function gitbookHeadingIds (tree, file) {
  const known = anchors[file.data.route] ?? {}
  const seen = Object.create(null) // a heading text can be 'constructor'
  const text = node => node.type === 'text' ? node.value : (node.children ?? []).map(text).join('')
  const walk = node => node.children?.forEach(child => {
    if (!/^h[1-6]$/.test(child.tagName)) return walk(child)
    // Inline HTML arrives as two raw nodes, '<a href="#x" id="x">' and '</a>'.
    const n = child.children.findIndex(c => c.type === 'raw' && /^<a href="#[^"]*" id="[^"]*">$/.test(c.value))
    const explicit = n !== -1 && child.children.splice(n, 2)[0].value.match(/id="([^"]*)"/)[1]
    // A heading that keeps an old id as '<a id="old"></a>' has a space before it; trimmed, so its own id does not end in '-'.
    const last = child.children.findLast(c => c.type !== 'raw')
    if (last?.type === 'text') last.value = last.value.trimEnd()
    const key = headingKey(text(child))
    seen[key] = (seen[key] ?? -1) + 1
    const id = explicit || (Object.hasOwn(known, key) ? known[key][seen[key]] : undefined)
    if (id) child.properties.id = id
  })
  walk(tree)
}

// The page's own table of contents: its h2 and h3 headings with their final ids, for G's "On this page".
function collectToc (tree, file) {
  const toc = []
  const text = node => node.type === 'text' ? node.value : (node.children ?? []).map(text).join('')
  const walk = node => node.children?.forEach(c => {
    if (c.tagName === 'h2' || c.tagName === 'h3') toc.push({ id: c.properties.id, text: text(c).trim(), sub: c.tagName === 'h3' })
    else walk(c)
  })
  walk(tree)
  file.data.toc = toc
}

const markdownToHtml = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(() => gitbookHeadingIds)
  .use(rehypeSlug)
  .use(() => collectToc)
  // Syntax colors at build time (highlight.js grammars, only blocks that name their language); shell.css maps
  // the token classes onto G's three code colors. No script in the browser.
  .use(rehypeHighlight, { detect: false })
  .use(() => wrapCode)
  .use(() => timeDates)
  .use(() => labelCells)
  .use(rehypeStringify, { allowDangerousHtml: true })

// <pre> -> <div class="code"><div class="code-head">lang <button data-copy>…</div><pre>, the markup of G.
// A block in the language "prompt" becomes the prompt box of the agent pages.
function wrapCode (node) {
  node.children?.forEach((child, i) => {
    // GitBook writes some blocks as raw HTML (<pre class="language-jsx"><code><strong>…): they get the same frame
    if (child.type === 'raw' && /<pre[\s>]/.test(child.value)) {
      child.value = child.value.replace(/<pre\b([^>]*)>([\s\S]*?)<\/pre>/g, (all, attrs, inner) => {
        const lang = /language-([\w-]+)/.exec(attrs + inner)?.[1] ?? ''
        return `<div class="code"><div class="code-head" data-pagefind-ignore>${lang}<button class="copy small" type="button" data-copy>Copy</button></div><pre${attrs}>${inner}</pre></div>`
      })
      return
    }
    if (child.tagName !== 'pre') return wrapCode(child)
    const lang = child.children[0]?.properties?.className?.find(c => c.startsWith('language-'))?.slice(9) ?? ''
    // a file name after the language (```json common.json) names the block in its head instead of the language
    const meta = child.children[0]?.data?.meta?.trim()
    const file = meta && /^[\w./@-]+$/.test(meta) ? meta : undefined // a path, not other fence meta like {1,3}
    const el = (tagName, className, children, extra = {}) => ({ type: 'element', tagName, properties: { className, ...extra }, children })
    const text = value => ({ type: 'text', value })
    if (lang === 'prompt') {
      node.children[i] = el('div', ['prompt'], [
        el('div', ['prompt-head'], [el('span', ['label'], [text('Prompt')]), el('button', ['copy'], [text('Copy prompt')], { type: 'button', dataCopy: '' })], { dataPagefindIgnore: '' }),
        child
      ])
      return
    }
    node.children[i] = el('div', ['code'], [
      el('div', ['code-head'], [text(file || lang), el('button', ['copy', 'small'], [text('Copy')], { type: 'button', dataCopy: '' })], { dataPagefindIgnore: '' }),
      child
    ])
  })
}

// Every date in running text stands in <time>, so it never breaks at its hyphens; not in code.
const DATE = /\b\d{4}-\d{2}-\d{2}\b/g
function timeDates (node) {
  if (['code', 'pre', 'time', 'script', 'style'].includes(node.tagName)) return
  node.children = node.children?.flatMap(child => {
    if (child.type !== 'text' || !DATE.test(child.value)) { timeDates(child); return [child] }
    DATE.lastIndex = 0
    const parts = []
    let last = 0
    for (const m of child.value.matchAll(DATE)) {
      if (m.index > last) parts.push({ type: 'text', value: child.value.slice(last, m.index) })
      parts.push({ type: 'element', tagName: 'time', properties: { dateTime: m[0] }, children: [{ type: 'text', value: m[0] }] })
      last = m.index + m[0].length
    }
    if (last < child.value.length) parts.push({ type: 'text', value: child.value.slice(last) })
    return parts
  })
}

// Each table cell gets its column's header as data-label, so on phones a row can stand as a block with labels
// (shell.css): three columns do not fit 375 px.
function labelCells (node) {
  if (node.tagName !== 'table') return node.children?.forEach(labelCells)
  const text = n => n.type === 'text' ? n.value : (n.children ?? []).map(text).join('')
  const rows = []
  const walk = n => n.children?.forEach(c => (c.tagName === 'tr' ? rows.push(c) : walk(c)))
  walk(node)
  const head = rows[0]?.children.filter(c => c.tagName === 'th').map(c => text(c).trim()) ?? []
  for (const row of rows.slice(1)) row.children.filter(c => c.tagName === 'td').forEach((td, i) => { if (head[i]) td.properties.dataLabel = head[i] })
}

async function load () {
  const pages = []
  for (const shared of SECTIONS) {
    const dir = `content/${shared.id}`
    const summary = await readFile(`${dir}/SUMMARY.md`, 'utf8').catch(() => null)
    // A copy per load: in `npm start` a load after an edit must not change the sidebar another request is reading.
    const section = { ...shared, groups: summary ? parseSummary(summary) : [{ title: '', items: [{ title: shared.title, target: 'README.md' }] }] }
    for (const item of section.groups.flatMap(g => g.items)) {
      if (/^https?:/.test(item.target)) {
        const r = resolve({ section, file: '' }, item.target)
        item.href = r ? r.route + r.hash : item.target
        continue
      }
      item.href = routeOf(section, item.target)
      pages.push({ section, file: item.target, route: item.href, title: item.title, src: await readFile(`${dir}/${item.target}`, 'utf8') })
    }
  }

  const titles = new Map(pages.map(p => [p.route, p.title]))
  const warnings = []
  for (const p of pages) {
    const warn = msg => warnings.push(`${p.route}: ${msg}`)
    const md = convertPage(p, 'md', titles, warn)
    p.markdown = md.text
    p.description = md.description || (p.file === 'README.md' ? p.section.description : '')
    const file = await markdownToHtml.process({ value: convertPage(p, 'html', titles, () => {}).text, data: { route: p.route } })
    p.html = keepWordsWhole(String(file))
    p.toc = file.data.toc
  }
  pages.forEach(p => {
    const same = pages.filter(q => q.section === p.section)
    const n = same.indexOf(p)
    p.prev = same[n - 1] && { title: same[n - 1].title, route: same[n - 1].route }
    p.next = same[n + 1] && { title: same[n + 1].title, route: same[n + 1].route }
  })
  for (const w of new Set(warnings)) console.warn(w)
  return { pages, byRoute: new Map(pages.map(p => [p.route, p])) }
}

// A Markdown page outside the docs (privacy notice, blog posts): same renderer, no GitBook syntax.
export async function renderPage (text, route) {
  const file = await markdownToHtml.process({ value: text, data: { route } })
  return { html: keepWordsWhole(String(file)), toc: file.data.toc }
}
export const renderMarkdown = async (text, route) => (await renderPage(text, route)).html

export const site = untilContentChanges(load)
