---
description: "The options under react in init() decide when components render again and how Trans treats HTML."
---

# React options

```javascript
i18n.use(initReactI18next).init({
  // ...
  react: {
    useSuspense: false, // use the ready flag of useTranslation instead
    bindI18n: 'languageChanged loaded', // also render again after a load
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'em'],
  },
});
```

* `bindI18n` (default `'languageChanged'`): the instance events, separated by spaces, after which `useTranslation`, `withTranslation`, `Translation`, `Trans` and `IcuTrans` render again; `false` for none.
* `bindI18nStore` (default `''`): the same for the events of the [resource store](/overview/api#store-events), for example `'added removed'`.
* `useSuspense` (default `true`): components suspend while their translations load; with `false`, `useTranslation` returns a `ready` flag instead.
* `nsMode` (default `'default'`): with `'fallback'`, `t` looks in every namespace the component names, in order, not only in the first.
* `keyPrefix` (no default): a prefix for the keys of every `t` from `useTranslation`, as a string or a selector function.
* `defaultTransParent` (no default): an element `Trans` wraps its content in, for example `'div'`.
* `transEmptyNodeValue` (default `''`): the default text of a `Trans` without children and without `defaults`.
* `transSupportBasicHtmlNodes` (default `true`): keeps simple HTML elements such as `<br/>` by their name in translations; see [Trans](trans-component.md#simple-html-elements).
* `transKeepBasicHtmlNodesFor` (default `['br', 'strong', 'i', 'p']`): the elements kept by their name.
* `transWrapTextNodes` (default `''`): wraps each text node of `Trans` in this element, for example `'span'`.
* `transDefaultProps` (no default): default `tOptions`, `values` and `components` for every `Trans`.
* `hashTransKey` (no default): a function that makes the key of a `Trans` without `i18nKey` from its text; without it, the text is the key.
* `unescape` (default: decodes basic HTML entities): the function `Trans` uses to decode HTML entities in its output.

The options belong to the instance they are set on; `setDefaults()` sets them for all instances.

All other options of `init()`: [Configuration options](/overview/configuration-options).
