---
description: "Write the translation files as JavaScript, TypeScript or YAML instead of JSON."
---

# Translation file formats

## JavaScript and TypeScript translation files

For projects that prefer to keep everything in a single module type, you can configure the CLI to output JavaScript or TypeScript files instead of JSON.

Configuration (`i18next.config.ts`):

```typescript
export default defineConfig({
  extract: {
    output: 'src/locales/{{language}}/{{namespace}}.ts', // Note the .ts extension
    outputFormat: 'ts', // Use TypeScript with ES Modules
  }
});
```

This will generate files like `src/locales/en/translation.ts` with the following content:

```typescript
export default {
  "myKey": "My value"
} as const;
```

## YAML translation files

For projects that prefer YAML for better readability and compatibility with other tools, you can configure the CLI to output YAML files instead of JSON.

Configuration (`i18next.config.ts`):

```typescript
export default defineConfig({
  extract: {
    output: 'locales/{{language}}/{{namespace}}.yaml', // Use .yaml or .yml
    outputFormat: 'yaml', // Optional - inferred from file extension
  }
});
```

This will generate files like `locales/en/translation.yaml` with the following content:

```yaml
app:
  title: My Application
  description: Welcome to our app
button:
  save: Save
  cancel: Cancel
```

> **Note:** Both `.yaml` and `.yml` extensions are supported and preserved. The `outputFormat: 'yaml'` option is optional when using these extensions: the format is automatically inferred from the file extension.
