---
description: "The options of the next-i18next config, with their defaults."
---

# Config options

The options of `i18n.config.ts` for the App Router:

* `supportedLngs` (required): the language codes, for example `['en', 'de']`.
* `fallbackLng` (required): the default language.
* `defaultNS` (default `'common'`): the default namespace.
* `ns` (default `[defaultNS]`): all namespaces.
* `localeInPath` (default `true`): `true` puts the language in the path (`/en/about`); `false` gives addresses without it, with the language from the cookie or header (every route renders on request); `'internal'` gives addresses without it while the language segment stays in the internal rewrite, so routes still prerender.
* `localeParamName` (default `'lng'`): the name of the language route segment (`app/[lng]`), used by `generateI18nStaticParams` and by `getT()` to read the language from the root param.
* `hideDefaultLocale` (default `false`): with `localeInPath: true`, the default language has no prefix in the path.
* `pathnames` (no default): translated paths per language, for example `{ '/contact': { de: '/kontakt' } }`; see [Translated paths](../app-router/translated-paths.md).
* `localePath` (default `'/locales'`): the folder of the translation files, relative to `public`.
* `localeStructure` (default `'{{lng}}/{{ns}}'`): the file layout inside `localePath`.
* `localeExtension` (default `'json'`): the file extension.
* `resources` (no default): translations passed in directly; nothing is loaded then.
* `resourceLoader` (no default): an async loader `(lng, ns) => Promise<object>`, used instead of `localePath`.
* `basePath` (no default): the route-folder prefix the proxy handles, for example `'/app-router'` for `app/app-router/[lng]/…` in [mixed-router setups](../guides/mixed-routers.md). The `basePath` of `next.config` needs no setting here; the proxy handles it by itself.
* `cookieName` (default `'i18next'`): the name of the language cookie.
* `headerName` (default `'x-i18next-current-language'`): the header that passes the language to Server Components.
* `cookieMaxAge` (default `31536000`, one year): the lifetime of the cookie in seconds.
* `persistCookie` (default `true`): whether the proxy writes the language cookie; `false` reads it but never writes it, for apps where another system owns the cookie.
* `cookieOptions` (default `{}`): more cookie attributes (`domain`, `secure`, `sameSite`, `path`, `maxAge`), applied on top of `{ path: '/', maxAge: cookieMaxAge, sameSite: 'lax' }`.
* `ignoredPaths` (default `['/api', '/_next', '/static']`): the paths the proxy skips.
* `use` (default `[]`): i18next plugins.
* `i18nextOptions` (default `{}`): more i18next init options.
* `nonExplicitSupportedLngs` (default `false`): lets `'en'` match `'en-US'` and other regional codes.
* `reloadOnPrerender` (default off): in development only, reloads the translations before each render; see [In development](../app-router/setup.md#in-development).

## Pages Router options

The options of `next-i18next.config.js` for the Pages Router, besides `i18n` (`defaultLocale` and `locales`, as in the Next.js config):

* `defaultNS` (default `'common'`): the default namespace.
* `localePath` (default `'./public/locales'`): the folder with the translation files. It can also be a function `(locale, namespace, missing) => path` that returns the path of one file (then list all namespaces in `ns`; `missing` is always `false`), or `null` when you pass `resources` yourself.
* `localeStructure` (default `'{{lng}}/{{ns}}'`): the file layout inside `localePath`. It follows a custom `interpolation.prefix` and `suffix` (for example `'{lng}/{ns}'`) unless you set it; ignored when `localePath` is a function.
* `localeExtension` (default `'json'`): the file extension; ignored when `localePath` is a function.
* `reloadOnPrerender` (default `false`): reloads the translations on every `serverSideTranslations` call, in development only; see [Reloading in development](../pages-router/setup.md#reloading-in-development).
* `serializeConfig` (default `true`): puts the config into the page props for `appWithTranslation`; see [Unserializable configs](../pages-router/setup.md#unserializable-configs).
* `serverInstanceKey` (no default): keeps one server-side i18next instance per key; see [Multi-tenant setups](../guides/multi-tenant.md).
* `use` (default `[]`): i18next plugins.
* `onPreInitI18next` (no default): called with the i18next instance before `init`, for example `(i18n) => i18n.on('failedLoading', handleFailedLoading)`.

All other [i18next options](/overview/configuration-options) and [React options](/react/latest/i18next-instance) go into the same config.

`serverSideTranslations` reads the config from `./next-i18next.config.js` unless you pass it. For another location, for example an app inside a monorepo, set the environment variable `I18NEXT_DEFAULT_CONFIG_PATH`, e.g. in `next.config.js`:

```js
process.env.I18NEXT_DEFAULT_CONFIG_PATH = `${__dirname}/next-i18next.config.js`
```
