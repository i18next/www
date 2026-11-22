---
description: "See how complete each language is; a missing translation makes it exit non-zero, so CI can stop the build."
---

# status [locale]

Displays a health check of your project's translation status. Can run without a config file. Exits with a non-zero status code when translations are missing.

The primary language is checked too: any key used in your code but absent from the primary language's translation files (a typo, or `extract` was never run) is reported and causes a non-zero exit code. Empty-string placeholders written by `extract` are considered present and do not fail the check. Running `npx i18next-cli status <primaryLanguage>` shows the absent keys in detail.

## Options

- `--namespace <ns>, -n <ns>`: Filter the report by a specific namespace.
- `--hide-translated`: Hide already translated keys in the detailed view, showing only missing translations.
- `status.ignoreKeys` (config): glob patterns for keys that should not be reported (and don't fail the check), e.g. keys that are intentionally left empty in some locales. Optional `ns:` prefix (`common:help.*-href`). Only affects `status`.
- `status.checkIdentical` (config, default `'warn'`): values identical to the primary language, e.g. English copied into `de` by a `defaultValue` function or a copied file, are marked `≈ (identical to en)` and counted in the summary (`3 identical to en`). With `'warn'` they still count as translated and the exit code does not change; `'error'` counts them as untranslated, so `status` fails; `'off'` / `false` disables the check. Skipped: locales of the primary's language (`en-GB` with `en`), values without letters once placeholders, `$t()` and tags are removed (`{{count}}`, `100 %`), URLs, e-mail addresses and short all-caps words (`OK`, `FAQ`). Brand names and other values that stay the same go into `status.ignoreKeys`. A plural form the primary language lacks (`ru` `_few`) is compared with its `_other`.
- `--unused`: Report only unused translation keys: keys present in your translation files that are no longer used in your source code (i.e. what `extract` with `removeUnusedKeys` would delete). Never modifies any files and exits with a non-zero status code when unused keys are found, so it can serve as a dedicated CI check alongside the regular missing-translations check. Static analysis cannot see a key that is only built at run time (``t(`error.${code}`)`` with a `code` of type `string`), so such a key is reported as unused while the app still uses it. List these keys in `extract.preservePatterns` (`'error.*'`) or name them in a comment (``// t(`error.${code}`)``): `--unused` then leaves them out, as `extract` keeps them (see [Dynamic keys](../guides/dynamic-keys.md)). Locize, the service of the i18next maintainers, sees which keys an app uses while it runs: its `locize-lastused` plugin records when each key of the source language was last used, from `localhost` by default and meant for development and staging ([Find unused translations](https://www.locize.com/docs/guides/find-unused-translations)).

## Examples

```bash
# Get a high-level summary for all locales and namespaces
npx i18next-cli status

# Get a detailed, key-by-key report for the 'de' locale
npx i18next-cli status de

# Get a summary for only the 'common' namespace across all locales
npx i18next-cli status --namespace common

# Get a detailed report for the 'de' locale, showing only the 'common' namespace
npx i18next-cli status de --namespace common

# Show only the untranslated keys for the 'de' locale
npx i18next-cli status de --hide-translated

# Combine options to see only missing translations in a specific namespace
npx i18next-cli status de --namespace common --hide-translated

# Report only unused keys across all locales
# (read-only, exits 1 when any are found)
npx i18next-cli status --unused

# Report only unused keys in the 'en' files, e.g. as a separate CI check
npx i18next-cli status en --unused
```

The detailed view provides a rich, at-a-glance summary for each namespace, followed by a list of every key and its translation status.

**Example output (`npx i18next-cli status de`):**

```bash
Key Status for "de":

Overall: [■■■■■■■■■■■■■■■■■■■■] 100% (12/12)

Namespace: common
Namespace Progress: [■■■■■■■■■■■■■■■■■■■■] 100% (4/4)
  ✓ button.save
  ✓ button.cancel
  ✓ greeting
  ✓ farewell

Namespace: translation
Namespace Progress: [■■■■■■■■■■■■■■■■□□□□] 80% (8/10)
  ✓ app.title
  ✓ app.welcome
  ✗ app.description
  ...
```
