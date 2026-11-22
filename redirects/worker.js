// Old GitBook hosts -> www.i18next.com, page by page from map.json.
// A Worker of its own, bound to react.i18next.com (and the bare i18next.com),
// so www's static assets never run Worker code. Its custom domains are in wrangler.jsonc next to it.
// _redirects cannot do this: its sources are paths on the host that serves it.
import map from './map.json' with { type: 'json' }

const WWW = 'https://www.i18next.com'
const ROOT = { 'react.i18next.com': '/react' } // fallback per host: the nearest page is the section start

function target (url) {
  const md = url.pathname.endsWith('.md')
  const exact = map[`https://${url.hostname}${url.pathname}`] // llms.txt, llms-full.txt
  if (exact) return { to: exact, known: true }
  // GitBook also answered /page.html; files like /sitemap.xml or /robots.txt go to the same path on www.
  if (/\.\w+$/.test(url.pathname) && !/\.(md|html)$/.test(url.pathname)) return { to: url.pathname, known: true }
  const path = url.pathname.replace(/\.(md|html)$/, '').replace(/\/+$/, '')
  const mapped = map[`https://${url.hostname}${path}`]
  const to = mapped ?? (url.hostname in ROOT ? ROOT[url.hostname] : path || '/')
  return { to: md && !to.endsWith('.txt') ? (to === '/' ? '/readme.md' : `${to}.md`) : to, known: mapped !== undefined || !(url.hostname in ROOT) }
}

export default {
  // Every morning a build of www through its Deploy Hook (secret DEPLOY_HOOK_URL), so the figures read at build stay
  // current; the cron is in wrangler.jsonc. Without the secret it does nothing; a refused call fails the cron run.
  // ponytail: the rebuild lives here because this Worker exists anyway; it moves when the old hosts are retired.
  scheduled (event, env, ctx) {
    if (!env.DEPLOY_HOOK_URL) return
    ctx.waitUntil(fetch(env.DEPLOY_HOOK_URL, { method: 'POST' }).then(r => { if (!r.ok) throw new Error(`deploy hook: HTTP ${r.status}`) }))
  },
  fetch (request) {
    const url = new URL(request.url)
    const { to, known } = target(url)
    // A guessed target (section start) is a 302; a path from the map is a 301.
    return Response.redirect(WWW + to + url.search, known ? 301 : 302)
  }
}
