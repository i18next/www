---
description: "next-i18next brings i18next to Next.js: language in the address, Server and Client Components, and the translations handed from the server to the browser."
---

# next-i18next

**Set up next-i18next with your coding agent** <a id="with-a-coding-agent"></a>\
Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

Your agent wraps the texts in `await getT()` in Server Components and `useT()` in Client Components and writes the translation files; you review the diff, and the translation files stay in your repository unless you choose a translation management service.\
⇒ [What the prompt tells your agent](/how-to/ai-coding-agents)

Everything that is not specific to Next.js is [i18next](/) and [react-i18next](/react): the `t` function, plurals, interpolation, namespaces and the translation files. It works with the App Router, the Pages Router, and apps that use both.

## Where to start

- **A new App Router app:** [App Router setup](app-router/setup.md). Then choose how the language shows in the
  address: in the path (`/de/about`, the default), [without a prefix for the default language](app-router/hide-default-locale.md),
  [only in a cookie](app-router/no-locale-path.md), or [clean addresses that still prerender](app-router/internal-locale-mode.md).
- **An app on the Pages Router:** [Pages Router setup](pages-router/setup.md).
- **Both routers in one app:** [Mixed routers](guides/mixed-routers.md).
- **Coming from v15:** [Migration from v15](reference/migration-from-v15.md).
- **Complete projects:** the [examples](reference/examples.md) in the repository.

## What there is <a id="what-v16-brings"></a>

- **App Router:** `getT()` in Server Components, `useT()` in Client Components, `createProxy()` for language detection
  and routing.
- **Language in the path or not:** locale-in-path (`/en/about`), no-locale-path (the language in a cookie) and internal
  locale mode (clean addresses, static prerendering per language).
- **Mixed routers:** the App Router and the Pages Router in one app, scoped with `basePath`.
- **Any i18next backend:** `i18next-http-backend`, `i18next-chained-backend` and others, see
  [Custom backends](guides/backends.md).
- **A proxy without Node.js modules,** so it runs on the Edge runtime.
- **The Pages Router API:** `appWithTranslation` and `serverSideTranslations`, imported from `next-i18next/pages` and
  `next-i18next/pages/serverSideTranslations`.
