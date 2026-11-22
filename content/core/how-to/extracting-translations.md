---
description: "Every key you use in code needs an entry in each language's file; this is how new keys get there."
---

# Extracting translations

## With your agent

Add the agent note once: `npx i18next-cli init --agent-note` (i18next-cli 1.93.2 and later; in a project that already has a config it writes only the note). It tells every later agent session to run `extract` after changing `t()` calls and `status` to see what is missing ([the note](/cli/commands/init#agent-note)). The [setup prompt](ai-coding-agents.md) extracts the keys too.

## With i18next-cli <a id="id-2-using-an-extraction-tool"></a>

```bash
npx i18next-cli extract
```

[`extract`](/cli/commands/extract) finds the keys in your code and writes them into every language's file; translations already there stay. In CI, [`npx i18next-cli status`](/cli/commands/status) exits non-zero when a language misses translations.

Not sure how much is still hardcoded? The free [i18n readiness check](https://translate.i18next.com/repo-check) runs the same lint rules on a public GitHub repository, in your browser.

Other extraction tools are listed under [plugins and utils](../overview/plugins-and-utils.md#extraction-tools).

## Older ways

### By hand <a id="id-1-adding-new-strings-manually"></a>

You can also add keys to the files by hand; the CLI saves that step.

### Runtime extraction <a id="id-3-runtime-extraction"></a>

[`i18next-cli extract`](/cli/commands/extract) finds new keys in your code before it runs; sending the keys i18next could not resolve to the backend at run time is the older way:

```javascript
i18next.init({
  saveMissing: true // send keys that were not found to the backend
});
```

Where the backend sends them is set in its options (for i18next-http-backend, see [its options](https://github.com/i18next/i18next-http-backend#backend-options)).
