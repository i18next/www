// What the site serves besides its pages: the Markdown copy of every page and post (same path plus .md),
// llms.txt and llms-full.txt for the site and per section, sitemap.xml, the blog's RSS feed, _redirects,
// the GitBook images and the link preview cards. scripts/postbuild.js writes them into dist/client after
// `vike build`; in `npm run dev` the middleware in vite.config.js serves them from here, so both are the same.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { SECTIONS, SITE_URL, assetSlug, mdPath, site } from '../src/content.js'
import { posts as loadPosts } from '../src/blog.js'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { data as homeData } from '../pages/index/+data.js'
import homeConfig from '../pages/index/+config.js'
import agentConfig from '../pages/with-your-agent/+config.js'
import blogConfig from '../pages/blog/+config.js'
import privacyConfig from '../pages/privacy/+config.js'
import { agentPages, agentHtml } from '../src/agentPages.js'

// G's pages (home, With your agent) are HTML; their .md is converted from it. Left out: what only works in the
// browser (buttons and the live previews G's scripts fill) and the logo images (the names stay).
const UI = new Set(['result', 'story-pick'])
const forMarkdown = () => tree => {
  const walk = node => {
    if (!node.children) return
    node.children = node.children.filter(c => c.tagName !== 'button' && c.tagName !== 'img' &&
      !(c.properties?.className ?? []).some(k => UI.has(k)))
    // <span>de</span>Heute, <code>npm i</code><span>MIT</span>: keep the words apart.
    node.children = node.children.flatMap((c, i, all) => {
      const next = all[i + 1]
      const apart = ['span', 'code', 'b'].includes(c.tagName) && next &&
        (next.type === 'element' || (next.type === 'text' && /^[\p{L}\p{N}]/u.test(next.value)))
      return apart ? [c, { type: 'text', value: ' ' }] : [c]
    })
    for (const c of node.children) {
      // A fact's source (G's .src line) follows its sentence in parentheses.
      if (c.properties?.className?.includes('src')) c.children = [{ type: 'text', value: ' (' }, ...c.children, { type: 'text', value: ')' }]
    }
    node.children.forEach(walk)
  }
  walk(tree)
}
const htmlToMd = async html => String(await unified()
  .use(rehypeParse, { fragment: true }).use(forMarkdown).use(rehypeRemark).use(remarkGfm).use(remarkStringify, { bullet: '-' })
  .process(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<div class="who"><span class="name">([^<]*)<\/span><span class="when">([^<]*)<\/span><\/div>/g, '<p><strong>$1</strong> · $2</p>')))
  .replace(/\]\(\//g, `](${SITE_URL}/`) // absolute links, as in the docs' .md copies
export async function outputs () {
  const { pages } = await site()
  const posts = await loadPosts()
  const files = new Map() // path -> text
  const write = (file, text) => files.set(file, text)
  const startPages = [
    { route: '/', md: '/index.md', file: 'content/home.html', ...homeConfig, markdown: await htmlToMd((await homeData()).html) },
    { route: '/with-your-agent', file: 'content/with-your-agent.html', ...agentConfig, markdown: await htmlToMd(readFileSync('content/with-your-agent.html', 'utf8')) },
    ...await Promise.all((await agentPages()).map(async p => ({ route: `/with-your-agent/${p.slug}`, file: `content/agent/${p.slug}.html`, title: p.title, description: p.description, markdown: await htmlToMd(await agentHtml(p)) })))
  ]
  const entry = p => `- [${p.title}](${SITE_URL}${p.md ?? mdPath(p.route)})${p.description ? `: ${p.description}` : ''}`
  // The blog list and the privacy notice: a .md copy and a place in llms.txt, as every page.
  const blogList = { route: '/blog', title: 'Blog', description: blogConfig.description, markdown: `# Blog\n\n${posts.map(entry).join('\n')}\n` }
  const privacy = { route: '/privacy', title: 'Privacy', description: privacyConfig.description, markdown: readFileSync('content/privacy.md', 'utf8') }

  // 1. One .md per page and post.
  for (const p of [...startPages, ...pages, blogList, ...posts, privacy]) {
    write(p.md ?? mdPath(p.route), `> Documentation index: [llms.txt](${SITE_URL}/llms.txt). Every page is also available as Markdown at its URL plus \`.md\`.\n\n${p.markdown}`)
  }

  // 2. llms.txt (index) and llms-full.txt (every page) for the whole site, and per section below its base path.
  const sectionIndex = s => [`## ${s.title}`, '', s.description, '', ...pages.filter(p => p.section.id === s.id).map(entry), ''].join('\n')
  const full = list => list.map(p => `<!-- ${SITE_URL}${p.route} -->\n\n${p.markdown}`).join('\n\n')
  const intro = '> i18next is the internationalization framework for JavaScript. Every page below is Markdown at its URL plus `.md`; llms-full.txt holds all pages in one file.'

  const startIndex = ['## Start', '', 'What i18next is, and how to build with it together with your agent.', '', ...startPages.map(entry), ''].join('\n')
  const blogIndex = ['## Blog', '', entry(blogList), ...posts.map(entry), ''].join('\n')
  const siteIndex = ['## Site', '', entry(privacy), ''].join('\n')
  write('/llms.txt', ['# i18next documentation', '', intro, '', startIndex, ...SECTIONS.map(sectionIndex), blogIndex, siteIndex].join('\n'))
  write('/llms-full.txt', full([...startPages, ...pages, blogList, ...posts, privacy]))
  for (const s of SECTIONS.filter(s => s.base)) {
    write(`${s.base}/llms.txt`, [`# ${s.title} documentation`, '', intro, '', sectionIndex(s)].join('\n'))
    write(`${s.base}/llms-full.txt`, full(pages.filter(p => p.section.id === s.id)))
  }

  // 3. Sitemap: the HTML pages, with the date their source last changed in git (a post: its own date).
  const changed = lastChanges()
  const newest = posts.map(p => p.updated ?? p.date).sort().at(-1)
  const urls = [
    ...startPages.map(p => [p.route, changed.get(p.file)]),
    ...pages.map(p => [p.route, changed.get(`content/${p.section.id}/${p.file}`)]),
    ['/blog', newest],
    ...posts.map(p => [p.route, p.updated ?? p.date]),
    ['/privacy', changed.get('content/privacy.md')]
  ]
  write('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([r, date]) => `  <url><loc>${SITE_URL}${r}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`)

  // 3b. RSS feed of the blog.
  const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  write('/blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>i18next blog</title>
  <link>${SITE_URL}/blog</link>
  <description>Technical posts about i18next.</description>
${posts.map(p => `  <item>
    <title>${xml(p.title)}</title>
    <link>${SITE_URL}${p.route}</link>
    <guid>${SITE_URL}${p.route}</guid>
    <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
    <description>${xml(p.description ?? '')}</description>
  </item>`).join('\n')}
</channel>
</rss>
`)

  // 4. _redirects for this host: old www.i18next.com paths that moved and GitBook's own extra URLs. The old hosts
  //    (react.i18next.com) are served by redirects/worker.js.
  const map = JSON.parse(readFileSync('redirects/map.json', 'utf8'))
  const moved = Object.entries(map)
    .filter(([from]) => from.startsWith('https://www.i18next.com/'))
    .map(([from, to]) => [from.slice('https://www.i18next.com'.length), to])
    .filter(([from, to]) => from !== to)
  write('/_redirects', [
    '# Written by scripts/postbuild.js from redirects/map.json.',
    '/sitemap-pages.xml /sitemap.xml 301',
    ...moved.flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`, `${from}.md ${mdPath(to)} 301`].filter(r => r.split(' ')[0] !== r.split(' ')[1]))
  ].join('\n') + '\n')

  // 5. GitBook images, under URL-safe names (see assetSlug): path -> source file.
  const images = new Map()
  for (const s of SECTIONS) {
    const dir = `content/${s.id}/.gitbook/assets`
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) images.set(`/img/${s.id}/${assetSlug(name)}`, path.join(dir, name))
  }

  // 6. Link preview images (og:image, see pages/+image.js): a card per page, a post's own cover where it has one.
  //    Path -> what to draw; postbuild renders them (dev does not need them).
  const og = [
    ...startPages.map(p => [p.route, p.route === '/' ? { title: 'Your site or app in more languages. Every text in a plain file in your repo.' } : { kicker: 'With your agent', title: p.route === '/with-your-agent' ? 'Build it with your agent' : p.title, photo: 'public/img/agent/bakery-window.jpg' }]),
    ...pages.map(p => [p.route, { kicker: p.section.title === p.title ? 'i18next documentation' : p.section.title, title: p.title }]),
    ['/blog', { kicker: 'i18next', title: 'Blog' }],
    ...posts.map(p => [p.route, { kicker: 'Blog', title: p.title, cover: p.image?.endsWith('.svg') && `public${p.image}` }]),
    ['/privacy', { kicker: 'i18next', title: 'Privacy' }]
  ]
  return { files, images, og: new Map(og.map(([route, c]) => [`/og/${route === '/' ? 'index' : route.slice(1)}.png`, c])), counts: { start: startPages.length, pages: pages.length, posts: posts.length, redirects: moved.length * 3 + 1 } }
}

// Date of the last commit per content file. None in a shallow clone (a CI checkout with depth 1 would give every
// file the date of the last commit) or without git; the sitemap then has no lastmod.
function lastChanges () {
  const dates = new Map()
  try {
    if (execFileSync('git', ['rev-parse', '--is-shallow-repository']).toString().trim() !== 'false') return dates
    let date
    for (const line of execFileSync('git', ['log', '--format=%cs', '--name-only', '--', 'content']).toString().split('\n')) {
      if (/^\d{4}-\d\d-\d\d$/.test(line)) date = line
      else if (line && !dates.has(line)) dates.set(line, date)
    }
  } catch {}
  return dates
}
