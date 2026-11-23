---
description: "Translators need whole sentences: a sentence built from pieces at run time cannot be right in every language."
---

# Best practices

## 1. Keep sentences whole <a id="implications-of-interpolation-for-localization"></a><a id="example"></a>

Use placeholders only for values known at run time, such as times and user input. A value that is known before, such as a payment type, becomes its own whole sentence.

```json en/translation.json
{
  "fees": "All fees will be charged to the {{paymentType}} on file for this account."
}
```

```json de/translation.json
{
  "fees": "Alle Beträge werden dem {{paymentType}} für dieses Konto in Rechnung gestellt."
}
```

German needs a different article before each payment type:

```javascript
i18next.t('fees', { paymentType: 'Kreditkarte' });
// -> "Alle Beträge werden dem Kreditkarte für dieses Konto in Rechnung gestellt."
// wrong: 'dem Kreditkarte' should be 'der Kreditkarte'
i18next.t('fees', { paymentType: 'PayPal-Konto' });
// -> "Alle Beträge werden dem PayPal-Konto für dieses Konto in Rechnung gestellt."
// right
```

Instead, one whole sentence per payment type: two keys (`feesCreditCard`, `feesPaypal`), or one key with a [context](../translation-function/context.md) (`fees_creditCard`, `fees_paypal`):

```json en/translation.json
{
  "fees_creditCard": "All fees will be charged to the credit card on file for this account.",
  "fees_paypal": "All fees will be charged to the PayPal account on file for this account."
}
```

## 2. Let i18next pick the plural

Pass `count` instead of `if (count === 1)` in your code: some languages have six plural forms ([Plurals](../translation-function/plurals.md)).

## 3. Variants with context, not with pieces

A variant of a sentence, for example for the person addressed, is a whole sentence under a [context](../translation-function/context.md), not a word put into a sentence.

## 4. Numbers and dates through a format

Never build a number or a date as text; a [format](../translation-function/formatting.md) in the placeholder writes it the way each language expects.

## 5. Name keys by meaning

Name a key by what it is for (`button.save`), not by its text; otherwise a changed text changes its key, in the code and in every file ([Key fallback](fallback.md#key-not-found)).

## 6. One key per meaning

The same English word may need two translations elsewhere: "Open" as a verb ("Open the file") and as an adjective ("The shop is open") get two keys.

## 7. Keep markup in the sentence

Links and emphasis stay inside the sentence with [`Trans`](/react/latest/trans-component), not a sentence split around them.

## 8. Leave room for longer texts

Translations are often longer than English: don't size buttons and labels to the English length, and put no text in images.

## 9. Keep the files in sync

Run `extract` after each change and `status` in CI ([Extracting translations](../how-to/extracting-translations.md)).
