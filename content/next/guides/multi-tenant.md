---
description: "Give each tenant its own i18next instance when the translations depend on the request, such as the host."
---

# Multi-tenant setups

On the server, next-i18next keeps one i18next instance per process (see [Server-side caching](backends.md#server-side-caching)): translations are loaded once and reused for every request. When they depend on the request (a tenant per host, a header your translation API needs), each tenant needs its own instance.

## App Router

Create one server i18next per tenant with `createServerI18next` and keep it for later requests. Only accept tenants you know: the `Host` header comes from the client, and a new instance per unknown value would grow without end.

```ts
// i18n.server.ts
import { headers } from 'next/headers'
import { createServerI18next } from 'next-i18next/server'
import { i18nConfig } from './i18n.config'

const tenants = new Set(['a.example.com', 'b.example.com'])
const servers = new Map<string, ReturnType<typeof createServerI18next>>()

export async function getTenantI18n() {
  const host = (await headers()).get('host') ?? ''
  const tenant = tenants.has(host) ? host : 'a.example.com'
  let server = servers.get(tenant)
  if (!server) {
    server = createServerI18next({
      ...i18nConfig,
      resourceLoader: (lng, ns) =>
        fetch(`https://api.example.com/translations/${tenant}/${lng}/${ns}`)
          .then((res) => res.json()),
    })
    servers.set(tenant, server)
  }
  return server
}
```

```tsx
// app/[lng]/page.tsx
import { getTenantI18n } from '../../i18n.server'

export default async function Page() {
  const { getT } = await getTenantI18n()
  const { t } = await getT('common')
  return <h1>{t('title')}</h1>
}
```

Pass the tenant's resources to `I18nProvider` the same way, with `getResources` from the same `getTenantI18n()` result. Each tenant's translations are loaded once per process; when a tenant edits them at runtime, call `i18n.reloadResources()` on that tenant's instance (`const { i18n } = await getT()`).

## Pages Router

The first `serverSideTranslations` call creates the shared instance with that call's backend options; later calls reuse those options and every namespace loaded so far, even when you pass a different config. Pass `serverInstanceKey` (the tenant, for example) in the config instead: next-i18next then keeps one instance per key, created by the first call with that key and reused by the later ones.

```js
// lib/tenantTranslations.js
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import i18nextConfig from '../next-i18next.config'

const tenants = new Set(['a.example.com', 'b.example.com'])

export function tenantTranslations(locale, namespaces, req) {
  const tenant = tenants.has(req.headers.host)
    ? req.headers.host
    : 'a.example.com'
  return serverSideTranslations(locale, namespaces, {
    ...i18nextConfig,
    serverInstanceKey: tenant,
    backend: {
      ...i18nextConfig.backend,
      customHeaders: { 'X-Tenant': tenant },
    },
  })
}
```

```js
// pages/index.js
export const getServerSideProps = async ({ locale, req }) => ({
  props: {
    ...(await tenantTranslations(locale, ['common'], req)),
  },
})
```

Only use keys from a known set: each key keeps its instance, and its backend's reload timer, until the server stops, so a key taken straight from a request header would let anyone add instances. Build a new config object per call instead of changing the imported one, which all requests share, and pass the backend in `use` as a class (`use: [HttpBackend]`), not as an instance, so each tenant gets its own. A class can't be sent in the page props, so set `serializeConfig: false` (see [Unserializable configs](../pages-router/setup.md#unserializable-configs)); that also keeps the tenant's headers out of the page. Each tenant's translations are loaded once per process; backends with a `reloadInterval` (i18next-http-backend refreshes every hour on the server by default) pick up a tenant's edits without a restart.
