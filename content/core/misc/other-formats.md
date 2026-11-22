---
description: "Besides the i18next format and ICU or MF2, i18next reads other message syntaxes through plugins, and other file formats through the CLI or a converter."
---

# Other formats

## Other message syntaxes

These are `i18nFormat` plugins: like ICU and MF2 they replace i18next's own syntax, so the same features stop working ([Using ICU or MF2](../how-to/using-icu-or-mf2.md#what-stops-working)).

* **Fluent:** [i18next-fluent](https://github.com/i18next/i18next-fluent) (for React, see its [README](https://github.com/i18next/i18next-fluent#readme)).
* **Shopify's format:** [@shopify/i18next-shopify](https://github.com/Shopify/i18next-shopify), with `{name}` placeholders and plural forms as nested keys.

## Other file formats

The i18next syntax stays; only the file differs.

* **JavaScript, TypeScript and YAML:** [i18next-cli](/cli/guides/file-formats) reads and writes them.
* **gettext PO:** [i18next-conv](https://github.com/i18next/i18next-gettext-converter) converts PO files to i18next JSON and back.
