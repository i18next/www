---
description: "Move from i18next-parser to i18next-cli, with the configuration converted for you."
---

# Migration from i18next-parser

Convert your `i18next-parser.config.js`:

```bash
npx i18next-cli migrate-config
```

This will:
- Convert your existing configuration to the new format
- Map old options to new equivalents
- Preserve custom settings where possible
- Create a new `i18next.config.ts` file

i18next-cli needs Node.js 22 or newer (i18next-parser also ran on Node.js 18 and 20), so a CI image may need a newer runtime.

{% hint style="warning" %}
Unlike i18next-parser, i18next-cli takes full ownership of the translation files in the output directory. Keep files you manage by hand in another directory or under other names.
{% endhint %}
