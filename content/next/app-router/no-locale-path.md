---
description: "Keep every address free of a language prefix; the language then comes from a cookie, and every route renders on request."
---

# No-locale-path mode

If you prefer clean URLs without a locale prefix for **all** languages (e.g., `/about` instead of `/en/about`), set `localeInPath: false`:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  localeInPath: false,
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}
```

In this mode:
- Routes live directly under `app/` (no `[lng]` segment)
- The proxy detects the language from cookies / Accept-Language, sets the header, but does **not** redirect
- Server Components use `getT()` as usual (language is read from the header)
- Client Components use `useT()` as usual (language comes from `I18nProvider`)
- Use `useChangeLanguage()` for language switching (updates cookie + triggers server re-render):

```tsx
'use client'
import { useChangeLanguage } from 'next-i18next/client'

export function LanguageSwitcher() {
  const changeLanguage = useChangeLanguage()
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('de')}>Deutsch</button>
    </div>
  )
}
```

The root layout reads the language from `getT()` instead of URL params:

```tsx
// app/layout.tsx (no [lng] segment)
export default async function RootLayout({ children }) {
  const { i18n, lng } = await getT()
  const resources = getResources(i18n)

  return (
    <I18nProvider language={lng} resources={resources}>
      <html lang={lng}>
        <body>{children}</body>
      </html>
    </I18nProvider>
  )
}
```

See [`examples/app-router-no-locale-path`](https://github.com/i18next/next-i18next/blob/master/examples/app-router-no-locale-path) for a complete example.
