---
description: "i18next-cli is what your agent calls and your CI checks: it finds the keys in your code, writes them into the translation files and reports what is missing."
---

# i18next-cli

**Set up i18next with your coding agent** <a id="with-a-coding-agent"></a>\
Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

The CLI prints the steps for the version it installs: wrap the texts in `t()`, extract the keys, check every language. You review the diff, and the translation files stay in your repository unless you choose a translation management service. The same flow as one command is [`localize`](commands/localize.md).\
⇒ [What the prompt tells your agent](/how-to/ai-coding-agents)

i18next-cli is what your agent calls and your CI checks. It reads your code with [SWC](https://swc.rs), a parser
written in Rust, and works from one configuration file:

- **The same extraction at every run.** [`extract`](commands/extract.md) finds the keys your code uses and writes them
  into the translation files, the same way each time, so an agent does not have to read every file to find them.
- **Checks that need no agent.** [`status`](commands/status.md) exits non-zero when a translation is missing; in CI it
  stops the build before a missing text goes live. [`lint`](commands/lint.md) finds texts that are not wrapped in `t()`
  and placeholders that do not match.
- **The steps of the installed version.** `localize --print-agent-prompt` prints the steps for an agent, matched to the
  version in your project (the prompt above).

Besides: [TypeScript types](commands/types.md) for the keys, [other languages kept in sync](commands/sync.md) with the
primary language, and [wrapping texts](commands/instrument.md) that are written into the code in `t()` calls.

It follows how i18next is used, not only plain `t('key')`: `useTranslation('ns', { keyPrefix })`, `getFixedT`, aliased
`t` functions, `<Trans>`, plurals and context. The [supported patterns](reference/supported-patterns.md) list them.

To try it, install it and set it up: [Getting started](getting-started.md). <a id="try-it-without-a-configuration"></a><a id="install-and-set-up"></a><a id="files-other-than-javascript-and-typescript"></a>
