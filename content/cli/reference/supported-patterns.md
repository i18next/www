---
description: "The i18next calls the extractor recognises, from t('key') to Trans, keyPrefix and aliased t functions."
---

# Supported patterns

The extractor recognises these i18next calls:

## Function calls

```javascript
// Basic usage
t('key')
t('key', 'Default value')
t('key', { defaultValue: 'Default' })

// With namespaces
t('ns:key')
t('key', { ns: 'namespace' })

// With interpolation
t('key', { name: 'John' })

// With plurals and context
t('key', { count: 1 }); // Cardinal plural
t('keyWithContext', { context: 'male' });
t('keyWithDynContext', { context: isMale ? 'male' : 'female' });

// With ordinal plurals
t('place', { count: 1, ordinal: true });
t('place', {
  count: 2,
  ordinal: true,
  defaultValue_ordinal_one: '{{count}}st place',
  defaultValue_ordinal_two: '{{count}}nd place',
  defaultValue_ordinal_other: '{{count}}th place'
});

// With key fallbacks
t(['key.primary', 'key.fallback']);
t(['key.primary', 'key.fallback'], { defaultValue: 'The fallback value' });

// With structured content (returnObjects)
t('countries', { returnObjects: true });
```

The extractor correctly handles **cardinal and ordinal plurals** (`count`), as well as context options, generating all necessary suffixed keys (e.g., `key_one`, `key_ordinal_one`, `keyWithContext_male`). It can even statically analyze ternary expressions in the `context` option to extract all possible variations.

## React components

```jsx
// Trans component
<Trans i18nKey="welcome">Welcome {{name}}</Trans>
<Trans ns="common">user.greeting</Trans>
<Trans count={count}>You have {{count}} messages</Trans>
<Trans context={isMale ? 'male' : 'female'}>A friend</Trans>

// useTranslation hook
const { t } = useTranslation('namespace');
const { t } = useTranslation(['ns1', 'ns2']);
```

## Complex patterns

```javascript
// Aliased functions
const translate = t;
translate('key');

// Destructured hooks
const { t: translate } = useTranslation();

// getFixedT
const fixedT = getFixedT('en', 'namespace');
fixedT('key');
```

## Selector API

The extractor handles the type-safe Selector API and routes namespaces the way
i18next does at run time. With a single-namespace hook,
selector paths are extracted into the bound namespace as-is:

```ts
const { t } = useTranslation('common');

t($ => $.button.save);                  // → common.json: button.save
t($ => $.button.save, { ns: 'auth' });  // → auth.json:   button.save
```

When the hook is called with a multi-namespace array, a leading path segment
that matches a **secondary** namespace is treated as a namespace prefix and
the rest of the path is routed to that namespace's file. The primary
namespace (the array's first entry) is **never** rewritten: its keys are
exposed flat on the selector proxy:

```ts
const { t } = useTranslation(['auth', 'validation']);

// → auth.json:       login.Welcome Back!
t($ => $.login['Welcome Back!']);
// → validation.json: email.Required
t($ => $.validation.email['Required']);
// → validation.json: email.Required
t($ => $.email['Required'], { ns: 'validation'});
```

As in i18next (`src/selector.js`), paths whose
first segment is the primary namespace, or doesn't appear in the hook's
namespace list at all, are joined with the configured `keySeparator` and
routed to the primary. Secondary-prefixed paths are joined as
`<ns><nsSeparator><rest>` so the standard `ns:key` routing places them in
the correct file.

### Strict mode

Set `types.enableSelector: 'strict'` (requires `i18next` ≥ 26.1.0 with
the matching runtime option) to drop the flattened-primary form entirely.
Every selector path must lead with an explicit namespace segment, and the
extractor rewrites leading segments uniformly: primary, secondary,
single- or multi-ns hooks all behave the same:

```ts
// useTranslation('common');
t($ => $.common.button.save);           // → common.json: button.save

// useTranslation(['auth', 'validation']);
t($ => $.auth.login['Welcome Back!']);  // → auth.json: login.Welcome Back!
t($ => $.validation.email['Required']); // → validation.json: email.Required
```

Strict mode is opt-in and does not work with a key inside a namespace whose
name matches a sibling namespace.
If you have keys like `Resources['config'].common.name` while `common` is
also a sibling namespace, leave strict mode off: the rewrite would route
that key into the wrong file.
