---
description: "Every export of next-i18next, by entry point, so you know what to import where."
---

# API reference

## `next-i18next` (root export)

| Export | Description |
|---|---|
| `defineConfig(config)` | Type-safe config helper (identity function) |
| `getLocalizedPath(path, lng, config)` | Public path of an internal route in a language, with locale prefix and [translated paths](../app-router/translated-paths.md): `'/contact'` -> `'/de/kontakt'` |
| `getInternalPath(pathname, config)` | Language and internal route of a public path: `'/de/kontakt'` -> `{ lng: 'de', path: '/contact' }` |
| `normalizeConfig(config)` | Fill in defaults and validate config |
| `I18nConfig` | Config type |

## `next-i18next/proxy` (also available as `next-i18next/middleware`)

| Export | Description |
|---|---|
| `createProxy(config)` | Returns a Next.js proxy function (for `proxy.ts`) |
| `createMiddleware(config)` | Alias for `createProxy` (for `middleware.ts` on Next.js < 16) |
| `defineConfig`, `normalizeConfig`, `I18nConfig` | Re-exported for Edge-safe config usage |

## `next-i18next/server`

| Export | Description |
|---|---|
| `initServerI18next(config)` | Initialize server config for `getT` from `next-i18next/server` (call once at module scope, before the first `getT()`); the alternative to `createServerI18next` |
| `createServerI18next(config)` | Returns `{ getT, getResources, generateI18nStaticParams }` bound to `config`. No `initServerI18next` and no evaluation order to get right; see [Server module](../app-router/setup.md#5-server-module) |
| `getT(ns?, options?)` | Get `{ t, i18n, lng }` for Server Components. Options: `{ lng?, keyPrefix? }` |
| `getResources(i18n, namespaces?, languages?)` | Extract loaded resources for client hydration. The shared instance preloads every supported language by default, so pass `languages` (e.g. `[lng, fallbackLng]`) to keep the serialized payload small. Include the fallback language, or keys missing from the current one have nothing to fall back to on the client |
| `generateI18nStaticParams()` | Returns `[{ lng: 'en' }, { lng: 'de' }, ...]` for `generateStaticParams`, keyed by `localeParamName` (`generateI18nStaticParams<'locale'>()` narrows the type) |

## `next-i18next/client`

| Export | Description |
|---|---|
| `I18nProvider` | Client-side provider wrapping `I18nextProvider` |
| `useT(ns?, options?)` | Translation hook for Client Components (works in all modes) |
| `useChangeLanguage(cookieName?, cookieOptions?)` | Language switcher hook for no-locale-path and internal mode; `cookieOptions` takes the same attributes as the config option |
| `Trans` | Re-exported from `react-i18next` |

## `next-i18next/icu` and `next-i18next/mf2`

| Export | Description |
|---|---|
| `I18nProvider` | `I18nProvider` from `next-i18next/client` with i18next-icu (`/icu`) or i18next-mf2 (`/mf2`) registered on the client instance. Same props. See [ICU and MF2 with the App Router](../app-router/icu-and-mf2.md) |

## `next-i18next/pages`

| Export | Description |
|---|---|
| `appWithTranslation` | HOC for `_app` |
| `useTranslation` | Translation hook (re-exported from react-i18next) |
| `Trans`, `I18nContext`, `withTranslation` | Re-exported from react-i18next |

## `next-i18next/pages/serverSideTranslations`

| Export | Description |
|---|---|
| `serverSideTranslations(locale, ns?, config?, extraLocales?)` | Load translations for `getStaticProps` / `getServerSideProps` |
