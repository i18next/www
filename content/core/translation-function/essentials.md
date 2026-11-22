---
description: "Every text you show goes through t(): you call it with a key, and it returns the text in the current language."
---

# Essentials

## Accessing keys

```javascript
// translation.json: { "welcome": "Welcome", "button": { "save": "Save" } }
i18next.t('welcome'); // -> "Welcome"
i18next.t('button.save'); // -> "Save"
```

A dot reaches into a nested object (`button.save`), a colon separates the namespace (`common:button.save`, see below). With the default separators, a key uses `.` and `:` for nothing else. A missing key returns the key itself; to write keys in natural language, see [key fallback](../principles/fallback.md#key-fallback).

## Passing a default value

You can pass in a default value for cases where the key could not be found in translations, like this:

```javascript
i18next.t('missingKey', 'default value to show'); // -> "default value to show"
```

## Accessing keys in different namespaces

Namespaces split your translations into several files (see [Namespaces](../principles/namespaces.md)).

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
```

## Multiple fallback keys

Pass an array of keys, and `t()` returns the first that exists: a specific text for keys built at run time, a general one as the last entry.

For example, a message for some error codes and a general one for the rest:

```json translation.json
{
  "error": {
    "unspecific": "Something went wrong.",
    "404": "The page was not found."
  }
}
```

```javascript
// const error = '404';
i18next.t([`error.${error}`, 'error.unspecific']);
// -> "The page was not found."

// const error = '502';
i18next.t([`error.${error}`, 'error.unspecific']);
// -> "Something went wrong."
```

<a id="overview-options"></a>All options of `t()` are listed in [Methods and events](../overview/api.md#t-options).
