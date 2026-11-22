---
description: "Chained backends load translations faster from a cache, and keep them available when the server is not."
---

# Cache and fallback

[i18next-chained-backend](https://github.com/i18next/i18next-chained-backend) tries its backends in order; the first one that returns the namespace wins. A cache goes first, a fallback goes last. A backend in front that has nothing yet gets the namespace saved into it once a later one has loaded it.

## Cache first <a id="browser-caching-with-local-storage"></a><a id="server-side-caching-with-filesystem"></a><a id="next.js-caching-with-next-i18next"></a>

The browser keeps the translations in `localStorage` and asks the server again after `expirationTime`:

```javascript
import i18next from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

i18next
  .use(ChainedBackend)
  .init({
    fallbackLng: 'en',
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        { expirationTime: 7 * 24 * 60 * 60 * 1000 }, // 7 days
        { loadPath: '/locales/{{lng}}/{{ns}}.json' }
      ]
    }
  });
```

For Next.js, see [Custom backends](/next/guides/backends#i18next-chained-backend).

## Fallback last <a id="browser-fallback-with-local-bundled-translations"></a><a id="server-side-fallback-with-filesystem"></a><a id="you-can-also-lazy-load-the-in-memory-translations-i.e.-when-using-webpack"></a>

The server's translations first; when it is not reachable or has none, the ones that ship with the app:

```javascript
import i18next from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
  .use(ChainedBackend)
  .init({
    fallbackLng: 'en',
    backend: {
      backends: [
        HttpBackend,
        // bundled: resourcesToBackend({ en: { translation: { … } } })
        resourcesToBackend((lng, ns) => import(`./locales/${lng}/${ns}.json`))
      ],
      backendOptions: [{ loadPath: '/locales/{{lng}}/{{ns}}.json' }]
    }
  });
```

On the server, use `i18next-fs-backend` in the same places: as the cache in front of the server, or as the fallback with files on disk.

## Saving missing keys

Saving missing keys at run time (`saveMissing`) is an older way to get new keys into your files ([Extracting translations](extracting-translations.md)). With a cache in the chain, a key can count as missing because the cache holds an older version of the namespace (the chained backend warns that it "may trigger based on stale data"), and the key is then sent to every backend in the chain that can save it.

Packages: [i18next-chained-backend](https://github.com/i18next/i18next-chained-backend), [i18next-localstorage-backend](https://github.com/i18next/i18next-localstorage-backend), [i18next-http-backend](https://github.com/i18next/i18next-http-backend), [i18next-fs-backend](https://github.com/i18next/i18next-fs-backend), [i18next-resources-to-backend](https://github.com/i18next/i18next-resources-to-backend).
