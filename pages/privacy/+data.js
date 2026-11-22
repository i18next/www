import { readFile } from 'node:fs/promises'
import { renderMarkdown } from '../../src/content.js'

export async function data () {
  return { html: await renderMarkdown(await readFile('content/privacy.md', 'utf8'), '/privacy') }
}
