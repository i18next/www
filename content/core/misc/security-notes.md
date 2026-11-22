---
description: "i18next escapes the values it inserts and leaves the syntax inside them alone. These notes are for when you change that."
---

# Security notes

## Turning escaping off

By default i18next HTML-escapes every value it inserts into a text (`escapeValue: true`), so a value cannot add markup. Two things insert a value as it is: `escapeValue: false` in the `interpolation` options, for every call or for one, and `{{- var}}` in a text (see [Unescape](../translation-function/interpolation.md#unescape)).

Turn escaping off only where the output is not HTML or something else escapes it later, as React does. Otherwise escape any user input yourself before you pass it to `t()`.

## Resolving syntax inside values

By default a value is inserted as text: a value that contains `{{…}}` or `$t(…)` stays as it is (`skipOnVariables: true`). With `skipOnVariables: false`, i18next resolves that syntax too, so a value can pull in other keys with `$t(…)` and other values of the call with `{{…}}`. Set it only for values your own code sets; with user input, the input decides which texts are shown.

## Values inside `$t()` options

{% hint style="warning" %}
Inside `$t()` options, use `{{var}}` for user input, never `{{- var}}`.
{% endhint %}

Since i18next **27.2.3**, a `{{var}}` inside the options of a `$t(key, { ... })` is escaped for the options' JSON, whatever `escapeValue` is. A value cannot end its string or add options: it reaches the nested lookup unchanged, and the nested lookup escapes it once, as a direct `t()` call does.

The one form that still inserts a value unescaped there is `{{- var}}`. A user-controlled value in it can break out of the JSON options literal and inject additional options:

```json translation.json
{
  "title": "$t(greeting, { \"name\": \"{{- userName}}\" })",
  "greeting": "Hello {{name}}"
}
```

```javascript
// userInput from a query string, a form, …
i18next.t('title', { userName: userInput })
```

If `userInput` is `1", "lng": "xx`, the substituted options string becomes `{ "name": "1", "lng": "xx" }`: the injected `lng` sends the nested lookup to a language the attacker chose, and `t()` returns that language's `greeting` ("Hello 1" in it). With `{{userName}}` instead, the same input stays text: `t()` returns `Hello 1&quot;, &quot;lng&quot;: &quot;xx`, the input HTML-escaped. In combination with a translation that contains raw HTML this can escalate to DOM XSS when the output is rendered into the page.

i18next logs a warning (at `warn` level, via the library's configured logger) when a translation uses `{{- var}}` inside a `$t()` options block, so you can spot it during development.

**Mitigation:** use `{{var}}` inside nesting options. Keep `{{- var}}` there for values your own code produces, like a formatter that returns the options, and never for user input.

Before 27.2.3, `{{var}}` was open to the same with `escapeValue: false`; update, or keep `escapeValue: true`.

## Security advisories

Reported vulnerabilities and the versions that fix them: [i18next's security advisories on GitHub](https://github.com/i18next/i18next/security/advisories).
