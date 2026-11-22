// GitBook-flavoured Markdown -> CommonMark + GFM. Everything GitBook-only is
// handled here, so the rest of the build never sees a {% tag %}.
//
// mode 'md':   plain Markdown for the .md copy and llms-full.txt (hints become
//              GFM alerts, tabs become bold labels, embeds become links).
// mode 'html': Markdown with a few HTML blocks for the page (hint boxes, tabs).
//
// Our own tag: {% locize %}…{% endlocize %} marks a part about Locize; the page shows it in the Locize look
// (.locize-part), the .md copy as plain text.
//
// Callbacks: link(target) -> new href or undefined (leave as is),
// asset(name) -> URL of a .gitbook/assets file, title(target) -> page title.

const HINT_ALERT = { info: 'NOTE', success: 'TIP', warning: 'WARNING', danger: 'CAUTION' }
const HINT_CLASS = { info: 'aside hint', success: 'aside hint tip', warning: 'aside hint warn', danger: 'aside hint danger' }
const TAG = /^\{%\s*([\w-]+)\s*(.*?)\s*%\}$/
const attr = (args, name) => args.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? ''

export function convert (src, { mode, link = () => {}, asset = n => n, title = () => {}, warn = () => {} }) {
  let description = ''
  src = src.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/, (_, fm) => {
    description = fm.match(/^description:\s*(.*)$/m)?.[1].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"') ?? ''
    return ''
  })
  const lines = src.split('\n')
  const out = []
  let depth = 0 // open hints; in md mode each one prefixes its lines with '> '
  let fence = null
  let tabGroup = 0
  let tabIndex = 0
  let inContentRef = false
  let h1Done = false
  // md mode: hint lines get '> ' prefixes; only an empty line is trimmed, so Markdown hard breaks (two spaces) survive.
  const push = (line = '') => out.push(mode === 'md' ? (line ? '> '.repeat(depth) + line : '> '.repeat(depth).trimEnd()) : line)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (fence) {
      push(line)
      if (line.trim().startsWith(fence) && /^(`+|~+)$/.test(line.trim())) fence = null
      continue
    }
    const open = line.match(/^\s*(`{3,}|~{3,})/)
    if (open) {
      fence = open[1]
      push(line)
      continue
    }
    const tag = line.trim().match(TAG)
    if (tag) {
      const [, name, args] = tag
      if (name === 'hint') {
        const style = attr(args, 'style') || 'info'
        if (mode === 'md') { depth++; push(`[!${HINT_ALERT[style] ?? 'NOTE'}]`) } else push(`<div class="${HINT_CLASS[style] ?? HINT_CLASS.info}">\n`)
      } else if (name === 'endhint') {
        if (mode === 'md') { depth--; push() } else push('\n</div>\n')
      } else if (name === 'locize') {
        if (mode === 'html') push('<div class="locize-part">\n')
      } else if (name === 'endlocize') {
        if (mode === 'html') push('\n</div>\n')
      } else if (name === 'tabs') {
        tabGroup++
        tabIndex = 0
        if (mode === 'html') {
          const buttons = tabTitles(lines, i).map((t, n) =>
            `<button role="tab" aria-selected="${n === 0}" aria-controls="tab-${tabGroup}-${n}">${t}</button>`)
          push(`<div class="tabs" role="tablist">${buttons.join('')}</div>\n`)
        }
      } else if (name === 'tab') {
        if (mode === 'md') { push(`**${attr(args, 'title')}**`); push() } else push(`<div role="tabpanel" id="tab-${tabGroup}-${tabIndex}"${tabIndex ? ' hidden' : ''}>\n`)
        tabIndex++
      } else if (name === 'endtab') {
        push(mode === 'html' ? '\n</div>\n' : '')
      } else if (name === 'endtabs') {
        push()
      } else if (name === 'embed') {
        const url = attr(args, 'url')
        const video = youtube(url)
        if (video && mode === 'html') {
          // The page mounts src/YouTubeEmbed.jsx here: a player only after consent, this link until then.
          push(`<div class="youtube-embed" data-youtube="${video.id}" data-start="${video.start}"><p><a href="${url}">Watch on YouTube</a></p></div>\n`)
        } else push(`[${video ? 'Watch on YouTube' : url}](${url})`)
      } else if (name === 'content-ref') {
        inContentRef = true
      } else if (name === 'endcontent-ref') {
        inContentRef = false
      } else {
        warn(`unknown GitBook tag {% ${name} %} dropped`)
      }
      continue
    }

    let text = line.split(/(`+[^`]*`+)/).map((part, n) => n % 2 ? part : prose(part, { link, asset })).join('')
    // GitBook stores a heading's id as '## Title <a href="#id" id="id"></a>'; the page build reads it, the .md drops it.
    // A plain '<a id="old"></a>' in a heading keeps an old id of a merged page there; the .md drops it too.
    if (mode === 'md') text = text.replace(/\s*<a (?:href="#[^"]*" )?id="[^"]*"><\/a>/g, '')
    if (inContentRef) {
      const target = line.match(/^\[[^\]]*\]\(([^)]+)\)/)?.[1] // the target as written; text holds it rewritten
      text = text.replace(/^\[[^\]]*\]\(([^)]+)\)/, (all, href) => `[${(target && title(target)) ?? href}](${href})`)
    }
    if (text.startsWith('<table data-view="cards">')) text = cards(text, mode)
    push(text)
    if (!h1Done && /^# /.test(line)) {
      h1Done = true
      if (description) { push(); push(mode === 'md' ? description : `<p class="lead">${description}</p>`) }
    }
  }
  if (depth || fence) warn('file ends inside a hint or a code fence')
  return { text: out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', description }
}

// youtu.be/<id>, youtube.com/watch?v=<id>, with t=705 or t=705s -> { id, start } (seconds).
function youtube (url) {
  const m = url.match(/^https?:\/\/(?:www\.)?(?:youtu\.be\/([\w-]+)|youtube\.com\/watch\?\S*?\bv=([\w-]+))/)
  if (!m) return null
  return { id: m[1] ?? m[2], start: Number(url.match(/[?&]t=(\d+)/)?.[1] ?? 0) }
}

// Titles of the tabs in the {% tabs %} block that starts at line i.
function tabTitles (lines, i) {
  const titles = []
  for (let j = i + 1; j < lines.length; j++) {
    const tag = lines[j].trim().match(TAG)
    if (tag?.[1] === 'endtabs') break
    if (tag?.[1] === 'tab') titles.push(attr(tag[2], 'title'))
  }
  return titles
}

// Asset paths, links and GitBook-only HTML attributes in one line of prose.
function prose (text, { link, asset }) {
  const assetName = '(?:\\.\\.\\/)*\\.gitbook\\/assets\\/'
  return text
    .replace(new RegExp(`\\]\\(<${assetName}([^>]+)>\\)`, 'g'), (_, n) => `](${asset(unescape(n))})`)
    .replace(new RegExp(`="${assetName}([^"]+)`, 'g'), (_, n) => `="${asset(n)}`)
    .replace(new RegExp(`\\]\\(${assetName}([^)]+)`, 'g'), (_, n) => `](${asset(unescape(n))}`)
    .replace(/(\]\(|href=")([^)"\s<>]+)/g, (all, pre, target) => {
      // In raw HTML a backslash is no escape: GitBook's \& in an href would stay in the URL.
      const t = pre === 'href="' ? unescape(target) : target
      return pre + (link(t) ?? t)
    })
    .replace(/\s+data-size="[^"]*"/g, '')
    .replace(/<\/?mark[^>]*>/g, '') // ponytail: GitBook text colour ($success) dropped, the text is bold anyway
}

const unescape = s => s.replace(/\\(.)/g, '$1')

// GitBook's card view: <table data-view="cards"> with hidden columns for the
// card's link (data-card-target) and cover image (data-card-cover).
function cards (html, mode) {
  const ths = [...html.matchAll(/<th(\s[^>]*)?>/g)].map(m => m[1] ?? '')
  const target = ths.findIndex(a => a.includes('data-card-target'))
  const cover = ths.findIndex(a => a.includes('data-card-cover'))
  const rows = [...html.replace(/^[\s\S]*<tbody>/, '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r =>
    [...r[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map(c => c[1]))
  const href = cell => cell?.match(/href="([^"]+)"/)?.[1] ?? ''
  const body = cells => cells.filter((_, n) => n !== target && n !== cover).join('')
  if (mode === 'md') {
    return rows.map(c => `- [${body(c).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}](${href(c[target])})`).join('\n')
  }
  return '<div class="card-grid">\n' + rows.map(c =>
    `<a class="card-link" href="${href(c[target])}"><img src="${href(c[cover])}" alt="" loading="lazy">${body(c)}</a>`).join('\n') + '\n</div>'
}
