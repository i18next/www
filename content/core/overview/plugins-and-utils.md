---
description: "Packages that add to i18next, by the i18next team and by the community, each with what it is for."
---

# Plugins and utils

The list holds projects with a change in the last twelve months, finished projects that work with the current i18next and are still used (marked as finished), and projects the maintainers keep (checked 2026-11-21).

## i18n formats

* **[i18next-fluent](https://github.com/i18next/i18next-fluent)**
* **[i18next-icu](https://github.com/i18next/i18next-icu)**
* **[i18next-mf2](https://github.com/i18next/i18next-mf2)**
* **[i18next-polyglot](https://github.com/i18next/i18next-polyglot):** the format of Polyglot.js. No release since 2018-04, works with i18next 27.
* **[i18next-shopify](https://github.com/Shopify/i18next-shopify)**

What each syntax is and what stops working with it: [Other formats](../misc/other-formats.md) and [Using ICU or MF2](../how-to/using-icu-or-mf2.md).

## Extraction tools

* **[i18next-cli](/cli):** the command-line tool for i18next: key extraction, linting, locale syncing and type generation.
* **[i18next-typescript-parser](https://github.com/emersion/i18next-typescript-parser):** extracts i18next keys from a TypeScript codebase.
* **[@i18next-selector/vite-plugin](https://github.com/ahrjarrett/i18next-selector/tree/main/packages/vite-plugin):** generates the plural keys on each edit of your translation files (HMR), for `enableSelector: 'optimize'`.
* **[i18next-scanner](https://github.com/i18next/i18next-scanner):** scans the code and merges the keys into the translation files. Finished: no release since 2024-10, works with i18next 27. [i18next-cli](/cli) is its successor.
* **[babel-plugin-i18next-extract](https://github.com/gilbsgilbs/babel-plugin-i18next-extract):** extracts the keys during the Babel build, into JSON files in the i18next format. Finished: no release since 2025-07, works with i18next 27.

## Utils

* **[i18next-gettext-converter](https://github.com/i18next/i18next-gettext-converter):** converts gettext `.mo` or `.po` to i18next JSON and back.
* **[i18next-gettext-loader](https://github.com/openculinary/i18next-gettext-loader):** converts gettext PO files to i18next JSON during webpack builds.
* **[vite-plugin-i18next-loader](https://github.com/alienfast/vite-plugin-i18next-loader):** bundles i18next locales from one or many JSON or YAML files and libraries into the client, with HMR.
* **[rollup-plugin-i18next-conv](https://github.com/perrin4869/rollup-plugin-i18next-conv):** imports `.po` files with Rollup.
* **[i18next-locales-sync](https://github.com/felixmosh/i18next-locales-sync):** syncs locale files against a primary language, with namespaces, plural forms and key sorting.
* **[eslint-plugin-i18next](https://github.com/edvardchen/eslint-plugin-i18next):** reports text in the code that is not translated.
* **[@i18next-plugin/eslint](https://github.com/PBK-B/i18next-plugin-eslint):** the rules of `i18next-cli lint` as an ESLint plugin, by the community.
* **[shipi18n](https://github.com/Shipi18n/shipi18n):** lints locale files (JSON, `.arb`, `.xcstrings`) in CI: missing keys, dropped placeholders, collapsed plurals; optionally an LLM-based check of the meaning.
* **[Locale Guard](https://github.com/Mohamed-Almarag/locale-guard):** a GitHub Action and CLI that lint locale files in pull requests and git hooks: missing keys, `{{name}}` placeholders, the plural keys each language needs, untranslated text.
* **[I18n Support Plus for JetBrains IDEs](https://plugins.jetbrains.com/plugin/30971-i18n-support-plus):** a community fork of I18n Support: navigation, completion, rename, extraction, missing-key checks.
* **[i18next support for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension):** extract, show, edit and lint translations in the editor.
* **[i18next-hmr](https://github.com/felixmosh/i18next-hmr):** reloads translations on client and server when they change (webpack, Vite).
* **[i18next-v4-format-converter](https://github.com/i18next/i18next-v4-format-converter):** converts old translation files to the current [i18next format](../misc/json-format.md), by CLI, in code or [in the browser](https://i18next.github.io/i18next-v4-format-converter-web/).
* **[i18next-json-csv-converter](https://github.com/andraaspar/i18next-json-csv-converter):** converts between CSV files and i18next JSON. Finished: no release since 2018-10, works with i18next 27.
* **[@alienfast/i18next-loader](https://github.com/alienfast/i18next-loader):** a webpack loader that bundles the translations from JSON or YAML files into the client at build time. Finished: no release since 2023-09, works with i18next 27. For Vite: vite-plugin-i18next-loader above.
* **[i18next-resource-store-loader](https://github.com/atroo/i18next-resource-store-loader):** a webpack loader that builds the resources from a folder at build time, so no request loads them. Finished: no release since 2023-09, works with i18next 27.

## Backend extenders

* **[i18next-chained-backend](https://github.com/i18next/i18next-chained-backend):** combines backends for a cache or a fallback ([Cache and fallback](../how-to/cache-and-fallback.md)).
* **[i18next-multiload-backend-adapter](https://github.com/i18next/i18next-multiload-backend-adapter):** lets a backend load several languages and namespaces in one request (`readMulti`).

## Backends

* **[i18next-http-backend](https://github.com/i18next/i18next-http-backend):** loads translations over HTTP (fetch) in the browser, Node.js and Deno.
* **[i18next-fs-backend](https://github.com/i18next/i18next-fs-backend):** loads translations from the filesystem in Node.js and Deno; also a cache layer with the chained backend.
* **[i18next-localstorage-backend](https://github.com/i18next/i18next-localstorage-backend):** caches translations in the browser's localStorage, with the chained backend.
* **[i18next-resources-to-backend](https://github.com/i18next/i18next-resources-to-backend):** turns resources or a dynamic `import()` into a backend.
* **[i18next-fetch-backend](https://github.com/perrin4869/i18next-fetch-backend):** loads translations with the browser's fetch.
* **[i18next-fluent-backend](https://github.com/i18next/i18next-fluent-backend):** loads Fluent `.ftl` files.
* **[i18next-electron-fs-backend](https://github.com/reZach/i18next-electron-fs-backend):** loads translations from the filesystem in an Electron app.
* **[i18next-locize-backend](https://github.com/locize/i18next-locize-backend):** loads translations from the Locize CDN.
* **[Transifex backend](https://github.com/transifex/transifex-javascript/tree/master/packages/i18next):** loads translations from Transifex Native.

## Language detector

* **[i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector):** detects the language in the browser.
* **[i18next-http-middleware](https://github.com/i18next/i18next-http-middleware):** detects the language of an HTTP request, also in Deno.
* **[koa-i18next-detector](https://github.com/lxzxl/koa-i18next-detector):** detects the language in Koa.
* **[react-native-localization-settings](https://github.com/jakex7/react-native-localization-settings):** detects the language in React Native and lets users change it in the system settings, with the native per-app language API.
* **[@os-team/i18next-react-native-language-detector](https://gitlab.com/os-team/libs/utils/-/tree/main/packages/i18next-react-native-language-detector):** the device language in React Native, from `getLocales()` of react-native-localize. Finished: no change since 2025-03, works with i18next 27.
* **[@unly/universal-language-detector](https://github.com/UnlyEd/universal-language-detector):** detects the language in the browser and on the server, for frameworks that render on both; it runs on its own and returns the language for your `lng`. Finished: no release since 2020-03, works with i18next 27.
* **[i18next-cli-language-detector](https://github.com/neet/i18next-cli-language-detector):** detects the language of a command-line app from its environment variables. No release since 2023-05, works with i18next 27.

## Post processors

* **[i18next-sprintf-postprocessor](https://github.com/i18next/i18next-sprintf-postProcessor):** sprintf syntax in translations.
* **[i18next-intervalplural-postprocessor](https://github.com/i18next/i18next-intervalPlural-postProcessor):** interval-based plurals like "one item", "a few items", "a lot of items".
* **[i18next-pseudo](https://github.com/MattBoatman/i18next-pseudo):** pseudo-localizes the texts, to test layouts and find text that is not translated. Finished: no release since 2021-02, works with i18next 27.
* **[i18next-react-postprocessor](https://github.com/orzechowskid/i18next-react-postprocessor):** puts React elements inside translated texts. Finished: no release since 2022-04, works with i18next 27.
* **[i18next-korean-postposition-processor](https://github.com/Perlmint/i18next-korean-postposition-processor):** picks the Korean postposition that fits the word before it. Finished: no release since 2021-09, works with i18next 27.

## Create your own plugin <a id="loggers"></a>

How plugins work and how to write one: [Plugins](../principles/plugins.md#writing-your-own-plugin).
