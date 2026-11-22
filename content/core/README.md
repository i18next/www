---
description: i18next shows the texts of a JavaScript app or site in each user's language. Every text sits in a plain JSON file in your repository, and your code fetches it by its key with t().
---

# Introduction

**Set up i18next with your coding agent**\
Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

The official [i18next-cli](/cli) prints the steps for the version installed in your project: wrap hardcoded strings in `t()`, extract the keys, check every language. You review the diff, and the translation files stay in your repository unless you choose a translation management service.\
⇒ [What the prompt tells your agent](how-to/ai-coding-agents.md)

## One library, everywhere <a id="learn-once-translate-everywhere"></a>

The same translation files, the same format and the same `t()` work in [React](/react), [Next.js](/next), [Astro](/astro), [React Native](/react/react-native), [Node.js](overview/environments.md) and [Vue](https://github.com/i18next/i18next-vue). A text translated once serves your app, your site and your mobile app.

At least 1,188 of the 100,000 most linked websites run i18next in their own code (scan of 2026-11), from X, NBA and DeepL to Lufthansa, Strava and UEFA: [who uses i18next](/blog/who-uses-i18next).

## What there is <a id="complete-solution"></a><a id="flexibility"></a><a id="scalability"></a><a id="ecosystem"></a>

* **[Write translations](translation-function/essentials.md):** interpolation, plurals, context, formatting and nesting.
* **[TypeScript](overview/typescript.md):** typed keys, so a typo fails at compile time and your editor completes the keys.
* **[How it works](how-to/add-or-load-translations.md):** namespaces, loading translations, fallbacks and plugins.
* **[React](/react), [Next.js](/next) and [Astro](/astro):** documented here by the i18next team; more frameworks from the team and the community under [other frameworks and languages](overview/supported-frameworks.md).
* **[i18next-cli](/cli):** the tool your agent calls and your CI runs: extract the keys, report missing translations, lint.
* **[Formats](misc/json-format.md):** i18next's own format, MessageFormat (ICU) and MessageFormat 2, and other syntaxes and file formats.
