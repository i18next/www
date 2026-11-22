// Link preview images (og:image), rendered at build into dist/client/og/<path>.png: a card in G's colours
// with the logo, the section and the page title; a blog post's own cover where it has one. Build-time only.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Text is drawn with the fonts in og-fonts/ only, through fontconfig also on a Mac (where pango would use CoreText and
// the system's fonts), so the images come out the same on a Mac and on the Linux build image, whose fonts differ from a Mac's.
// Both are read when sharp first draws text, so setting them here, before any card is rendered, is enough.
process.env.PANGOCAIRO_BACKEND = 'fc'
process.env.FONTCONFIG_FILE = fileURLToPath(new URL('og-fonts/fonts.conf', import.meta.url))

const logo = `data:image/svg+xml;base64,${readFileSync('public/assets/logo.svg').toString('base64')}`
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// At most three lines of about 26 characters; a longer title ends in an ellipsis.
function lines (title, width = 26, max = 3) {
  const out = []
  for (const word of title.split(/\s+/)) {
    const last = out.at(-1)
    if (last !== undefined && (last + ' ' + word).length <= width) out[out.length - 1] = last + ' ' + word
    else out.push(word)
  }
  return out.length > max ? [...out.slice(0, max - 1), out[max - 1] + ' …'] : out
}

// A card with a picture behind it (the "With your agent" pages: the bakery window, left third empty for the title).
export function photoCard ({ kicker, title, photo }) {
  const t = lines(title, 17, 5)
  const img = `data:image/jpeg;base64,${readFileSync(photo).toString('base64')}`
  const y0 = 340 - (t.length - 1) * 28
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <image href="${img}" x="0" y="0" width="1200" height="630"/>
  <image href="${logo}" x="28" y="20" width="240" height="90"/>
  ${kicker ? `<text x="56" y="${y0 - 76}" fill="#00796b" font-family="Menlo, Consolas, monospace" font-size="24">${esc(kicker)}</text>` : ''}
  ${t.map((l, i) => `<text x="56" y="${y0 + i * 56}" fill="#1b2421" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700">${esc(l)}</text>`).join('\n  ')}
  <text x="56" y="590" fill="#7a8580" font-family="Menlo, Consolas, monospace" font-size="22">www.i18next.com</text>
</svg>`
}

export function card ({ kicker, title }) {
  const t = lines(title)
  const y0 = 350 - (t.length - 1) * 40 // first title line; the block stays centred between logo and footer
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f3ec"/>
  <image href="${logo}" x="40" y="24" width="320" height="120"/>
  ${kicker ? `<text x="64" y="${y0 - 86}" fill="#00796b" font-family="Menlo, Consolas, monospace" font-size="28">${esc(kicker)}</text>` : ''}
  ${t.map((l, i) => `<text x="64" y="${y0 + i * 80}" fill="#1b2421" font-family="Helvetica, Arial, sans-serif" font-size="66" font-weight="700">${esc(l)}</text>`).join('\n  ')}
  <rect x="64" y="540" width="1072" height="2" fill="#ddd7ca"/>
  <text x="64" y="590" fill="#7a8580" font-family="Menlo, Consolas, monospace" font-size="26">www.i18next.com</text>
</svg>`
}

export const toPng = (svg, file) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file)
