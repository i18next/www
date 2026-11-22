// The pages below "With your agent" share one shape (crumb, title, the sentence the person says, who has the problem,
// the prompt box with its hint), built here from content/agent/pages.json. content/agent/<slug>.html holds only what
// is the page's own: its prompt as the first <pre>, an optional note under the prompt box, then its sections.
// Build-time only.
import { readFile } from 'node:fs/promises'
import { untilContentChanges } from './contentCache.js'
import { esc } from './usageWidgets.js'
import { withLocizeBlocks } from './locizeBlock.js'

export const agentPages = untilContentChanges(() => readFile('content/agent/pages.json', 'utf8').then(JSON.parse))
// Notes in comments are for whoever maintains the page, not for its visitors: they stay out of the built page.
export const withoutComments = html => html.replace(/<!--[\s\S]*?-->\s*/g, '')

// A prompt wraps on phones, but never inside a command or flag: a word with a hyphen (`i18next-cli`,
// `--print-agent-prompt`) up to 30 characters stays whole in a <span class="nb">. The copy button reads innerText,
// so what is copied stays the text as written. Longer words (a URL) may still break, so nothing overflows.
export const WHOLE = /[^\s<>]*-[^\s<>]*/g
export const keepWordsWhole = html => html.replace(/(<div class="prompt">[\s\S]*?<pre[^>]*>)([\s\S]*?)(<\/pre>)/g, (all, open, inner, close) =>
  open + inner.split(/(<[^>]+>)/).map((part, i) => i % 2 ? part : part.replace(WHOLE, w => w.length > 30 ? w : `<span class="nb">${w}</span>`)).join('') + close)

export async function agentHtml (page) {
  const file = `content/agent/${page.slug}.html`
  const parts = withoutComments(await readFile(file, 'utf8')).match(/^\s*(<pre>[\s\S]*?<\/pre>)\s*([\s\S]*?)\s*(<section[\s\S]*)$/)
  if (!parts) throw new Error(`${file}: expected the prompt as the first <pre>, then the sections`)
  const [, prompt, note, sections] = parts
  return keepWordsWhole(`<section class="problem-hero">
    <div class="wrap readable">
      <div class="crumb"><a href="/with-your-agent">With your agent</a> / ${esc(page.crumb)}</div>
      <h1>${esc(page.title)}</h1>
      <p class="quote">“${esc(page.quote)}”</p>
      <p class="who-has">${esc(page.whoHas)}</p>
      <div class="prompt">
        <div class="prompt-head">
          <span class="label">Prompt</span>
          <span class="hint">${esc(page.hint)}</span>
          <button class="copy" data-copy>Copy prompt</button>
        </div>
${prompt}
      </div>
      ${note}
    </div>
  </section>
  ${withLocizeBlocks(sections)}`)
}
