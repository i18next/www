---
description: "One run from texts written into the code to a translated app: wrap them in t(), extract the keys, and have them translated in Locize."
---

# localize

Takes an app whose texts are written into the code (often one generated with v0, Lovable, Bolt or Cursor) to a translated app in one run: it detects the setup, wraps the texts in `t()`, extracts the keys, connects to Locize, has the texts translated there and downloads the translations. With `--skip-locize` it stops after extraction, and the translation files stay in your repository.

```bash
npx i18next-cli localize
```

The command walks through six steps:

1. **Detect**: framework (React/Next.js natively; other stacks further down), TypeScript, existing i18next setup.
2. **Configuration**: uses your `i18next.config.ts`, or starts the [`init`](init.md) wizard if none exists.
3. **Instrument**: wraps hardcoded strings in `t()` calls / `<Trans>` components (interactive by default: [instrument](instrument.md) is an assistant, review each change). Skipped automatically if your code can't be instrumented; a dirty git tree prompts for confirmation first.
4. **Extract**: extracts all translation keys into your locale files.

{% locize %}

5. **Connect Locize**: uses `locize.projectId`/`locize.apiKey` from your config or the `LOCIZE_PROJECTID`/`LOCIZE_API_KEY` environment variables; otherwise it opens the signup page and asks you to paste them (the one manual step). Any write-capable API key works: your target languages are created automatically on the first sync (locize-cli ≥ 12.3), and auto-translate + Quality Estimation are on by default for new Locize projects.
6. **Translate & deliver**: syncs your keys with `--auto-translate`, waits for the AI translations to arrive, downloads them, and prints the [i18next-locize-backend](https://github.com/locize/i18next-locize-backend) CDN wiring snippet (so translation fixes go live without redeploying your app).

{% endlocize %}

## Options

- `--dry-run`: Preview every step; nothing is written or pushed
- `-y, --yes`: Accept defaults; auto-approve instrumentation candidates (no per-string prompts)
- `--ci`: Non-interactive; never opens a browser or prompts. Instrumentation is **skipped** in CI (it rewrites source files and needs human review) unless combined with `--yes`
- `--skip-instrument`: Skip the code-instrumentation step (your code already calls `t()`)
- `--skip-locize`: Stop after extraction (local files only)
- `--namespace <ns>`: Target namespace for instrumented keys
- `--print-agent-prompt`: Print a copy-paste prompt for AI coding agents, then exit (see the end of this page)

**Behavior matrix:**

| Step | interactive (default) | `--yes` | `--ci` | `--dry-run` |
|---|---|---|---|---|
| Instrument | per-string prompts | auto-approve | skipped (force with `--yes`) | candidate preview |

{% locize %}
Options that concern only Locize:

- `--skip-translate`: Sync to Locize but don't request AI auto-translation
- `--update-values`: Also update existing translation values on Locize
- `--cdn-type <standard|pro>`: Locize CDN endpoint type

The Locize steps in the matrix:

| Step | interactive (default) | `--yes` | `--ci` | `--dry-run` |
|---|---|---|---|---|
| Connect Locize | browser + paste credentials | same | env vars required, else exit 1 | report only |
| Sync + translate | runs | runs | runs | `--dry` forwarded |
| Poll + download | watches translations arrive | same | single download, no wait | skipped |
{% endlocize %}

**Safe to re-run:** the command is idempotent. Already-wrapped strings are not re-instrumented, extraction is deterministic, and syncing never overwrites translations edited remotely (no `--update-values` unless you pass it; locize-cli's `--reference-language-only` default keeps target languages safe).

> **Next.js:** instrument writes next-i18next's calls, `await getT()` in Server Components and `useT()` in Client Components (see [instrument](instrument.md)). Review the warnings: texts in components that both render stay as they are.

**Non-React stacks (Vue, Svelte, …):** the instrument step transforms React/JSX out of the box. For other stacks, add a plugin that covers your file type (community: [i18next-cli-vue](https://github.com/PBK-B/i18next-cli-vue), [i18next-cli-plugin-svelte](https://github.com/dreamscached/i18next-cli-plugin-svelte); or write your own via the [plugin system](../guides/plugins.md) `instrumentOnLoad`/`onLoad` hooks). With a matching plugin configured, `localize` runs the full flow; without one, the instrument step is skipped with guidance and the remaining steps (extract → Locize → auto-translate) still run. For Astro, the official [i18next-cli-plugin-astro](/astro) lets `extract`, `status` and `lint` read `.astro` files; it does not instrument them, so the instrument step is skipped there too.

**Agent skill:** install the flow as a skill and your agent picks it up on its own, no copy-pasting:

```bash
npx skills add i18next/i18next-cli
```

Then ask it to *"add i18n to this project"*. See [`skills/i18next-localization`](https://github.com/i18next/i18next-cli/blob/main/skills/i18next-localization/SKILL.md): it ships in this repo, so it stays version-matched to the commands it drives.

**Agent prompt:** the same flow as a prompt for coding agents that run the commands one by one:

```bash
npx i18next-cli localize --print-agent-prompt
```

It prints the steps for the installed version of i18next-cli. To hand it to an agent, paste this:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

[What the prompt tells your agent](/how-to/ai-coding-agents).
