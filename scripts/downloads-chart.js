// Draws the npm downloads per week of i18next and react-i18next, every week since 2015, into
// public/img/blog/the-history-of-i18next.svg, the history post's cover, in the dark look of the covers.
// Weeks run Monday to Sunday. npm reports 0 for both packages on days it has no data for; a week with
// such a day is left out (a gap in the lines), so a missing day does not read as a drop.
//   node scripts/downloads-chart.js [last Sunday, default: the last full week before today]
import { writeFileSync } from 'node:fs'

const PKGS = ['i18next', 'react-i18next']
const COLORS = ['#26b8a5', '#f0c987']
const FIRST = new Date('2015-01-12T00:00:00Z') // the first Monday with data for both
const day = 864e5
const iso = d => d.toISOString().slice(0, 10)
const today = new Date(iso(new Date()) + 'T00:00:00Z')
const last = process.argv[2] ? new Date(process.argv[2] + 'T00:00:00Z') : new Date(today - ((today.getUTCDay() || 7) * day))

async function daily (pkg) {
  const counts = {}
  for (let from = FIRST; from <= last; from = new Date(+from + 365 * day)) {
    const to = new Date(Math.min(+from + 364 * day, +last))
    const url = `https://api.npmjs.org/downloads/range/${iso(from)}:${iso(to)}/${pkg}`
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(url)
      if (res.ok) { for (const d of (await res.json()).downloads) counts[d.day] = d.downloads; break }
      if (attempt === 8) throw new Error(`${url}: HTTP ${res.status}`)
      await new Promise(resolve => setTimeout(resolve, attempt * 10000)) // the API rate-limits
    }
  }
  return counts
}

const data = []
for (const pkg of PKGS) data.push(await daily(pkg))
const weeks = []
for (let monday = FIRST; +monday + 6 * day <= +last; monday = new Date(+monday + 7 * day)) {
  const days = Array.from({ length: 7 }, (_, i) => iso(new Date(+monday + i * day)))
  const gap = days.some(d => data.every(counts => !counts[d]))
  weeks.push({ monday, values: gap ? null : data.map(counts => days.reduce((sum, d) => sum + counts[d], 0)) })
}

const W = 1200; const H = 630; const L = 196; const R = 40; const T = 176; const B = 550
const top = Math.ceil(Math.max(...weeks.flatMap(w => w.values ?? [0])) / 1e7) * 1e7
const x = i => (L + (W - L - R) * i / (weeks.length - 1)).toFixed(1)
const y = v => (B - (B - T) * v / top).toFixed(1)
const MONO = 'ui-monospace, SF Mono, Menlo, Consolas, monospace'
const SANS = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
// One polyline per run of weeks without a gap.
const lines = k => {
  const runs = [[]]
  weeks.forEach((w, i) => { if (w.values) runs.at(-1).push(`${x(i)},${y(w.values[k])}`); else if (runs.at(-1).length) runs.push([]) })
  return runs.filter(r => r.length > 1).map(r => `<polyline points="${r.join(' ')}"/>`).join('')
}
const steps = Array.from({ length: top / 1e7 }, (_, i) => (i + 1) * 1e7)
const lastWeek = weeks.at(-1)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
  <title id="t">npm downloads per week of i18next and react-i18next, from the week of ${iso(FIRST)} to the week of ${iso(lastWeek.monday)}</title>
  <!-- Drawn by scripts/downloads-chart.js from api.npmjs.org/downloads/range, read ${iso(today)}. -->
  <rect width="${W}" height="${H}" fill="#14211e"/>
  <rect width="${W}" height="64" fill="#1a2b27"/>
  <circle cx="44" cy="32" r="7" fill="#3b524c"/><circle cx="68" cy="32" r="7" fill="#3b524c"/><circle cx="92" cy="32" r="7" fill="#3b524c"/>
  <text x="128" y="40" fill="#8ea7a1" font-family="${MONO}" font-size="22">npm downloads per week · ${FIRST.getUTCFullYear()} to ${iso(last)} · read ${iso(today)}</text>
  <text x="64" y="128" fill="#dfeae6" font-family="${SANS}" font-size="40" font-weight="600">Downloads per week</text>
  <g font-family="${SANS}" font-size="28" fill="#dfeae6">${PKGS.map((p, k) => `<circle cx="${W - R - 400 + k * 170}" cy="118" r="10" fill="${COLORS[k]}"/><text x="${W - R - 382 + k * 170}" y="128">${p}</text>`).join('')}</g>
  <g stroke="#26383a">${steps.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`).join('')}<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="#3b524c"/></g>
  <g fill="#8ea7a1" font-family="${MONO}" font-size="24" text-anchor="end">${steps.map(v => `<text x="${L - 16}" y="${+y(v) + 8}">${v / 1e6} million</text>`).join('')}<text x="${L - 16}" y="${B + 8}">0</text></g>
  <g fill="#8ea7a1" font-family="${MONO}" font-size="24" text-anchor="middle">${weeks.map((w, i) => w.monday.getUTCMonth() === 0 && w.monday.getUTCDate() <= 7 && w.monday.getUTCFullYear() % 2 === 0 ? `<text x="${x(i)}" y="${B + 44}">${w.monday.getUTCFullYear()}</text>` : '').join('')}</g>
  ${[1, 0].map(k => `<g fill="none" stroke="${COLORS[k]}" stroke-width="3" stroke-linejoin="round">${lines(k)}</g>`).join('\n  ')}
</svg>
`
writeFileSync('public/img/blog/the-history-of-i18next.svg', svg)
console.log(`${weeks.length} weeks to ${iso(last)}, ${weeks.filter(w => !w.values).length} left out for days without data`)
