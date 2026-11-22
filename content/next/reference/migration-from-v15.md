---
description: "What changes when you move from next-i18next 15 to 16, for App Router and Pages Router apps."
---

# Migration from v15

## App Router users

If you were using i18next and react-i18next directly (as recommended in v15):

1. `npm install next-i18next@16`
2. Create an `i18n.config.ts` with your languages and namespaces
3. Replace your custom proxy/middleware with `createProxy(config)` in `proxy.ts`
4. Replace your custom `getT` / translation init with a [server module](../app-router/setup.md#5-server-module): `createServerI18next(config)` and the `getT` it returns
5. Replace your custom `I18nProvider` with the one from `next-i18next/client`
6. Replace `useTranslation` with `useT` from `next-i18next/client` in client components

## Pages Router users

1. Update imports from `next-i18next` to `next-i18next/pages`
2. Update `serverSideTranslations` import to `next-i18next/pages/serverSideTranslations`
3. Update type imports: `import type { TFunction, WithTranslation, I18n } from 'next-i18next/pages'`
4. Everything else works the same
