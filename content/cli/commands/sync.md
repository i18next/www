---
description: "Bring the files of the other languages in line with the primary language: add the missing keys, remove the ones that are gone."
---

# sync

Synchronizes secondary language files against your primary language file, adding missing keys and removing extraneous ones.

```bash
npx i18next-cli sync
```

## Options

- `--changed-only`: Only sync the keys that changed on the current git branch. The primary-language files are diffed against the merge-base with the base branch, and only added/modified keys are propagated to the secondary languages; nothing is removed. Changed keys are scoped per source file (the same bare key name in another namespace does not match), and when any plural variant of a key changed, all its plural forms are included (target languages often need more CLDR plural forms than the source). Requires git and JSON/JSON5/YAML translation files
- `--base <ref>`: Base branch/ref for `--changed-only` (default: auto-detect `origin/HEAD`, then `main`, then `master`). In CI, make sure the base branch is fetched: e.g. `actions/checkout` with `fetch-depth: 0`
