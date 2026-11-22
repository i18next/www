// Copies the images the docs load from other hosts into content/<section>/.gitbook/assets/ and writes
// content/<section>/external.json (URL -> file), so the site serves its own copies (the site serves only its own files).
// Run it when a page gets an image from another host:
//   node scripts/import-images.js
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SECTIONS } from '../src/content.js'

const IMG = /<img[^>]+src="(https?:\/\/[^"]+)"|!\[[^\]]*\]\((https?:\/\/[^)\s]+)/g
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/webp': 'webp' }
const mdFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (e.name.startsWith('.') ? [] : mdFiles(path.join(dir, e.name))) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : [])

for (const s of SECTIONS) {
  const dir = `content/${s.id}`
  if (!existsSync(dir)) continue
  const urls = new Set(mdFiles(dir).flatMap(f => [...readFileSync(f, 'utf8').matchAll(IMG)].map(m => m[1] ?? m[2])))
  const map = {}
  for (const url of urls) {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) { console.warn(`${url}: HTTP ${res.status}, stays external`); continue }
    const name = `ext-${createHash('sha1').update(url).digest('hex').slice(0, 10)}.${EXT[res.headers.get('content-type')?.split(';')[0]] ?? 'bin'}`
    mkdirSync(`${dir}/.gitbook/assets`, { recursive: true })
    writeFileSync(`${dir}/.gitbook/assets/${name}`, Buffer.from(await res.arrayBuffer()))
    map[url] = name
  }
  if (urls.size) writeFileSync(`${dir}/external.json`, JSON.stringify(map, null, 2) + '\n')
  if (urls.size) console.log(`${s.id}: ${Object.keys(map).length} of ${urls.size} external images copied`)
}
