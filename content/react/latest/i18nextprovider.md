---
description: "I18nextProvider passes an i18next instance through React context, for multiple instances or server-side setups."
---

# I18nextProvider

## What it does <a id="when-to-use"></a>

`I18nextProvider` passes an i18next instance to the components below it through React context. You need it when there are several instances, for example in a [component library](https://github.com/i18next/react-i18next/tree/master/example/react-component-lib) with an instance of its own, or with one instance per request on the [server](ssr.md).

```jsx
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App';

<I18nextProvider i18n={i18n} defaultNS="translation">
  <App />
</I18nextProvider>
```

## I18nextProvider props

* `i18n` (object): the i18next instance the components below use.
* `defaultNS` (string or array of strings): the default namespace or namespaces for the components below.
