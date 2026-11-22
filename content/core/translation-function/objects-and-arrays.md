---
description: "A key can hold an object or a list instead of one text; `t()` returns it whole, or joined into one text."
---

# Objects and arrays

Useful when a component renders several texts together, such as a menu or a list of steps. Interpolation, plurals and nesting work inside the returned values.

## Objects

```javascript
// translation.json: { "menu": { "home": "Home", "blog": "Blog" } }
i18next.t('menu', { returnObjects: true }); // -> { home: "Home", blog: "Blog" }
```

Without `returnObjects`, `t('menu')` returns the key, `"menu"` (with `debug: true` i18next logs that the key holds an object).

Set `returnObjects: true` in `init` to make it the default for every call ([Configuration options](../overview/configuration-options.md#translation-defaults)).

## Arrays

```json translation.json
{
  "steps": ["Install", "Configure", "Translate into {{language}}"]
}
```

```javascript
i18next.t('steps', { returnObjects: true, language: 'German' });
// -> ["Install", "Configure", "Translate into German"]

i18next.t('steps', { joinArrays: ' → ', language: 'German' });
// -> "Install → Configure → Translate into German"

i18next.t('steps.0'); // -> "Install"
```

Set `joinArrays` in `init` to make it the default for every call ([Configuration options](../overview/configuration-options.md#translation-defaults)).
