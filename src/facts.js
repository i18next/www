// The start page's checkable statements from their sources, read while the site is built, so each
// figure shows with the date it was read. Without network the build uses content/facts.json, which
// `npm run facts` refreshes. Build-time only.
import { readFile } from 'node:fs/promises'

// GITHUB_TOKEN, when set (a secret build variable in Workers Builds), lifts GitHub's limit of 60 requests an hour
// per address, which builds on shared addresses reach. A token GitHub refuses (expired, revoked) is dropped for a
// second try without it, so it never costs the fresh figures.
const auth = url => url.startsWith('https://api.github.com/') && process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}
const get = async url => {
  const headers = auth(url)
  let res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) })
  if ((res.status === 401 || res.status === 403) && headers.authorization) {
    console.warn(`facts: GitHub refused GITHUB_TOKEN (HTTP ${res.status}); reading without it`)
    res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.json()
}

// "27.1.3" against "27.2.2": true when a is the same version or newer (plain x.y.z, as npm and GitHub name them)
const atLeast = (a, b) => {
  const [x, y] = [a, b].map(v => String(v).match(/\d+(\.\d+)*/)?.[0].split('.').map(Number) ?? [])
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0)
  return true
}

export async function readFacts () {
  const [week, i18next, cli, advisories] = await Promise.all([
    get('https://api.npmjs.org/downloads/point/last-week/i18next'),
    get('https://registry.npmjs.org/i18next'),
    get('https://registry.npmjs.org/i18next-cli/latest'),
    get('https://api.github.com/repos/i18next/i18next/security-advisories?state=published&per_page=100')
  ])
  const latest = i18next['dist-tags'].latest
  const yearAgo = Date.now() - 365 * 864e5
  // the repository's published security advisories of the last twelve months, and how many are fixed on the latest
  // release: each names a patched version, and the latest release is that version or newer
  const lastYear = advisories.filter(a => Date.parse(a.published_at) >= yearAgo)
  const fixed = lastYear.filter(a => a.vulnerabilities.every(v => v.patched_versions && atLeast(latest, v.patched_versions)))
  return {
    asOf: new Date().toISOString().slice(0, 10),
    downloads: { count: week.downloads, start: week.start, end: week.end },
    i18next: { latest, released: i18next.time[latest].slice(0, 10) },
    advisories: { lastYear: lastYear.length, fixed: fixed.length },
    cli: { version: cli.version }
  }
}

let cached
export const facts = () => (cached ??= readFacts().catch(async err => {
  console.warn(`facts: ${err.message}; using content/facts.json`)
  return JSON.parse(await readFile('content/facts.json', 'utf8'))
}))
