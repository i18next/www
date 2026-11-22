---
description: "Split the translations into namespaces, so each route loads only the texts it needs."
---

# Namespaces

## Code-splitting translations (one namespace per route)

The extractor finds the namespace in your code (`useTranslation('checkout')`, `t('checkout:title')` or the `ns` option). With `{{namespace}}` in `output`, it writes one file per namespace and language:

```typescript
export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: 'src/**/*.{ts,tsx}',
    output: 'src/locales/{{language}}/{{namespace}}.json',
  }
});
```

How the app then loads only the namespaces a route needs: [Add or load translations](/how-to/add-or-load-translations) and [Namespaces](/principles/namespaces).

## Merging namespaces

You can also combine all namespaces into a single file per language. This is useful for reducing the number of network requests in some application setups.

Configuration (`i18next.config.ts`):

```typescript
export default defineConfig({
  extract: {
    // Note: The `output` path no longer contains the {{namespace}} placeholder
    output: 'src/locales/{{language}}.ts',
    outputFormat: 'ts',
    mergeNamespaces: true,
  }
});
```

This will generate a single file per language, like `src/locales/en.ts`, with namespaces as top-level keys:

```typescript
export default {
  "translation": {
    "key1": "Value 1"
  },
  "common": {
    "keyA": "Value A"
  }
} as const;
```

## Nested namespaces for type generation

When generating TypeScript types, namespaces are derived from the filename only by default (e.g., `locales/en/dashboard/user.json` → namespace: `user`). If you organize translation files in nested directories and want the generated types to preserve that structure as part of the namespace, use the `basePath` option in your `types` configuration.

Configuration (`i18next.config.ts`):

```typescript
export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'public/locales/{{language}}/{{namespace}}.json',
  },
  types: {
    input: 'public/locales/en/**/*.json',
    basePath: 'public/locales/en',
    output: 'src/types/i18next.d.ts',
    resourcesFile: 'src/types/resources.d.ts',
  }
});
```

With this configuration:
- `public/locales/en/common.json` → type namespace: `common`
- `public/locales/en/dashboard/user.json` → type namespace: `dashboard/user`
- `public/locales/en/dashboard/settings.json` → type namespace: `dashboard/settings`
- `public/locales/en/features/auth/login.json` → type namespace: `features/auth/login`

The `basePath` can include the `{{language}}` placeholder for flexibility:

```typescript
types: {
  input: 'public/locales/en/**/*.json',
  basePath: 'public/locales/{{language}}',
  output: 'src/types/i18next.d.ts',
  resourcesFile: 'src/types/resources.d.ts',
}
```

This is useful for organizing translations into logical groups while maintaining type safety across your entire namespace hierarchy.
