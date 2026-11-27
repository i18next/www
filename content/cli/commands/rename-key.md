---
description: "Rename a key in your code and in every translation file in one step."
---

# rename-key

Safely refactor translation keys across your entire codebase. This command updates both source files and translation files atomically.

```bash
npx i18next-cli rename-key <oldKey> <newKey> [options]
```

The plural forms of the key move with it (`cart.item_one`, `place_ordinal_one`, nested or flat, with your
`pluralSeparator`), and so do its context forms for the context values your code uses (`friend_male` and
`friend_male_one` for `t('friend', { context: 'male' })`, every value of a dynamic context). A key that only starts the
same way (`friend_list`) stays. Without `outputFormat`, each translation file keeps the format of its path (`.ts`,
`.yaml`, `.json`).

## Options

- `--dry-run`: Preview changes without modifying any files

## Examples

```bash
# Basic rename
npx i18next-cli rename-key "old.key" "new.key"

# With namespace prefix
npx i18next-cli rename-key "common:button.submit" "common:button.save"

# Preview changes without modifying files
npx i18next-cli rename-key "old.key" "new.key" --dry-run

# Refactor from mnemonic ID to meaningful key
npx i18next-cli rename-key "Invalid username or password" \
  "login.form.invalid-credentials"
```
