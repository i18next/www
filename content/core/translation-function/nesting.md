---
description: "A translation can contain another one: `$t(key)` puts its text in place, so a term is written once."
---

# Nesting

## Basic

```javascript
// translation.json: { "app": "i18next", "welcome": "Welcome to $t(app)" }
i18next.t('welcome'); // -> "Welcome to i18next"
```

A key from another namespace takes the namespace first: `$t(common:app)`.

## Passing options to nestings

A nested key takes options as JSON after a comma, for example the count from the outer call:

```json translation.json
{
  "girlsAndBoys": "They have $t(girls, {\"count\": {{girls}} }) and $t(boys, {\"count\": {{boys}} })",
  "boys_one": "{{count}} boy",
  "boys_other": "{{count}} boys",
  "girls_one": "{{count}} girl",
  "girls_other": "{{count}} girls"
}
```

```javascript
i18next.t('girlsAndBoys', { girls: 3, boys: 2 });
// -> "They have 3 girls and 2 boys"
```

{% hint style="info" %}
Make sure the options string is valid JSON and can be parsed using JSON.parse:

`"sampleKey": "test $t(nest2, { \"changedVarName\": \"{{var}}\" })"`
{% endhint %}

<a id="security-note-interpolated-values-inside-a-nesting-options-block"></a>Keep the default escaping for values inside `$t()` options; see [Security notes](../misc/security-notes.md#values-inside-t-options).

## Passing nesting to interpolated values <a id="passing-nesting-to-interpolated"></a>

```javascript
// translation.json: { "key1": "hello world", "key2": "say: {{val}}" }
i18next.t('key2', { val: '$t(key1)' }); // -> "say: hello world"
```

{% hint style="warning" %}
This works only with [`skipOnVariables`](interpolation.md#all-interpolation-options) set to `false` in the `interpolation` options. Turn it off only for values your own code sets; with user input it lets the input run `$t()` ([Security notes](../misc/security-notes.md#resolving-syntax-inside-values)).
{% endhint %}

<a id="additional-options"></a>The nesting syntax (`nestingPrefix`, `nestingSuffix`, `nestingOptionsSeparator`) can be changed: see [All interpolation options](interpolation.md#all-interpolation-options).
