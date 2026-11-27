---
description: "Find texts in your code that are not wrapped in t(), and placeholders that do not match the translation."
---

# lint

Analyzes your source code for internationalization issues. Can run without a config file.

```bash
npx i18next-cli lint
```

**What it checks:**

- **Hardcoded strings** *(error)*: user-facing text in JSX elements and attributes that isn't wrapped in `t()`/`<Trans>`.
- **Interpolation parameters** *(error)*: mismatches between `{{placeholders}}` in a translation and the params passed to `t()` (missing or unused), also for selector calls like `t($ => $.user.greeting, { name })`. The placeholders come from the primary language's translation of the key in the namespace of the call (`useTranslation('home')`, `t('home:greeting')`, `{ ns: 'home' }`, a `keyPrefix`), every plural form included; a key without a translation is checked as written. The params are read like i18next reads them: with a `replace: { … }` object its keys are the variables (keys next to it are reported as unused), and when a spread, a computed key or a non-literal `replace` may hold any variable, a missing one is not reported for that call. Toggle with `lint.checkInterpolationParams` (default: `true`). Variables your `interpolation.defaultVariables` fills in at runtime go into `lint.defaultVariables` (e.g. `['appName']`) and are not reported as missing; a dotted placeholder like `{{user.name}}` counts when its root `user` is listed. With `extract.messageFormat: 'icu'` or `'mf2'` the arguments come from the ICU or MF2 parser (`{name}`, `{$name}`), so plurals like `one {{count} row}` are not read as `{{…}}` interpolation.
- **ICU / MF2 messages** *(error, only with `extract.messageFormat: 'icu'` or `'mf2'`)*: every value in the translation files of all locales is parsed. The linter reports, with file, key and line (JSON files):
  - syntax errors with the parser's message, e.g. `greeting: ICU syntax error: EXPECT_ARGUMENT_CLOSING_BRACE at column 7`
  - argument names that differ from the primary language (a renamed or missing `{name}`). `#` in a plural is not an argument
  - plural categories of `plural` and `selectordinal` (MF2: `.match` on `:number` or `:integer`) that do not fit the locale. Allowed are the locale's CLDR categories, required are `other` plus every category a whole number below one million selects. So `ru` needs `one`, `few` and `many`, while `fr`, `es`, `it` and `pt` may leave out `many` (only from 1,000,000) and `cs` its `many` (fractions only), and `zero` in English is reported as unused. Exact selectors like `=0` are always allowed, and they count for a category that selects only a few small numbers when they cover them all: `=1` covers `one` in English, but not in Russian, where `one` is also 21, 31 and so on. For a locale `Intl` does not know only `other` is required. A language code with `_` (`ru_RU`, `pt_BR`) is read as `ru-RU`, `pt-BR`.
  - *(warning, MF2 only)* whitespace at the start or end of a pattern that differs from the primary language: `{{ {$count} files}}` shows the space in the app.

  Empty values count as untranslated and are skipped. See [ICU and MF2 messages](../guides/icu-and-mf2.md).
- **Placeholders across locales** *(warning by default, i18next format)*: every translation file is compared with the primary language, so a translation that renamed or dropped a placeholder is reported with file, key and line (JSON files), e.g. `greeting: missing {{name}}, unexpected {{nom}} (compared with "en")`. Compared are:
  - interpolations by name, read like i18next does: `{{name}}`, `{{ name }}`, `{{- name}}` and `{{name, uppercase}}` are all `name`, so a format may differ per language. A custom `interpolationPrefix` / `interpolationSuffix` is read
  - nested `$t(key)` references
  - tags, in any order: the numbered ones of `<Trans>` (`<0>…</0>`, `<1/>`) and named ones like `<bold>` from its `components`, which react-i18next shows as text when a translation renames them. The basic HTML react-i18next keeps as is (`extract.transKeepBasicHtmlNodesFor`, default `br`, `strong`, `i`, `p`) is not compared: a language may add or drop it

  Plural forms are compared as a group (the union over `_zero`, `_one`, `_other`, ...), since `{{count}}` may be left out of `_one` or `_zero` and a language has forms the primary language lacks (`ru` `_few`). A partly translated plural is checked for unexpected placeholders only. Keys only one side has and empty values are skipped (`status` reports them). Configure with `lint.checkTranslationPlaceholders`: `'warn'` / `true` (default), `'error'` (fails the run), `'off'` / `false`. With `extract.messageFormat: 'icu'` or `'mf2'` the ICU / MF2 check above runs instead.
- **`<Trans>` tags against the children** *(warning by default)*: `<Trans>` numbers its children, text included, so the `{' '}` a formatter inserts at a line break shifts every later index. In `Hello{' '}<Bold>world</Bold>` the `{' '}` is `<1>` and `<Bold>` is `<2>`, and a translation `Hello <1>world</1>` renders `Hello  `. The tags of the primary language's translation of every `<Trans>` with children (context and plural forms included) are resolved like react-i18next does at runtime, and a tag that does not render what it wraps is reported, e.g. `reminder:disclosure: <1> points to the text " ", which replaces its content`:
  - a tag with content on a text child, which renders that text instead
  - a tag past the last child, which loses its markup
  - an empty tag (`<2/>`) on an element with text, which renders the element without its text
  - a tag with content on a `<br/>` (or another void element), which makes React throw

  A tag on an interpolation object (`<1>{{count}}</1>`) is fine: react-i18next renders its content. A tag on an expression (`{link}`) is not checked: its value is known only at runtime. A `<Trans>` with `components` is skipped. Only the primary language is checked; in the i18next format the placeholder check above compares the tags of the other languages with it. Configure with `lint.checkTransIndices`: `'warn'` / `true` (default), `'error'` (fails the run), `'off'` / `false`.
- **String concatenation** *(warning by default)*: translated strings glued together with `+`, or a sentence split across multiple adjacent translations (`<Trans>` components and/or `{t()}` expressions rendered as siblings). This breaks in languages that reorder or inflect the pieces; use a single key with placeholders instead. Configure with `lint.checkConcatenation`: `'warn'` / `true` (default) reports it without failing the run, `'error'` makes it fail (exit non-zero, useful for CI), and `'off'` / `false` disables it.

  ```jsx
  // ⚠️ Flagged: word order can't be translated
  t('greeting') + ', ' + name
  <p><Trans>Hello</Trans> and <Trans>World</Trans></p>
  <p><Trans>new</Trans>{t('cat')}</p>

  // ✅ Preferred: one key, placeholders
  t('greeting', { name }) // "Hello, {{name}}"
  <Trans i18nKey="greeting">Hello {{name}}</Trans>
  ```

- **Punctuation concatenation** *(off by default)*: punctuation glued onto a translation, e.g. `<label><Trans>Email</Trans>:</label>` or `<div>- <Trans>item</Trans></div>`. Punctuation spacing and form differ across languages (French needs a narrow no-break space before `:`, CJK uses fullwidth `：`, RTL reorders), so it belongs inside the translation or in semantic markup (a real `<ul>/<li>` for bullets). This is **opt-in**, since keeping punctuation out of a translation is often deliberate. Enable with `lint.checkPunctuationConcatenation`: `'warn'`, `'error'`, or `'off'` / `false` (default).

  ```jsx
  // ⚠️ Flagged when enabled
  <label><Trans>Email</Trans>:</label>
  <div>- <Trans>item</Trans></div>

  // ✅ Preferred
  <label><Trans i18nKey="emailLabel">Email:</Trans></label>
  <ul><li><Trans>item</Trans></li></ul>
  ```

  The linter exits non-zero only when it finds **errors**; a run with only warnings succeeds. Individual spots can be excused with the [`i18next-instrument-ignore` directive](instrument.md#suppressing-detection-with-i18next-instrument-ignore).

**Baseline: fail only on new issues.** To adopt `lint` in CI on a codebase that already has issues, record them once and commit the file:

```bash
npx i18next-cli lint --update-baseline
```

This writes `i18next-lint-baseline.json` (another path: `lint.baseline`) with the issues per file. While the file exists, `lint` reports and fails only on issues it does not hold, and prints how many existing ones it left out. An issue is identified by its file, type and text, not its line, so moving code keeps it in the baseline, while one more identical hardcoded string in the same file is new. When issues get fixed, `lint` says how many entries no longer occur; run `--update-baseline` again to drop them. This is the same approach as ESLint's bulk suppressions.

To suppress warnings for code you intentionally aren't translating yet, use the [`i18next-instrument-ignore` directive](instrument.md#suppressing-detection-with-i18next-instrument-ignore): the same comment recognized by the `instrument` command.
