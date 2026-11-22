---
description: "Translate an Astro site with plain i18next: Astro gives each language its address, i18next the texts, and a static build ships no JavaScript for it."
---

# i18next in Astro

**Set up i18next in Astro with your coding agent**\
Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

Your agent follows the steps the CLI prints for your project and writes the translation files; you review the diff, and the files stay in your repository unless you choose a translation management service. The CLI does not wrap texts in `.astro` files yet.\
⇒ [What the prompt tells your agent](/how-to/ai-coding-agents)

In Astro, a page file under `src/pages/[lang]/` gives every language its own address (`/en/`, `/de/`), and Astro's
[built-in i18n routing](https://docs.astro.build/en/guides/internationalization/) adds the redirect and the URL helpers. It has no `t()`: no plurals, no interpolation, no fallbacks. Plain
i18next adds them while Astro renders the pages. In a static build it runs only at build time: the test of 2026-11-19
(Astro 7.4.13, i18next 27.2.2) wrote one HTML file per language and page, with no JavaScript file and no script tag.

No integration package is needed. You need three things: i18next, your translation files, and for the checks
[`i18next-cli`](/cli) with [`i18next-cli-plugin-astro`](https://github.com/i18next/i18next-cli-plugin-astro).

## What there is

* **[Getting started](getting-started.md):** one address per language, i18next once for the whole build, the pages, the language switch with hreflang. <a id="1-one-address-per-language"></a><a id="2-i18next-once-for-the-whole-build"></a><a id="3-pages"></a><a id="4-language-switch-and-hreflang"></a>
* **[The CLI plugin](getting-started.md#5-extract-keys-and-check-every-language):** `extract`, `status` and `lint` read `.astro` files, and a missing translation stops the build. <a id="5-extract-keys-and-check-every-language"></a>
* **[When the texts change, and interactive parts](getting-started.md#when-the-texts-change-and-interactive-parts):** a changed text needs a new build; an interactive island uses the binding of its framework. <a id="when-the-texts-change-and-interactive-parts"></a>
