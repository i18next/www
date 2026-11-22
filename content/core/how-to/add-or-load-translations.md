---
description: "Your translations reach i18next either with the code, or from files loaded when a language or namespace is needed."
---

# Add or load translations

## Load as needed

### With your bundler <a id="lazy-load-in-memory-translations"></a>

[i18next-resources-to-backend](https://github.com/i18next/i18next-resources-to-backend) turns a dynamic `import()` into a backend: your bundler splits the translation files, and i18next loads a language or namespace when it is needed.

```javascript
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
  .use(resourcesToBackend((language, namespace) =>
    import(`./locales/${language}/${namespace}.json`)
  ))
  .init({ lng: 'de', ns: ['common'], defaultNS: 'common' });

// locales/de/common.json: { "button": { "save": "Speichern" } }
i18next.t('button.save'); // -> "Speichern", once common is loaded
```

### From the server <a id="load-using-a-backend-plugin"></a>

[i18next-http-backend](https://github.com/i18next/i18next-http-backend) fetches the files from your server; `loadPath` says where they are. Its other options are in its readme.

```javascript
import i18next from 'i18next';
import Backend from 'i18next-http-backend';

i18next
  .use(Backend)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });
```

Other backends, for example for the filesystem in Node.js, are listed under [plugins and utils](../overview/plugins-and-utils.md#backends).

`resources` and a backend do not fall back to each other; for that, see [Cache and fallback](cache-and-fallback.md#fallback-last).

## With the code, on init <a id="add-on-init"></a>

```javascript
import i18next from 'i18next';

i18next.init({
  lng: 'de',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    en: { common: { button: { save: 'Save' } } },
    de: { common: { button: { save: 'Speichern' } } }
  }
});

i18next.t('button.save'); // -> "Speichern"
```

## Add after init

```javascript
import i18next from 'i18next';

i18next.init({ lng: 'de', resources: {} });
i18next.addResourceBundle('de', 'common', { button: { save: 'Speichern' } });

i18next.t('button.save', { ns: 'common' }); // -> "Speichern"
```

Pass at least `resources: {}` on init when you add translations later and use no backend: without it, i18next tries to load the translations and, with `debug: true`, warns "No backend was added via i18next.use. Will not load resources." More ways to add and remove translations are in [Methods and events](../overview/api.md).

### Combined with a backend plugin

With a backend, set `partialBundledLanguages: true` to add some translations on init or later and load the rest through the backend. Set `ns: []` to load no namespace on init, not even the default `translation`.

```javascript
i18next.use(Backend).init({
  partialBundledLanguages: true,
  ns: [],
  resources: {}
});
i18next.addResourceBundle('de', 'common', { button: { save: 'Speichern' } });
// the rest through the backend:
// i18next.loadNamespaces(['admin']), i18next.loadLanguages(['fr'])
```
