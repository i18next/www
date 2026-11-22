---
description: "When a text is missing, i18next looks further: in the broader language, in a fallback language, in a fallback namespace, and last it shows the key."
---

# Fallback

## The order <a id="core-elements"></a><a id="keys"></a><a id="example"></a><a id="example-1"></a><a id="example-2"></a><a id="languages"></a><a id="namespaces"></a><a id="resolution-order"></a><a id="id-1.-similar-keys"></a><a id="id-2.-languages"></a><a id="id-3.-namespaces"></a><a id="id-4.-fallback-keys"></a><a id="id-5.-key-not-found"></a>

For each key, i18next tries these steps in order and stops at the first text it finds:

1. **The key's forms**, from the most specific: with context and plural (`key_male_other`), with context (`key_male`), with plural (`key_other`), then the plain key ([Plurals](../translation-function/plurals.md#when-a-plural-form-is-missing), [Context](../translation-function/context.md)).
2. **The languages**: the current one, its broader language (`de` for `de-CH`), then `fallbackLng` ([Language fallback](#language-fallback)).
3. **The namespaces**: the current one, then `fallbackNS`; each namespace goes through all languages first ([Namespace fallback](#namespace-fallback)).
4. **Fallback keys**: the next key of an array, `t(['specific', 'general'])`, through the same steps ([Calling with fallback keys](#calling-with-fallback-keys)).
5. **The key itself**, the last one of an array ([Key not found](#key-not-found)).

## Language fallback

### Variant resolving: fallback from dialects or scripts

If a key is missing in a variant (with a region or script, such as `en-GB`), i18next looks in the broader language (`en`). So write the common texts in the language and only what differs in the variant.

```javascript
i18next.init({
  lng: 'en-GB',
  resources: {
    'en-GB': { translation: { i18n: 'Internationalisation' } },
    en: { translation: { i18n: 'Internationalization', i18n_short: 'i18n' } }
  }
});

i18next.t('i18n'); // -> "Internationalisation"
i18next.t('i18n_short'); // -> "i18n", from en
i18next.t('i18n', { lng: 'en' }); // -> "Internationalization"
```

### Fallback to different languages

If you cannot provide the preferred language for a user, you can specify another language as a fallback. This is useful to indicate the main language or, for instance, if you want to keep the fallbacks different per region.

```javascript
// fallback to one language
i18next.init({
    fallbackLng: 'en'
});

// fallback ordered
i18next.init({
    fallbackLng: ['fr', 'en']
});

// fallback depending on user language
i18next.init({
    fallbackLng: { 
        'de-CH': ['fr', 'it'], //French and Italian are also spoken in Switzerland
        'zh-Hant': ['zh-Hans', 'en'],
        'es': ['fr'],
        'default': ['en']
    }
});

// a function: the variant, then its language, then en
i18next.init({
  fallbackLng: (code) => {
    const lang = code.split('-')[0]; // 'de-CH' -> 'de'
    return lang === code ? [code, 'en'] : [code, lang, 'en'];
  }
});
```

There is no fallback language by default; set `fallbackLng` to the language your app is written in.

## Namespace fallback

If a key is missing in the current [namespace](namespaces.md), `fallbackNS` lists the namespaces to look in next:

```javascript
// app.json: { "title": "i18next" }
// common.json: { "button": { "save": "Save" } }
i18next.init({ ns: ['app', 'common'], defaultNS: 'app', fallbackNS: 'common' });

i18next.t('title'); // -> "i18next"
i18next.t('button.save'); // -> "Save", from common
```

## Key fallback

### Key not found

If a key does not return a value, the key acts as a fallback:

```javascript
i18next.t('notExistingKey'); // -> "notExistingKey"
```

A raw key in your UI means a translation is missing; [`i18next-cli status`](/cli/commands/status) lists them before you release.

Keys can be the text itself, so the key is the fallback instead of a fallback language. Then a changed text changes its key, in the code and in every file.

```javascript
// de.json: { "Save changes": "Änderungen speichern" }
i18next.init({
  lng: 'de',
  nsSeparator: false, // keys may contain ':' and '.'
  keySeparator: false,
  fallbackLng: false
});

i18next.t('Save changes'); // -> "Änderungen speichern"
i18next.t('Delete account'); // -> "Delete account" (not translated yet)
```

### Missing values for existing keys

An empty string in a file counts as missing, so the fallback applies (`returnEmptyString: false`, the default).

### Calling with fallback keys

An array of keys returns the first that exists: see [Multiple fallback keys](../translation-function/essentials.md#multiple-fallback-keys).
