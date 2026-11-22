---
description: "Every option `init()` and `createInstance()` take, grouped by what it controls, with its default."
---

# Configuration options

`i18next.init(options, callback)`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](api.md#older-ways)).

The same options go to [`createInstance()`](api.md#createinstance).

## Languages <a id="languages-namespaces-resources"></a>

* `lng` (default none): the language to use; it overrides the language detector. `'cimode'` returns the key instead of the text. Use codes like `en-US` ([FAQ](../how-to/faq.md#how-should-the-language-codes-be-formatted)).
* `fallbackLng` (default `false`): the language to use when a text is missing, usually the one your app is written in; `false` loads no fallback language ([Fallback](../principles/fallback.md#language-fallback)).
* `supportedLngs` (default `false`): the languages allowed; others are not loaded.
* `nonExplicitSupportedLngs` (default `false`): counts a variant as supported when its language is (`en-US` when `en` is in `supportedLngs`); with a backend such as i18next-http-backend it can cause [request errors](https://github.com/i18next/i18next/issues/1687).
* `load` (default `'all'`): which codes to look up for `en-US` with `fallbackLng: 'dev'`: `'all'` gives `en-US`, `en`, `dev`; `'currentOnly'` gives `en-US`; `'languageOnly'` gives `en`.
* `preload` (default `false`): languages to load on init, for example on a server before it renders.
* `lowerCaseLng` (default `false`): lowercases the whole code (`en-US` becomes `en-us`).
* `cleanCode` (default none, deprecated): codes without a region get their canonical casing (`EN` becomes `en`); `false` keeps them as they are.
* `appendNamespaceToCIMode` (default `false`): with `lng: 'cimode'`, puts the namespace in front of the returned key.
* `detection` (default none): the options of the language detector ([plugins and utils](plugins-and-utils.md#language-detector)).

## Namespaces

* `ns` (default `'translation'`): the namespace, or namespaces, to load; `[]` loads none on init ([Namespaces](../principles/namespaces.md)).
* `defaultNS` (default `'translation'`): the namespace `t()` uses when none is given; with `ns` set and no `defaultNS`, the first of `ns`. `false` or `[]` turns the default namespace off.
* `fallbackNS` (default `false`): namespaces to look in when a key is missing in the current one ([Fallback](../principles/fallback.md#namespace-fallback)).

## Loading translations <a id="initasync"></a><a id="plugin-options"></a>

* `resources` (default none): the translations to start with, when no backend loads them ([Add or load translations](../how-to/add-or-load-translations.md)).
* `partialBundledLanguages` (default `false`): some translations in `resources`, the rest through the backend.
* `backend` (default none): the options of the backend ([plugins and utils](plugins-and-utils.md#backends)).
* `cache` (default none): the options of a cache layer in a backend ([Cache and fallback](../how-to/cache-and-fallback.md)).
* `initAsync` (default `true`): loads in `init()` after a `setTimeout`. `false` loads at once, which only works with a backend that loads synchronously, such as [i18next-fs-backend](https://github.com/i18next/i18next-fs-backend); then `t()` works right after `init()`:

```javascript
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next.use(Backend).init({ initAsync: false });
i18next.t('key'); // -> the value
```

* `maxParallelReads` (default `10`): at most this many backend reads at a time, so loading many files does not open thousands of sockets or file descriptors (`EMFILE`); usually faster, too.
* `maxRetries` (default `5`) and `retryTimeout` (default `350` ms, doubled on each retry): how often and after how long a failed read is tried again.

## Keys <a id="others"></a>

* `keySeparator` (default `'.'`): the character between the levels of a nested key; `false` for flat keys.
* `nsSeparator` (default `':'`): the character between namespace and key; `false` turns namespace prefixes off.
* `pluralSeparator` (default `'_'`): the character before the plural suffix.
* `contextSeparator` (default `'_'`): the character before the context suffix.
* `ignoreJSONStructure` (default `true`): looks a key that is not found as a nested key up as a flat key.
* `enableSelector` (default `false`): `t()` takes a selector function; `'optimize'` for very large resources, `'strict'` for a namespace in every path ([Selector API](../typescript/selector-api.md), [Typed keys](typescript.md#custom-type-options)).

## Translation defaults

What `t()` does for every call unless the call says otherwise ([t options](api.md#t-options)).

* `postProcess` (default `false`): the post processors to apply ([Plugins](../principles/plugins.md#post-processor)).
* `postProcessPassResolved` (default `false`): passes the resolved details to the post processors as `options.i18nResolved`.
* `returnNull` (default `false`): a `null` value counts as a translation.
* `returnEmptyString` (default `false`): an empty string counts as a translation; with `false` it falls back like a missing value, while an explicit `''` default value from code still counts.
* `returnObjects` (default `false`): returns objects and arrays ([Objects and arrays](../translation-function/objects-and-arrays.md)).
* `returnDetails` (default `false`): returns the language, namespace, key and value used, instead of the text.
* `returnedObjectHandler` (default none): `function(key, value, options)`, called when a key holds an object but `returnObjects` is off.
* `joinArrays` (default `false`): joins an array into one text with this separator, for example `', '`.
* `overloadTranslationOptionHandler` (default: a second string argument becomes `defaultValue`): turns the extra arguments of `t()` into options.
* `interpolation`: the interpolation options ([All interpolation options](../translation-function/interpolation.md#all-interpolation-options)).

## Formats

* `cacheInBuiltFormats` (default `true`): caches the built-in formatters ([Formatting](../translation-function/formatting.md#built-in-formats)); `false` if you run into [this issue](https://github.com/i18next/i18next/issues/2227).
* `i18nFormat` (default none): the options of an i18n format plugin such as i18next-icu ([Using ICU or MF2](../how-to/using-icu-or-mf2.md)).

## Missing keys

What happens when a key or a value is missing. New keys get into your files with [`i18next-cli extract`](/cli/commands/extract); saving them at run time is under [Older ways](#saving-missing-keys).

* `parseMissingKeyHandler` (default none): `function(key, defaultValue, options)`, returns what to show for a missing key.
* `appendNamespaceToMissingKey` (default `false`): puts the namespace in front of a missing key.
* `missingInterpolationHandler` (default none): `function(text, value)`, called when a value for a placeholder is `undefined` (not for an empty string or `null`); returns the text to use.

## Logging

* `debug` (default `false`): logs to the console, for example why loading did not work.

## React

* `react`: the options of react-i18next ([React options](/react/latest/i18next-instance)).

## Older ways

### Saving missing keys

[`i18next-cli extract`](/cli/commands/extract) writes new keys from your code into the translation files before the app runs. With `saveMissing: true`, i18next instead sends the keys it does not find to the backend's [`create`](../principles/plugins.md#backend) function while the app runs.

* `saveMissing` (default `false`): sends missing keys to the backend (only backends with `create`, such as i18next-fs-backend and i18next-http-backend).
* `updateMissing` (default `false`): also sends a key whose `defaultValue` differs from its translation; useful only while the code is the source of the texts.
* `saveMissingTo` (default `'fallback'`): the language to save to: the fallback language, `'current'` (the language in use) or `'all'` (every language in `i18next.languages`).
* `saveMissingPlurals` (default `true`): saves every plural form, not only the singular, when `t()` was called with `count`.
* `missingKeyHandler` (default `false`): `function(lngs, ns, key, fallbackValue, updateMissing, options)`, your own handling of a missing key; needs `saveMissing: true`. Its arguments:
  * `lngs`: the languages to save to, by `saveMissingTo`.
  * `ns`: the namespace.
  * `key`: the key, with its plural suffix when `saveMissingPlurals` saves each form.
  * `fallbackValue`: the default value from the code (per plural form `defaultValue_<form>`), otherwise the key; `undefined` with `missingKeyNoValueFallbackToKey`.
  * `updateMissing`: `true` when the key exists but its `defaultValue` differs and `updateMissing` is on.
  * `options`: the options of the `t()` call.
* `missingKeyNoValueFallbackToKey` (default `false`): does not use the key as the value of a saved missing key (with i18next-http-backend the key gets an empty value).

Disable `saveMissing` in production.
