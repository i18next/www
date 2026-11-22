---
description: "Interpolation puts values into a text at run time: a name, a count, a date."
---

# Interpolation

## Basic

A placeholder is a name in double curly braces; `t()` replaces it with the value of the same name.

```javascript
// translation.json: { "greeting": "Hello {{name}}" }
i18next.t('greeting', { name: 'Ana' }); // -> "Hello Ana"
```

## Working with data models

You can also pass entire data models as a value for interpolation.

```javascript
// translation.json: { "key": "I am {{author.name}}" }
const author = { 
    name: 'Jan',
    github: 'jamuhl'
};
i18next.t('key', { author });
// -> "I am Jan"
```

## Unescape

By default, the values get escaped to mitigate XSS attacks. You can toggle escaping off by either putting `-` before the key or setting the `escapeValue` option to `false` when requesting a translation.

```json translation.json
{
  "keyEscaped": "no danger {{myVar}}",
  "keyUnescaped": "dangerous {{- myVar}}"
}
```

```javascript
i18next.t('keyEscaped', { myVar: '<img />' });
// -> "no danger &lt;img /&gt;"

i18next.t('keyUnescaped', { myVar: '<img />' });
// -> "dangerous <img />"

i18next.t('keyEscaped', {
  myVar: '<img />',
  interpolation: { escapeValue: false }
});
// -> "no danger <img />"
```

{% hint style="warning" %}
**If you turn escaping off, escape any user input yourself.** Before i18next 27.2.3, a value inside a `$t()` nesting-options block could also inject options when `escapeValue` is false; since 27.2.3 it is escaped there. [Security notes](../misc/security-notes.md#turning-escaping-off) shows what turning it off means and the mitigations.
{% endhint %}

## All interpolation options <a id="additional-options"></a>

The options go in `init` for every call, or in a single call of `t()`:

```javascript
i18next.init({
    interpolation: { ... }
});

i18next.t('key', {
    interpolation: { ... }
});
```

Placeholder syntax:

* `prefix` (default `{{`) and `suffix` (default `}}`): other brackets around a placeholder.

Escaping (see [Unescape](#unescape) above):

* `escapeValue` (default `true`): escapes the values you pass, against XSS; turn it off only where the output is not HTML or is escaped later, as React does.
* `escape` (default: replaces `&`, `<`, `>`, `"` and `'` with HTML entities): your own escape function.
* `useRawValueToEscape` (default `false`): passes the value to `escape` as it is, not turned into a string first; for an escape function that checks types itself.
* `unescapePrefix` (default `-`) and `unescapeSuffix` (default none): the mark inside a placeholder that turns escaping off for it, as in `{{- myVar}}`.

Values:

* `defaultVariables` (default none): values every `t()` call gets, unless the call passes its own.
* `skipOnVariables` (default `true`; `false` before v21): a value that contains `{{…}}` or `$t(…)` is used as it is, not resolved. Keep it true when values come from users or outside sources.
* `maxReplaces` (default `1000`): how many replacements one text may run before i18next stops, so a value that refers back to itself cannot loop forever.

Explained on their own page:

* `formatSeparator` (default `,`) and `alwaysFormat` (default `false`): the separator between value and format, as in `{{val, number}}`, and formatting every value, also one without a format ([Formatting](formatting.md)).
* `nestingPrefix` (default `$t(`), `nestingSuffix` (default `)`) and `nestingOptionsSeparator` (default `,`): the syntax of a nested key ([Nesting](nesting.md)).
