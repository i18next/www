---
description: "With a declaration file, TypeScript knows your keys: a typo or a missing value for a placeholder fails at compile time, and your editor completes the keys."
---

# Typed keys

## With i18next-cli <a id="create-a-declaration-file"></a>

[`npx i18next-cli types`](/cli/commands/types) generates the types from your translation files: `resources.d.ts` with every key on each run, and `i18next.d.ts`, which registers them, once if it does not exist yet. Point it at the files of your source language:

```typescript
// i18next.config.ts
import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'locales/{{language}}/{{namespace}}.json'
  },
  types: {
    input: ['locales/en/*.json'],
    output: 'src/types/i18next.d.ts',
    resourcesFile: 'src/types/resources.d.ts'
  }
});
```

The generated `i18next.d.ts`:

```typescript
import type Resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: false;
    defaultNS: 'translation';
    resources: Resources;
  }
}
```

## By hand

Export the resources `as const` and register their type in a declaration file:

**`i18n.ts`**

```typescript
import i18next from 'i18next';
import ns1 from './locales/en/ns1.json';
import ns2 from './locales/en/ns2.json';

export const defaultNS = 'ns1';
export const resources = {
  en: { ns1, ns2 },
} as const;

i18next.init({
  lng: 'en',
  ns: ['ns1', 'ns2'],
  defaultNS,
  resources,
});
```

**`i18next.d.ts`**

```typescript
import { resources, defaultNS } from './i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['en'];
  }
}
```

When the resources are not in your code (a backend loads them), import each namespace's JSON into the declaration file instead: `resources: { ns1: typeof ns1; ns2: typeof ns2 }`.

Put your type declarations in one `@types` directory under `src` or above it, for example `@types/i18next.d.ts`. Use TypeScript 5. We recommend [`strict`](https://www.typescriptlang.org/tsconfig#strict) (or at least [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)) in your tsconfig; typed keys also work without `strictNullChecks`.

### Some examples

* [react-i18next](https://github.com/i18next/react-i18next/tree/master/example/react-typescript)
* [next-i18next (App Router)](https://github.com/i18next/next-i18next/tree/master/examples/app-router-simple)
* [next-i18next (Pages Router)](https://github.com/i18next/next-i18next/tree/master/examples/pages-router-simple)

## Custom type options

Set them in `CustomTypeOptions` in your `i18next.d.ts`; each has a default.

* `resources` (default `object`): the resources whose keys and values the types are read from; the most important option.
* `defaultNS` (default `'translation'`): the namespace `t()` and `useTranslation()` use without one.
* `fallbackNS` (default `false`): namespaces to look a key up in when it is missing ([Fallback](../principles/fallback.md#namespace-fallback)).
* `keySeparator` (default `'.'`): the character between the levels of a nested key; `false` for flat keys only, and `keyPrefix` then takes the parts of a flat key before a `.`, as `getFixedT()` joins it.
* `nsSeparator` (default `':'`): the character between namespace and key; `false` for keys without the `ns:key` form.
* `pluralSeparator` (default `'_'`) and `contextSeparator` (default `'_'`): the characters before the plural and the context suffix.
* `returnNull` (default `false`): `null` counts as a translation.
* `returnEmptyString` (default `false`): an empty string counts as a translation; with `false` a key whose value is `''` is typed as the key, as it falls back at run time. Set it to `true` together with the init option of the same name.
* `returnObjects` (default `false`): objects count as a translation result.
* `allowObjectInHTMLChildren` (default `false`): lets HTML elements take objects, for React's `Trans` with interpolation values.
* `interpolationPrefix` (default `'{{'`), `interpolationSuffix` (default `'}}'`), `interpolationFormatSeparator` (default `','`): set them when you change the interpolation options of the same name.
* `unescapePrefix` (default `'-'`) and `unescapeSuffix` (default `''`): the mark for an unescaped placeholder, as in `{{- name}}`.
* `parseInterpolation` (default `true`): types the `t()` options from the `{{variable}}` patterns; `'icu'` or `'mf2'` from the ICU arguments or MF2 variables ([Using ICU or MF2](../how-to/using-icu-or-mf2.md#typescript)); `false` turns the parsing off. Type-only.
* `interpolationFormatTypeMap` (default `{}`): the type of a value by its format or function name, for example `date: Date | number`.
* `strictKeyChecks` (default `false`): checks the key even when a `defaultValue` is given.
* `strictInterpolationChecks` (default `true`): `t()` needs its options for a string with `{{variables}}`: for `'Hello {{name}}!'`, `t('greeting')` is a type error and `t('greeting', { name })` compiles. It applies to string keys, selectors and `getFixedT`, and with `strictKeyChecks` also to `t(key, defaultValue)`; ICU and MF2 messages need their arguments regardless. `false` lets a call leave the options out, and the raw `{{name}}` reaches the UI.
* `defaultVariables` (default `{}`): the variables `interpolation.defaultVariables` fills in at run time, for example `{ appName: string }`; they become optional in the `t()` options.
* `enableSelector` (default `false`): `t()` takes a selector function; `'optimize'` for very large resources, `'strict'` for a namespace in every path ([Selector API](../typescript/selector-api.md)).

### Wrappers with `strictInterpolationChecks`

With `strictInterpolationChecks: true`, a function that passes a key on to `t()` without options only compiles when none of the strings it may get has variables. Type its key with `ParseKeysWithoutVariables`: the keys `t()` takes without options. A plural key is left out when its forms take `count`.

```typescript
import type { ParseKeysWithoutVariables } from 'i18next';

// 'Settings' and 'Save' are allowed, 'Hello {{name}}' is not
const label = (key: ParseKeysWithoutVariables<'common'>) => t(key);
```

A wrapper that needs the other keys too takes the options as well, like `t()` itself.

## Per-package namespace types in a monorepo (`ResourceNamespaceMap`)

Use this when one i18next instance is shared across several packages in a monorepo (for example, a shared UI library `@repo/ui` consumed as source by an app), and each package declares its own namespace types.

`CustomTypeOptions.resources` is a single property of an interface, so TypeScript requires every contribution to come from a single `declare module 'i18next'` block. Two declarations of `resources` from different packages collide with [TS2717](https://typescript.tv/errors/#ts2717). The common workaround was to declare every dependency's namespace in the leaf app's augmentation file (often falling back to `any` for namespaces the app doesn't use directly).

`ResourceNamespaceMap` is a separate interface designed so each package can declare its own namespace types independently. TypeScript merges members across multiple `declare module 'i18next'` blocks automatically.

**`packages/ui/i18next.d.ts`** declares only the UI package's namespace:

```typescript
import "i18next";
import type uiTranslations from "./translations/en/ui.json";

declare module "i18next" {
  interface ResourceNamespaceMap {
    "@repo/ui": typeof uiTranslations;
  }
}
```

**`apps/frontend/i18next.d.ts`** declares only the app's own namespaces:

```typescript
import "i18next";
import type common from "./translations/en/common.json";
import type pageHome from "./translations/en/page-home.json";

declare module "i18next" {
  interface ResourceNamespaceMap {
    common: typeof common;
    "page-home": typeof pageHome;
  }

  // Scalar options stay on CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "common";
  }
}
```

When both files are in the same compile unit (the typical case for source-consumed monorepo packages), TypeScript merges the registry: `useTranslation("@repo/ui")` typechecks inside the UI package, `useTranslation("common")` works inside the app, and neither side has to know about the other's namespaces.

**Scalar options stay on `CustomTypeOptions`.** `ResourceNamespaceMap` only handles namespace resource types. Settings like `defaultNS`, `returnNull`, `enableSelector`, `parseInterpolation`, etc. continue to live on `CustomTypeOptions` and follow the existing single-declaration rules, but those are scalar and rarely conflict across packages.

**Coexists with `CustomTypeOptions.resources`.** If you already use `CustomTypeOptions.resources`, it continues to work, and new packages can opt into `ResourceNamespaceMap` without forcing you to migrate. Both surfaces feed `TypeOptions['resources']`.

**Same-key conflicts.** If two declarations contribute the same namespace with the same key but different literal types (e.g. `'A'` in one package, `'B'` in another), that key is silently dropped from the merged namespace, and calling `t()` with it errors as an unknown key. Other keys in the namespace are preserved.

If your project has several i18next instances with different translation resources instead, each instance needs its own `tsconfig.json` and `i18next.d.ts`; see [i18next/i18next-monorepo](https://github.com/i18next/i18next-monorepo) for an example.

<a id="testing"></a><a id="mocking-the-selector-function"></a><a id="troubleshooting"></a><a id="intellisense-not-working"></a><a id="expected-0-arguments-but-got-1.-when-calling-t"></a><a id="typechecking-got-slow-with-large-resource-files"></a><a id="out-of-memory-oom-errors"></a><a id="type-htmlattributes-less-than-t-greater-than-is-not-assignable-to-type"></a><a id="type-error-template-literal"></a><a id="type-error-excessively-deep-and-possibly-infinite"></a><a id="tagged-template-literal-react-i18next-only"></a><a id="customize-t-function-return-when-returnobjects-is-set-to-true-but-customtypeoptions.resources-is-not"></a><a id="example-with-object"></a><a id="example-with-array"></a><a id="example-without-casting-using-type-parameters"></a><a id="troubleshooting-less-than-23"></a><a id="slow-compilation-time"></a><a id="argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz"></a><a id="not-working-interpolation-values"></a><a id="interpolation-values-not-working"></a><a id="selector-api"></a>The examples across these docs use string keys; a function that picks the key instead (`$ => $.key`) is the [Selector API](../typescript/selector-api.md). Tests, type errors and slow type checks are on [Troubleshooting](../typescript/troubleshooting.md#typechecking-got-slow-with-large-resource-files).
