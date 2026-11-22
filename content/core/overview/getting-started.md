---
description: "Your first translated text with i18next alone, in a few lines and without a framework."
---

# Getting started

**Using a coding agent?** Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

Your agent wraps the texts in `t()` and writes the translation files; you review the diff, and the translation files stay in your repository unless you choose a translation management service. ⇒ [What the prompt tells your agent](../how-to/ai-coding-agents.md)

## Installation <a id="load-in-deno"></a><a id="load-from-cdn"></a><a id="supported-environments"></a>

```bash
npm install i18next
```

With yarn: `yarn add i18next`. Deno, a script tag from a CDN and the browsers i18next supports: [Environments](environments.md).

## Basic sample <a id="important-caveat"></a><a id="extended-sample"></a>

For an app, use a binding instead of setting `innerHTML` yourself: [React](/react), [Next.js](/next) or [Astro](/astro).

```javascript
import i18next from 'i18next';

i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true, // logs what i18next does to the console
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});
// ready at once: the resources were passed to init
document.getElementById('output').innerHTML = i18next.t('key');
```

## Next steps <a id="choose-your-message-syntax"></a>

* The translation functions like [interpolation](../translation-function/interpolation.md), [formatting](../translation-function/formatting.md) and [plurals](../translation-function/plurals.md).
* A binding for your framework: [react-i18next](/react), [next-i18next](/next), [Astro](/astro) or [another framework](supported-frameworks.md).
* The [configuration options](configuration-options.md).
* Your translators or tools expect ICU or MF2? Read [Using ICU or MF2](../how-to/using-icu-or-mf2.md) before your files grow.
* [Type-safe translations with TypeScript](typescript.md).
* A [language detector](plugins-and-utils.md) to detect the preferred language of your user.
* A [backend plugin](plugins-and-utils.md) to load the translations from the server or filesystem.
* A first machine translation of your files: [translate.i18next.com](https://translate.i18next.com/).
* Missing translations or interpolation errors in your files: the free [i18n health check](https://translate.i18next.com/health-check).
* Hardcoded strings left in a GitHub repository: the free [i18n readiness check](https://translate.i18next.com/repo-check).
