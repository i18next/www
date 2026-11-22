---
description: "Stop a build when the translation files are out of date, and keep them current while you work."
---

# CI and watch mode

## CI/CD integration

Each of these checks ends with a non-zero exit code, so CI stops the build:

- `npx i18next-cli status`: a translation is missing in a language. The main check.
- `npx i18next-cli lint`: a text is not wrapped in `t()`, or a placeholder does not match.
- `npx i18next-cli extract --ci`: the translation files are not up to date with the code.
- `npx i18next-cli types --ci`: the generated TypeScript definitions are out of date.

```yaml
# GitHub Actions, the steps of a job
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npm ci
- name: Translation files up to date
  run: npx i18next-cli extract --ci
- name: Every language complete
  run: npx i18next-cli status
- name: No texts outside t()
  run: npx i18next-cli lint
- name: Types up to date
  run: npx i18next-cli types --ci
```

## Watch mode

For development, use watch mode to automatically update translations:

```bash
npx i18next-cli extract --watch
npx i18next-cli lint --watch
```
