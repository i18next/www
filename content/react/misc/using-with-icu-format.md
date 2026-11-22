---
description: "With i18next-icu your texts use ICU MessageFormat; t() works as before, and IcuTrans handles markup."
---

# ICU in React

## Setup <a id="extend-the-i18n-instance-with-icu-module"></a>

On top of [Getting started](../getting-started.md), install [i18next-icu](https://github.com/i18next/i18next-icu) and its peer dependency:

```bash
npm install i18next-icu intl-messageformat
```

Then add it to your i18next instance:

```javascript
import ICU from 'i18next-icu';

i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    // ...
  });
```

With i18next-icu, i18next's own plural and context suffix keys (`key_one`, `key_male`), `{{name}}` interpolation and `$t()` nesting stop working. [Using ICU or MF2](/how-to/using-icu-or-mf2) in the i18next docs lists what keeps working and what does not. For typed ICU values in TypeScript, see [Using ICU or MF2](/how-to/using-icu-or-mf2#typescript).

## Use the ICU format

### Using t function

```json translation.json
{
  "icu": "{numPersons, plural, =0 {no persons} =1 {one person} other {# persons}}"
}
```

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <div>{t('icu', { numPersons: 500 })}</div>;
}

// result:
<div>500 persons</div>
```

## Markup with IcuTrans <a id="using-the-trans-component"></a><a id="using-babel-macros-trans-plural-select-removed-in-v18"></a>

ICU syntax can't go into JSX children, because `{curly brackets}` there are JavaScript. Use the [IcuTrans component](../latest/icu-trans-component.md) instead of `Trans`, which may also not work with the [React Compiler](https://react.dev/learn/react-compiler). It takes the ICU message as a string and a list of components that replace the numbered tags:

```jsx
import { IcuTrans } from 'react-i18next';

const user = 'John Doe';

<IcuTrans
  i18nKey="icu_and_trans"
  defaultTranslation="We invited <0>{user}</0>."
  content={[{ type: 'strong' }]}
  values={{ user }}
/>

// result:
We invited <strong>John Doe</strong>.
```

```json translation.json
{
  "icu_and_trans": "We invited <0>{user}</0>."
}
```

See the [IcuTrans component](../latest/icu-trans-component.md) page for plurals inside such a message, nested elements, usage in React Server Components and the props reference.

A working example: [react-icu](https://github.com/i18next/react-i18next/tree/master/example/react-icu).
