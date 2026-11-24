---
description: "The options of i18next.config.ts: where the keys are read, where the files go and how each command behaves."
---

# Configuration

The configuration is `i18next.config.ts` or `i18next.config.js`. The `defineConfig` helper adds types and editor completion and nothing else.

## Basic configuration

```typescript
// i18next.config.ts
import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de', 'fr'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
});
```

Without `defineConfig`, a plain object works the same, for example when i18next-cli is not installed in the project:

```javascript
// i18next.config.js
export default {
  locales: ['en', 'de', 'fr'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
};
```

Only JavaScript and TypeScript files (`.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`) are extracted. Other file types (`.vue`, `.astro`, `.pug`) need a [plugin](guides/plugins.md).

## Options <a id="advanced-configuration"></a>

Only `locales`, `extract.input` and `extract.output` are required. In `i18next.config.ts` your editor completes the rest.

* `locales` (required): the language codes, for example `['en', 'de', 'fr']`.
* `plugins` (default `[]`): see [Plugin system](guides/plugins.md).

### extract

* `input` (required): glob pattern(s) of the files to read.
* `output` (required): the path of the translation files, with `{{language}}` and `{{namespace}}`, or a function `(language, namespace) => path`.
* `ignore` (no default): glob pattern(s) of files to leave out.
* `outputFormat` (default `'json'`): `'json5'` (comments, trailing commas and formatting kept where possible), `'yaml'`, `'js'`, `'js-esm'`, `'js-cjs'` or `'ts'` (a module with `export default`). An `output` ending in `.json5`, `.yaml` or `.yml` picks its format by itself.
* `mergeNamespaces` (default `false`): one file per language, with the namespaces as top-level keys; `output` then has no `{{namespace}}`.
* `functions` (default `['t', '*.t']`): the translation functions to look for. A leading `*` matches any object (`'*.t'` matches `i18n.t`), a trailing `*` any method (`'tProps.*'` matches `tProps.label`).
* `transComponents` (default `['Trans']`): the components whose children are translations.
* `transKeepBasicHtmlNodesFor` (default `['br', 'strong', 'i', 'p']`): the HTML tags kept by name in the default text of a `Trans`.
* `useTranslationNames` (default `['useTranslation', 'getT', 'useT']`): the functions that return a `t`. A name takes the namespace as first argument and the options with `keyPrefix` as second; an object sets other positions: `{ name: 'loadPageTranslations', nsArg: 1, keyPrefixArg: 2 }`.
* `defaultNS` (default `'translation'`): the namespace of keys that name none; `false` writes no namespace, for example for one file per language without nesting.
* `fallbackNS` (no default): the namespace or namespaces to fall back to, as in i18next; keys translated there are not copied into other namespace files.
* `nsSeparator` (default `':'`), `keySeparator` (default `'.'`, `false` for flat keys), `contextSeparator` and `pluralSeparator` (default `'_'`).
* `preservePatterns` (no default): keys `extract` keeps although the code does not use them, as patterns with an optional namespace: `'dynamic.feature.*'`, `'assets:*'` (every key of `assets`), `'dynamic:user.*.profile'`.
* `preserveContextVariants` (default `false`): keeps every context variant of a key that is used with `context` (`friend_male`, `friend_female`), and adds them to every language.
* `sort` (default `true`): sorts the keys; `false` keeps their order, a function `(a, b) => number` sets your own. `'locize'` sorts by plain character code, the order of the files Locize publishes, so `extract` followed by `locize-sync` or `locize-download` shows no reordering in the diff.
* `indentation` (default `2`): spaces, or a string.
* `primaryLanguage` (default: the first of `locales`) and `secondaryLanguages` (default: all others).
* `omitMissingKeys` (default `false`): the languages (or `true` for all secondary ones) that get no empty placeholder for a new key, so i18next falls back to `fallbackLng` at run time. Existing translations stay, unused keys still go, and `status` still counts the missing ones; empty strings already in these files stay until you remove them.
* `defaultValue` (default `''`): the value of a missing key in secondary languages, or a function `(key, namespace, language, value) => string`, for example ``(key) => `TODO: translate ${key}` ``.
* `removeUnusedKeys` (default `true`): removes the keys the code no longer uses.
* `ignoreNamespaces` (no default): namespaces that `extract`, `status` and `sync` leave alone, with `*` as a wildcard (`'dev.*'`), for example namespaces shared in a monorepo. Such a namespace still serves as `fallbackNS`: it is read, never written.
* `extractFromComments` (default `true`): also reads `t()` and `Trans` in code comments.
* `maxTypeDepth` (default `5`): how many levels of nested members a dynamic key follows into a typed value; more levels cost time and memory with large recursive types such as OpenAPI schemas.
* `generateBasePluralForms` (default `true`): with `false`, `t('key', { context: 'male', count: 1 })` writes only `key_male_one` and `key_male_other`, not `key_one` and `key_other`.
* `disablePlurals` (default `false`): writes no plural forms; `count` still fills `{{count}}`.
* `allPluralForms` (default `false`): gives every language the plural forms of all languages (with `en` and `pl`, English gets `_few` and `_many` as well).
* `nestingPrefix` (default `'$t('`), `nestingSuffix` (default `')'`) and `nestingOptionsSeparator` (default `','`): how `$t(...)` nesting is written. A key reached only through `$t(...)`, in the code or in a translation, is kept.
* `interpolationPrefix` (default `'{{'`) and `interpolationSuffix` (default `'}}'`).
* `messageFormat` (default `'i18next'`): `'icu'` or `'mf2'` for i18next-icu or i18next-mf2; see [ICU and MF2 messages](guides/icu-and-mf2.md).
* `instrumentScorer` (no default): your own confidence score for `instrument`; see [Custom scorer hook](commands/instrument.md#custom-scorer-hook).
* `acceptedAttributes`, `acceptedTags`, `ignoredAttributes`, `ignoredTags`: as under `lint`, for both `instrument` and `lint`; see [Translatable attributes per element](#translatable-attributes-per-element).
* `warnOnConflicts` (default `false`): `'warn'` or `'error'` when the same key is extracted with different default values.
* `warnOnAmbiguousTypes` (default `false`): `'warn'` or `'error'` when the extractor has to guess which of several declarations of a type, enum or constant a dynamic key means.

### lint

* `acceptedAttributes` (no default): only these JSX attributes are checked, before `ignoredAttributes`; an object sets them per element.
* `acceptedTags` (no default): only these tags are checked, before `ignoredTags`; `'all'` checks every tag, your components included.
* `ignoredAttributes` and `ignoredTags` (no default): attributes and tags whose content is not checked.
* `ignore` (no default): files to leave out, besides those of `extract.ignore`.
* `checkInterpolationParams` (default `true`): reports `t()` calls whose values do not match the placeholders.
* `defaultVariables` (no default): the variables `interpolation.defaultVariables` fills in, so they are not reported as missing (`'user'` covers `{{user.name}}`).
* `checkConcatenation` (default `'warn'`): strings concatenated with a translation. `'error'` fails the run, `'off'` turns it off.
* `checkPunctuationConcatenation` (default `'off'`): punctuation glued onto a translation, such as `<Trans>Email</Trans>:`.
* `checkTranslationPlaceholders` (default `'warn'`): compares the placeholders (`{{name}}`, `$t(key)`, `<0>`) of every language with the primary language.
* `checkTransIndices` (default `'warn'`): `<Trans>` tags of the primary translation that do not match the component's children.
* `baseline` (default `'i18next-lint-baseline.json'`): the file `lint --update-baseline` writes.

### status

* `ignoreKeys` (no default): keys `status` does not report, as patterns like `preservePatterns` (`'*-href'`, `'common:empty-table-subtitle'`).
* `checkIdentical` (default `'warn'`): values identical to the primary language. `'error'` counts them as untranslated, `'off'` turns the check off.

### types

* `input` (required): the translation files of the primary language, for example `['locales/en/*.json']`.
* `output` (required): the `i18next.d.ts` to write.
* `resourcesFile` (no default): a separate file for the resource types.
* `basePath` (no default): keeps folders as part of the namespace; see [Namespaces](guides/namespaces.md#nested-namespaces-for-type-generation).
* `enableSelector` (default `false`): types for the selector API; `'strict'` needs a namespace segment in every path. `'optimize'` leaves out the type-level processing of your translations, for very large resources; the keys are not changed, so a plural key is given in full ([Selector API](/typescript/selector-api#turn-it-on)).
* `indentation` (default: `extract.indentation`).

{% locize %}
### locize

* `projectId` and `apiKey` (best from the `LOCIZE_API_KEY` environment variable), `version` (default `'latest'`) and `cdnType` (`'standard'` or `'pro'`). The commands and their options: [Locize commands](commands/locize.md).
{% endlocize %}

## Extending the recommended lint tags and attributes

You can extend the built-in recommended lists for linting by importing and spreading them in your config:

```typescript
import {
  defineConfig,
  recommendedAcceptedTags,
  recommendedAcceptedAttributes,
} from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    output: 'public/locales/{{language}}/{{namespace}}.json',
  },
  lint: {
    acceptedTags: ['my-web-component', ...recommendedAcceptedTags],
    acceptedAttributes: ['data-label', ...recommendedAcceptedAttributes]
  }
});
```

## Translatable attributes per element

The same prop name can mean different things on different components: `label` is a button's text but a chart axis's data key. Give `acceptedAttributes` an object to say per JSX element which props hold text:

```typescript
import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    output: 'public/locales/{{language}}/{{namespace}}.json',
    acceptedAttributes: {
      // label is not text, except where an element adds it back
      '*': ['!label'],
      Button: ['label'],
      PageTitle: ['heading'],
      'Select.Option': ['hint']
    }
  },
  lint: {
    // lint checks attributes only on the elements acceptedTags lets through
    acceptedTags: 'all'
  }
});
```

- A name adds an attribute to the recommended list (`recommendedAcceptedAttributes`), `!name` removes it. For `instrument`, a component's props also hold text by their name or a sentence as their value (see [instrument](commands/instrument.md#what-it-transforms)); `!name` switches that off for the prop as well. `'*'` applies to every element first, then the element's own entry, so an element can add back what `'*'` removed.
- Attribute names are case-insensitive (`helpText` and `helptext` are the same attribute).
- Element keys are case-sensitive, as in JSX (`Select` is a component, `select` the HTML element), and match the imported name through aliases: after `import { PageTitle as PT }`, `<PT>` uses the `PageTitle` entry.
- `<Select.Option>` uses the `Select.Option` entry when there is one, otherwise `Option`.
- Set in `extract`, the rules apply to `instrument` and `lint`; `lint.acceptedAttributes` overrides them for `lint` only. `instrument` wraps the values of added attributes (also ones it skips by default, such as `name`) and leaves the strings of removed ones alone, `{...}` expressions included; JSX and `count === 1 ? … : …` plurals inside a removed attribute are still checked. The array form stays a `lint`-only accept-list.
- `lint` checks attributes only on the elements `acceptedTags` lets through, and the recommended tags are HTML tags: for your components use `acceptedTags: 'all'` or list them.
