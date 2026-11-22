---
description: "Set up next-i18next in an App Router app: the language in the address, and translations in Server and Client Components."
---

# App Router setup

## 1. Install

```bash
npm install next-i18next i18next react-i18next
```

## 2. Translation files

Put the JSON files in `app/i18n/locales/` and load them with a `resourceLoader` (next step). The bundler then includes them, so this works on every host, serverless platforms included:

```
app/i18n/locales/en/common.json
app/i18n/locales/en/home.json
app/i18n/locales/de/common.json
app/i18n/locales/de/home.json
```

Files in `public/locales/` work without a `resourceLoader`, but only with local or traditional hosting: on serverless platforms (Vercel, AWS Lambda) the files in `public/` are served from a CDN and are not on the file system at run time.

## 3. Configuration

Create a config file (e.g., `i18n.config.ts`):

```ts
import type { I18nConfig } from 'next-i18next/proxy'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home'],
  // bundled with the app, so it works on every host
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig
```

The `resourceLoader` uses a dynamic `import()`, which the bundler can trace, so the files end up in the serverless function bundle. Without a `resourceLoader`, next-i18next reads `public/locales/` from the file system at run time.

Import `I18nConfig` from `next-i18next/proxy` (not from `next-i18next`) to keep the config file Edge-safe.

## 4. Proxy

Create `proxy.ts` at your project root (Next.js 16+ replaces `middleware.ts` with `proxy.ts`):

```ts
import { createProxy } from 'next-i18next/proxy'
import i18nConfig from './i18n.config'

export const proxy = createProxy(i18nConfig)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
}
```

The matcher leaves out the root metadata files (`app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`). If your sitemap is a localized route instead (`app/[lng]/sitemap.ts`), take `sitemap.xml` out of the matcher, so the proxy still sends `/sitemap.xml` to a language.

> **Note**: `createMiddleware` from `next-i18next/middleware` is still available for projects on Next.js < 16.

The proxy:
- Detects language from cookie > Accept-Language header > fallback
- Redirects bare URLs to locale-prefixed paths (e.g., `/about` -> `/en/about`)
- Sets a custom header (`x-i18next-current-language`) for Server Components
- Persists the language in a cookie, but only when it changed: a cookie written by the proxy counts as a modified cookie for Next, and a modified cookie makes every Server Action revalidate and refetch the page. Set `persistCookie: false` if another system owns that cookie, and `cookieOptions` to scope it (e.g. `{ domain: '.example.com', secure: true }`)

## 5. Server module

Bind the config once, in a module of its own, and import `getT` from it everywhere on the server (next-i18next 16.3 and later):

```ts
// i18n.server.ts
import { createServerI18next } from 'next-i18next/server'
import i18nConfig from './i18n.config'

export const { getT, getResources, generateI18nStaticParams } =
  createServerI18next(i18nConfig)
```

Layouts, pages, `generateMetadata` and Route Handlers import from this module, so there is no initialization step and no order to get right. Next.js's own [internationalization guide](https://nextjs.org/docs/app/guides/internationalization) works the same way: pages import their translations from one module. Call `createServerI18next` once, at module scope: each call creates its own i18next instance. The examples import it as `@/i18n.server`, with the `@/` alias that create-next-app sets up.

## 6. Root layout

```tsx
// app/[lng]/layout.tsx
import { I18nProvider } from 'next-i18next/client'
import { getT, getResources, generateI18nStaticParams } from '@/i18n.server'

export async function generateStaticParams() {
  return generateI18nStaticParams()
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lng: string }>
}) {
  const { lng } = await params
  const { i18n } = await getT()
  const resources = getResources(i18n)

  return (
    <html lang={lng}>
      <body>
        <I18nProvider language={lng} resources={resources}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
```

Key points:
- `getResources(i18n)`: serializes loaded translations for client hydration
- `I18nProvider`: wraps children so client components can use `useT()`

### With initServerI18next instead

`initServerI18next(config)` at module scope in the root layout sets the config for `getT` from `next-i18next/server`, without a module of your own:

```tsx
// app/[lng]/layout.tsx
import { initServerI18next, getT, getResources, generateI18nStaticParams } from 'next-i18next/server'
import i18nConfig from '../../i18n.config'

initServerI18next(i18nConfig)
```

It is a side effect: it has to run in the process before the first `getT()`. Module scope of the root layout works because Next loads the root layout before anything below it, but nothing enforces it if a second copy of `next-i18next/server` calls `getT()` first, for example from a Route Handler, which is bundled in its own layer. The server module above has no such order.

## 7. Server Components

```tsx
// app/[lng]/page.tsx
import { getT } from '@/i18n.server'

export default async function Home() {
  const { t } = await getT('home')
  return <h1>{t('title')}</h1>
}

export async function generateMetadata() {
  const { t } = await getT('home')
  return { title: t('meta_title') }
}
```

On Next.js 16.3+ `getT()` resolves the language from the `[lng]` root param (via `next/root-params`) before falling back to the proxy header and cookie. Reading a root param does not opt the route out of static prerendering, so `getT()` is safe in prerendered routes (including with `cacheComponents: true`). Route Handlers and Server Actions have no root params: pass `{ lng }` explicitly there.

With `cacheComponents: true`, `next dev` reports "uncached data" at a `getT()` call when that render reads translations from disk with `fs`, once per language: with an `fs`-based `resourceLoader` (like the one in [In development](#in-development)), or without a `resourceLoader`, where locale files are read from `public/locales`. An `import()`-based `resourceLoader` does not trigger it. Either way it is file I/O in the dev render, not a dynamic route: `next build` is the check to trust, and it prerenders every locale.

For the `Trans` component in Server Components, import it from `react-i18next` and pass both `t` and `i18n`. In a Server Component, the `react-server` export condition of react-i18next gives the variant without React context:

```tsx
import { Trans } from 'react-i18next'
import { getT } from '@/i18n.server'

export default async function Page() {
  const { t, i18n } = await getT()
  return (
    <Trans t={t} i18n={i18n} i18nKey="welcome">
      Welcome to <strong>next-i18next</strong>
    </Trans>
  )
}
```

With react-i18next older than 18, import it from `react-i18next/TransWithoutContext` instead.

## 8. Client Components

```tsx
'use client'
import { useT } from 'next-i18next/client'

export default function Counter() {
  const { t } = useT('home')
  return <button>{t('click_me')}</button>
}
```

`useT` works in both locale-in-path (`/en/about`) and no-locale-path modes. `I18nProvider` follows the `[lng]` or `[locale]` route param when there is one; `useT` itself does not subscribe to the URL, so rewriting it (`history.replaceState`, `?page=`) does not re-render its callers.

For the `Trans` component in Client Components:

```tsx
'use client'
import { Trans, useT } from 'next-i18next/client'

export default function Greeting() {
  const { t } = useT()
  return <Trans t={t} i18nKey="greeting">Hello <strong>world</strong></Trans>
}
```

## 9. Language switching (locale-in-path)

When the locale is part of the URL path (e.g., `/en/about` → `/de/about`), switch languages by navigating to the new locale prefix:

```tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'

export function LanguageSwitcher({ supportedLngs }: { supportedLngs: string[] }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (locale: string) => {
    const segments = pathname.split('/')
    segments[1] = locale
    router.push(segments.join('/'))
  }

  return (
    <div>
      {supportedLngs.map((lng) => (
        <button key={lng} onClick={() => switchLocale(lng)}>{lng}</button>
      ))}
    </div>
  )
}
```

With [translated paths](translated-paths.md), use `getInternalPath` and `getLocalizedPath` instead of replacing the first segment. For the no-locale-path mode (cookie-based), see `useChangeLanguage` in [No-locale-path mode](no-locale-path.md).

## In development

Set `reloadOnPrerender: process.env.NODE_ENV === 'development'` to see edits to the translation files without restarting `next dev` (it has no effect in production; leave it off with `cacheComponents: true`, where re-reading the files is uncached I/O), and, because the bundler caches JSON loaded with `import()`, read the files with `fs` in development:

```ts
const resourceLoader: I18nConfig['resourceLoader'] =
  process.env.NODE_ENV === 'development'
    ? async (lng, ns) => {
        const fs = await import('fs/promises')
        const path = await import('path')
        const content = await fs.readFile(
          path.resolve(process.cwd(), `app/i18n/locales/${lng}/${ns}.json`),
          'utf-8'
        )
        return JSON.parse(content)
      }
    : (lng, ns) => import(`./app/i18n/locales/${lng}/${ns}.json`)
```
