---
description: "Keep the addresses of the default language without a prefix (/about), while the other languages keep theirs (/de/about)."
---

# Hide default locale

If you want clean URLs for the default language while keeping locale prefixes for other languages, set `hideDefaultLocale: true`:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  hideDefaultLocale: true,
}
```

In this mode:
- `/about` serves the default language (English): no prefix needed
- `/de/about` serves German: non-default locales keep their prefix
- `/en/about` automatically redirects to `/about` (canonical clean URL)
- The `[lng]` folder structure stays the same: the proxy rewrites internally
