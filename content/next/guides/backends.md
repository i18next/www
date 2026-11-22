---
description: "Load the translations from an API, a CDN or a translation management service instead of the files in your repository."
---

# Custom i18next backends

next-i18next supports any i18next backend plugin for loading translations from an API, a CDN or a translation management service.

When a custom backend is provided via `use`, next-i18next will **not** add its default resource loader, giving you full control.

## i18next-http-backend

```ts
import type { I18nConfig } from 'next-i18next/proxy'
import HttpBackend from 'i18next-http-backend'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  use: [HttpBackend],
  i18nextOptions: {
    backend: {
      loadPath: 'https://cdn.example.com/locales/{{lng}}/{{ns}}.json',
    },
  },
}

export default i18nConfig
```

## i18next-chained-backend

For client-side caching with a remote fallback:

```ts
import type { I18nConfig } from 'next-i18next/proxy'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  use: [ChainedBackend],
  i18nextOptions: {
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        { expirationTime: 7 * 24 * 60 * 60 * 1000 },
        { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      ],
    },
  },
}

export default i18nConfig
```

For the client-side `I18nProvider`, pass custom backend plugins via the `use` prop:

```tsx
<I18nProvider
  language={lng}
  resources={resources}
  use={[HttpBackend]}
  i18nextOptions={{
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
  }}
>
  {children}
</I18nProvider>
```

Backends passed here are **browser-only**. `I18nProvider` is a Client Component, but the App Router also renders it on the server, once per request, so a backend attached there would run in Node on every render: fetching per render, and, for backends that refresh on a timer, leaving a live timer behind on each one. next-i18next therefore skips backend plugins during the server pass and renders from `resources`; the browser instance keeps the backend and does the fetching. Non-backend plugins (detectors, post-processors) are applied in both passes.

If you want Client Components to load namespaces that are **not** in `resources` on the server as well, so only the namespaces a route renders end up in the HTML and the rest load on demand, opt in with `ssrBackend`. It applies the backends from `use` during the server pass too. Combine it with `react.useSuspense: true`, so a missing namespace suspends into the nearest `<Suspense>` boundary instead of rendering keys, and both passes render the same text:

```tsx
'use client'
import { Suspense } from 'react'
import { I18nProvider } from 'next-i18next/client'
import resourcesToBackend from 'i18next-resources-to-backend'

const backend = resourcesToBackend(
  (lng, ns) => import(`../i18n/locales/${lng}/${ns}.json`)
)

export function Providers({ children, language, resources }) {
  return (
    <I18nProvider
      language={language}
      // app-shell namespaces only, e.g. getResources(i18n, ['common'], [lng])
      resources={resources}
      use={[backend]}
      ssrBackend
      i18nextOptions={{ react: { useSuspense: true } }}
    >
      <Suspense fallback={<Skeleton />}>{children}</Suspense>
    </I18nProvider>
  )
}
```

Use `ssrBackend` only with backends that have no timers and no relative URLs, such as `i18next-resources-to-backend` with dynamic imports. HTTP backends must stay browser-only for the reason above.

### Client-side cache with bundled translations

Translations bundled at build time (`resourceLoader` in the App Router, `serverSideTranslations` in the Pages Router) render on the server; in the browser the chain loads the languages and namespaces that are missing from `public/locales` and keeps them in localStorage. In the App Router the chain goes into `I18nProvider`'s `use` prop:

```tsx
'use client'

import { I18nProvider } from 'next-i18next/client'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

export function I18nProviderWithCache({
  children,
  language,
  resources,
  supportedLngs,
  defaultNS,
}) {
  return (
    <I18nProvider
      language={language}
      resources={resources}
      supportedLngs={supportedLngs}
      defaultNS={defaultNS}
      use={[ChainedBackend]}
      i18nextOptions={{
        backend: {
          backends: [LocalStorageBackend, HttpBackend],
          backendOptions: [
            { expirationTime: 60 * 60 * 1000 }, // 1 hour
            { loadPath: '/locales/{{lng}}/{{ns}}.json' },
          ],
        },
      }}
    >
      {children}
    </I18nProvider>
  )
}
```

In the Pages Router, `next-i18next.config.js` adds the chain in the browser only:

```js
const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend = require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

const isBrowser = typeof window !== 'undefined'

module.exports = {
  i18n: { defaultLocale: 'en', locales: ['en', 'de'] },
  backend: {
    backendOptions: [
      { expirationTime: 60 * 60 * 1000 }, // 1 hour
      { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    ],
    backends: isBrowser ? [LocalStorageBackend, HttpBackend] : [],
  },
  partialBundledLanguages: isBrowser && true,
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : [],
}
```

## Server-side caching

On the server, next-i18next uses a **module-level singleton** i18next instance:

- Translations are loaded **once** and reused across all subsequent requests
- Custom backends benefit from this: no re-fetching per request
- Additional namespaces are loaded on demand and cached

With the Pages Router, `serverInstanceKey` keeps one such instance per key (a tenant, for example), see [Multi-tenant setups](multi-tenant.md).

In **serverless environments** (Lambda, Vercel Serverless, etc.), the cache only lives as long as the warm function instance. For serverless, prefer:
1. Bundling translations at build time via `resources` or `resourceLoader` with dynamic imports
2. Downloading translations in CI/CD with the CLI of your translation service
