---
description: "Options every command takes, such as the path to another configuration file."
---

# Global options

- `-c, --config <path>`: Override automatic config detection and use the specified config file (relative to cwd or absolute). This option is forwarded to commands that load or ensure a config (e.g. extract, status, types, sync, locize-*).

Examples:
```bash
# Use a config file stored in a package subfolder (monorepo)
npx i18next-cli extract --config ./packages/my-package/config/i18next.config.ts

# Short flag variant, for status
npx i18next-cli status de -c ./packages/my-package/config/i18next.config.ts
```

## Spinner and logger output

All commands that show progress spinners (extract, types, lint, sync) support:

- `--quiet` flag to silence spinner and non-essential output (for CI, scripting, or log capture)
- Programmatic logger support: pass a custom logger object to capture output in your own format or stream

**CLI example:**

```bash
npx i18next-cli extract --quiet
```

**Programmatic example:**

```typescript
import { runExtractor } from 'i18next-cli';
const logger = {
  info: (msg) => myLogStream.write(msg + '\n'),
  warn: (msg) => myWarnStream.write(msg + '\n'),
  error: (msg) => myErrStream.write(msg + '\n'),
};
await runExtractor(config, { quiet: false, logger });
```

If you pass a logger, spinner output and all progress/info messages are routed to your logger instead of the interactive spinner.
