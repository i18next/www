---
description: "Set up next-i18next in a Pages Router app, with the API you know from v15 under next-i18next/pages."
---

# Pages Router setup

For projects using only the Pages Router, the familiar v15 API is available under `next-i18next/pages`:

```js
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
}
```

```js
// next.config.js
const { i18n } = require('./next-i18next.config.js')
module.exports = { i18n }
```

```tsx
// pages/_app.tsx
import { appWithTranslation } from 'next-i18next/pages'

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />
export default appWithTranslation(MyApp)
```

```tsx
// pages/index.tsx
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { useTranslation } from 'next-i18next/pages'

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function Home() {
  const { t } = useTranslation('common')
  return <h1>{t('title')}</h1>
}
```

See [`examples/pages-router-simple`](https://github.com/i18next/next-i18next/blob/master/examples/pages-router-simple), [`examples/pages-router-ssg`](https://github.com/i18next/next-i18next/blob/master/examples/pages-router-ssg), and [`examples/pages-router-auto-static-optimize`](https://github.com/i18next/next-i18next/blob/master/examples/pages-router-auto-static-optimize) for more.

## Fallback locales

By default the `defaultLocale` is the fallback language. To change that, set [`fallbackLng`](/principles/fallback) to a string, an array, an object or a function, as in i18next.

With `nonExplicitSupportedLngs: true`, every regional variant falls back to its language (`de-CH` to `de`) without a file per variant. The variants still have to be in `locales` for Next.js routing, and `fallbackLng` can't be a function then.

```js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de-AT', 'de-DE', 'de-CH'],
  },
  fallbackLng: {
    default: ['en'],
    'de-CH': ['fr', 'en'],
  },
  nonExplicitSupportedLngs: true,
  // de-CH falls back to de, fr and en (an own entry replaces `default`)
}
```

`serverSideTranslations` adds the fallback languages to the page props, so each one makes the page bigger. With `fallbackLng: false` only the current language is shipped.

## Loading translations on the client <a id="client-side-loading-of-translations-via-http"></a>

Pages without `serverSideTranslations` (for example pages Next.js optimizes as static because they have no `getStaticProps`), or namespaces you only need later, can load their translations in the browser. Add a backend for the browser only, and `partialBundledLanguages` so the namespaces from `serverSideTranslations` and the ones loaded later go together:

```js
// next-i18next.config.js
const HttpBackend = require('i18next-http-backend/cjs')

const isBrowser = typeof window !== 'undefined'

module.exports = {
  i18n: { defaultLocale: 'en', locales: ['en', 'de'] },
  partialBundledLanguages: isBrowser,
  serializeConfig: false,
  use: isBrowser ? [HttpBackend] : [],
}
```

i18next-http-backend loads `/locales/{{lng}}/{{ns}}.json` by default, which is your `public/locales` folder. Pass the config to `appWithTranslation` (see [Unserializable configs](#unserializable-configs)). [`examples/pages-router-auto-static-optimize`](https://github.com/i18next/next-i18next/blob/master/examples/pages-router-auto-static-optimize) has the full setup, with a local storage cache through i18next-chained-backend.

## Reloading in development <a id="reloading-resources-in-development"></a>

Translations are loaded once per server process, so changes to your JSON files show up only after a restart. With `reloadOnPrerender: true`, `serverSideTranslations` reloads the languages and namespaces it ships on every call. It only does that while `NODE_ENV` is not `production`, so it never reloads per request in production.

## Unserializable configs

`serverSideTranslations` puts your config into the page props, so `appWithTranslation` can use it in the browser. Plugins in `use`, a function `localePath` and other functions can't be serialized, and Next.js fails with an error like:

```
Error: Error serializing `._nextI18Next.userConfig.use[0].process` returned from `getStaticProps` in "/my-page".
Reason: `function` cannot be serialized as JSON. Please only return JSON serializable data types.
```

Set `serializeConfig: false` and pass the config to `appWithTranslation` and `serverSideTranslations` yourself:

```tsx
// pages/_app.tsx
import { appWithTranslation } from 'next-i18next/pages'
import nextI18NextConfig from '../next-i18next.config'

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />

export default appWithTranslation(MyApp, nextI18NextConfig)
```

```tsx
// pages/index.tsx
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import nextI18NextConfig from '../next-i18next.config'

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(
      locale,
      ['common', 'footer'],
      nextI18NextConfig
    )),
  },
})
```

## Fallback SSG pages <a id="usage-with-fallback-ssg-pages"></a>

With [`getStaticPaths`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) and `fallback: true`, Next.js renders the fallback page first without props. Without `_nextI18Next` in the props, `appWithTranslation` has no i18n instance yet and renders your app without the `I18nextProvider`; once the props arrive, the provider is added and React mounts your app again (effects run twice). Pass the config to `appWithTranslation` (as above) so there is an instance from the first render on.

The fallback render still has no translations, so don't render translated text while `router.isFallback` is `true`: the keys would show, and the server and client HTML would not match.

The options of this config, and where `serverSideTranslations` looks for it: [Pages Router options](../reference/configuration.md#pages-router-options). <a id="pages-router-options"></a>

## Deployment

### Vercel and Netlify

`serverSideTranslations` reads the locale files at runtime. Some serverless hosts can't find them under the default relative path; if you get file system errors, set `localePath` with `path.resolve`:

```js
// next-i18next.config.js
module.exports = {
  i18n: { defaultLocale: 'en', locales: ['en', 'de'] },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
}
```

### Docker

Copy `next-i18next.config.js` into the image next to `next.config.js` (for example `COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js` with the [Dockerfile from the Next.js docs](https://nextjs.org/docs/app/getting-started/deploying#docker)), because `serverSideTranslations` reads it at runtime.

## Older ways

### Missing keys with saveMissing <a id="missing-keys-savemissing"></a>

The Pages Router's built-in loader only reads the locale files, so `saveMissing: true` on its own saves nothing. To collect missing keys, add a backend that can save them, in the browser: [i18next-http-backend](https://github.com/i18next/i18next-http-backend) with an `addPath` pointing to an API route of yours that stores the keys it receives.

```js
// next-i18next.config.js
const HttpBackend = require('i18next-http-backend/cjs')

const isBrowser = typeof window !== 'undefined'

module.exports = {
  i18n: { defaultLocale: 'en', locales: ['en', 'de'] },
  saveMissing: process.env.NODE_ENV === 'development',
  serializeConfig: false,
  use: isBrowser ? [HttpBackend] : [],
  backend: isBrowser ? { addPath: '/api/missing/{{lng}}/{{ns}}' } : undefined,
}
```

With `serializeConfig: false`, pass the config to `appWithTranslation(MyApp, nextI18NextConfig)` and `serverSideTranslations(locale, ns, nextI18NextConfig)`. On the server the built-in loader keeps reading the files.
