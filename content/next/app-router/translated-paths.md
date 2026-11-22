---
description: "Give a page its own path in each language, such as /de/kontakt for /en/contact, from one set of route folders."
---

# Translated paths

With `localeInPath: true`, the path after the locale can be translated per language. The keys of `pathnames` are the internal routes (the folders in `app/[lng]`), the values the public path per language; a language without an entry keeps the internal path. `[param]` matches one segment, `[...param]` the rest of the path, and both sides of an entry must use the same params (`createProxy` throws otherwise). Static routes are matched before routes with params, as in Next.js.

Keep the languages and paths in a module of their own, so Client Components such as a language switcher can import them without your `resourceLoader`:

```ts
// i18n.routing.ts
import type { I18nConfig } from 'next-i18next/proxy'

export const routing = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  pathnames: {
    '/contact': { de: '/kontakt', it: '/contatti' },
    '/blog/[slug]': { de: '/artikel/[slug]' },
  },
} satisfies I18nConfig
```

```ts
// i18n.config.ts
import type { I18nConfig } from 'next-i18next/proxy'
import { routing } from './i18n.routing'

const i18nConfig: I18nConfig = {
  ...routing,
  defaultNS: 'common',
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig
```

The proxy then:

- serves `/de/kontakt` from `app/[lng]/contact`, with a rewrite, so the URL stays translated
- redirects `/de/contact` to `/de/kontakt`, so each page has one URL per language
- redirects `/contact` straight to the translated path in the detected language

With `hideDefaultLocale`, a translated path of the default language works without the prefix (`{ en: '/contact-us' }` serves `/contact-us`). Translated paths need the locale in the URL to know the language of a path, so they are not used with `localeInPath: false` or `'internal'`.

Build links and the language switcher with the helpers from `next-i18next`, which work in Server and Client Components:

```tsx
import Link from 'next/link'
import { getLocalizedPath } from 'next-i18next'
import { routing } from '../i18n.routing'

// -> /de/kontakt
<Link href={getLocalizedPath('/contact', lng, routing)}>{t('contact')}</Link>
```

```tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { getInternalPath, getLocalizedPath } from 'next-i18next'
import { routing } from '../i18n.routing'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  // the same page in another language: /de/kontakt -> /contact -> /it/contatti
  const { path } = getInternalPath(pathname, routing)
  return (
    <div>
      {routing.supportedLngs.map((lng) => (
        <button
          key={lng}
          onClick={() => router.push(getLocalizedPath(path, lng, routing))}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
```

For hreflang alternates, call `getLocalizedPath` for every language in `generateMetadata`:

```ts
alternates: {
  languages: Object.fromEntries(
    routing.supportedLngs.map((lng) => [
      lng,
      getLocalizedPath('/contact', lng, routing),
    ])
  ),
},
```
