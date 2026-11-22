import { readFile } from 'node:fs/promises'
import { facts } from '../../src/facts.js'
import { esc, logoItem } from '../../src/usageWidgets.js'
import { withoutComments } from '../../src/agentPages.js'
import { withLocizeBlocks } from '../../src/locizeBlock.js'
const million = n => `${(n / 1e6).toFixed(1)} million`

// The home page (content/home.html, G) with its figures filled in:
// - the "Sites that run i18next" band from the scan behind "Who uses i18next?": content/usage.json and our own copies
//   of its logos in public/img/logos/, the first 16 of the browser-checked brands by site rank;
// - every element with data-fact from content/usage.json and src/facts.js (npm downloads, registry, GitHub security
//   advisories, i18next-cli).
export async function data () {
  const [html, usage, f] = await Promise.all([
    readFile('content/home.html', 'utf8').then(withoutComments),
    readFile('content/usage.json', 'utf8').then(JSON.parse),
    facts()
  ])
  const values = {
    'usage.hits': usage.hits.toLocaleString('en'),
    'downloads.count': million(f.downloads.count),
    'downloads.start': f.downloads.start,
    'downloads.end': f.downloads.end,
    'i18next.latest': f.i18next.latest,
    'i18next.released': f.i18next.released,
    'advisories.lastYear': f.advisories.lastYear,
    'cli.version': f.cli.version,
    asOf: f.asOf
  }
  // the home page says none of the advisories applies on the latest release; a build that finds one it does not cover
  // (no patched version, or a patched version newer than the latest release) stops
  if (f.advisories.fixed !== f.advisories.lastYear) throw new Error('facts: a security advisory is not fixed on the latest release')
  const rank = new Map(usage.sites.flatMap(s => [s.domain, ...(s.aka ?? [])].map(d => [d, s.rank])))
  const logos = usage.brands
    .toSorted((a, b) => (rank.get(a.domain) ?? Infinity) - (rank.get(b.domain) ?? Infinity))
    .slice(0, 16)
    .map(logoItem)
  return {
    html: withLocizeBlocks(html)
      .replace(/<ul class="logos">[\s\S]*?<\/ul>/, `<ul class="logos">\n${logos.join('\n')}\n</ul>`)
      .replace(/(<[a-z]+ [^>]*data-fact="([\w.]+)"[^>]*>)[^<]*/g, (all, open, key) => {
        if (!(key in values)) throw new Error(`content/home.html: unknown data-fact "${key}"`)
        return open + esc(values[key])
      })
  }
}
