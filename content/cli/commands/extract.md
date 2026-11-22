---
description: "Write the keys your code uses into the translation files of every language, the same way at every run."
---

# extract

Parses source files, extracts keys, and updates your JSON translation files.

```bash
npx i18next-cli extract [options]
```

## Options

- `--watch, -w`: Re-run automatically when files change
- `--ci`: Exit with non-zero status if any files are updated (for CI/CD)
- `--dry-run`: Does not change any files. Useful in combination with `--ci` (for CI/CD)
- `--sync-primary`: Sync primary language values with default values from code
- `--sync-all`: Sync primary language values with default values from code AND clear synced keys in all other locales (implies `--sync-primary`)
- `--trust-derived`: When used with `--sync-primary` or `--sync-all`, also trust defaults inferred from keys such as `t('Hello')` or `keyPrefix`-derived values. This keeps the default sync behavior strict unless you opt in.
- `--with-types`: After extraction (and on every re-run in `--watch` mode), regenerate the TypeScript definitions whenever translation files changed. Avoids the need to run `extract -w` and `types -w` as two separate processes.
- `--quiet`: Suppress spinner and non-essential output (for CI or scripting)

## Examples

```bash
# One-time extraction
npx i18next-cli extract

# Watch mode for development
npx i18next-cli extract --watch

# CI mode (fails if files changed)
npx i18next-cli extract --ci

# Sync primary language with code defaults
npx i18next-cli extract --sync-primary

# Sync primary and clear synced keys in all other locales
npx i18next-cli extract --sync-all

# Sync using explicit defaults plus inferred key-derived defaults
npx i18next-cli extract --sync-all --trust-derived

# Combine options for optimal development workflow
npx i18next-cli extract --sync-primary --watch

# Keep TypeScript definitions in sync from a single process
# (no separate `types -w` needed)
npx i18next-cli extract --watch --with-types
```
