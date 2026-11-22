---
description: "Render translated pages on the server, and hand the translations to the client so it does not load them again."
---

# Server rendering without Next.js

With Next.js, use [next-i18next](/next); it does all of this for you. <a id="using-next.js"></a>

## One instance per request <a id="setting-the-i18next-instance-based-on-req"></a>

[i18next-http-middleware](https://github.com/i18next/i18next-http-middleware) creates an i18next instance per request, in the language of that request. [I18nextProvider](i18nextprovider.md) hands it to your app:

```jsx
app.use(handle(i18next)); // sets req.i18n and req.language

// in the route that renders the page
const html = renderToString(
  <I18nextProvider i18n={req.i18n}>
    <App />
  </I18nextProvider>
);
```

## Passing translations to the client <a id="passing-initial-translations-initial-language-down-to-client"></a><a id="using-the-usessr-hook"></a>

Hand the language and the translations to the client with the page, so it renders right away instead of loading them again (and suspending). On the server they come from the middleware: the language is `req.language`, the translations are `req.i18n.store.data` (every loaded language; pass only the ones the page needs).

On the client, `useSSR` puts them into the i18next instance before your app renders:

```jsx
import { useSSR } from 'react-i18next';

export function InitSSR({ initialI18nStore, initialLanguage }) {
  useSSR(initialI18nStore, initialLanguage);

  return <App />;
}
```

On the server, where the instance is the middleware's per-request copy, `useSSR` does nothing.

## Older ways <a id="using-the-withssr-hoc"></a>

The higher-order component `withSSR` does the same as `useSSR`:

```jsx
import { withSSR } from 'react-i18next';
import App from './App';

const ExtendedApp = withSSR()(App);

<ExtendedApp
  initialLanguage="de"
  initialI18nStore={{ de: { translation: { welcome: 'Willkommen' } } }}
/>
```

`ExtendedApp.getInitialProps()` calls the one of `App`, if it has one.
