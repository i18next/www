---
description: "Run the App Router and the Pages Router in one app: the App Router under a base path of its own, the Pages Router with the i18n routing of Next.js."
---

# Mixed router setup (App Router + Pages Router)

For projects that use both routers, next-i18next supports a `basePath` option that scopes the App Router proxy to a specific URL prefix while the Pages Router uses Next.js built-in i18n routing for everything else.

## Configuration

Create a shared config file for common settings:

```js
// i18n.shared.js
module.exports = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'footer'],
}
```

App Router config with `basePath`:

```ts
// i18n.config.ts
import type { I18nConfig } from 'next-i18next/proxy'
const shared = require('./i18n.shared.js')

const i18nConfig: I18nConfig = {
  ...shared,
  basePath: '/app-router',
  localeParamName: 'locale', // the segment is app/app-router/[locale]
  resourceLoader: (language, namespace) =>
    import(`./public/locales/${language}/${namespace}.json`),
}

export default i18nConfig
```

Pages Router config:

```js
// next-i18next.config.js
const shared = require('./i18n.shared.js')

module.exports = {
  i18n: {
    defaultLocale: shared.fallbackLng,
    locales: shared.supportedLngs,
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
}
```

## Proxy <a id="proxy-and-middleware"></a>

With `basePath: '/app-router'`, `createProxy` automatically:
- **Skips** any request not under `/app-router/...` (letting Pages Router handle those)
- Redirects `/app-router/page` to `/app-router/en/page`
- Sets the language header for Server Components under that prefix

```ts
// proxy.ts
import { createProxy } from 'next-i18next/proxy'
import i18nConfig from './i18n.config'

export const proxy = createProxy(i18nConfig)

export const config = {
  matcher: ['/app-router/:path*'],
}
```

## next.config.js

Include the Pages Router i18n config so Next.js handles locale routing for Pages:

```js
const { i18n } = require('./next-i18next.config.js')

module.exports = {
  i18n,
  reactStrictMode: true,
}
```

## Directory structure

```
app/app-router/[locale]/layout.tsx    -- App Router layout
app/app-router/[locale]/page.tsx      -- App Router pages
pages/_app.tsx                         -- appWithTranslation
pages/index.tsx                        -- Pages Router pages
public/locales/en/common.json         -- shared translation files
```

App Router pages import `getT` from your [server module](../app-router/setup.md#5-server-module) and the rest from `next-i18next/client`.
Pages Router pages import from `next-i18next/pages` and `next-i18next/pages/serverSideTranslations`.

See [`examples/mixed-routers`](https://github.com/i18next/next-i18next/blob/master/examples/mixed-routers) for a complete example.
