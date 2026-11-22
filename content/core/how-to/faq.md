---
description: "Short answers to the questions people ask most, each with a link to where it is explained."
---

# FAQ

## Loading issues

### I don't see my translations?

Try setting `debug: true` on init and check the console log. There is most likely a warning about an unresolvable loadPath or invalid JSON. Check if the translation files are accessible via the browser.

## Translation

### How to translate the resource files?

For a first machine translation of your files: [translate.i18next.com](https://translate.i18next.com). Have people review it before it goes live.

### How to check the translation files for missing or broken translations?

Use the free [i18n health check](https://translate.i18next.com/health-check): drop in your JSON locale files and it instantly reports missing translations, duplicate source values and interpolation placeholder mismatches. Everything runs in your browser; nothing is uploaded.

### How do I find the strings that are still hardcoded?

Paste your public GitHub repository into the free [i18n readiness check](https://translate.i18next.com/repo-check): it lists the user-facing strings that are not wrapped in `t()` yet (file and line, the same rules as `npx i18next-cli lint`), detects your framework and locale files, and shows untranslated keys per language. Everything runs in your browser; only github.com is contacted. Private repository? Run `npx i18next-cli lint` locally.

### How do I know which plural suffix I have to use?

`i18next-cli extract` writes each language's forms; see [Plurals](../translation-function/plurals.md#which-forms-a-language-needs).

### Why are my plural keys not working?

Are you seeing this error in the development console?

> No Intl support, please use an Intl polyfill!

i18next resolves plural forms with [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules). Without it, only the English-style `_one` and `_other` resolve, so languages with more forms (Russian, Arabic, Polish) show wrong or missing plurals. Add the [polyfill](https://github.com/eemeli/intl-pluralrules):

```shell
npm install intl-pluralrules
```

```javascript
import 'intl-pluralrules'
```

React Native's Hermes engine needs it in every app that uses plurals; see [React Native and Expo](/react/react-native).

### How should the language codes be formatted?

Theoretically, you're not bound to any specific language code format, but if you want to make use of all the built-in language features, like proper [pluralization](../translation-function/plurals.md) and correct [fallback resolution](../principles/fallback.md#language-fallback), we strongly suggest using the following standard (BCP 47 language tag):

`lng-(script)-REGION-(extensions)`\
\
e.g.

* en, en-US or en-GB
* zh, zh-HK or zh-Hant-HK

Other examples are listed here: [https://www.iana.org/assignments/language-tags/language-tags.xhtml](https://www.iana.org/assignments/language-tags/language-tags.xhtml)

And more information about the format can be found here: [https://www.w3.org/International/articles/language-tags/](https://www.w3.org/International/articles/language-tags/)

{% hint style="info" %}
As soon as you use the dash character `-` i18next tries to format the language codes with `Intl.getCanonicalLocales`.
{% endhint %}

### How do I get the current language?

Use `i18next.resolvedLanguage`:

```javascript
i18next.resolvedLanguage // 'en'
```

The three related properties differ:

* `i18next.language`: the language as set/detected, e.g. `de-CH`
* `i18next.resolvedLanguage`: the language actually used for the loaded translations after fallback resolution, e.g. `de`; this is usually what you want for UI (language switchers, `lang` attributes)
* `i18next.languages`: the full fallback chain, e.g. `['de-CH', 'de', 'en']`

In react-i18next you get the instance from the hook: `const { i18n } = useTranslation()`.

### Why does my app keep switching back to a previously detected language?

[i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) **caches** the detected language in `localStorage` (and optionally cookies) by default. A language detected or chosen once will win over a changed `fallbackLng` or a different browser setting on the next visit.

To change this, configure the detector's `caches` option:

```javascript
i18next.init({
  detection: {
    caches: [] // disable caching entirely, always re-detect
    // or: caches: ['cookie']
  }
});
```

During development you can clear the `i18nextLng` entry from `localStorage`. Calling `i18next.changeLanguage(lng)` updates the cache; `i18next.changeLanguage(undefined)` re-runs detection.

### Is i18next overkill for a small site?

i18next can start as small as a naive "fetch a JSON file" approach, without any plugins:

```javascript
import i18next from 'i18next';

i18next.init({
  lng: 'en',
  resources: {
    en: { translation: { welcome: 'Welcome' } },
    de: { translation: { welcome: 'Willkommen' } }
  }
});

i18next.t('welcome'); // -> 'Welcome'
```

That is the whole setup: no backend, no detector, no framework binding. What you get over a hand-rolled `fetch`-JSON helper, without writing it yourself: correct [plural rules](../translation-function/plurals.md) for every language (not just `count === 1`), a [fallback chain](../principles/fallback.md) so missing keys never render blank, [interpolation with escaping](../translation-function/interpolation.md), and [Intl-based formatting](../translation-function/formatting.md). When the project grows, the plugin ecosystem (lazy loading, detection, framework bindings) attaches to the same setup instead of a rewrite.

### Can I use my source text as the key (gettext style)?

Yes. Nothing forces abstract keys like `header.title`; natural-language keys work:

```javascript
i18next.init({
  nsSeparator: false, // if your texts contain ':'
  keySeparator: false // if your texts contain '.'
});

i18next.t('Welcome to our application'); // key === English source text
```

[`i18next-cli extract`](/cli/commands/extract) writes the English text into the source file, and translators translate from the key itself. The cost: a changed text changes its key, in the code and in every file ([Best practices, rule 5](../principles/best-practices.md#5-name-keys-by-meaning)).

## Process

### How do I keep track of my translation progress? <a id="how-do-i-keep-overview-over-my-translation-progress"></a>

Run [`npx i18next-cli status`](/cli/commands/status): it shows per language which keys are translated and which are missing.

### How to handle changes in e2e tests? <a id="how-to-handle-with-changes-in-e2e-tests"></a>

For e2e tests a good tactic is to set the language to `cimode` on init. This will set i18next to always return the key on calling `i18next.t`. Want to add the namespace to the returned value? Set `appendNamespaceToCIMode: true` on init.

### How to use i18next in serverless environments?

Due to how serverless functions work, you cannot guarantee that a cached version of your data is available. Serverless functions are short-lived and can shut down at any time, purging any in-memory or filesystem cache. This may be an acceptable trade-off, but sometimes it isn't acceptable.

Because of this we suggest not using a remote backend, and instead downloading the translations and packaging them with your serverless function.

## Support <a id="misc"></a>

### How can I support the project?

There are a lot of ways to support us. Make a PR for a requested feature. Improve the documentation. Help others to get started. Spread the word.

[Locize](https://www.locize.com/i18next) is our translation management service, and its customers fund the work on i18next.
