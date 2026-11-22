---
description: "Record where each key is used in your code, with a small plugin."
---

# Location metadata tracking

The extractor knows the file, line and column of every key. A small plugin writes them into one file:

```typescript
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Plugin } from 'i18next-cli';

interface LocationMetadataOptions {
  /** Output path for the metadata file (default: 'locales/metadata.json') */
  output?: string;
  /** Include line and column numbers (default: true) */
  includePosition?: boolean;
}

export const locationMetadataPlugin = (
  options: LocationMetadataOptions = {}
): Plugin => {
  const {
    output = 'locales/metadata.json',
    includePosition = true,
  } = options;

  return {
    name: 'location-metadata',

    async onEnd(keys) {
      const metadata: Record<string, any> = {};

      for (const extractedKey of keys.values()) {
        const { key, ns, locations } = extractedKey;

        // Skip keys without location data
        if (!locations || locations.length === 0) {
          continue;
        }

        // Format location data
        const locationData = locations.map(loc => {
          if (includePosition && loc.line !== undefined) {
            return `${loc.file}:${loc.line}:${loc.column ?? 0}`;
          }
          return loc.file;
        });

        // Organize metadata
        const namespace = ns || 'translation';
        if (!metadata[namespace]) {
          metadata[namespace] = {};
        }
        metadata[namespace][key] = locationData;
      }

      // Write metadata file
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, JSON.stringify(metadata, null, 2), 'utf-8');

      console.log(`📍 Location metadata written to ${output}`);
    }
  };
};
```

Add it to the configuration:

```typescript
// i18next.config.ts
import { defineConfig } from 'i18next-cli';
import { locationMetadataPlugin } from './plugins/location-metadata.mjs';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
  plugins: [
    locationMetadataPlugin({
      output: 'locales/metadata.json'
    })
  ]
});
```

The result:

```json locales/metadata.json
{
  "translation": {
    "app.title": [
      "src/App.tsx:12:15",
      "src/components/Header.tsx:8:22"
    ],
    "user.greeting": [
      "src/pages/Profile.tsx:45:10"
    ]
  },
  "common": {
    "button.save": [
      "src/components/SaveButton.tsx:18:7",
      "src/forms/UserForm.tsx:92:5"
    ]
  }
}
```
