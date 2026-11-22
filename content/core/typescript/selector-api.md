---
description: "With the selector API, `t` takes a function that picks the key from your typed resources, with go-to-definition in your editor; string keys stay the default."
---

# Selector API

With [`enableSelector`](../overview/typescript.md#custom-type-options) set, `t` takes a function that picks the key from the typed resources (`$ => $.key`) instead of a string. Everything else stays as with string keys: the same options, the same namespaces, the same results.

## Turn it on

```typescript
// i18next.d.ts
import 'i18next';
import type Resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: true;
    resources: Resources;
  }
}
```

* `'optimize'` instead of `true`: for very large resources, with faster type checks; the keys are not changed, so give a plural key in full or use [@i18next-selector/vite-plugin](https://github.com/ahrjarrett/i18next-selector/tree/main/packages/vite-plugin).
* `'strict'`: every namespace only as `$.<ns>.key`, see [Namespaces](#namespaces).

## Keys

```typescript
i18next.t($ => $.welcome); // -> "Welcome"
i18next.t($ => $.button.save); // -> "Save"
i18next.t($ => $.steps[0]); // -> "Install"
i18next.t($ => $['my translated text']); // a key with spaces or punctuation

// fallback keys: the first one that resolves
i18next.t([$ => $.error[error], $ => $.error.unspecific]);
// -> "The page was not found." for '404', "Something went wrong." for '502'

// a missing key: the selected path acts as the fallback
i18next.t($ => $.notExistingKey); // -> "notExistingKey"
```

## Options

Every option of `t` works the same way:

```typescript
i18next.t($ => $.greeting, { name: 'Ana' }); // -> "Hello Ana"
i18next.t($ => $.item, { count: 5 }); // -> "5 items"
i18next.t($ => $.invite, { context: 'male' }); // -> "Invite him"
i18next.t($ => $.total, { val: 1000.1, lng: 'de' }); // -> "Total: 1.000,1"
i18next.t($ => $.missingKey, { defaultValue: 'default value to show' });
i18next.t($ => $.menu, { returnObjects: true });
// -> { home: "Home", blog: "Blog" }
```

## Namespaces

```typescript
i18next.t($ => $.button.save, { ns: 'common' }); // -> "Save"

// with several namespaces, a path whose first segment names another namespace
// goes there
i18next.t($ => $.common.title, { ns: ['translation', 'common'] });
// -> "Common title"
```

i18next checks only the selector's first segment against the namespaces of the call (or of react-i18next's `useTranslation(['translation', 'common'])`); with `useTranslation`, plain `t('foo')` lookups stay in the first namespace. The first namespace itself is never a prefix: `$.translation.welcome` means a key `translation.welcome` inside it.

**Strict selector mode.** With several namespaces, `$.translation.welcome` typechecks but does not resolve. `enableSelector: 'strict'` types every namespace, the first one included, only as `$.<ns>.key` (`$.welcome` is then a type error), and resolves that form for each of them; keys named like a namespace then stop resolving ([#2405](https://github.com/i18next/i18next/issues/2405)).

## Fixed `t` and key prefix

```typescript
const t = i18next.getFixedT(null, null, 'user.accountSettings.changePassword');
// same as i18next.t($ => $.user.accountSettings.changePassword.title)
t($ => $.title);
// another namespace needs the prefix overridden
t($ => $.title, { ns: 'ns', keyPrefix: '' });

// react-i18next
const { t } = useTranslation('translation', { keyPrefix: 'very.deeply.nested' });
t($ => $.key); // -> "here"
```

Do not use `keyPrefix` if you want to switch to another namespace in the selector path: with `useTranslation(['translation', 'ns'], { keyPrefix: 'very.deeply.nested' })`, `t($ => $.ns.key)` does not work.

## React

`useTranslation`, `withTranslation` and `<Translation>` hand out the same `t`, and `Trans` takes its attributes from it:

```tsx
const { t } = useTranslation(['ns1', 'ns2', 'ns3']);
t($ => $.key); // from ns1, the first namespace
t($ => $.ns2.key); // from ns2

<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong title={t($ => $.nameTitle)}>{{name}}</strong>, you
  have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

## `returnObjects` with type parameters

```typescript
type MyCustomReturn = { title: string; text: string };
const tResult = t<string, { returnObjects: true }, MyCustomReturn>(
  $ => $.myKey,
  { returnObjects: true }
);
```
