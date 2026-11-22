---
description: "Wrap texts written into the code in t() calls, as a first pass you review."
---

# instrument

Scans your source code for hardcoded user-facing strings and instruments them with i18next translation calls. This is useful for adding i18next instrumentation to an existing codebase that wasn't built with internationalization in mind.

{% hint style="warning" %}
`instrument` is a first pass that works from heuristics: it misses some texts and wraps some strings that are not texts. Review every change before you commit it.
{% endhint %}

```bash
npx i18next-cli instrument
```

## Options

- `--dry-run`: Preview changes without writing files to disk: each text with the key it would get, by file
- `--interactive`: Prompt for approval of each candidate string
- `--namespace <ns>`: Target a specific namespace for extracted keys
- `-q, --quiet`: Suppress spinner and output

## What it transforms

The `instrument` command detects five types of transformations:

1. **Simple string → `t()` call:**
   ```javascript
   // Before
   const msg = 'Welcome back';

   // After
   const msg = t('welcomeBack', 'Welcome back');
   ```

2. **Template literal (static only) → `t()` call:**
   ```javascript
   // Before
   const msg = `Welcome back`;

   // After
   const msg = t('welcomeBack', 'Welcome back');
   ```
   With a value inside, the value becomes a placeholder: `` `Hello ${name}` `` becomes
   `t('helloName', 'Hello {{name}}', { name })`. A literal with no word around its values (`` `${name}` ``) stays.

3. **JSX text → JSX expression with `t()`:**
   ```jsx
   // Before
   <h1>Welcome back</h1>

   // After
   <h1>{t('welcomeBack', 'Welcome back')}</h1>
   ```

4. **JSX mixed content → `<Trans>` component:**
   ```jsx
   // Before
   <p>Click <a href="/docs">here</a> to continue</p>

   // After
   <p>
     <Trans i18nKey="clickHereToContinue">
       Click <a href="/docs">here</a> to continue
     </Trans>
   </p>
   ```
   A link or text component whose only children are text (`<Link to="/docs">here</Link>`, `<Text.Strong>`) and
   `{' '}` stay in the sentence too; a button or an icon does not. The key is made from the words, and the
   `i18nKey` takes the quotes the file's JSX attributes use.

5. **Plurals → one `t()` with `count`:** a `count === 1 ? … : …` ternary, or a call of a plural helper named
   `plural`, `pluralize` or `pluralise` that takes `(count, one, other)`, also inside a template literal. `#` in
   a form stands for the number, as in ICU:
   ```javascript
   // Before
   `${n} ${plural(n, 'key', 'keys')} unused`
   plural(files.length, '# file', '# files')

   // After
   t('countKeysUnused', {
     defaultValue_one: '{{count}} key unused',
     defaultValue_other: '{{count}} keys unused',
     count: n
   })
   t('countFiles', {
     defaultValue_one: '{{count}} file',
     defaultValue_other: '{{count}} files',
     count: files.length
   })
   ```
   Once every call of an imported helper is rewritten, its import goes.

A sentence stays whole around a value: a variable, a property, a string or number formatted from one
(`{items.join(', ')}`, `{n.toLocaleString()}`, `{format.date(d)}`), a choice between such values. A placeholder is
named after what it shows: `` `Last login ${format.date(user.lastLogin)}` `` becomes `'Last login {{lastLogin}}'`;
the same expression twice is one placeholder. A key keeps the first words of a long text (at most 40 characters,
no `_`, which i18next reads as a plural or context suffix), and a key the code uses already is never reused for
another text nor made the parent of nested ones: `Tenants` next to an existing `t('tenants.title')` gets `tenants2`.

What JSX shows is text, a single word too: JSX text (as it renders: lines joined, `&apos;` decoded), a
translatable attribute (`title`, `aria-label`, `data-tip`, …), and a string an element renders from an
expression (`{busy ? 'saving' : 'saved'}`, `{name || 'unnamed'}`). When one branch of a ternary is text, the
other string branch is too.

## Namespace targeting

Use `--namespace <ns>` to direct extracted keys into a specific namespace. When a non-default namespace is specified:
- React components use `useTranslation('<ns>')` with clean keys
- Non-component code uses `i18next.t('key', 'default', { ns: '<ns>' })`
- In `--interactive` mode you are prompted for the target namespace

```bash
npx i18next-cli instrument --namespace common
```

## Custom scorer hook

Override the built-in confidence heuristic via `extract.instrumentScorer` in your config. The function receives each candidate string and its context, and can:
- Return a number (0 to 1) to override the confidence score
- Return `null` to force-skip the candidate
- Return `undefined` to fall back to the built-in heuristic

```typescript
export default defineConfig({
  // ...
  extract: {
    // ...
    instrumentScorer: (content, { file, code, beforeContext, afterContext }) => {
      // Skip strings that belong to your analytics domain
      if (content.startsWith('track_')) return null;
      // Boost strings in your UI layer
      if (file.includes('/components/')) return 0.95;
      // Fall back to built-in detection for everything else
      return undefined;
    }
  }
});
```

## What it skips (by design)

The instrumenter uses confidence heuristics to avoid transforming:
- Test files (`*.test.*`, `*.spec.*`), stories (`*.stories.*`, `*.story.*`, `*.storybook.*`) and the folders
  `__tests__`, `__mocks__`, `__fixtures__`; other fixture folders go into `extract.ignore`
- Empty strings and single characters
- Pure numbers and numeric IDs
- URL strings and file paths
- CSS class names and technical identifiers
- Developer-facing error codes (all-caps patterns like `ERROR_NOT_FOUND`)
- `console.*` calls, everything in them, and variables used only there (a log line built beforehand)
- Object keys and computed keys, compared strings and `case` values; and a string the file also uses as data
  (compared, an `id`/`key`/`value`/`type`/`code`, an entry of an `order`/`ids`/`values` list), everywhere in that
  file unless an element renders it or it is an attribute's value: a facet's `of()` returning `'no 2FA'` keeps
  matching `order: ['2FA', 'no 2FA']`
- Prompts for a language model: the functions, variables and properties named like `getSystemPrompt`,
  `userPrompt` or `aiAssistantPrompt` (a translated prompt changes what the model does)
- Analytics event names (`track`, `trackEvent`, `logEvent`, `capture`, `identify`, `gtag`), event names (`emit`,
  `on`), log and error-report calls (`logger.*`, `Sentry.*`), `new Error()` and `RegExp` arguments (errors are for
  developers; show users a text of your own), format patterns (`dayjs(d).format('DD MMM YYYY')`)
- Icon ligatures: the content of an element named `…Icon` or with a `material-icons`/`material-symbols` class
- CSS values (`var(--brand)`, `inset 0 0 5px 1px var(--shadow)`), and strings in a `classes`/`style` variable
- Strings a text is compared with or searched for (`msg.includes('not found')`, `split`, `replace`, …),
  selectors (`querySelector`, `closest`), attribute and storage names (`getAttribute`, `setItem`, …)
- camelCase identifiers (`aiReview`), rules and key paths (`required|min:2`), strings without a letter (` / `),
  code snippets shown as text (several lines of code or shell commands)
- The content of `<code>`, `<script>` and `<style>` (and of `extract.ignoredTags`); inside a sentence they stay
  part of its `<Trans>`
- HTML attribute values that appear technical (which attributes hold text can be set per element, see [Translatable attributes per element](../configuration.md#translatable-attributes-per-element)); the JSX and functions inside such an attribute (`action={<Button>Change</Button>}`, `onClick={() => notify('Copied')}`) are checked as anywhere else
- Template literals with no word besides their expressions: ids, paths, keys, language codes and class names
  built in code (`` `${projectId}-${version}` ``, `` `weight_${code}` ``, `` `${baseUrl}/api/${id}` ``,
  `` `zh-${country}` ``); and values of technical properties (`` { 'Authorization': `Bearer ${token}` } ``,
  `url`, `id`, `type`, `code`, `className`, …)
- Strings already inside `t()` calls or `<Trans>`, `<IcuTrans>` and their `…WithoutContext` components (their
  `values` too), including the project's own `extract.functions` and `extract.transComponents`
- **Module-scope strings**: anything outside a function body, e.g. a top-level config/registry array:
  ```ts
  export const SETTINGS_SECTIONS = [
    { id: 'appearance', label: 'Appearance' }, // left untouched
  ]
  ```
  A `t()` call there would be evaluated once, when the module is first imported: possibly before i18next
  is initialized, and never again when the language changes. Move the text into a component, or expose the
  registry as a hook that calls `useTranslation()` internally:
  ```ts
  export const useSettingsSections = () => {
    const { t } = useTranslation()
    return [{ id: 'appearance', label: t('appearance', 'Appearance') }]
  }
  ```

## Auto-injection

When transformations are applied, the command automatically:
- Injects `import { useTranslation } from 'react-i18next'` in React files (or `import i18next from 'i18next'` for non-React files)
- Injects `const { t } = useTranslation()` into each React function component that contains transformed strings (an arrow component with an expression body, `() => <p>…</p>`, gets a block for it), unless it has a `t` already (a prop, or a hook from a module that re-exports it), and adds `t` to the dependencies of a `useMemo` or `useCallback` whose callback now calls it
- Places the imports after the file's import declarations and directives (`'use client'` stays first; never inside a string that shows code), and imports no name the file has already, from whatever module
- Takes `t` from a hook call the component makes already, unless a text comes before it: `const { i18n } = useTranslation('settings')` becomes `const { t, i18n } = useTranslation('settings')`, so the new keys go to that namespace; a function that is no component but binds `t` from a translation hook (a custom hook, `generateMetadata` with `getT()`) uses that `t`, not `i18next.t()`
- Detects the project's framework from `package.json` dependencies, dev and peer dependencies included; in a workspace package (npm/yarn `workspaces`, `pnpm-workspace.yaml`) also from the workspace root's
- Uses `useTranslation()` hook style `t()` inside React components, or `i18next.t()` for utility / non-component code
- Generates an `i18n.ts` (or `i18n.js` for JS-only projects) initialization file if none exists and the code imports neither `i18next` nor `react-i18next` yet (an app that does is set up somewhere, perhaps in a shared package), pre-configured with [`i18next-resources-to-backend`](https://github.com/i18next/i18next-resources-to-backend) to lazy-load your translation files via dynamic imports, and with the browser's language (`navigator.language`, matched against your `locales`); not in a Next.js app, see below
- Adds `i18n.changeLanguage()` next to a call that sets the user's language: `setLanguage(code)`, or a settings, profile or user call with a `language`/`locale` property (`updateSettings({ language: code })`). Only where that call is a statement of its own in a block or an arrow function's body, with a plain variable or property as the language (the injected call repeats it), and not for a `language` property passed as data (`fetchTranslations({ lng })`). `--dry-run` lists every such site; in an app where a language is data (a translation tool's view filter), review them

## Next.js apps ([next-i18next](/next))

An app with next-i18next (a dependency, or imported), and a Next.js app with no i18next set up at all, gets
next-i18next's calls, by where each file renders. The import graph decides: a file under `app/` is a Server
Component unless it says `'use client'`, a `'use client'` file and all it imports are Client Components, a file
under `pages/` and all it imports render with the Pages Router (imports resolve relative, through the `paths` of
`tsconfig.json` or `jsconfig.json` and from the project root). A Next.js app with i18next or react-i18next and no
next-i18next keeps `react-i18next`.

- **Server Components:** `const { t } = await getT()` from `next-i18next/server` (or from the module the app
  imports `getT` from, such as its own `createServerI18next` file), and the component becomes `async`. A
  `<Trans>` gets `t={t} i18n={i18n}` and comes from `react-i18next/TransWithoutContext`. `generateMetadata()`
  and other async functions get `getT()` as well, and `export const metadata = { title: '…' }` becomes
  `export async function generateMetadata () { const { t } = await getT(); return { title: t(…) } }`.
- **Client Components:** `const { t } = useT()` and `Trans` from `next-i18next/client`.
- **Pages Router:** `useTranslation` and `Trans` from `next-i18next/pages`. A page that loads no translations
  (no `serverSideTranslations()` in it or in a helper it imports) is named in a warning.
- **A component that Server and Client Components both render** works with neither: its texts stay, named in a
  warning, unless it gets `t` as a prop (and `i18n` too for a `<Trans>`), which it then uses.
- Left as they are, each named in a warning: texts outside components (next-i18next has no global `t`), files
  no page or layout imports (which side renders them is not known), API routes (`route.ts` under `app/`,
  `pages/api/`), Server Actions and cached functions (`'use server'`, `'use cache'`: `getT()` there needs
  `{ lng }`), a Server Component wrapped in `memo()` or `forwardRef()`, and language switches: next-i18next
  changes the language through the route or `useChangeLanguage()`.
- No init file: next-i18next sets i18next up itself. When it is not set up yet, the steps are printed (install,
  then `i18n.config`, proxy and root layout for the App Router, `appWithTranslation` and `serverSideTranslations`
  for the Pages Router).

## Workflow <a id="recommended-workflow"></a><a id="expected-workflow"></a>

1. Preview every change:
   ```bash
   npx i18next-cli instrument --dry-run
   ```
2. Approve the candidates one by one; use `edit-key` or `skip` freely:
   ```bash
   npx i18next-cli instrument --interactive
   ```
3. Review the changes, run your tests, fix what was missed or wrapped wrongly, and commit.
4. Write the keys into the translation files:
   ```bash
   npx i18next-cli extract
   ```

## Limitations

Besides what the warning above says:

- **Other plurals:** a plural written another way than a `count === 1 ? … : …` ternary or a `plural`, `pluralize` or `pluralise` helper keeps its form and needs manual cleanup.
- **Very dynamic strings:** strings built from concatenation, template operations or computed values may not be detected correctly.
- **Framework-specific patterns:** decorators, custom hooks or directives may not be recognized.

## Suppressing detection with `i18next-instrument-ignore`

Both the `lint` and `instrument` commands honor an ignore comment so you can skip placeholder or intentionally-untranslated content. It works as a line or block comment, including the JSX `{/* ... */}` form, and comes in two variants:

| Directive | Scope |
| --- | --- |
| `i18next-instrument-ignore` | The **entire JSX element** that begins on the next line: its opening tag, all nested children, and its closing tag. Falls back to a single line when the next line isn't a JSX element (e.g. a plain `t()` call). |
| `i18next-instrument-ignore-next-line` | Only the **single line** immediately after the directive. |

```jsx
// Suppress a whole element (including multi-line opening tags and nested
// children)
{/* i18next-instrument-ignore */}
<div
  css={css`text-align: center;`}>
  Hi, I'm Bob 👋
  <p>This nested text is ignored too</p>
</div>

// Suppress just one line
{/* i18next-instrument-ignore-next-line */}
<p>Only this line is ignored</p>

// Also works for t() interpolation warnings in the linter
// i18next-instrument-ignore
const msg = t('Hello {{name}}!', { wrong: 'world' })
```
