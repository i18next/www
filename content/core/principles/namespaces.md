---
description: "Namespaces split your translations into several files, so texts that belong together stay together and each part of the app loads only what it needs."
---

# Namespaces

## Ways to split <a id="semantic-reasons"></a><a id="technical-editorial-reasons"></a>

* **common.json**: labels used everywhere, such as Save and Cancel.
* **validation.json**: all validation texts.
* **glossary.json**: terms that should read the same in every text.
* **One namespace per page or feature** (an admin area, a lazy-loaded module), loaded when it is needed.

## Sample

```javascript
i18next.init({
  ns: ['common', 'moduleA'],
  defaultNS: 'moduleA'
});

// moduleA.json: { "name": "Module A" }
// common.json: { "button": { "save": "Save" } }

// t() looks in moduleA, the defaultNS
i18next.t('name'); // -> "Module A"

// another namespace: the ns option
i18next.t('button.save', { ns: 'common' }); // -> "Save"

// or the prefix; not with natural-language keys, they may contain ':'
i18next.t('common:button.save'); // -> "Save"

// load another namespace after init
i18next.loadNamespaces('admin').then(() => {
  i18next.t('title', { ns: 'admin' });
});
```

`fallbackNS` lists namespaces to look in when a key is missing in the current one: with `fallbackNS: 'common'`, `t('button.save')` finds "Save" in common.

For details on how to load namespaces from files or a backend, see [Add or load translations](../how-to/add-or-load-translations.md).
