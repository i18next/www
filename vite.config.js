import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'

const TYPES = {
  md: 'text/markdown; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  js: 'text/javascript',
  json: 'application/json',
  wasm: 'application/wasm',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp'
}

// `npm run dev`: serve what postbuild writes in a build (Markdown copies, llms.txt, sitemap, feed, GitBook
// images), computed by the same scripts/outputs.js, so "View as Markdown", "Copy page for your agent" and the
// docs images work in dev too. Search uses the index of the last build (dist/client/pagefind), if there is one.
// The pages that `npm run check -- --dev` visits are those of the last build, too.
// ponytail: recomputed per request, cheap next to a page render.
// An edit in content/ makes the caches read again (src/contentCache.js) and reloads the page.
const devOutputs = {
  name: 'i18next-dev-outputs',
  apply: 'serve',
  configureServer (server) {
    const content = path.resolve('content')
    server.watcher.add(content)
    server.watcher.on('all', (event, file) => {
      if (!file.startsWith(content + path.sep)) return
      globalThis.__contentVersion = (globalThis.__contentVersion ?? 0) + 1 // src/contentCache.js reads again
      server.ws.send({ type: 'full-reload' })
    })
    server.middlewares.use(async (req, res, next) => {
      try {
        const url = decodeURIComponent(req.url.split('?')[0])
        if (url.includes('..') || !/\.(md|txt|xml)$|^\/img\/(core|react)\/|^\/pagefind\//.test(url)) return next()
        const send = (body, file = url) => {
          res.setHeader('Content-Type', TYPES[path.extname(file).slice(1).toLowerCase()] ?? 'application/octet-stream')
          res.end(body)
        }
        if (url.startsWith('/pagefind/')) return send(await readFile(path.join('dist/client', url))) // no '..' above
        const { outputs } = await server.ssrLoadModule('/scripts/outputs.js')
        const { files, images } = await outputs()
        if (files.has(url)) return send(files.get(url))
        if (images.has(url)) return send(await readFile(images.get(url)))
      } catch (err) {
        if (err.code !== 'ENOENT' && !(err instanceof URIError)) return next(err)
      }
      next()
    })
  }
}

export default defineConfig({
  plugins: [vike(), react(), devOutputs]
})
