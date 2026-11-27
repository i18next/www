---
description: "Generate TypeScript types from your translation files, so a typo in a key fails at compile time and your editor completes the keys."
---

# types

Generates TypeScript definitions from your translation files for full type-safety and autocompletion.

What the types give you and how to set them up in your app: [Typed keys](/overview/typescript). <a id="type-safety"></a>

```bash
npx i18next-cli types [options]
```

## Options

- `--watch, -w`: Re-run automatically when translation files change
- `--ci`: Exit with a non-zero status if the generated TypeScript definitions are out of date (check-only, writes nothing). Cannot be combined with `--watch`.
- `--quiet, -q`: Suppress spinner and non-essential output (for CI or scripting)

## Notes

- With `extract.defaultNS: false`, the generated `defaultNS` comes from your resource files, because i18next's types cannot express `false`. Adjust `i18next.d.ts` if your runtime config uses another default namespace.
- With `extract.messageFormat: 'icu'` or `'mf2'`, a newly generated `i18next.d.ts` sets `parseInterpolation` to the same value when your i18next is 26.5.0 or later (`false` with 26.2.0 to 26.4.x), so `t()` options are checked against the arguments of each message. An existing `i18next.d.ts` is not rewritten; `types` warns until you add the line.
- When `extract` changes `keySeparator`, `nsSeparator`, `pluralSeparator`, `contextSeparator`, `interpolationPrefix` or `interpolationSuffix`, `i18next.d.ts` needs the same value in `CustomTypeOptions` ([Custom type options](/overview/typescript#custom-type-options)). An existing `i18next.d.ts` is not rewritten, so add the line by hand there.
- With `strictInterpolationChecks` (the default from i18next 27), `t()` needs its options for every string with `{{variables}}`. Declare the variables `interpolation.defaultVariables` fills in with the `defaultVariables` type option, type the key of a wrapper around `t()` with `ParseKeysWithoutVariables<'ns'>`, and list the same variables in `lint.defaultVariables`, because `lint` does not read the `.d.ts`.
