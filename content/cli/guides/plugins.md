---
description: "Extend the CLI with plugins: other file types, and your own steps in extraction, linting and instrumenting."
---

# Plugin system

Create custom plugins to extend the capabilities of `i18next-cli`. The plugin system provides hooks for extraction, linting, and instrumentation, with a single unified `plugins` array.

## Hooks

- `setup`: Runs once at the start of each extraction (`extract`, every `--watch` re-run, `status`). Receives the plugin context (`config`, `logger`), so a plugin can read the i18next-cli config. Use it for any setup tasks.
- `onLoad`: Runs for each file *before* it is parsed. You can use this to transform code (e.g., transpile a custom language to JavaScript).
- `onVisitNode`: Runs for every node in the Abstract Syntax Tree (AST) of a parsed JavaScript/TypeScript file. This provides access to the full parsing context, including variable scope and TypeScript-specific syntax like `satisfies` and `as` operators.
- `onKeySubmitted`: Hook called synchronously for every translation key submitted to the extractor, including duplicates, before the deduplication decision is made.
- `extractKeysFromExpression`: Runs for specific expressions during AST traversal to extract additional translation keys. This is ideal for handling custom syntax patterns or complex key generation logic without managing pluralization manually.
- `extractContextFromExpression`: Runs for specific expressions to extract context values that can't be statically analyzed. Useful for dynamic context patterns or custom context resolution logic.
- `onEnd`: Runs after all JS/TS files have been parsed but *before* the final keys are compared with existing translation files. This is the ideal hook for parsing non-JavaScript files (like `.html`, `.vue`, or `.svelte`) and adding their keys to the collection.
- `afterSync`: Runs after the extractor has compared the found keys with your translation files and generated the final results. Use it for post-processing tasks, like generating a report of newly added keys. It also runs on a dry run, where no translation file was written: its third argument `{ isDryRun }` tells, so a plugin that writes files can skip that (`afterSync(results, config, { isDryRun }) { if (isDryRun) return; ... }`).

### Lint plugin hooks

- `lintSetup(context)`: Runs once before linting starts. Receives `LintPluginContext` with `config` and `logger`.
- `lintExtensions`: Optional extension hint (for example `['.vue']`). Used as a skip hint/optimization.
- `lintOnLoad(code, filePath)`: Runs before lint parsing for each file.
  - Return `string` to replace source code for linting. For a non-JS/TS file (such as `.astro`, `.vue`, `.svelte`) it is parsed as TSX, as `extract` parses `onLoad` output.
  - Return `undefined` to pass through unchanged. A non-JS/TS file no plugin returns code for is skipped.
  - Return `null` to skip linting the file entirely.
- `lintOnResult(filePath, issues)`: Runs after each file is linted. Return a new issues array to filter/augment results, or `undefined` to keep as-is.

### Instrument plugin hooks

- `instrumentSetup(context)`: Runs once before instrumentation starts. Receives `InstrumentPluginContext` with `config` and `logger`.
- `instrumentExtensions`: Optional extension hint (for example `['.vue']`). Used as a skip hint/optimization.
- `instrumentOnLoad(code, filePath)`: Runs before scanning each file for hardcoded strings.
  - Return `string` to replace source code before scanning.
  - Return `undefined` to pass through unchanged.
  - Return `null` to skip instrumenting the file entirely.
- `instrumentOnResult(filePath, candidates)`: Runs after candidates are detected. Return a new `CandidateString[]` to filter/augment results, or `undefined` to keep as-is.

### Default values of submitted keys

Native `t()` and `<Trans>` submissions include `defaultValueSource`: `'explicit'`
for supplied defaults, `'inferred'` for serialized JSX children, or `'fallback'`
for synthesized key text. When both submissions have this metadata, duplicate
keys prefer explicit defaults over inferred text over an empty default (`''`) over
fallbacks; equal-priority defaults keep the first occurrence. Plugins may also supply this optional field.
It is independent of `explicitDefault`, which controls whether existing plural
translations may be overwritten: a count-interpolated shorthand default can have
`defaultValueSource: 'explicit'` while `explicitDefault` remains `false`.

## Lint plugin API

```typescript
import type {
  Plugin,
  LinterPlugin,
  LintPluginContext,
  LintIssue,
} from 'i18next-cli';

// You can type your plugin as Plugin (full surface), LinterPlugin (lint-focused),
// or InstrumenterPlugin (instrument-focused)
export const vueLintPlugin = (): LinterPlugin => ({
  name: 'vue-lint-plugin',
  lintExtensions: ['.vue'],
  lintSetup: async (context: LintPluginContext) => {
    context.logger.info('vue lint plugin initialized');
  },
  lintOnLoad: async (code, filePath) => {
    if (!filePath.endsWith('.vue')) return undefined;
    // preprocess SFC/template to lintable JS/TS/JSX text
    return code;
  },
  lintOnResult: async (_filePath, issues: LintIssue[]) => {
    // Example: keep only interpolation issues
    return issues.filter(issue => issue.type === 'interpolation');
  }
});
```

## Instrument plugin API

```typescript
import type {
  InstrumenterPlugin,
  InstrumentPluginContext,
  CandidateString,
} from 'i18next-cli';

export const vueInstrumentPlugin = (): InstrumenterPlugin => ({
  name: 'vue-instrument-plugin',
  instrumentExtensions: ['.vue'],
  instrumentSetup: async (context: InstrumentPluginContext) => {
    context.logger.info('vue instrument plugin initialized');
  },
  instrumentOnLoad: async (code, filePath) => {
    if (!filePath.endsWith('.vue')) return undefined;
    // Extract template block from SFC and return as JSX-like code
    return code;
  },
  instrumentOnResult: async (_filePath, candidates: CandidateString[]) => {
    // Example: only keep high-confidence candidates
    return candidates.filter(c => c.confidence >= 0.5);
  }
});
```

The same `plugins` list serves `extract`, `lint` and `instrument`:

```typescript
import { defineConfig } from 'i18next-cli';
import { vueLintPlugin } from './plugins/vue-lint-plugin.mjs';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx,vue}'],
    output: 'locales/{{language}}/{{namespace}}.json'
  },
  plugins: [
    vueLintPlugin()
  ]
});
```

## Extraction plugin examples

A plugin that reads keys from `.vue` files:

```typescript
import { glob } from 'glob';
import { readFile, writeFile } from 'node:fs/promises';

export const myCustomPlugin = () => ({
  name: 'my-custom-plugin',

  // Handle custom file formats
  async onEnd(keys) {
    // Extract keys from .vue files
    const vueFiles = await glob('src/**/*.vue');
    for (const file of vueFiles) {
      const content = await readFile(file, 'utf-8');
      const keyMatches = content.matchAll(/\{\{\s*\$t\(['"]([^'"]+)['"]\)/g);
      for (const match of keyMatches) {
        keys.set(`translation:${match[1]}`, {
          key: match[1],
          defaultValue: match[1],
          ns: 'translation'
        });
      }
    }
  }
});
```

A plugin that reads keys and context from expressions and JSX:

```typescript
export const advancedExtractionPlugin = () => ({
  name: 'advanced-extraction-plugin',

  // Extract keys from template literals and `as` expressions
  extractKeysFromExpression: (expression, config, logger) => {
    const keys = [];

    // Handle template literals with variable substitutions
    if (expression.type === 'TemplateLiteral') {
      // Extract pattern: `user.${role}.permission`
      const variables = expression.expressions.map(e =>
        e.type === 'Identifier' ? e.value : 'dynamic'
      );

      if (variables.includes('role')) {
        // Generate keys for known roles
        keys.push(
          'user.admin.permission',
          'user.manager.permission',
          'user.employee.permission'
        );
      }
    }

    // Handle `as` expressions with a union of string literals
    if (expression.type === 'TsAsExpression' &&
        expression.typeAnnotation?.type === 'TsUnionType') {
      const unionTypes = expression.typeAnnotation.types;
      for (const unionType of unionTypes) {
        if (unionType.type === 'TsLiteralType' &&
            unionType.literal?.type === 'StringLiteral') {
          keys.push(`dynamic.${unionType.literal.value}.extracted`);
        }
      }
    }

    return keys;
  },

  // Extract context from conditional expressions
  extractContextFromExpression: (expression, config, logger) => {
    const contexts = [];

    // Handle ternary operators: isAdmin ? 'admin' : 'user'
    if (expression.type === 'ConditionalExpression') {
      if (expression.consequent.type === 'StringLiteral') {
        contexts.push(expression.consequent.value);
      }
      if (expression.alternate.type === 'StringLiteral') {
        contexts.push(expression.alternate.value);
      }
    }

    // Handle template literals: `${role}.${level}`
    if (expression.type === 'TemplateLiteral') {
      const parts = expression.expressions.map(expr =>
        expr.type === 'Identifier' ? expr.value : 'unknown'
      );
      if (parts.length > 0) {
        const joins = expression.quasis.map(quasi => quasi.cooked);
        contexts.push(joins.reduce((acc, join, i) =>
          acc + (join || '') + (parts[i] || ''), ''
        ));
      }
    }

    return contexts;
  },

  // Handle complex AST patterns
  onVisitNode: (node, context) => {
    // Custom extraction for specific component patterns
    if (node.type === 'JSXElement' &&
        node.opening.name.type === 'Identifier' &&
        node.opening.name.value === 'CustomTransComponent') {

      const keyAttr = node.opening.attributes?.find(attr =>
        attr.type === 'JSXAttribute' &&
        attr.name.value === 'translationKey'
      );

      if (keyAttr?.value?.type === 'StringLiteral') {
        context.addKey({
          key: keyAttr.value.value,
          defaultValue: 'Custom component translation',
          ns: 'components'
        });
      }
    }
  }
});
```

Both in the configuration:

```typescript
import { defineConfig } from 'i18next-cli';
import { myCustomPlugin, advancedExtractionPlugin } from './my-plugins.mjs';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx,vue}'],
    output: 'locales/{{language}}/{{namespace}}.json'
  },
  plugins: [
    myCustomPlugin(),
    advancedExtractionPlugin()
  ]
});
```

## Known plugins

- [i18next-cli-plugin-astro](/astro): the official plugin that lets `extract`, `status` and `lint` read `.astro` files
- [i18next-cli-plugin-svelte](https://github.com/dreamscached/i18next-cli-plugin-svelte): a simple plugin to extract translation keys from Svelte components
- [rsbuild-plugin-i18next-extractor](https://github.com/rspack-contrib/rsbuild-plugin-i18next-extractor): an Rsbuild plugin that leverages the Rspack module graph to extract only the i18n translations that are actually imported and used in your code, preventing unused translations from being bundled.
- [i18next-cli-vue](https://github.com/PBK-B/i18next-cli-vue): i18next-cli plugin for extracting i18n keys from Vue SFC files, applicable to Vue 2 and Vue 3
