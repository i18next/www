---
description: "Check a project in one command, then set up the configuration and keep the translation files in step with your code."
---

# Getting started

## Try it without a configuration

In the root of a project that already uses i18next:

```bash
npx i18next-cli status
```

shows how complete each language is, and

```bash
npx i18next-cli lint
```

lists the texts in your code that are not wrapped in `t()` yet.

## Install and set up

```bash
npm install --save-dev i18next-cli
```

Create the configuration with [`init`](commands/init.md), which asks for the languages and where the files go, or write
`i18next.config.ts` yourself:

```typescript
import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{js,jsx,mjs,ts,tsx}'],
    output: 'public/locales/{{language}}/{{namespace}}.json',
  },
});
```

Then:

```bash
npx i18next-cli extract   # write the keys into the translation files
npx i18next-cli status    # what is missing per language
npx i18next-cli types     # optional: TypeScript types for the keys
```

All options are in [Configuration](configuration.md). Coming from i18next-parser? [`migrate-config`](commands/migrate-config.md)
converts its configuration.

## Files other than JavaScript and TypeScript

i18next-cli reads JavaScript and TypeScript files (`.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`). Adding other extensions to `extract.input` is not enough: other
file types need a [plugin](guides/plugins.md). There is an official one for Astro,
[i18next-cli-plugin-astro](https://github.com/i18next/i18next-cli-plugin-astro) (see [Getting started with Astro](/astro/getting-started#5-extract-keys-and-check-every-language)), and
community plugins for [Vue](https://github.com/PBK-B/i18next-cli-vue) and
[Svelte](https://github.com/dreamscached/i18next-cli-plugin-svelte).
