---
description: "Your first translated Astro pages: one address per language, i18next once for the whole build, and a build that stops when a translation is missing."
---

# Getting started

```bash
npm install i18next
npm install --save-dev i18next-cli i18next-cli-plugin-astro
```

## 1. One address per language

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://example.com', // the hreflang links need absolute addresses
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: { prefixDefaultLocale: true } // /en/ and /de/
  }
})
```

## 2. i18next, once for the whole build

The translation files sit in `src/i18n/locales/<language>/<namespace>.json`. One module loads all of them and
initializes one i18next instance; each page asks it for a `t()` bound to its language.

```ts
// src/i18n/index.ts
import i18next from 'i18next'

const files = import.meta.glob<Record<string, string>>('./locales/*/*.json', {
  eager: true,
  import: 'default'
})
const resources: Record<string, Record<string, Record<string, string>>> = {}
for (const [path, data] of Object.entries(files)) {
  const [, lng, ns] = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)!
  ;(resources[lng] ??= {})[ns] = data
}

export const languages = { en: 'English', de: 'Deutsch' } as const
export type Lang = keyof typeof languages
export const defaultLang: Lang = 'en'

const i18n = i18next.createInstance()
i18n.init({
  resources,
  fallbackLng: defaultLang,
  defaultNS: 'common',
  interpolation: { escapeValue: false } // Astro escapes what {t(...)} renders
})

// A t() for one language and, if given, one namespace.
export const getT = (lang: Lang, ns?: string) => i18n.getFixedT(lang, ns)

// The same page in another language: /en/order/ -> /de/order/
export function pathForLang (pathname: string, target: Lang) {
  const parts = pathname.split('/')
  parts[1] = target
  return parts.join('/')
}
```

A new language or namespace needs no code change: `import.meta.glob` finds every file (add the language to
`locales` in `astro.config.mjs` and in `i18next.config.ts`, and to `languages`).

## 3. Pages

A page under `src/pages/[lang]/` is built once per language:

```astro
---
// src/pages/[lang]/index.astro
import Layout from '../../layouts/Layout.astro'
import { getT, languages, type Lang } from '../../i18n'

export function getStaticPaths () {
  return Object.keys(languages).map(lang => ({ params: { lang } }))
}

const lang = Astro.params.lang as Lang
const t = getT(lang, 'home')
---
<Layout lang={lang} title={t('title')}>
  <h1>{t('title')}</h1>
  <p>{t('greeting', { name: 'Anna' })}</p>
  <p>{t('loaves', { count: 3 })}</p>
</Layout>
```

with `src/i18n/locales/en/home.json`:

```json src/i18n/locales/en/home.json
{
  "title": "Kornfeld Bakery",
  "greeting": "Hello, {{name}}!",
  "loaves_one": "One rye loaf for tomorrow",
  "loaves_other": "{{count}} rye loaves for tomorrow"
}
```

Plurals follow the rules of each language (`_one`, `_other` and the other forms a language has), and a key missing in
German falls back to English.

## 4. Language switch and hreflang

Astro's routing does not write the `hreflang` links; the layout does, and it carries the language switch:

```astro
---
// src/layouts/Layout.astro (excerpt)
import { languages, defaultLang, pathForLang, type Lang } from '../i18n'
const { lang, title } = Astro.props
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
    {Object.keys(languages).map(l => (
      <link
        rel="alternate"
        hreflang={l}
        href={new URL(pathForLang(Astro.url.pathname, l as Lang), Astro.site)}
      />
    ))}
    <link
      rel="alternate"
      hreflang="x-default"
      href={new URL(pathForLang(Astro.url.pathname, defaultLang), Astro.site)}
    />
  </head>
  <body>
    <nav>
      {Object.entries(languages).map(([l, label]) =>
        l === lang
          ? <strong>{label}</strong>
          : <a href={pathForLang(Astro.url.pathname, l as Lang)}>{label}</a>)}
    </nav>
    <slot />
  </body>
</html>
```

## 5. Extract keys and check every language

Without the plugin, `i18next-cli` reads only JavaScript and TypeScript files, so the keys of `.astro` pages stay
unseen. With it, `extract`, `status` and `lint` read them too:

```ts
// i18next.config.ts
import { defineConfig } from 'i18next-cli'
import astro from 'i18next-cli-plugin-astro'

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: 'src/**/*.{astro,ts}',
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    // Our getT(lang, ns) takes the namespace second; next-i18next's getT, which
    // the CLI knows, takes it first.
    useTranslationNames: [{ name: 'getT', nsArg: 1, keyPrefixArg: 2 }]
  },
  plugins: [astro()]
})
```

- `npx i18next-cli extract` writes new keys into the files of every language.
- `npx i18next-cli status` exits non-zero when a key has no translation in a language. Put it before the build, and a
  missing translation stops the build:

```json
{
  "scripts": {
    "build": "i18next-cli status && astro build"
  }
}
```

Requires Node.js 22.12, i18next-cli 1.92.0 and i18next-cli-plugin-astro 1.1.0 or newer.

`lint` checks `.astro` files
like `.tsx` files (hardcoded text, interpolation that does not match the translation); `instrument` does not read them
yet.

## When the texts change, and interactive parts

- **A changed text needs a new build,** like any other content of a static site.
- **An interactive part** (an island with `client:load`) that shows translated text uses [react-i18next](/react) or the
  binding of its framework inside the island, with the same JSON files. That island sends i18next to the browser: in a
  client-rendered React page, i18next 27.2.2 with react-i18next 18.0.3 adds 17.4 KB gzip once, and each text about
  35 bytes per language (measured 2026-11-21).
