---
description: "Numbers, dates and currencies look different in every language; a format in the placeholder writes them the way the language expects."
---

# Formatting

## Basic usage

A format follows the value's name in the placeholder, after a comma. The built-in formats use the browser's or Node.js's [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

```javascript
// translation.json: { "total": "Total: {{val, number}}" }
i18next.t('total', { val: 1000 }); // -> "Total: 1,000"
```

A format takes options in three ways; each of these writes "Total: 1,000.00":

```json translation.json
{
  "totalTwo": "Total: {{val, number(minimumFractionDigits: 2)}}"
}
```

```javascript
// 1. in the text, in brackets; several options separated by semicolons
i18next.t('totalTwo', { val: 1000 });

// 2. in the call
i18next.t('total', { val: 1000, minimumFractionDigits: 2 });

// 3. per value, when a text has several values
i18next.t('total', {
  val: 1000,
  formatParams: { val: { minimumFractionDigits: 2 } }
});
```

<a id="additional-options"></a>Two settings of interpolation concern formatting, `formatSeparator` and `alwaysFormat`: see [All interpolation options](interpolation.md#all-interpolation-options).

### Overriding the language <a id="overriding-the-language-to-use"></a>

A value is formatted in the language of the call. To format it in another one, pass `lng` (or `locale`) in the call or for the one value:

```javascript
i18next.t('total', { val: 1000.1, lng: 'de' }); // -> "Total: 1.000,1"
i18next.t('total', { val: 1000.1, formatParams: { val: { lng: 'de' } } });
// -> "Total: 1.000,1"
```

### Using multiple formatters

Several formats after one value run from left to right (here two of your own, added as under [Custom formatter](#custom-formatter)):

```javascript
// translation.json: { "path": "File: {{name, lowercase, underscore}}" }
i18next.t('path', { name: 'My Report' }); // -> "File: my_report"
```

## Built-in formats

### Number

`number`, as under [Basic usage](#basic-usage). For options see [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).

### Currency

```json translation.json
{
  "price": "Price: {{val, currency(USD)}}",
  "priceExplicit": "Price: {{val, currency(currency: USD)}}",
  "priceTwo": "Price: {{localValue, currency}} or {{altValue, currency}}"
}
```

```javascript
i18next.t('price', { val: 2000 }); // -> "Price: $2,000.00"
i18next.t('priceExplicit', { val: 2300 }); // -> "Price: $2,300.00"
i18next.t('priceTwo', {
  localValue: 12345.67,
  altValue: 16543.21,
  formatParams: {
    localValue: { currency: 'USD', locale: 'en-US' },
    altValue: { currency: 'CAD', locale: 'fr-CA' }
  }
}); // -> "Price: $12,345.67 or 16 543,21 $"
```

For options see [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).

### DateTime

```javascript
// translation.json: { "due": "Due on {{val, datetime}}" }
const date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
i18next.t('due', { val: date }); // -> "Due on 12/20/2012"
i18next.t('due', {
  val: date,
  formatParams: {
    val: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }
}); // -> "Due on Thursday, December 20, 2012"
```

For options see [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

### RelativeTime

```json translation.json
{
  "dueIn": "Due {{val, relativetime}}",
  "updated": "Updated {{val, relativetime(quarter)}}",
  "updatedNarrow": "Updated {{val, relativetime(range: quarter; style: narrow;)}}"
}
```

```javascript
i18next.t('dueIn', { val: 3 }); // -> "Due in 3 days"
i18next.t('updated', { val: -3 }); // -> "Updated 3 quarters ago"
i18next.t('updatedNarrow', { val: -3 }); // -> "Updated 3q ago"
i18next.t('updatedNarrow', { val: -3, style: 'long' });
// -> "Updated 3 quarters ago"
```

For options see [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat).

### List

```javascript
// translation.json: { "bought": "You bought {{val, list}}" }
i18next.t('bought', { val: ['apples', 'pears', 'plums'] });
// -> "You bought apples, pears, and plums"
```

For options see [Intl.ListFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat).

## Custom formatter

### Adding a custom format function <a id="adding-custom-format-function"></a>

Add your own format by name; it is then available in every text:

```javascript
// after i18next.init(options);
i18next.services.formatter.add('lowercase', (value, lng, options) => {
  return value.toLowerCase();
});
i18next.services.formatter.add('underscore', (value, lng, options) => {
  return value.replace(/\s+/g, '_');
});
```

{% hint style="warning" %}
Add a custom format function **after** the `i18next.init()` call.
{% endhint %}

`addCached` builds the formatter once per language and options, for formats that are expensive to create:

```javascript
i18next.services.formatter.addCached('specialformat', (lng, options) => {
  const formatter = new Intl.NumberFormat(lng, options);
  return (val) => formatter.format(val);
});
```

### A formatter plugin of your own

To format values that carry no format in the text, for example every date, replace the built-in formatter with a plugin and set `alwaysFormat`:

```javascript
const myFormatter = {
  type: 'formatter',
  init(services, i18nextOptions) {}, // for setup, if you need it
  format(value, format, lng, options) {
    // do whatever you like here... and return the formatted string
    if (!format && value instanceof Date) {
      return value.toUTCString()
    }
    return value
  },
  add(name, fc) {
    // handle adding a new format, if you need it
  },
  addCached(name, fc) {
    // handle adding a new cached format, if you need it
  }
}

i18next
  .use(myFormatter)
  .init({
    fallbackLng: 'en',
    interpolation: {
      alwaysFormat: true // set alwaysFormat to true
    },
    resources: {
      en: {
        translation: {
          testKeyWithoutFormat: 'On the "{{val}}"',
        }
      }
    }
  });

i18next.t('testKeyWithoutFormat', { val: new Date() })
// -> On the "Mon, 07 Jul 2025 11:44:50 GMT"
```
