---
title: "i18next 27 and react-i18next 18: what changes and how to upgrade"
description: "i18next 27.0.0 and react-i18next 18.0.0 came out on 2026-11-07. They change defaults most setups had to override, keep the logger and the React options per instance, refuse language codes that look like markup, and make Trans render values as written. What changes for your app, and a prompt that upgrades it."
date: 2026-11-07
tags: Release, React
image: /img/blog/i18next-27-react-i18next-18.svg
imageAlt: The install command for i18next 27 and react-i18next 18, and three defaults before and after
---

## Key takeaways

- i18next 27.0.0 and react-i18next 18.0.0 came out together on 2026-11-07; the current versions are 27.2.2 and 18.0.3
  (2026-11-19).
- Four defaults change: `fallbackLng` is `false`, `returnEmptyString` is `false`, a language code without a region gets
  its canonical casing, and the types check interpolation variables.
- A language code from a detector or `changeLanguage()` that has the shape of markup or a path is refused, unless you
  configured it.
- In react-i18next 18, `Trans` renders values and entities as written and re-renders on a language change by itself.
- Both need Node.js 22 or later; react-i18next 18 needs i18next 27 and React 18 or later.

## Upgrade with your agent

Paste this into your agent (Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI, ...). The migration guides list
every change with what to do, and your agent applies what concerns your code:

```prompt
Upgrade this project to i18next 27 and react-i18next 18.
First read the two migration guides:
https://www.i18next.com/misc/migration-guide.md (section "v26.x.x to v27.0.0")
https://www.i18next.com/react/latest/migrating-v17-to-v18.md
Apply what concerns this code, run the tests and the build,
and list what you changed and why.
```

Without an agent, these options keep the behavior of v26 where an option exists, while you go through the changes:

```js
i18next.init({
  fallbackLng: 'dev', // better: your source language; there is no implicit 'dev' any more
  returnEmptyString: true, // an empty translation is a translation again
  cleanCode: false // keep codes without a region as they are ('EN' stays 'EN')
})
```

```ts
declare module 'i18next' {
  interface CustomTypeOptions {
    strictInterpolationChecks: false
    returnEmptyString: true
  }
}
```

## The four defaults

**`fallbackLng` is `false` instead of `['dev']`.** Without a `fallbackLng`, i18next no longer asks the backend for
`dev` (with i18next-http-backend, `/locales/dev/translation.json`), and `saveMissing` sends missing keys for the current
language. Set `fallbackLng` to your main language.

**`returnEmptyString` is `false`.** An empty translation falls back like a missing one: to the fallback language, the
default value or the key. i18next-cli writes `''` for keys not yet translated in the other languages; they now show the
fallback language instead of a blank. An explicit `t('key', '')` still returns `''`. Where an empty string is meant to
show nothing, for example when your translation tool keeps empty strings on purpose, set `returnEmptyString: true` in
`init()` and in `CustomTypeOptions`.

**Language codes without a region get their canonical casing**, as codes with a region already did: `'EN'` becomes
`'en'`. Only the casing changes; aliases such as `iw` or `tl` stay as they are, and so do codes that are not BCP 47
(`en_US`). `cleanCode: false` keeps codes exactly as they are and is deprecated.

**The types check interpolation variables** (`strictInterpolationChecks`): `t()` needs the options for a string with
variables, so a `{{name}}` cannot be left out of a call, and plural keys are checked too. A wrapper around `t()` is
typed with `ParseKeysWithoutVariables`; variables that `interpolation.defaultVariables` fills in are declared with
`defaultVariables` in `CustomTypeOptions`.

## What else changes in i18next 27

- **Each instance has its own logger and post-processors.** An instance from `createInstance()` no longer sees what the
  default instance registered, so call `use()` on each instance; a clone (`cloneInstance()`) keeps its parent's.
- **Unsafe language codes are refused.** A code that does not have the shape `isSafeLanguageCode()` checks (letters,
  digits, `-`, `_`, `@` and `.`, at most 128 characters) is refused unless it is listed in `supportedLngs`, a
  `fallbackLng`, `preload` or `resources`. Before, a detector could make `"><img src=x onerror=alert(1)>` the value of
  `i18next.language`, which apps put into `<html lang>`. BCP 47, POSIX (`sr@latin`) and private-use codes
  (`en-x-pirate`) pass.
- **An object without `returnObjects` counts as a missing key**: `t()` returns the default value or the key, instead
  of the sentence "key '…' returned an object instead of string." that ended up in the UI.
- **`/` is no longer escaped**: `'$10/month'` stays as it is instead of `'$10&#x2F;month'`. Snapshots that contain
  `&#x2F;` need an update.
- **`addResources()` keeps numbers, booleans and objects**, which it dropped before.
- **`createInstance(options)` merges the defaults right away**, so `getFixedT()` no longer throws before `init()`.
- **`keySeparator: false` means flat keys only**: a key is no longer split at the text `false`, and selectors work on
  the flat keys.

Removed: the dotted language in resource store calls (`getResource('en.translation.key')`; pass language, namespace
and key separately), the `interpolation.*Escaped` options (pass the delimiters as `prefix`, `suffix`, `nestingPrefix`
and `nestingSuffix`), the type `compatibilityJSON`, the option types of plugins, and the CommonJS root `index.js`.

What keeps working: backends and detectors without `callbackApi` (with a deprecation warning in debug mode), and the
writable `isInitialized`, which react-i18next 17's `useSSR` and the Pages Router of next-i18next rely on.

## What changes in react-i18next 18

- **`Trans` renders values and entities as written.** It always decodes HTML entities after parsing, as `IcuTrans`
  does: `Tom & Jerry` no longer renders as `Tom &amp; Jerry`, and a date `17/12/2025` no longer as
  `17&#x2F;12&#x2F;2025`. Values still render as text, never as markup. `shouldUnescape` is ignored and warns.
- **`Trans` and `IcuTrans` re-render on a language change** by themselves, like `useTranslation`; before, they waited
  for a parent to re-render.
- **The `react` options stay on their instance.** A second instance no longer inherits the first one's
  `useSuspense: false`; set them on every instance, or call `setDefaults()` once.
- **The `i18n` from `useTranslation` reads the instance**, so after `await i18n.changeLanguage('de')` it says `de`. A
  check like `prevProps.i18n.language !== this.props.i18n.language` no longer sees the change: compare the objects.
- **`useSSR` and `withSSR` call `hydrate()`.** Test mocks need `hydrate`, and mocks used with `Trans` need `on` and
  `off`, since `Trans` now subscribes to events.
- **`Trans` works in React Server Components.** A `react-server` export condition resolves
  `import { Trans } from 'react-i18next'` to the variant without context; pass the instance of the request as `i18n`.
- **Removed:** the `react-i18next/icu.macro` Babel macro (write `IcuTrans`), and the AMD build. The UMD build no longer
  bundles i18next: 26.2 KB minified in 18.0.0, against 77.6 KB in 17.1.13.
- **Types:** the `allowObjectInHTMLChildren` augmentation is opt-in (`import 'react-i18next/augment-react'`), and
  `I18nContext` is `undefined` outside an `I18nextProvider`, as at runtime.

## Support

Node.js 22 or later (CI runs 22, 24 and 26). The builds target ES2020: Chrome and Edge 80, Firefox 80, Safari 14.
TypeScript `^5 || ^6 || ^7`, unchanged.

## Since 27.0.0

- **27.1.0:** when the plural form for `count` is missing, `t()` uses the `_other` form of the same language before the
  next fallback language, as CLDR does.
- **27.1.2 and 27.1.3:** language codes and namespaces from requests no longer grow a server's memory without end, and
  a code named like an `Object.prototype` property no longer breaks loading.
- **27.2.2 and 18.0.3** (2026-11-19) are the current versions. Every change is in the changelogs of
  [i18next](https://github.com/i18next/i18next/blob/master/CHANGELOG.md) and
  [react-i18next](https://github.com/i18next/react-i18next/blob/master/CHANGELOG.md).

## FAQ

### Can I upgrade i18next first and react-i18next later?

Yes. react-i18next 17.1.13 and later work with i18next 27. Apps on React 16 or 17 stay on react-i18next 17, since 18
needs React 18.

### Does next-i18next work with i18next 27?

Yes: next-i18next 16.5.1 accepts i18next 23.7.13 and later, and its Pages Router keeps working because
`isInitialized` stays writable.
