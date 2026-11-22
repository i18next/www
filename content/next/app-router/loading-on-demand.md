---
description: "Load each language on its first request instead of at startup, so a server with many languages needs less memory."
---

# Loading languages on demand

By default the shared server instance preloads every supported language at startup, so `getResources(i18n)` can serialize any of them. With many locales and namespaces that is a lot of resident memory. Pass `i18nextOptions: { preload: [] }` to load each language on its first request instead:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de', 'fr', 'it'],
  fallbackLng: 'en',
  i18nextOptions: { preload: [] },
}
```

The store then only holds languages that have been requested so far, so pass `[lng, fallbackLng]` to `getResources` rather than relying on everything being present.

On the client the language then changes in two steps: `useChangeLanguage` writes the cookie and calls `router.refresh()`, and `I18nProvider` switches as soon as that re-render delivers the new language's resources. Client Components keep working without any extra setup: pass `supportedLngs` to `I18nProvider` only if you want to restrict which languages it accepts (unset, it accepts any language the server sends).
