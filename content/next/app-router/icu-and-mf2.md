---
description: "Write your translations in MessageFormat (ICU) or MessageFormat 2 in an App Router app; getT() and useT() stay the same."
---

# ICU and MF2 with the App Router

To write your translations in ICU MessageFormat ([i18next-icu](https://github.com/i18next/i18next-icu)) or in Unicode MessageFormat 2 ([i18next-mf2](https://github.com/i18next/i18next-mf2)) instead of the i18next JSON format, register the plugin in the server config and import `I18nProvider` from `next-i18next/icu` (or `next-i18next/mf2`). Both plugins replace i18next's own plurals, context keys and `{{interpolation}}`; [Using ICU or MF2](/how-to/using-icu-or-mf2) lists what keeps working and what does not.

## Install

```bash
npm install i18next-icu intl-messageformat
# or, for MF2
npm install i18next-mf2
```

Both are optional peer dependencies of next-i18next. Apps that never import `next-i18next/icu` or `next-i18next/mf2` do not resolve or bundle them.

## Configuration

Add the plugin to `use`, so `getT()` formats the messages on the server:

```ts
// i18n.config.ts
import type { I18nConfig } from 'next-i18next/proxy'
import ICU from 'i18next-icu'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
  use: [ICU],
}

export default i18nConfig
```

```json app/i18n/locales/en/common.json
{
  "photos": "You have {count, plural, =0 {no photos} one {# photo} other {# photos}}.",
  "order": "{status, select, pending {Your order is being prepared.} shipped {Your order is on its way.} other {Your order status is unknown.}}",
  "welcome": "Welcome back, <0>{name}</0>!"
}
```

In the root layout, import `I18nProvider` from `next-i18next/icu` instead of `next-i18next/client`. It takes the same props and registers i18next-icu on the client instance:

```tsx
// app/[lng]/layout.tsx
import { I18nProvider } from 'next-i18next/icu' // or 'next-i18next/mf2'
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

  return (
    <html lang={lng}>
      <body>
        <I18nProvider language={lng} resources={getResources(i18n)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
```

A Server Component cannot pass a plugin class to a Client Component as a prop: `<I18nProvider use={[ICU]}>` in a layout fails the build with "Functions cannot be passed directly to Client Components". `next-i18next/icu` is a Client module that imports the plugin itself, so no `'use client'` wrapper of your own is needed. `useT`, `useChangeLanguage` and `Trans` still come from `next-i18next/client`.

Notes:
- The client instance does not read the server config. Plugin options in `i18nextOptions.i18nFormat` (for example `bidiIsolation: 'none'` for MF2) have to be passed to `I18nProvider` as well, via its `i18nextOptions` prop, or the server and client render different text.
- The proxy imports the same config, so the plugin ends up in the proxy bundle too (about 40 KB for i18next-icu). To keep it out, leave `use` out of the shared config and add it in the [server module](setup.md#5-server-module): `createServerI18next({ ...i18nConfig, use: [ICU] })`.
- For MF2, put `MF2` from `i18next-mf2` into `use` and import `I18nProvider` from `next-i18next/mf2`. Messages are written in MF2 syntax, e.g. `.input {$count :number} .match $count one {{You have {$count} photo.}} * {{You have {$count} photos.}}`.

## Server Components

```tsx
// app/[lng]/page.tsx
import { getT } from '@/i18n.server'
import { IcuTransWithoutContext } from 'react-i18next/IcuTransWithoutContext'

export default async function Page() {
  const { t, i18n } = await getT()
  return (
    <main>
      <p>{t('photos', { count: 5 })}</p>
      <p>{t('order', { status: 'shipped' })}</p>
      <p>
        <IcuTransWithoutContext
          i18nKey='welcome'
          defaultTranslation='Welcome back, <0>{name}</0>!'
          content={[{ type: 'strong' }]}
          values={{ name: 'Ada' }}
          t={t}
          i18n={i18n}
        />
      </p>
    </main>
  )
}
```

`IcuTransWithoutContext` (react-i18next 17.0.21 or later) uses no React context, so it renders in Server Components. Pass the `t` from `getT()`; it is bound to the request's language. `Trans` from `react-i18next/TransWithoutContext` works as well, with `values` and `components`:

```tsx
<Trans
  t={t}
  i18n={i18n}
  i18nKey='welcome'
  values={{ name: 'Ada' }}
  components={[<strong key='0' />]}
/>
```

With react-i18next 17, import both from these entry points in Server Components: the `react-i18next` root also loads React context. react-i18next 18 resolves the root to them in Server Components (its `react-server` export condition), so `import { Trans, IcuTrans } from 'react-i18next'` works there as well.

## Client Components

```tsx
'use client'
import { useState } from 'react'
import { IcuTrans } from 'react-i18next'
import { useT } from 'next-i18next/client'

export function Photos() {
  const { t } = useT()
  const [count, setCount] = useState(0)
  return (
    <>
      <p>{t('photos', { count })}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <IcuTrans
        i18nKey='welcome'
        defaultTranslation='Welcome back, <0>{name}</0>!'
        content={[{ type: 'strong' }]}
        values={{ name: 'Ada' }}
      />
    </>
  )
}
```

## TypeScript

With i18next 26.5.0 or later, set `parseInterpolation: 'icu'` (or `'mf2'`) and the options of `t` from `getT` and `useT`, and the `values` of `IcuTrans` and `IcuTransWithoutContext` (react-i18next 17.1.0 or later), are type-checked against the arguments of each message. The messages need literal types, which `npx i18next-cli types` generates (see [i18next-cli](#i18next-cli) below); with `typeof` on a JSON import, every message is a `string` and nothing is checked:

```ts
// @types/i18next.d.ts
import 'i18next'
import type Resources from './resources' // generated by `npx i18next-cli types`

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: Resources
    parseInterpolation: 'icu' // or 'mf2'
  }
}
```

```tsx
// photos: 'You have {count, plural, =0 {no photos} one {# photo} other {# photos}}.'
const { t } = await getT()
t('photos', { count: 5 }) // ok
t('photos', { count: 'five' }) // type error: count takes a number
// type error: 'pass these arguments as t() options': { count: number; }
t('photos')
```

With i18next 26.2.0 to 26.4.x, set `parseInterpolation: false` instead: the default type extractor reads `{{variables}}`, and ICU arguments nested in a plural (`one {{count} row}`) and MF2 variants (`* {{You have {$count} photos.}}`) contain double braces that are not i18next variables, so these `t` calls would not compile. Keys are still checked, the values you pass to `t` are not.

## i18next-cli

[i18next-cli](/cli) 1.76.0 or later knows both formats. Set `extract.messageFormat` to `'icu'` or `'mf2'` in your `i18next.config.ts`:

```ts
import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['app/**/*.{ts,tsx}'],
    output: 'app/i18n/locales/{{language}}/{{namespace}}.json',
    messageFormat: 'icu', // or 'mf2'
  },
})
```

`extract` then writes one key per message instead of `_one`/`_other` suffix keys and extracts `IcuTrans` and `IcuTransWithoutContext`, `lint` checks the syntax, the argument names and the plural categories of every language, and `types` writes the resources file with literal message types and `parseInterpolation: 'icu'` or `'mf2'` (i18next-cli 1.77.0 with i18next 26.5.0 or later, else `false`) into a newly generated `i18next.d.ts`.

See [`examples/app-router-icu`](https://github.com/i18next/next-i18next/blob/master/examples/app-router-icu) for a complete app with plurals, a select and rich text in Server and Client Components.
