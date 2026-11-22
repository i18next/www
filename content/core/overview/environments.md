---
description: "i18next runs wherever JavaScript runs; how you load it differs between the browser, Node.js, Deno and React Native."
---

# Environments

## Browser <a id="supported-environments"></a><a id="builds-in-the-npm-package"></a><a id="load-from-cdn"></a>

i18next supports the two most recent versions of evergreen browsers (Chrome, Firefox, Safari, etc.).

With a bundler, install it with npm: the package holds a CommonJS, an ES module and a UMD build, and its package.json points the bundler to the right one.

Without a bundler, load it with a script tag from a CDN, with a fixed version:

```html
<script src="https://unpkg.com/i18next@27.2.3/dist/umd/i18next.min.js"></script>
```

[cdnjs](https://cdnjs.com/libraries/i18next) and [jsDelivr](https://www.jsdelivr.com/package/npm/i18next) serve the same files.

## Node.js

Install i18next with npm and import it as in the [basic sample](getting-started.md#basic-sample). For Express, Fastify and other Node.js servers, [i18next-http-middleware](https://github.com/i18next/i18next-http-middleware) detects the language per request; [i18next-fs-backend](https://github.com/i18next/i18next-fs-backend) loads the translation files from the filesystem.

## Deno <a id="load-in-deno"></a>

```bash
deno add jsr:@i18next/i18next
```

```javascript
import i18next from '@i18next/i18next';
```

## React Native

See [React Native and Expo](/react/react-native).

The formats use the Intl API and the plurals `Intl.PluralRules`; older environments may need their polyfills from [FormatJS](https://formatjs.io/docs/polyfills/).
