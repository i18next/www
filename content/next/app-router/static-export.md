---
description: "Export an App Router app as a static site without a server, one page per language and route."
---

# Static export (`output: 'export'`)

The [App Router setup](setup.md) also works as a static site without a server, in the default locale-in-path mode:

- Set `output: 'export'` in `next.config.js` and delete `proxy.ts`: a static export has no server, so the proxy cannot run.
- Keep `generateI18nStaticParams()` in `app/[lng]/layout.tsx`. `next build` writes one page per language and route (`out/en.html`, `out/de/about.html`, ...).
- `getT()` reads the language from the `[lng]` root param on Next.js 16.3+. On older versions, pass it from `params`: `getT('home', { lng })`.
- `hideDefaultLocale`, `localeInPath: false` and `localeInPath: 'internal'` depend on the proxy and do not work here.
- Nothing redirects bare paths or writes the language cookie: link to locale paths (`/de/about`), and `/` follows the browser languages on every visit.

The proxy normally redirects `/`, so the export has no page there. Add a `public/index.html`; the build copies it to `out/index.html`, and it sends visitors to the first supported language in their browser settings, or to the fallback language:

```html
<!doctype html>
<meta charset="utf-8">
<script>
  const supportedLngs = ['en', 'de']
  const lng = navigator.languages
    .map((l) => l.split('-')[0])
    .find((l) => supportedLngs.includes(l))
  location.replace('/' + (lng || 'en'))
</script>
<noscript><meta http-equiv="refresh" content="0; url=/en"></noscript>
```

Or use a redirect rule on your static host instead (for example `/` to `/en`).
