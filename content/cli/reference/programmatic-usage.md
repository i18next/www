---
description: "Run extraction, linting and the other commands from a build script or any Node.js program."
---

# Programmatic usage

In addition to the CLI commands, `i18next-cli` can be used programmatically in your build scripts, Gulp tasks, or any Node.js application.

## Basic programmatic usage

```typescript
import {
  runExtractor,
  runLinter,
  runSyncer,
  runStatus,
  runTypesGenerator,
} from 'i18next-cli';
import type { I18nextToolkitConfig } from 'i18next-cli';

const config: I18nextToolkitConfig = {
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
};

// Run the complete extraction process
const { anyFileUpdated, hasErrors } = await runExtractor(config);
console.log('Files updated:', anyFileUpdated);

// Print the translation status (exits the process with code 1 when
// translations are missing)
await runStatus(config);

// Run linting and get results
const { success, message, files } = await runLinter(config);
if (!success) {
  console.error(message);
  for (const [filename, issues] of Object.entries(files)) {
    console.error(`${issues.length} issues found in ${filename}.`);
  }
}

// Sync translation files
await runSyncer(config);

// types generation
await runTypesGenerator(config);
```

## Build tool integration

### Gulp

```typescript
import gulp from 'gulp';
import { runExtractor } from 'i18next-cli';

gulp.task('i18next-extract', async () => {
  const config = {
    locales: ['en', 'de', 'fr'],
    extract: {
      input: ['src/**/*.{ts,tsx,js,jsx}'],
      output: 'public/locales/{{language}}/{{namespace}}.json',
    },
  };

  await runExtractor(config);
});
```

### Webpack

```typescript
import { runExtractor } from 'i18next-cli';
import config from './i18next.config';

class I18nextExtractionPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'I18nextExtractionPlugin',
      async (compilation, callback) => {
        await runExtractor(config);
        callback();
      }
    );
  }
}
```

## Available functions

- `runExtractor(config, options?)`: Complete extraction with file writing
- `runLinter(config)`: Run linting analysis and return results
- `runSyncer(config)`: Sync translation files
- `runStatus(config, options?)`: Print the translation status; exits the process with code 1 when translations are missing
- `runTypesGenerator(config)`: Generate types
- `runLocalize(options?, configPath?)`: The full [`localize`](../commands/localize.md) flow (detect → instrument → extract → Locize sync with auto-translate → download)

## Advanced usage

### `Linter`: a class that lints your codebase and emits events along the way

```typescript
import { Linter } from 'i18next-cli';
import type { I18nextToolkitConfig } from 'i18next-cli';

const config: I18nextToolkitConfig = {
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
};

const linter = new Linter(config);

linter.on('progress', ({ message }) => console.log(message));

await linter.run();
```

This programmatic API gives you the same power as the CLI but with full control over when and how it runs in your build process.
