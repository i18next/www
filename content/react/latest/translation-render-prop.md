---
description: "Translation passes t and the i18next instance to a render function."
---

# Translation (render prop)

For class components; in function components, use the [`useTranslation`](usetranslation-hook.md) hook.

## What it does <a id="when-to-use"></a>

`Translation` calls its child function with `t` and an object holding the i18next instance `i18n`; `i18n` is there to change the language, for example `i18n.changeLanguage('en-US')`. While the translations load, the component suspends ([Not using Suspense](#not-using-suspense)).

```jsx
import { Component } from 'react';
import { Translation } from 'react-i18next';

export class MyComponent extends Component {
  render() {
    return (
      <Translation>
        {(t, { i18n }) => <p>{t('welcome')}</p>}
      </Translation>
    );
  }
}
```

## Translation params

### Loading namespaces

```jsx
// load a specific namespace; t looks in ns1
<Translation ns="ns1">
  {(t) => <p>{t('key')}</p>}
</Translation>

// load several namespaces; t looks in the first, { ns } in another
<Translation ns={['ns1', 'ns2', 'ns3']}>
  {(t) => <p>{t('key')} {t('key', { ns: 'ns2' })}</p>}
</Translation>
```

### Overriding the i18next instance

```jsx
// passing in an i18n instance
// use only if you do not like the default instance
// set by i18next.use(initReactI18next) or the I18nextProvider
import i18n from './i18n';

<Translation i18n={i18n}>
  {(t) => <p>{t('welcome')}</p>}
</Translation>
```

### Not using Suspense

```jsx
// the third argument says whether the translations are loaded
<Translation useSuspense={false}>
  {(t, { i18n }, ready) => (ready ? <p>{t('welcome')}</p> : <p>Loading</p>)}
</Translation>
```
