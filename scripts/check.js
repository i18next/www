// Checks the built site as served by `npx wrangler dev --port 8790`:
//  1. every old URL in redirects/map.json, sent through redirects/worker.js, ends on a page (HTML and .md);
//  2. every heading id GitBook served (redirects/anchors.json) exists here, and every
//     link inside the pages points to a page; #anchors that are missing are listed as warnings
//     (the ones found so far are dead on GitBook and GitHub too);
//  3. every address any page links to or loads (header, sidebar, page tools, footer, images, scripts) answers,
//     and every #anchor on a page exists there;
//  4. llms.txt files, sitemap and the Pagefind bundle are served with the right types.
//   node scripts/check.js [base URL]
//   node scripts/check.js http://127.0.0.1:3457 --dev   against `npm run dev`: no old URLs (they need _redirects
//     and the Worker), the rest as in the build
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import worker from '../redirects/worker.js'

const DEV = process.argv.includes('--dev')
const BASE = process.argv.slice(2).find(a => !a.startsWith('--')) ?? 'http://127.0.0.1:8790'
const map = JSON.parse(readFileSync('redirects/map.json', 'utf8'))
const problems = []
const warnings = []
const get = async (p) => {
  const res = await fetch(BASE + p) // follows _redirects
  return { status: res.status, type: res.headers.get('content-type') ?? '', body: await res.text(), url: res.url }
}

// 1. Old URLs. Old www.i18next.com paths are served by this site itself (_redirects), the other hosts by the Worker.
let old = 0
for (const from of Object.keys(map).filter(k => !DEV && k.startsWith('https://www.i18next.com'))) {
  const path = from.slice('https://www.i18next.com'.length) || '/'
  for (const variant of path.endsWith('.txt') ? [path] : path === '/' ? [path, '/readme.md'] : [path, `${path}/`, `${path}.md`]) {
    const res = await get(variant)
    const want = variant.endsWith('.md') ? 'text/markdown' : variant.endsWith('.txt') ? 'text/plain' : 'text/html'
    if (res.status !== 200 || !res.type.startsWith(want)) problems.push(`old URL www${variant} -> ${res.status} ${res.type}`)
    old++
  }
}
for (const from of Object.keys(map).filter(k => !DEV && k.startsWith('https://') && !k.startsWith('https://www.i18next.com'))) {
  for (const variant of from.endsWith('.txt') ? [from] : [from, `${from || ''}.md`.replace(/(\.com)\.md$/, '$1/readme.md')]) {
    const loc = (await worker.fetch(new Request(variant))).headers.get('location')
    const target = new URL(loc)
    const res = await get(target.pathname + target.search)
    const want = variant.endsWith('.md') ? 'text/markdown' : variant.endsWith('.txt') ? 'text/plain' : 'text/html'
    if (res.status !== 200 || !res.type.startsWith(want)) problems.push(`old URL ${variant} -> ${loc} -> ${res.status} ${res.type}`)
    old++
  }
}

// 2. Links and anchors in the built HTML (only inside the page content).
const htmlFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name === 'index.html' ? [path.join(dir, e.name)] : [])
const pages = new Map(await Promise.all(htmlFiles('dist/client').map(async f => {
  const route = ('/' + path.relative('dist/client', path.dirname(f)).split(path.sep).join('/')).replace(/^\/$/, '') || '/'
  const { status, body: html } = await get(route) // as served (in dev: rendered now)
  if (status !== 200) problems.push(`page ${route}: ${status}`)
  return [route, { html, ids: new Set([...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1])) }]
})))
let links = 0
for (const [route, { html }] of pages) {
  const body = (html.split('data-pagefind-body')[1]?.split('<nav class="pager"')[0] ?? '').replace(/<pre[\s\S]*?<\/pre>/g, '')
  for (const [, href] of body.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(href)) continue
    links++
    const [p, hash] = href.replace(/&amp;/g, '&').split('#')
    const target = p === '' ? route : p.replace(/\/$/, '') || '/'
    if (pages.has(target)) {
      if (hash && !pages.get(target).ids.has(decodeURIComponent(hash))) warnings.push(`anchor ${route} -> ${href}`)
    } else if ((await get(target)).status !== 200) problems.push(`link ${route} -> ${href}`)
  }
}

// Everything else a page links to or loads, outside the content too (header, sidebar, page tools, footer):
// each address once; #anchors on the page itself (the "On this page" links) must exist.
const targets = new Map()
for (const [route, { html, ids }] of pages) {
  const outside = html.replace(/<pre[\s\S]*?<\/pre>/g, '')
  for (const [, attr, value] of outside.matchAll(/\s(href|src|srcset|srcSet)="([^"]+)"/g)) {
    for (const ref of attr.toLowerCase() === 'srcset' ? value.split(',').map(v => v.trim().split(/\s+/)[0]) : [value.replace(/&amp;/g, '&')]) {
      if (/^(https?:|mailto:|data:|javascript:)/.test(ref) || ref.startsWith('//')) continue
      if (ref.startsWith('#')) {
        if (ref.length > 1 && !ids.has(decodeURIComponent(ref.slice(1)))) problems.push(`anchor on ${route}: ${ref}`)
        continue
      }
      const target = ref.split('#')[0]
      if (target && !targets.has(target)) targets.set(target, route)
    }
  }
}
for (const [target, route] of targets) {
  const res = await get(target)
  const md = target.endsWith('.md') && !res.type.startsWith('text/markdown')
  if (res.status !== 200 || md) problems.push(`${route} links to ${target}: ${res.status} ${res.type}`)
}

// "Edit this page" leads to the page's file in its repository (content/<section>/ holds the same files).
const repos = Object.fromEntries((await import('../src/sections.js')).SECTIONS.map(s => [s.repo, s.id]))
for (const [route, { html }] of pages) {
  const edit = html.match(/href="([^"]+)"[^>]*>Edit this page/)?.[1]
  if (!edit) continue
  const repo = Object.keys(repos).find(r => edit.startsWith(r + '/'))
  if (!repo || !existsSync(`content/${repos[repo]}/${edit.slice(repo.length + 1)}`)) problems.push(`edit link ${route} -> ${edit}`)
}

// Images from other hosts load before any consent. Only own images: anything from another host is copied in,
// or waits for consent and is named in the privacy notice. A failed import can leave the copies
// out, so this is a problem, not a warning.
for (const [route, { html }] of pages) {
  const hosts = [...html.matchAll(/<img\s[^>]*src="https?:\/\/([^/"]+)/g)].map(m => m[1]).filter(h => h !== 'www.i18next.com')
  if (hosts.length) problems.push(`external images ${route}: ${hosts.length} (${[...new Set(hosts)].join(', ')})`)
}

const anchors = JSON.parse(readFileSync('redirects/anchors.json', 'utf8'))
let ids = 0
for (const [route, byText] of Object.entries(anchors)) {
  for (const id of Object.values(byText).flat()) {
    ids++
    if (!pages.get(route)?.ids.has(id)) problems.push(`GitBook heading id ${route}#${id} missing`)
  }
}

// Links and images inside the .md copies (absolute URLs to this site).
const mdFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (e.name === 'pagefind' ? [] : mdFiles(path.join(dir, e.name))) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : [])
const mdTargets = new Map()
for (const f of mdFiles('dist/client')) {
  const text = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '')
  for (const [, url] of text.matchAll(/(?:\]\(|src=")https:\/\/www\.i18next\.com(\/[^)"#\s]*)/g)) mdTargets.set(url, f)
}
for (const [url, f] of mdTargets) {
  if ((await get(url)).status !== 200) problems.push(`link in ${path.relative('dist/client', f)} -> ${url}`)
}

// 4. Machine-readable files and search.
for (const [p, type] of [['/llms.txt', 'text/plain'], ['/llms-full.txt', 'text/plain'], ['/react/llms.txt', 'text/plain'], ['/next/llms-full.txt', 'text/plain'], ...DEV ? [] : [['/readme.md', 'text/markdown'], ['/readme', 'text/html']], ['/sitemap.xml', 'xml'], ['/pagefind/pagefind.js', 'javascript'], ['/privacy', 'text/html'], ['/', 'text/html'], ['/introduction.md', 'text/markdown'], ['/blog', 'text/html'], ['/blog/feed.xml', 'xml'], ['/blog/who-uses-i18next', 'text/html'], ['/blog/who-uses-i18next.md', 'text/markdown'], ['/index.md', 'text/markdown'], ['/with-your-agent', 'text/html'], ['/with-your-agent.md', 'text/markdown'], ['/with-your-agent/build-multilingual-site', 'text/html'], ['/with-your-agent/build-multilingual-site.md', 'text/markdown'], ['/assets/fonts/fonts.css', 'text/css'], ['/assets/agent/bakery.js', 'javascript']]) {
  const res = await get(p)
  if (res.status !== 200 || !res.type.includes(type)) problems.push(`${p}: ${res.status} ${res.type}`)
}

console.log(`${old} old URLs, ${ids} GitBook heading ids, ${links} internal links in ${pages.size} pages, ${targets.size} addresses the pages link to or load, ${mdTargets.size} link targets in .md files checked`)
if (warnings.length) console.log(`${warnings.length} warnings:\n` + warnings.join('\n'))
console.log(problems.length ? `${problems.length} problems:\n` + problems.join('\n') : 'no problems')
process.exitCode = problems.length ? 1 : 0
