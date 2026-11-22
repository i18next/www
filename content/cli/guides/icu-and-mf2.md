---
description: "Extract, lint and type messages written in MessageFormat (ICU) or MessageFormat 2."
---

# ICU and MF2 messages

If your translations are written in ICU MessageFormat ([i18next-icu](https://github.com/i18next/i18next-icu)) or Unicode MessageFormat 2 ([i18next-mf2](https://github.com/i18next/i18next-mf2)), tell the CLI:

```typescript
export default defineConfig({
  locales: ['en', 'de', 'ru'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
    messageFormat: 'icu', // or 'mf2'
  },
})
```

What it changes:

- `extract` writes one key per message. `t('photos', '{count, plural, one {# photo} other {# photos}}', { count })` gives `photos`, not `photos_one` and `photos_other`, and `context` adds no `_male` keys, because ICU and MF2 keep plurals and selects inside the message and the plugins never read suffix keys. `$t()` in a value is text, not nesting. Plural suffix keys left over from an earlier extraction are removed like other unused keys.
- `extract` writes the children of `<Trans>` with `{name}` (ICU) or `{$name}` (MF2) in the value; the key of a `<Trans>` without `i18nKey` stays what react-i18next builds at runtime (`Hello {{name}}`).
- `extract` reads [`IcuTrans`](/react/latest/icu-trans-component) and `IcuTransWithoutContext` (also when imported under another name): the key is `i18nKey`, or `defaultTranslation` when there is none, and `defaultTranslation` is the value. The components of `react-i18next/icu.macro` (`Trans`, `Plural`, `Select`, `SelectOrdinal`) are extracted with the message the macro builds, for example `<Trans i18nKey="welcome">Welcome, <strong>{name}</strong>!</Trans>` gives `Welcome, <0>{name}</0>!`. These two are recognized in every format, without adding them to `transComponents`.
- `status` counts a plural or select message as one key.
- `instrument` writes `{name}` / `{$name}` placeholders and escapes the text around them (`File '{{name}}'` becomes `File ''{name}'`, since an apostrophe before `{` starts quoted text in ICU), a ternary like `count === 1 ? 'task' : 'tasks'` becomes one plural message (`{count, plural, one {…} other {…}}`, MF2 `.match $count`) instead of `defaultValue_one` / `defaultValue_other`, and the i18n init file it creates registers `i18next-icu` or `i18next-mf2`.
- `lint` parses every translation value and reports syntax errors, arguments that differ from the primary language and plural categories that do not fit a locale (see [`lint`](../commands/lint.md)). The `t()` interpolation check reads the arguments with the same parser.
- `types` sets `parseInterpolation: 'icu'` or `'mf2'` in a newly generated `i18next.d.ts`, so `t()` options are type-checked against each message's arguments (i18next 26.5.0 or later; with older versions it sets `parseInterpolation: false`).

What keeps and what stops working at runtime with these formats (plural and context suffix keys, `$t()` nesting, i18next formatters, `escapeValue`) is described in [Using ICU or MF2](/how-to/using-icu-or-mf2).
