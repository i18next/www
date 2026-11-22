// The one Locize block: a page writes <locize-block title="…" href="…" link="…">its sentences
// </locize-block>, and the build puts the block's markup there. On an agent page it stands as a way beside the free
// one, marked "From the maintainers" with the sentence on how Locize funds i18next; with `wide` it is the start page's
// own band, marked "Sponsor" (its sentences say the same). Build-time only.
import { esc } from './usageWidgets.js'

const BLOCK = /<locize-block([^>]*)>([\s\S]*?)<\/locize-block>/g
const attrs = s => Object.fromEntries([...s.matchAll(/(\w+)(?:="([^"]*)")?/g)].map(([, k, v]) => [k, v ?? true]))

export const withLocizeBlocks = html => html.replace(BLOCK, (_, a, body) => {
  const { title, href, link, wide } = attrs(a)
  if (wide) {
    return `<div class="sponsor">
        <span class="mark">Sponsor</span>
        <div>
          <h3>${esc(title)}</h3>
          ${body.trim()}
        </div>
        <a class="btn" href="${esc(href)}">${esc(link)}</a>
      </div>`
  }
  return `<div class="way locize">
          <h3>${esc(title)}</h3>
          ${body.trim()}
          <p class="note"><span class="mark">From the maintainers</span>
            Locize is the translation management service of the people who maintain i18next; its customers fund i18next.</p>
          <a class="btn" href="${esc(href)}">${esc(link)}</a>
        </div>`
})
