import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convert } from './gitbook.js'

const SRC = `---
description: "Plurals in short."
---

# Plurals <a href="#plurals" id="plurals"></a>

{% hint style="warning" %}
Pass \`count\`. See [nesting](nesting.md#options).

\`\`\`js
t('key', { count: 1 })
\`\`\`
{% endhint %}

{% tabs %}
{% tab title="String keys" %}
A
{% endtab %}
{% tab title="Selector API" %}
B
{% endtab %}
{% endtabs %}

{% embed url="https://youtu.be/abc" %}

![](<../.gitbook/assets/Screen Shot (1).png>) <img src="../.gitbook/assets/a b.jpg" alt="" data-size="original">
`

const opts = mode => ({ mode, link: t => t.endsWith('.md#options') ? `/x${mode === 'md' ? '.md' : ''}#options` : undefined, asset: n => `/img/${n}` })

test('md: GFM alerts, bold tab labels, links, assets, no GitBook syntax left', () => {
  const { text, description } = convert(SRC, opts('md'))
  assert.equal(description, 'Plurals in short.')
  assert.match(text, /^# Plurals\n\nPlurals in short\.\n/)
  assert.match(text, /> \[!WARNING\]\n> Pass `count`\. See \[nesting\]\(\/x\.md#options\)\.\n>\n> ```js\n> t\('key', \{ count: 1 \}\)\n> ```/)
  assert.match(text, /\*\*String keys\*\*\n\nA\n\n\*\*Selector API\*\*\n\nB/)
  assert.match(text, /\[Watch on YouTube\]\(https:\/\/youtu\.be\/abc\)/)
  assert.match(text, /!\[\]\(\/img\/Screen Shot \(1\)\.png\) <img src="\/img\/a b\.jpg" alt="">/)
  assert.doesNotMatch(text, /\{%|data-size|id="plurals"/)
})

test('html: hint box, tab list with panels, lead paragraph', () => {
  const { text } = convert(SRC, opts('html'))
  assert.match(text, /# Plurals <a href="#plurals" id="plurals"><\/a>\n\n<p class="lead">Plurals in short\.<\/p>/)
  assert.match(text, /<div class="aside hint warn">\n\nPass/)
  assert.match(text, /<div class="tabs" role="tablist"><button role="tab" aria-selected="true" aria-controls="tab-1-0">String keys<\/button><button role="tab" aria-selected="false" aria-controls="tab-1-1">Selector API<\/button><\/div>/)
  assert.match(text, /<div role="tabpanel" id="tab-1-1" hidden>\n\nB\n\n<\/div>/)
  assert.match(text, /<div class="youtube-embed" data-youtube="abc" data-start="0"><p><a href="https:\/\/youtu\.be\/abc">Watch on YouTube<\/a><\/p><\/div>/)
})

test('locize block: the Locize look on the page, plain text in the .md copy', () => {
  const src = '{% locize %}\n### About Locize\n\nText.\n{% endlocize %}\n'
  assert.match(convert(src, opts('html')).text, /<div class="locize-part">\n\n### About Locize\n\nText\.\n\n<\/div>/)
  const md = convert(src, opts('md')).text
  assert.match(md, /### About Locize\n\nText\./)
  assert.doesNotMatch(md, /\{%|locize-part|^> /m)
})

test('cards table: one card per row, link and cover from the hidden columns', () => {
  const row = (t, href, img) => `<tr><td><p>${t}</p></td><td></td><td><a href="${href}">x</a></td><td><a href="../.gitbook/assets/${img}">${img}</a></td></tr>`
  const src = `<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody>${row('One', 'https://a.example', 'a.jpg')}${row('Two', 'https://b.example', 'b.jpg')}</tbody></table>`
  assert.equal(convert(src, opts('md')).text, '- [One](https://a.example)\n- [Two](https://b.example)\n')
  assert.match(convert(src, opts('html')).text, /<a class="card-link" href="https:\/\/a\.example"><img src="\/img\/a\.jpg" alt="" loading="lazy"><p>One<\/p><\/a>/)
})
