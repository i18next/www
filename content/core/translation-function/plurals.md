---
description: "One text per plural form: i18next picks the right one for the number you pass as `count`, by the rules of each language (`Intl.PluralRules`)."
---

# Plurals

## Singular / plural

Pass the number as `count`. Without `count`, `t('key')` looks up `key` only, never `key_one` or `key_other`.

```json translation.json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

```javascript
i18next.t('item', { count: 1 }); // -> "1 item"
i18next.t('item', { count: 5 }); // -> "5 items"
i18next.t('item', { count: 100 }); // -> "100 items"
```

For `count: 0` a `_zero` form, where it exists, wins over the language's own form:

```javascript
// translation.json: { "item_zero": "No items" }
i18next.t('item', { count: 0 }); // -> "No items"
```

Where `Intl.PluralRules` is missing, only `_one` and `_other` resolve: see [Environments](../overview/environments.md) and [React Native and Expo](/react/react-native).

## Languages with multiple plurals

The sample uses Arabic, which has 5 plural forms besides the singular.

```json translation.json
{
  "key_zero": "zero",
  "key_one": "singular",
  "key_two": "two",
  "key_few": "few",
  "key_many": "many",
  "key_other": "other"
}
```

```javascript
i18next.t('key', {count: 0}); // -> "zero"
i18next.t('key', {count: 1}); // -> "singular"
i18next.t('key', {count: 2}); // -> "two"
i18next.t('key', {count: 3}); // -> "few"
i18next.t('key', {count: 4}); // -> "few"
i18next.t('key', {count: 5}); // -> "few"
i18next.t('key', {count: 11}); // -> "many"
i18next.t('key', {count: 99}); // -> "many"
i18next.t('key', {count: 100}); // -> "other"
```

## When a plural form is missing

Since v27.1.0, when the form selected for `count` is missing, i18next uses the `_other` form of the same language before it moves on to the fallback language, as CLDR does ([lateral inheritance](https://www.unicode.org/reports/tr35/#Lateral_Inheritance)). Within one language the order is `key_<form>`, then the plain `key`, then `key_other`. With a context, `key_<context>_other` comes before `key_other`; with `ordinal`, the last one is `key_ordinal_other`. A `defaultValue_other` is used the same way, after `defaultValue`.

This matters for French, Spanish, Italian and Portuguese: current CLDR data gives them a `many` form for exact millions, so files with only `_one` and `_other` miss it.

```javascript
// fr: { "file_one": "{{count}} fichier", "file_other": "{{count}} fichiers" }
i18next.t('file', { count: 1000000 });
// -> "1000000 fichiers" (before v27.1.0: "file", or the fallback language)
```

A form that is filled in from `_other` is not reported as missing at runtime (`saveMissing`, `missingKeyHandler`, `exists()`).

## Which forms a language needs <a id="how-to-find-the-correct-plural-suffix"></a>

[`i18next-cli extract`](/cli/commands/extract) writes each language's forms into its file: `_one` and `_other` for English, `_zero` to `_other` for Arabic. To look them up yourself:

```javascript
new Intl.PluralRules('ar').resolvedOptions().pluralCategories
// -> ["zero", "one", "two", "few", "many", "other"]
```

## Ordinal plurals

With `ordinal: true`, i18next picks the ordinal form (`_ordinal_one`, `_ordinal_two` …) by the language's ordinal rules; in English 1st and 21st, 2nd and 22nd, 3rd and 23rd, and 4th, 11th or 24th each take a form of their own:

```json en/translation.json
{
  "place_ordinal_one": "{{count}}st place",
  "place_ordinal_two": "{{count}}nd place",
  "place_ordinal_few": "{{count}}rd place",
  "place_ordinal_other": "{{count}}th place"
}
```

```javascript
i18next.t('place', { count: 1, ordinal: true }); // -> "1st place"
i18next.t('place', { count: 21, ordinal: true }); // -> "21st place"
i18next.t('place', { count: 2, ordinal: true }); // -> "2nd place"
i18next.t('place', { count: 3, ordinal: true }); // -> "3rd place"
i18next.t('place', { count: 11, ordinal: true }); // -> "11th place"
i18next.t('place', { count: 32, ordinal: true }); // -> "32nd place"
```

## Interval plurals

Want to define phrases expressing that the number of items lies in a range, like _a few items_ or _a lot of items_?

You will need to add a post processor: [i18next-intervalplural-postprocessor](https://github.com/i18next/i18next-intervalplural-postprocessor)

```javascript
import i18next from 'i18next';
import intervalPlural from 'i18next-intervalplural-postprocessor';

i18next
  .use(intervalPlural)
  .init(i18nextOptions);
```

```json translation.json
{
  "key1_one": "{{count}} item",
  "key1_other": "{{count}} items",
  "key1_interval": "(1)[one item];(2-7)[a few items];(7-inf)[a lot of items];",
  "key2_one": "{{count}} item",
  "key2_other": "{{count}} items",
  "key2_interval": "(1)[one item];(2-7)[a few items];"
}
```

```javascript
i18next.t('key1_interval', {postProcess: 'interval', count: 1}); // -> "one item"
i18next.t('key1_interval', {postProcess: 'interval', count: 4});
// -> "a few items"
i18next.t('key1_interval', {postProcess: 'interval', count: 100});
// -> "a lot of items"

// not matching into a range it will fallback to
// the regular plural form
i18next.t('key2_interval', {postProcess: 'interval', count: 1}); // -> "one item"
i18next.t('key2_interval', {postProcess: 'interval', count: 4});
// -> "a few items"
i18next.t('key2_interval', {postProcess: 'interval', count: 100});
// -> "100 items"
```

Several counts in one text: [nesting](nesting.md#passing-options-to-nestings).
