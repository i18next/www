// The parts of the post "Who uses i18next" that come from the scan's data (content/usage.json): key figures, two bar
// charts, the 60 browser-checked brands and the full list. A post marks the place with <!-- usage:stats -->,
// <!-- usage:charts -->, <!-- usage:brands --> or <!-- usage:table -->; src/blog.js puts HTML there for the page and
// Markdown for its .md copy. Static: the page needs no script (find in page searches the list).
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
// One site in a logo band (the home page's and the post's): its favicon copy and its name.
export const logoItem = b => `<li><span class="logo" title="${esc(b.name)}"><img src="/img/logos/${esc(b.domain)}.png" alt="" width="24" height="24" loading="lazy"><span>${esc(b.name)}</span></span></li>`
const n = v => v.toLocaleString('en')
// "0k–10k" in the data reads "0 to 10k" on the page: a range takes "to"
const band = b => b.replace(/^0k/, '0').replace('–', ' to ')
const binding = f => f || 'bundled (binding not exposed)'

const parts = usage => {
  const stats = [
    [n(usage.hits), 'of the top 100,000 sites run i18next in their own code'],
    [`${usage.pctReachable}%`, 'of the sites that answered'],
    [n(usage.render.ssr), 'render it on the server with next-i18next'],
    [n(usage.frameworks['react-i18next'] + usage.frameworks['next-i18next']), 'use react-i18next or next-i18next']
  ]
  const charts = [
    ['How i18next is wired up (the binding found in the scripts)', Object.entries(usage.frameworks)],
    ['Sites that run i18next per 10,000 of the ranking', usage.density.map(d => [band(d.band), d.count])]
  ]
  return { stats, charts }
}

export function usageHtml (name, usage) {
  const { stats, charts } = parts(usage)
  if (name === 'stats') {
    return '<dl class="usage-stats">' + stats.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('') + '</dl>'
  }
  if (name === 'charts') {
    return charts.map(([title, rows]) => {
      const max = Math.max(...rows.map(r => r[1]))
      return `<figure class="bars"><figcaption>${esc(title)}</figcaption>` + rows.map(([label, count]) =>
        `<div class="bar"><span class="bar-label">${esc(label)}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.max(4, Math.round(100 * count / max))}%"></span></span><span class="bar-num">${n(count)}</span></div>`
      ).join('') + '</figure>'
    }).join('\n')
  }
  if (name === 'brands') {
    return '<ul class="logos usage-brands">' + usage.brands.map(logoItem).join('') + '</ul>'
  }
  if (name === 'table') {
    const rows = usage.sites.map(s => `<tr><td>${n(s.rank)}</td><td>${esc(s.domain)}${s.aka ? ` <small>(also ${esc(s.aka.join(', '))})</small>` : ''}</td><td>${esc(binding(s.framework))}</td><td>${s.ssr ? 'yes' : ''}</td></tr>`)
    return `<details class="site-list"><summary>All ${n(usage.sites.length)} sites, by rank</summary><table><thead><tr><th>Rank</th><th>Site</th><th>Binding</th><th>On the server</th></tr></thead><tbody>${rows.join('')}</tbody></table></details>`
  }
  throw new Error(`unknown usage part "${name}"`)
}

export function usageMd (name, usage) {
  const { stats, charts } = parts(usage)
  if (name === 'stats') return stats.map(([v, l]) => `- **${v}** ${l}`).join('\n')
  if (name === 'charts') return charts.map(([title, rows]) => `${title}:\n\n| | Sites |\n| --- | --- |\n` + rows.map(([l, c]) => `| ${l} | ${n(c)} |`).join('\n')).join('\n\n')
  if (name === 'brands') return usage.brands.map(b => b.name).join(', ') + '.'
  if (name === 'table') {
    return '| Rank | Site | Binding | On the server |\n| --- | --- | --- | --- |\n' +
      usage.sites.map(s => `| ${n(s.rank)} | ${s.domain}${s.aka ? ` (also ${s.aka.join(', ')})` : ''} | ${binding(s.framework)} | ${s.ssr ? 'yes' : ''} |`).join('\n')
  }
  throw new Error(`unknown usage part "${name}"`)
}
