---
description: "IcuTrans is Trans for ICU messages: markup and links stay inside one translatable ICU sentence."
---

# IcuTrans component

## When you need it <a id="important-note"></a>

Only when your i18next instance uses [i18next-icu](https://github.com/i18next/i18next-icu) and markup or components (`strong`, `em`, a link) sit inside a sentence; for everything else, use `t()`. `Trans` can't take ICU syntax such as `{count, plural, ...}`, because `{curly brackets}` in JSX children are JavaScript. `IcuTrans` takes the message as a string (`defaultTranslation`) and a list of component declarations (`content`) that replace the numbered tags `<0>`, `<1>`, ... in it.

`IcuTrans` does not load translations; the [`useTranslation`](usetranslation-hook.md) hook does. It renders again when the language changes, like `useTranslation`.

```jsx
import { IcuTrans, useTranslation } from 'react-i18next';

function MyComponent() {
  // this loads the namespace (and suspends until it is loaded)
  const { t } = useTranslation('myNamespace');

  return (
    <IcuTrans
      i18nKey="helloWorld"
      defaultTranslation="Hello World"
      content={[]}
      t={t}
    />
  );
}
```

The message syntax (arguments, `plural`, `select`, `selectordinal`, number and date formats) is in the [i18next-icu](https://github.com/i18next/i18next-icu) README and the [ICU message format reference](https://formatjs.github.io/docs/core-concepts/icu-syntax).

## Samples

### Using with React components

This component enables you to nest any React content to be translated as one cohesive string. Plurals, selects and formatting go into the ICU message itself. `IcuTrans` uses the most relevant `t()` function (from the [context instance](i18nextprovider.md) or the global instance), unless overridden via the `i18n` or `t` props.

Before:

```jsx
function MyComponent({ person, messages }) {
  const { name } = person;
  const count = messages.length;

  return (
    <>
      Hello <strong title="This is your name">{name}</strong>, you
      have {count} unread messages. <Link to="/msgs">Go to messages</Link>.
    </>
  );
}
```

After:

```jsx
import { IcuTrans, useTranslation } from 'react-i18next';

function MyComponent({ person, messages }) {
  const { t } = useTranslation();
  const { name } = person;
  const count = messages.length;

  return (
    <IcuTrans
      i18nKey="userMessagesUnread"
      defaultTranslation="Hello <0>{name}</0>, you have {count, plural, one {# unread message} other {# unread messages}}. <1>Go to messages</1>."
      values={{ name, count }}
      content={[
        { type: 'strong', props: { title: t('nameTitle') } },
        { type: Link, props: { to: '/msgs' } },
      ]}
      t={t}
    />
  );
}
```

```json translation.json
{
  "nameTitle": "This is your name",
  "userMessagesUnread": "Hello <0>{name}</0>, you have {count, plural, one {# unread message} other {# unread messages}}. <1>Go to messages</1>."
}
```

Result with `name = 'Arthur'` and `count = 42`:

```html
Hello <strong title="This is your name">Arthur</strong>, you
have 42 unread messages. <a href="/msgs">Go to messages</a>.
```

The index of a declaration in `content` is the number of its tag: `content[0]` replaces `<0>...</0>`, `content[1]` replaces `<1>...</1>`. The text between the tags becomes the children of that element. There is one key per message: the plural forms live inside the ICU message, not in `_one`/`_other` suffixed keys.

### Nested elements

Declarations can have their own children declarations. Tags inside a tag are numbered again from `0` and refer to `props.children` of the outer declaration:

```jsx
<IcuTrans
  i18nKey="features"
  defaultTranslation="Features: <0><0>Fast</0><1>Reliable</1></0>"
  content={[
    {
      type: 'ul',
      props: {
        children: [{ type: 'li' }, { type: 'li' }],
      },
    },
  ]}
/>

// result
Features: <ul><li>Fast</li><li>Reliable</li></ul>
```

HTML entities in the translation (`&amp;`, `&lt;`, `&nbsp;`, `&copy;`, numeric entities, ...) are decoded to their characters. `IcuTrans` renders a fragment, without a wrapping element.

### Usage in React Server Components

`import { IcuTrans } from 'react-i18next'` works in a Server Component: the package's `react-server` export condition gives Server Components the variant without React context (`IcuTransWithoutContext`). Pass `i18n` explicitly when you have an instance per request:

```jsx
// app/[lng]/page.jsx (Server Component), here with next-i18next's getT from your server module
import { getT } from '@/i18n.server';
import { IcuTrans } from 'react-i18next';

export default async function Page() {
  const { t, i18n } = await getT('common');

  return (
    <IcuTrans
      t={t}
      i18n={i18n}
      i18nKey="welcome"
      defaultTranslation="Welcome, <0>{name}</0>!"
      content={[{ type: 'strong' }]}
      values={{ name: 'Arthur' }}
    />
  );
}
```

Without `i18n` it uses the global instance set by `initReactI18next`, which is the wrong one with an instance per request: pass that instance as `i18n` (`t` is optional; a `t` from `getFixedT` carries no instance). In development and with `debug: true` it warns when `i18n` is missing.

### TypeScript

With `parseInterpolation: 'icu'` in your `CustomTypeOptions`, `values` is typed from the message of `i18nKey`, the same way the options of `t` are. A misspelled or missing argument, or a value of the wrong type, is a type error:

```tsx
// resources: { welcome: 'Welcome, <0>{name}</0>! You have {count, plural, one {# message} other {# messages}}.' }
<IcuTrans
  i18nKey="welcome"
  defaultTranslation="Welcome, <0>{name}</0>!"
  content={[{ type: 'strong' }]}
  values={{ nmae: 'Arthur', count: 2 }}
  // error: 'nmae' does not exist in type
  // '{ name: string | number; count: number; }'
/>
```

`values` itself stays optional, as on `Trans`. See [ICU in React](../misc/using-with-icu-format.md) for the setup.

## IcuTrans props

`defaultTranslation` and `content` are required properties; all others are optional. `IcuTrans` and `IcuTransWithoutContext` take the same props.

* `i18nKey` (string, no default): the key to look up. Without it, `defaultTranslation` is the key (natural language keys). It can carry the namespace as `'ns:key'` (with `nsSeparator`), but the `ns` prop is clearer. The TypeScript types currently require this prop.
* `defaultTranslation` (string, required): the message in ICU format with numbered tags (`<0>...</0>`). Used when the key has no translation yet, and as the key when `i18nKey` is left out.
* `content` (array, required): one declaration per numbered tag, `{ type, props }`: `type` is a DOM element name (`'strong'`, `'a'`) or a component (`Link`), the optional `props` are passed to it, for example `{ type: 'a', props: { href: '/somewhere' } }`. Declarations for tags inside a tag go into `props.children`, see [Nested elements](#nested-elements).
* `values` (object, default `{}`): the values for the arguments of the ICU message, including the number for `plural` and `selectordinal`, for example `values={{ name, count }}`. They override the same names in `interpolation.defaultVariables`. With `parseInterpolation: 'icu'`, the TypeScript type comes from the message, see [TypeScript](#typescript).
* `ns` (string or array of strings, no default): the namespace. Without it: the namespace of `t`, then the `defaultNS` of the [provider](i18nextprovider.md), then `i18next.options.defaultNS`.
* `t` (function, no default): the `t` function to use instead of `i18n.t()`, for example the one from [`useTranslation`](usetranslation-hook.md).
* `i18n` (object, no default): the i18next instance. Without it: the instance of the nearest [provider](i18nextprovider.md) (`IcuTrans` only), then the global instance set by `initReactI18next`.

Unlike `Trans`, there are no `count`, `context`, `tOptions`, `parent`, `shouldUnescape` or `components` props, and children are ignored. Put plurals and selects into the ICU message and pass their values in `values`. The `react` options for `Trans` in `i18next.init` (`transWrapTextNodes`, `transKeepBasicHtmlNodesFor`, `defaultTransParent`, ...) do not apply to `IcuTrans`.
