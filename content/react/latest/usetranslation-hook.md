---
description: "useTranslation gives a component its t function and the i18next instance, and renders it again when the language changes."
---

# useTranslation (hook)

## What it does <a id="when-to-use"></a>

Call it inside a function component:

```jsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  // without a namespace, it uses defaultNS ('translation' by default)
  const { t, i18n } = useTranslation();

  return <p>{t('welcome')}</p>;
}
```

Most of the time you only need `t`; the `i18n` instance is there to change the language, for example `i18n.changeLanguage('en-US')`.

While translations are still loading, the hook suspends the component, so wrap it in React's [Suspense](https://react.dev/reference/react/Suspense) or [turn that off](#not-using-suspense).

## useTranslation params

### Loading namespaces

```jsx
// load a specific namespace; t uses it as default
const { t } = useTranslation('ns1');
t('key'); // looked up in ns1

// load several namespaces; t uses the first one as default
const { t } = useTranslation(['ns1', 'ns2', 'ns3']);
t('key'); // looked up in ns1
t('key', { ns: 'ns2' }); // looked up in ns2
```

Only `t` is bound to the namespace (through i18next's [getFixedT](/overview/api#getfixedt)); `i18n` is the plain i18next instance.

### Overriding the i18next instance

```javascript
// passing in an i18n instance
// use only if you do not like the default instance
// set by i18next.use(initReactI18next) or the I18nextProvider
import i18n from './i18n';
const { t, i18n } = useTranslation('ns1', { i18n });
```

### Optional keyPrefix option

```jsx
// translation.json: { "very": { "deeply": { "nested": { "key": "here" } } } }
const { t } = useTranslation('translation', { keyPrefix: 'very.deeply.nested' });
const text = t('key'); // -> "here"
```

With a `keyPrefix`, keys with a namespace prefix such as `t('ns:key')` do not resolve.

### Optional lng option

```jsx
// you can pass a language to be used for the resulting t function
const { t } = useTranslation('translation', { lng: 'de' });
const text = t('key'); // -> "hier"
```

### Not using Suspense

```javascript
// ready says whether the translations are loaded
const { t, i18n, ready } = useTranslation('ns1', { useSuspense: false });
```

{% hint style="info" %}
When not using Suspense, you will need to handle the not-ready state yourself, e.g. by rendering a loading component as long as `!ready`. Not doing so will result in rendering your translations before they are loaded, which will cause save missing to be called although the translations exist (just not loaded yet).
{% endhint %}

### Troubleshooting

**Blank screen or "suspended while rendering, but no fallback UI was specified"?** `useSuspense` is `true` by default: while translations load asynchronously (http backend, ...), the component suspends. Either wrap it in a `<Suspense fallback={...}>` boundary, or set `useSuspense: false` and handle the `ready` flag as shown above.
