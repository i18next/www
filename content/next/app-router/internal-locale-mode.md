---
description: "Addresses without a language prefix that still prerender statically, one version per language."
---

# Internal locale mode (clean URLs + static prerendering)

`localeInPath: false` gives clean URLs, but the language then comes from `headers()`/`cookies()`, which makes every route dynamic. If you need clean URLs **and** static prerendering per locale (e.g. with Next.js Cache Components, `cacheComponents: true`), set `localeInPath: 'internal'`:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  localeInPath: 'internal',
  // only if your segment is app/[locale] instead of app/[lng]
  localeParamName: 'locale',
}
```

In this mode:
- Routes live under `app/[lng]/` exactly like the default mode, so `generateI18nStaticParams()` prerenders every locale
- The proxy detects the language (cookie > Accept-Language > fallback) and **rewrites** `/about` to `/de/about` internally: the public URL never shows a locale
- Explicit locale paths (`/de/about`) are served as-is, like in the default mode: the proxy never redirects them, so `<Link>` prefetches cannot flip the language cookie. Your own links should be clean (`/about`)
- `getT()` reads the language from the `[lng]` root param (Next.js 16.3+), so it does not opt the route out of prerendering
- Use `useChangeLanguage()` for language switching, as in no-locale-path mode
- `hideDefaultLocale` has no effect here
