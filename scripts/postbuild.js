// After `vike build`: writes what scripts/outputs.js computes into dist/client (Markdown copies, llms.txt,
// sitemap, feed, _redirects, GitBook images, link preview cards). Pagefind indexes dist/client afterwards.
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { outputs } from './outputs.js'
import { card, photoCard, toPng } from '../src/ogImage.js'

const OUT = 'dist/client'
const target = file => {
  mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true })
  return path.join(OUT, file)
}
const { files, images, og, counts } = await outputs()
for (const [file, text] of files) writeFileSync(target(file), text)
for (const [file, source] of images) cpSync(source, target(file))
await Promise.all([...og].map(([file, c]) => toPng(c.cover ? readFileSync(c.cover, 'utf8') : c.photo ? photoCard(c) : card(c), target(file))))

// Pagefind keeps each page's description as metadata: the 404 shows it under a hit instead of an excerpt.
let described = 0
for (const file of readdirSync(OUT, { recursive: true }).filter(f => f.endsWith('.html'))) {
  const html = readFileSync(path.join(OUT, file), 'utf8')
  const tagged = html.replace('<meta name="description" ', '<meta name="description" data-pagefind-meta="description[content]" ')
  if (tagged !== html) { writeFileSync(path.join(OUT, file), tagged); described++ }
}

console.log(`postbuild: ${counts.start + counts.pages + counts.posts} .md files (${counts.start} start pages, ${counts.posts} blog posts), ${files.size} files in all, ${counts.redirects} redirects, ${images.size} images, ${og.size} preview images, ${described} pages with a description for search`)
