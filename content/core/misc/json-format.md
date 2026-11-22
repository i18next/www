---
description: "i18next's own message format: plain JSON, with placeholders, plurals and variants written into the keys and values. It is the default and works with every i18next feature and tool."
---

# i18next format

## At a glance <a id="i18next-json-v4"></a>

```json translation.json
{
  "welcome": "Welcome",
  "button": { "save": "Save" },
  "app": "i18next",
  "welcomeTo": "Welcome to $t(app)",
  "greeting": "Hello {{name}}",
  "greetingUnescaped": "Hello {{- name}}",
  "total": "Total: {{val, number}}",
  "invite": "Invite them",
  "invite_male": "Invite him",
  "invite_female": "Invite her",
  "item_one": "{{count}} item",
  "item_other": "{{count}} items",
  "steps": ["Install", "Configure", "Translate"],
  "menu": { "home": "Home", "blog": "Blog" }
}
```

Brackets and suffixes are the defaults; [Interpolation](../translation-function/interpolation.md#all-interpolation-options) and [Configuration options](../overview/configuration-options.md#keys) list the options that change them.

To learn more about the features check the documentation:

* [Interpolation](../translation-function/interpolation.md)
* [Formatting](../translation-function/formatting.md)
* [Plurals](../translation-function/plurals.md)
* [Context](../translation-function/context.md)
* [Nesting](../translation-function/nesting.md)
* [Objects and arrays](../translation-function/objects-and-arrays.md)

Your translators or tools expect ICU or MF2? See [Using ICU or MF2](../how-to/using-icu-or-mf2.md).
