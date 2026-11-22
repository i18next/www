---
description: "A component names the namespaces it needs, and react-i18next loads them before it renders."
---

# Namespaces in components

Each namespace is a translation file of its own, for example `common.json` and `admin.json`; [Namespaces](/principles/namespaces) explains how i18next uses them.

```jsx
import { Trans, useTranslation } from 'react-i18next';

function AdminPage() {
  const { t } = useTranslation(['common', 'admin']);

  return (
    <>
      <h1>{t('title', { ns: 'admin' })}</h1>
      <Trans i18nKey="hint" ns="admin" components={{ bold: <strong /> }} />
      <button>{t('button.save')}</button>
    </>
  );
}
```

```json public/locales/en/common.json
{
  "button": { "save": "Save" }
}
```

```json public/locales/en/admin.json
{
  "title": "User management",
  "hint": "Changes apply <bold>right away</bold>."
}
```

`t` looks in the first namespace, `common`; `{ ns: 'admin' }` looks in the second. `Trans` takes the namespace in `ns`, or uses the namespace of the `t` from the hook when you pass it as `t={t}`. The component waits until both namespaces are loaded, so wrap it in React's `Suspense` ([useTranslation](../latest/usetranslation-hook.md)).

The older ways do the same: [withTranslation](../latest/withtranslation-hoc.md) for class components, and the [Translation render prop](../latest/translation-render-prop.md) with the namespaces in `ns`.

## Separating translation files

Load only the namespaces a page needs; the rest load when a component asks for them. How to load them: [Add or load translations](/how-to/add-or-load-translations).
