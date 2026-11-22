---
description: "The same key can have a variant per situation, for example the gender of the person addressed; `context` picks it."
---

# Context

## Basic

```json translation.json
{
  "invite": "Invite them",
  "invite_male": "Invite him",
  "invite_female": "Invite her"
}
```

```javascript
i18next.t('invite'); // -> "Invite them"
i18next.t('invite', { context: 'male' }); // -> "Invite him"
i18next.t('invite', { context: 'female' }); // -> "Invite her"
```

A context without its own key falls back to the plain key: `t('invite', { context: 'other' })` returns "Invite them".

## Combining with plurals

With `count`, the plural suffix follows the context: `invite_male_one`, `invite_male_other`.

```json translation.json
{
  "invite_male_one": "Invite him",
  "invite_male_other": "Invite the {{count}} men",
  "invite_female_one": "Invite her",
  "invite_female_other": "Invite the {{count}} women"
}
```

```javascript
i18next.t('invite', { context: 'male', count: 1 }); // -> "Invite him"
i18next.t('invite', { context: 'male', count: 3 }); // -> "Invite the 3 men"
i18next.t('invite', { context: 'female', count: 1 }); // -> "Invite her"
i18next.t('invite', { context: 'female', count: 3 }); // -> "Invite the 3 women"
```
