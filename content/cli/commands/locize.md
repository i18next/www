---
description: "Keep the translation files in step with a Locize project: download, upload and migrate."
---

# Locize integration

{% locize %}
Locize is the translation management service of the i18next maintainers; these commands are only for projects that use it.
{% endlocize %}

**First-time setup:** to set up Locize, run
`npx i18next-cli init` and pick **Locize** at the "Translation backend?"
prompt: the wizard will open the signup page, ask for your Project ID
and API key, and write the `locize` block into your config for you. See
[the `init` command](init.md) for details.

**Prerequisites:** The Locize commands require `locize-cli` to be installed:

```bash
# Install globally (recommended)
npm install -g locize-cli
```

Sync translations with the Locize translation management platform:

```bash
# Download translations from Locize
npx i18next-cli locize-download

# Upload/sync translations to Locize
npx i18next-cli locize-sync

# Migrate local translations to Locize
npx i18next-cli locize-migrate
```

**Locize command options:**

The `locize-sync` command supports additional options:

```bash
npx i18next-cli locize-sync [options]
```

**Options:**
- `--update-values`: Update values of existing translations on Locize
- `--src-lng-only <true|false>`: Check for changes in source language only (default: `true`). Pass `--src-lng-only false` to sync all languages
- `--compare-mtime`: Compare modification times when syncing
- `--dry-run`: Run the command without making any changes
- `--auto-translate <true|false>`: Trigger AI/MT auto-translation of newly synced keys. Requires auto-translation in your Locize project (enabled by default for new projects; runs once the project is subscribed or an AI/MT provider is configured)
- `--auto-translate-review <true|false>`: Route auto-translated segments through the review workflow for languages that have review enabled
- `--auto-translate-languages <lng1,lng2>`: Restrict auto-translation to these target languages (defaults to all)
- `--changed-only`: Only sync and auto-translate the keys that changed on the current git branch compared to the base branch, for translating just a pull request's diff instead of the whole project. The source-language files are diffed against the merge-base with the base branch; key creation, value updates and auto-translation are restricted to those keys, and deletions are skipped. Keys are scoped per namespace file, and when any plural variant of a key changed, all its plural forms are included. Requires git and locize-cli >= 12.7
- `--base <ref>`: Base branch/ref for `--changed-only` (default: auto-detect `origin/HEAD`, then `main`, then `master`). In CI, make sure the base branch is fetched: e.g. `actions/checkout` with `fetch-depth: 0`

The same options can be set persistently in the `locize` block of your config:

```typescript
export default defineConfig({
  // ...
  locize: {
    projectId: '...',
    apiKey: process.env.LOCIZE_API_KEY,
    autoTranslate: true,
    autoTranslateReview: false,
    autoTranslateLanguages: ['de', 'fr'],
    changedOnly: true,          // only sync keys changed vs. the base branch
    changedOnlyBase: 'main',    // optional; auto-detected when omitted
  },
});
```

> **Note:** auto-translation only fires when the **reference language** is updated, and the translation itself happens asynchronously on the Locize side: run `locize-download` (or let [`localize`](localize.md) wait for you) to pull the results.

**Interactive setup:** If your Locize credentials are missing or invalid, the toolkit will guide you through an interactive setup process to configure your Project ID, API key, and version.
